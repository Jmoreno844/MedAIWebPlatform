from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserBase, UserLogin
from app.core.security import create_access_token, verify_password, get_password_hash
from datetime import timedelta
import logging
from jose import JWTError, jwt
from app.schemas.user import TokenData
import os
from dotenv import load_dotenv
from starlette.websockets import WebSocket

# Load environment variables
load_dotenv()

# Get JWT settings from environment
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY must be set in environment variables")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

router = APIRouter(
    prefix="/api/auth",
)


@router.post("/token")
async def login_for_access_token(
    user_login: UserLogin,
    response: Response,
    db: Session = Depends(get_db),
):
    try:
        user = db.query(User).filter(User.email == user_login.email).first()
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        if not verify_password(user_login.password, user.password):
            logger.warning(f"Failed login attempt for user: {user_login.email}")
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            domain=None,   # or remove this line completely
            secure=True,  # Set to True in production
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
        
        return {"message": "Login successful"}
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Login error occurred"
        )

# Dependencia personalizada para obtener el token de la cookie
def get_token_from_cookie(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token

# Dependencia personalizada para obtener el token de la cookie en WebSocket
def get_token_from_websocket_cookie(websocket: WebSocket) -> str:
    """Parse 'access_token' from the Cookie header in a WebSocket handshake."""
    cookie_header = websocket.headers.get("cookie")
    if not cookie_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No cookies found in WebSocket handshake."
        )

    cookies = cookie_header.split(";")
    # Look for a cookie named 'access_token'
    for cookie in cookies:
        if "=" not in cookie:
            continue
        name, value = cookie.strip().split("=", 1)
        if name == "access_token":
            return value

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not find access_token in WebSocket cookies."
    )

# Actualizar get_current_user para usar la nueva dependencia
def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    token = get_token_from_cookie(request)  # uses request now
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except (JWTError, TypeError, ValueError):
        raise credentials_exception
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_from_token(token: str, db: Session) -> User:
    """Función para obtener el usuario desde el token directamente."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except (JWTError, TypeError, ValueError):
        raise credentials_exception
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user

# Endpoint protegido que utiliza el token de la cookie
@router.get("/me", response_model=UserBase)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Endpoint de registro
@router.post("/register", response_model=UserBase)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = get_password_hash(user.password)
        
        # Create new user
        db_user = User(
            name=user.name,
            lastName=user.lastName,
            email=user.email,
            password=hashed_password,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
        
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error during registration"
        )

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logout successful"}