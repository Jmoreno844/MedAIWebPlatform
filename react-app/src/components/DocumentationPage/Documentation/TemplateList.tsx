import React from "react";
import { ResumenTemplate } from "./types";

interface TemplateListProps {
  templates: ResumenTemplate[];
  loading: boolean;
  selectedTemplateId: number | null;
  setSelectedTemplateId: (id: number) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  loading,
  selectedTemplateId,
  setSelectedTemplateId,
}) => (
  <div className="relative py-2">
    {loading ? (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    ) : (
      <ul className="absolute z-20 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-auto right-0 w-full">
        {templates.map((template) => (
          <li
            key={template.id}
            className={`p-2 cursor-pointer rounded ${
              selectedTemplateId === template.id
                ? "bg-blue-50 border-l-4 border-blue-400"
                : "hover:bg-gray-50 border-gray-200 border"
            }`}
            onClick={() => setSelectedTemplateId(template.id)}
          >
            {template.titulo}
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default TemplateList;
