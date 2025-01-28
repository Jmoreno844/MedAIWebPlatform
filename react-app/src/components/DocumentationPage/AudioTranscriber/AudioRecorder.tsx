import React, { useState } from "react";
import { useAudioRecording } from "./hooks/useAudioRecording";
import "./AudioRecorder.css";
export const AudioRecorder: React.FC<{
  onTranscriptionGenerate: (blob: Blob) => void;
}> = ({ onTranscriptionGenerate }) => {
  const [uploadedFile, setUploadedFile] = useState<Blob | null>(null);
  const {
    recording,
    audioURL,
    audioBlob,
    startRecording,
    stopRecording,
    deleteRecording,
    setAudioURL, // Destructure setAudioURL from the hook
  } = useAudioRecording();

  return (
    <div className="w-1/3 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Grabación</h2>
      <button
        onClick={startRecording}
        disabled={recording}
        className="w-full py-2 mb-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Empezar a grabar
      </button>
      <button
        onClick={stopRecording}
        disabled={!recording}
        className="w-full py-2 mt-2 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Parar de grabar
      </button>
      <div className="flex justify-center mt-4">
        <label className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center cursor-pointer">
          Importar Transcripción
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                setAudioURL(url);
                setUploadedFile(file); // Store file without sending
              }
            }}
            className="hidden"
          />
        </label>
      </div>
      {recording && (
        <div className="flex items-center justify-center mt-4">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8"></div>
          <span className="ml-2">Grabando...</span>
        </div>
      )}
      {audioURL && (
        <>
          <audio src={audioURL} controls className="mt-4 w-full" />
          <button
            onClick={deleteRecording}
            className="w-full py-2 mb-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Borrar grabación
          </button>
          <button
            onClick={() => {
              const blobToSend = uploadedFile || audioBlob;
              if (blobToSend) onTranscriptionGenerate(blobToSend);
            }}
            disabled={!audioBlob && !uploadedFile}
            className="w-full py-2 mt-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Generar transcripción
          </button>
        </>
      )}
    </div>
  );
};
