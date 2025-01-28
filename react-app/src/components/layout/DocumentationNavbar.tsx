import React from "react";
import { useMode } from "../../context/ModeContext";
import { Navbar } from "./Navbar";

export const DocumentationNavbar: React.FC = () => {
  const { activeMode, setActiveMode } = useMode();

  return (
    <nav className="bg-blue-600 h-16 flex items-center justify-between px-4">
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveMode("transcribir")}
          className={`px-4 py-2 rounded-md text-base font-semibold transition-colors 
            ${
              activeMode === "transcribir"
                ? "bg-white text-blue-600"
                : "text-white hover:bg-blue-700"
            }`}
        >
          Transcribir
        </button>
        <button
          onClick={() => setActiveMode("generar")}
          className={`px-4 py-2 rounded-md text-base font-semibold transition-colors
            ${
              activeMode === "generar"
                ? "bg-white text-blue-600"
                : "text-white hover:bg-blue-700"
            }`}
        >
          Generar
        </button>
      </div>
      <Navbar />
    </nav>
  );
};
