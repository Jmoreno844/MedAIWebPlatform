# Plataforma Web para la Generación de Documentación Médica Automatizada

Esta aplicación web fue desarrollada como parte de un proyecto de grado en ingenieria de sistemas, con el objetivo de optimizar los procesos de documentación clínica mediante inteligencia artificial. La plataforma combina un backend construido con FastAPI y un frontend desarrollado con React, permitiendo la transcripción de audio y la generación automática de historias clínicas, además de ofrecer un chat interactivo para consultas médicas en tiempo real.

🚀 **Características Principales**

✅ **Transcripción Automática de Audio**: Utiliza el modelo Whisper ejecutado localmente en GPU para convertir dictados médicos en texto de forma precisa.

✅ **Generación de Documentos Clínicos**: Integra la API de Google Gemini para generar documentos médicos personalizados a partir de la transcripción y plantillas.

✅ **Chat Médico en Tiempo Real**: Comunicación con WebSockets y API de Gemini para respuestas médicas basadas en búsqueda en Google.

✅ **Seguridad y Validación**: Implementa autenticación con JWT, validación de datos con Pydantic y gestión segura de base de datos con SQLAlchemy y MySQL.

✅ **Documentación**: API documentada con Swagger/OpenAPI para facilitar su uso y pruebas.

🏗️ **Estructura del Proyecto**

El repositorio está organizado en dos carpetas principales:

📂 /react-app – Código fuente del frontend desarrollado en React + TypeScript.

📂 /fastapi-project – Código fuente del backend implementado en FastAPI + MySQL.

🖥️ **Capturas de la Aplicación**

📌 Página de inicio interfaz principal donde los usuarios pueden acceder a las funcionalidades clave.
![home](https://github.com/user-attachments/assets/f59d1f31-9e38-4b0e-b23a-c37d6b3ebc9b)

📌 Página de grabacion y transcripcion de audio.
![transcripcion](https://github.com/user-attachments/assets/c2929150-1279-453d-987e-a22b9f6edd14)

📌 Pagina de generación de documentos médicos a partir de transcripciones y plantillas predefinidas.
![documentacion](https://github.com/user-attachments/assets/63843875-fc9b-47ef-9d7f-494678f13281)

📌 Chat Médico en Tiempo RealConsultas médicas basadas en IA con integración de búsqueda en Google.
![image](https://github.com/user-attachments/assets/2527be5b-666a-45e3-a3e0-0d5e0e57b61c)

