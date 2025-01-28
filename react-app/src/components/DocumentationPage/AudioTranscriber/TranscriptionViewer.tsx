import React from "react";

interface TranscriptionViewerProps {
  transcription: string;
  onDelete: () => void;
  isLoading?: boolean;
}

export const TranscriptionViewer: React.FC<TranscriptionViewerProps> = ({
  transcription,
  onDelete,
  isLoading,
}) => (
  <div className="flex-1 ml-4">
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transcripción</h2>
        {transcription && (
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800"
          >
            Eliminar
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <textarea
          className="w-full h-64 p-2 border rounded-lg resize-none"
          value={transcription}
          readOnly
        />
      )}
    </div>
  </div>
);
