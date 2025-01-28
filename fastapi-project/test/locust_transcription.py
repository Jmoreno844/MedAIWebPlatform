from locust import HttpUser, task, between
import time, os
import random

class TranscriptionUser(HttpUser):
    wait_time = between(0.5, 1.0)  # Reduced wait time for concurrent calls

    def on_start(self):
        # Use absolute path matching terminal location
        self.audio_path = "/home/juan/Downloads/Spanishpodcast_Goingtothedoctor.mp3"
        if not os.path.exists(self.audio_path):
            raise FileNotFoundError(f"Audio file not found: {self.audio_path}")
        self.request_count = 0

    @task
    def test_transcription(self):
        self.request_count += 1
        timestamp = int(time.time())
        random_suffix = random.randint(1000, 9999)
        unique_filename = f"audio_{timestamp}_{random_suffix}_{self.request_count}.mp3"
        
        with open(self.audio_path, "rb") as audio_file:
            files = {
                "file": (
                    unique_filename.replace(" ", "_"),
                    audio_file,
                    "audio/mpeg"  # Correct MIME type for MP3
                )
            }
            response = self.client.post(
                "/api/transcribe/1",
                files=files,
                name="/api/transcribe"
            )
        
        # Log response metrics
        if response.status_code != 200:
            print(f"Error: {response.status_code} - {response.text}")