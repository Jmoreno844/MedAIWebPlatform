from locust import HttpUser, task, between
import json
import time

class GenerationUser(HttpUser):
    wait_time = between(0.5, 1.0)  # Reduced wait time for concurrent calls

    def on_start(self):
        # Prepare payload for generation request
        self.payload = {
            "informacion_extra": "Paciente con antecedentes de hipertensión arterial y diabetes mellitus tipo 2.",
            "transcripcion_consulta": "Médico: Buenos días, ¿cómo se siente hoy? Paciente: Hola, doctor. No muy bien. He tenido mareos frecuentes y una sensación de fatiga extrema en las últimas dos semanas. Médico: ¿Ha notado algún otro síntoma, como palpitaciones, dificultad para respirar o dolor en el pecho? Paciente: Sí, a veces siento que mi corazón late muy rápido y me cuesta respirar, especialmente cuando subo escaleras. Médico: Entiendo. ¿Ha revisado sus niveles de glucosa y presión arterial recientemente? Paciente: Sí, mi glucosa ha estado alrededor de 180 mg/dL en ayunas, y mi presión arterial ha estado en 150/95 mmHg. Médico: Gracias por la información. Voy a realizar un examen físico y revisar su historial. ¿Ha tenido algún cambio en su medicación recientemente? Paciente: No, sigo tomando metformina 1000 mg dos veces al día y losartán 50 mg una vez al día. Médico: Bien. Al examinarlo, noto que tiene taquicardia y un soplo cardíaco suave. También observo edema leve en las extremidades inferiores. Le recomendaré realizar un electrocardiograma y un ecocardiograma para evaluar la función cardíaca. Además, ajustaremos su medicación para controlar mejor su presión arterial y glucosa. Paciente: Entiendo, doctor. ¿Cree que esto podría estar relacionado con mi diabetes e hipertensión? Médico: Sí, es probable que sus síntomas estén relacionados con un descontrol de sus condiciones crónicas y posiblemente con una cardiopatía subyacente. Le recomendaré también una consulta con un cardiólogo. Paciente: Gracias, doctor. Haré lo que sea necesario.",
            "id_plantilla": 1
        }
        self.request_count = 0

    @task
    def test_generation(self):
        self.request_count += 1
        start_time = time.time()
        
        # Send generation request
        response = self.client.post(
            "/api/generarDocumento",
            json=self.payload,
            name="/api/generarDocumento"
        )
        
        # Log response metrics
        duration = time.time() - start_time
        if response.status_code != 200:
            print(f"Error: {response.status_code} - {response.text}")
        else:
            print(f"Generation completed in {duration:.2f}s")