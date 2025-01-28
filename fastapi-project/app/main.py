from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from app.db.base import Base
from app.db.session import engine, db

from app.api.User.auth import router as auth_router
from app.api.User.user_settings import router as user_settings_router
from app.api.encuentros import router as encuentros_router
from app.api.paciente import router as paciente_router
from app.api.AI.chat import router as chat_router
from app.api.User.plantillas import router as plantillas_router
from app.api.AI.transcribe_local import router as transcribe_router
from app.api.transcripciones import router as transcripciones_router
from app.api.documentacion import router as documentacion_router
from app.api.AI.generar_documentacion import router as generardocumentacion_router

#from app.api.AI.unsloth import router as unsloth_router
#from app.api.AI.ollama import router as ollama_router
import logging

from google import genai
from app.services.chat import GeminiChatService

from starlette.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application...")
    try:
        # Initialize database
        db.init_db()
        Base.metadata.create_all(bind=db.engine)  # Ensure engine is correctly initialized
        logger.info("Database initialized")
        
        # Initialize GenAI client
        app.state.genai_client = genai.Client(
            vertexai=True,
            project="medicalweb-446916",
            location="us-central1"
        )
        app.state.chat_service = GeminiChatService(app.state.genai_client)
        logger.info("GenAI client initialized")
        
        yield
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise
    finally:
        logger.info("Shutting down application...")
        try:
            db.dispose()
            logger.info("Resources cleaned up")
        except Exception as e:
            logger.error(f"Shutdown error: {e}")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = self.get_csp_header()
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"  # Prevents MIME-type sniffing
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    def get_csp_header(self):
        return "; ".join([
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # Required for Swagger UI
            "style-src 'self' 'unsafe-inline'",  # Required for Swagger UI
            "img-src 'self' data: https:",
            "connect-src 'self' http://localhost:3000 https://app.medscribe.space",
            "font-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
        ])

app = FastAPI(
    title="Medical Chat API",
    description="API for medical chat application",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",   # Swagger UI endpoint
    redoc_url="/redoc"
)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:11434",
    "http://127.0.0.1",
    "https://app.medscribe.space"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Add WebSocket CORS middleware
@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    if request.headers.get("upgrade", "").lower() == "websocket":
        response.headers.update({
            "Access-Control-Allow-Origin": "*",  # Replace with your frontend domain in production
            "Access-Control-Allow-Credentials": "true",
        })
    return response

# Include routers
app.include_router(auth_router)
app.include_router(user_settings_router)
app.include_router(paciente_router)
app.include_router(encuentros_router)
app.include_router(plantillas_router)
app.include_router(chat_router)
app.include_router(transcribe_router)
app.include_router(transcripciones_router)
app.include_router(documentacion_router)
app.include_router(generardocumentacion_router)
#app.include_router(ollama_router)
#app.include_router(unsloth_router)





