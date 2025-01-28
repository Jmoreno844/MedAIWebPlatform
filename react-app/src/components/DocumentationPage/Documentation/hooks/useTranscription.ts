// filepath: /src/components/DocumentationPage/Documentation/hooks/useTranscription.ts
import { useState, useEffect } from "react";
import axios from "../../../../axiosConfig";
import { Transcription } from "../types";

export const useTranscription = (encuentroId: number | null) => {
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (encuentroId) {
      setLoading(true);
      axios
        .get<Transcription[]>(
          `${process.env.REACT_APP_API_URL}/api/transcripciones/${encuentroId}`
        )
        .then((resp) => {
          if (resp.data.length > 0) {
            setTranscription(resp.data[0].contenido);
          } else {
            setTranscription("No hay transcripción disponible.");
          }
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setTranscription("No hay transcripción disponible.");
          } else {
            setError("Error al cargar la transcripción.");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [encuentroId]);

  return { transcription, loading, error };
};
