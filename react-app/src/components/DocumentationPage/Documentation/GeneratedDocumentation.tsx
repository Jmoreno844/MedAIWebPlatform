import React from "react";

interface GeneratedDocumentationProps {
  generatedText: string;
  loading: boolean;
  handleSaveDocumentation: () => void;
  handleDeleteDocumentation: () => void;
}

const cleanText = (text: string) => {
  return text
    .replace(/\*\*/g, "") // Remove **
    .replace(/[`]/g, ""); // Remove backticks
};

const GeneratedDocumentation: React.FC<GeneratedDocumentationProps> = ({
  generatedText,
  loading,
  handleSaveDocumentation,
  handleDeleteDocumentation,
}) => (
  <div className="w-1/2 bg-white shadow-md rounded-lg p-6 flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Documento Generado</h2>
      {generatedText && (
        <button
          onClick={handleDeleteDocumentation}
          className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
          title="Eliminar transcripción"
        >
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      )}
    </div>
    <div
      className="flex-grow border whitespace-pre-wrap border-gray-300 rounded-lg p-4 overflow-auto bg-gray-50"
      dangerouslySetInnerHTML={{
        __html: loading ? "<p>Cargando...</p>" : `<p>${generatedText}</p>`,
      }}
    />
    <button
      onClick={handleSaveDocumentation}
      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
      disabled={loading || !generatedText}
    >
      {loading ? "Guardando..." : "Guardar Documentación"}
    </button>
  </div>
);

export default GeneratedDocumentation;
