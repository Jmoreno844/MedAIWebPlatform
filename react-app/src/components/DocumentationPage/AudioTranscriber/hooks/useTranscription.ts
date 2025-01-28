import { useState, useEffect, useRef } from "react";
import axios from "../../../../axiosConfig";

export const useTranscription = (encuentroId: number | null) => {
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 3000;

  useEffect(() => {
    if (!encuentroId) return;

    const connect = () => {
      if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
        setError("Failed to connect after multiple attempts");
        return;
      }

      const WS_URL = `${process.env.REACT_APP_WS_URL}/ws/transcription/${encuentroId}`;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === "completed") {
          setTranscription(data.content);
          setIsLoading(false);
        } else if (data.status === "processing") {
          setIsLoading(true);
        }
      };

      ws.onerror = () => {
        console.log("WebSocket error - attempting reconnect");
        reconnectAttempts.current++;
        ws.close();
      };

      ws.onclose = () => {
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          setTimeout(connect, RECONNECT_DELAY);
        }
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [encuentroId]);

  const fetchTranscription = async (id: number) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/transcripciones/${id}`
      );
      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setTranscription(response.data[0].contenido);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Error fetching transcription:", error);
        setError("Error al cargar la transcripción existente");
      }
    }
  };

  const deleteTranscription = async () => {
    if (!encuentroId) {
      setError("No hay un encuentro seleccionado");
      return;
    }
    if (
      !window.confirm(
        "¿Está seguro de eliminar la transcripción? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/transcripciones/${encuentroId}`
      );
      setTranscription("");
    } catch (error: any) {
      console.error("Error al eliminar la transcripción:", error);
      setError("Error al eliminar la transcripción");
    }
  };

  const sendAudioToServer = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, "audio.wav");
    setIsLoading(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/transcribe/${encuentroId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.error("Error sending audio to server:", error);
      setError("Error al enviar el audio al servidor");
      setIsLoading(false);
    }
  };

  return {
    transcription,
    error,
    isLoading,
    fetchTranscription,
    deleteTranscription,
    sendAudioToServer,
  };
};
