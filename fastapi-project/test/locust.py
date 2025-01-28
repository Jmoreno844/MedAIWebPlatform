from locust import HttpUser, TaskSet, task, between
import asyncio

class IAUserBehavior(TaskSet):

    @task(1)
    def chat_medico(self):
        response = self.client.post("/api/chat", json={"mensaje": "¿Cuáles son los síntomas de la diabetes?"})
        # Puedes agregar verificaciones o métricas personalizadas aquí

    @task(2)
    def transcripcion_audio(self):
        with open("sample_audio.wav", "rb") as audio_file:
            response = self.client.post("/api/transcribir", files={"audio": audio_file})
        # Verifica la respuesta y registra el tiempo

    @task(1)
    def generar_documento(self):
        response = self.client.post("/api/generar_documento", json={"transcripcion": "Transcripción de ejemplo"})
        # Verifica la respuesta y registra el tiempo

class WebsiteUser(HttpUser):
    tasks = [IAUserBehavior]
    wait_time = between(1, 5)
