import React, { useState, useRef, useEffect } from "react";
import TemplateList from "./TemplateList";
import { ResumenTemplate } from "./types";

interface ExtraInfoBoxProps {
  extraInfo: string;
  setExtraInfo: (value: string) => void;
  templates: ResumenTemplate[];
  loading: boolean;
  selectedTemplateId: number | null;
  setSelectedTemplateId: (id: number) => void;
  handleGenerateDocumentation: () => void;
}

const ExtraInfoBox: React.FC<ExtraInfoBoxProps> = ({
  extraInfo,
  setExtraInfo,
  templates,
  loading,
  selectedTemplateId,
  setSelectedTemplateId,
  handleGenerateDocumentation,
}) => {
  const [showTemplateList, setShowTemplateList] = useState(false);
  const [showError, setShowError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId
  );

  const toggleTemplateList = () => {
    setShowTemplateList((prev) => !prev);
  };

  const handleSelectTemplate = (id: number) => {
    setSelectedTemplateId(id);
    setShowTemplateList(false);
    setShowError(false); // Clear error when template is selected
  };

  const handleGenerateClick = () => {
    if (!selectedTemplateId) {
      setShowError(true);
      return;
    }
    handleGenerateDocumentation();
  };

  // Close the popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowTemplateList(false);
      }
    };

    if (showTemplateList) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTemplateList]);

  return (
    <div
      className="bg-white shadow-md rounded-lg p-4 flex flex-col space-y-4"
      ref={containerRef}
    >
      {/* Additional Information Section */}
      <div>
        <h2 className="text-xl font-bold mb-2">Información Adicional</h2>
        <textarea
          className="w-full h-24 border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={extraInfo}
          placeholder="Agrega información extra..."
          onChange={(e) => setExtraInfo(e.target.value)}
        />
      </div>

      {/* Template Selection Section */}
      <div className="relative">
        <h3 className="text-lg font-semibold mb-2">Plantilla Seleccionada</h3>
        {showError && !selectedTemplateId && (
          <p className="text-red-500 text-sm mb-2">
            Por favor, selecciona una plantilla antes de generar la
            documentación
          </p>
        )}
        <div
          className="p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          onClick={toggleTemplateList}
        >
          {selectedTemplate
            ? selectedTemplate.titulo
            : "Selecciona una plantilla"}
        </div>
        {showTemplateList && (
          <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-500 rounded-lg shadow-lg z-30">
            <TemplateList
              templates={templates}
              loading={loading}
              selectedTemplateId={selectedTemplateId}
              setSelectedTemplateId={handleSelectTemplate}
            />
          </div>
        )}
      </div>

      {/* Generate Documentation Button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerateClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Generar Documentación
        </button>
      </div>
    </div>
  );
};

export default ExtraInfoBox;
