import React from "react";

interface TranscriptionBoxProps {
  transcription: string;
  loading: boolean;
}

const TranscriptionBox: React.FC<TranscriptionBoxProps> = ({
  transcription,
  loading,
}) => (
  <div className="flex-1 overflow-auto bg-white shadow-md rounded-lg p-4">
    <h2 className="text-xl font-bold mb-2">Transcripción</h2>
    <p className="text-sm whitespace-pre-wrap h-full overflow-auto">
      {loading ? "Cargando..." : transcription}
    </p>
  </div>
);

export default TranscriptionBox;
