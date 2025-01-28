import React, { useEffect, useRef } from "react";
import AudioTranscriber from "./AudioTranscriber/index";
import Documentation from "./Documentation/Documentation";
import { useMode } from "../../context/ModeContext";

const Container: React.FC = () => {
  const { activeMode } = useMode();
  const prevMode = useRef(activeMode);

  useEffect(() => {
    if (prevMode.current !== activeMode) {
      console.log(`Mode changed from ${prevMode.current} to ${activeMode}`);
      prevMode.current = activeMode;
    }
  }, [activeMode]);

  const renderContent = () => {
    console.log("Rendering content for mode:", activeMode);

    switch (activeMode) {
      case "transcribir":
        return <AudioTranscriber />;
      case "generar":
        return <Documentation />;
      default:
        console.warn("Unknown mode:", activeMode);
        return <AudioTranscriber />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex-1">{renderContent()}</div>
    </div>
  );
};

export default Container;
