import React, { useEffect } from "react";
import { AudioRecorder } from "./AudioRecorder";
import { TranscriptionViewer } from "./TranscriptionViewer";
import { useTranscription } from "./hooks/useTranscription";
import { secureStore } from "../../../utils/secure-store";

const AudioTranscriber: React.FC = () => {
  const encuentro = secureStore.get();
  const {
    transcription,
    error,
    isLoading,
    fetchTranscription,
    deleteTranscription,
    sendAudioToServer,
  } = useTranscription(encuentro?.id || null);

  useEffect(() => {
    if (encuentro?.id) {
      fetchTranscription(encuentro.id);
    }
  }, [encuentro?.id, fetchTranscription]);

  if (error === "No hay un encuentro seleccionado.") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          {/* Implementa la lógica para redirigir o permitir seleccionar un encuentro */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-100 p-4">
      <AudioRecorder onTranscriptionGenerate={sendAudioToServer} />
      <TranscriptionViewer
        transcription={transcription}
        onDelete={deleteTranscription}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AudioTranscriber;
