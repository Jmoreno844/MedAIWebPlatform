from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from unsloth import FastLanguageModel
import torch
from unsloth.chat_templates import get_chat_template
import logging
from app.db.session import get_db

from app.models.plantilla import Plantilla
from app.prompts.medical_prompts import generate_documentation_prompt, documentation_instruction

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api"
)

class GenerateRequest(BaseModel):
     transcripcion_consulta: str
     informacion_extra: str
     id_plantilla: int

class GenerateResponse(BaseModel):
    generated_text: str

max_seq_length = 8048  # Reducido para evitar el error de max_seq_len
dtype = "bfloat16"
load_in_4bit = True

# Cargar el modelo y tokenizer
try:
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name="unsloth/Phi-3.5-mini-instruct",  
        #model_name="unsloth/Llama-3.2-3B-Instruct",
        max_seq_length=max_seq_length,
        dtype=dtype,
        load_in_4bit=load_in_4bit,

        # token="hf_...", # usar si se usan modelos restringidos como meta-llama/Llama-2-7b-hf
    )
    tokenizer = get_chat_template(
        tokenizer,
        chat_template="llama-3.1",
    )
    # change the padding tokenizer value
    tokenizer.add_special_tokens({"pad_token": "<|reserved_special_token_0|>"})
    model.config.pad_token_id = tokenizer.pad_token_id # updating model config
    tokenizer.padding_side = 'right' # padding to right (otherwise SFTTrainer shows warning)
    FastLanguageModel.for_inference(model)  # Habilitar inferencia 2x más rápida
    logger.info("Modelo y tokenizer cargados exitosamente")
except Exception as e:
    logger.error(f"Error al cargar el modelo o tokenizer: {e}")
    model = None
    tokenizer = None

@router.post("/generate_local", response_model=GenerateResponse)
async def generate_text(request_data: GenerateRequest,
                        db: Session = Depends(get_db),

                        ):
    if not model or not tokenizer:
        logger.error("Modelo o tokenizer no disponibles")
        raise HTTPException(status_code=500, detail="Modelo no disponible.")
    try: 
        plantilla = db.query(Plantilla.contenido).filter(Plantilla.id == request_data.id_plantilla).first()
        if not plantilla:
            raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la plantilla: {str(e)}")
   
    contents = generate_documentation_prompt(transcripcion_consulta=request_data.transcripcion_consulta, 
                                               informacion_extra=request_data.informacion_extra, 
                                               plantilla=plantilla)
    try:
        messages = [
            {"role": "system",         "content": documentation_instruction},
            {"role": "user", "content": contents},
        ]

        inputs = tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
        ).to("cuda")

        outputs = model.generate(
            input_ids=inputs,
            max_new_tokens=2004,
            use_cache=True,
            temperature=1.5,
            min_p=0.1
        )

        # Only decode the new tokens, excluding the input prompt
        generated_text = tokenizer.batch_decode(outputs[:, inputs.shape[1]:])[0].strip()
        return GenerateResponse(generated_text=generated_text)
    
    except Exception as e:
        logger.error(f"Error generando texto: {e}")
        raise HTTPException(status_code=500, detail="Error generando texto.")