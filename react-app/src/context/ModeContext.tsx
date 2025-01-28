import React, { createContext, useContext, useState } from "react";

type Mode = "transcribir" | "generar";

interface ModeContextType {
  activeMode: Mode;
  setActiveMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeMode, setActiveMode] = useState<Mode>("transcribir");

  console.log("ModeProvider render - activeMode:", activeMode);

  const setMode = (mode: Mode) => {
    console.log("ModeProvider setMode called with:", mode);
    setActiveMode(mode);
  };

  return (
    <ModeContext.Provider value={{ activeMode, setActiveMode: setMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  console.log("useMode hook called - current mode:", context.activeMode);
  return context;
};
