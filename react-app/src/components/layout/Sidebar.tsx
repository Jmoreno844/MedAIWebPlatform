import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust the import path as needed
import UltimosEncuentrosBar from "./UltimosEncuentrosBar";
import { secureStore, Encounter } from "../../utils/secure-store";

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const [isSecondSidebarOpen, setIsSecondSidebarOpen] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(
    null
  );

  const cerrarSesion = async () => {
    await logout();
  };

  useEffect(() => {
    const encuentro = secureStore.get();
    setSelectedEncounter(encuentro);
  }, []);

  return (
    <>
      <div className="w-64 min-h-screen bg-gray-800 text-white flex flex-col justify-between text-center">
        <div>
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-3">Bienvenido!</h2>
            {selectedEncounter ? (
              <div className="flex justify-between w-11/12 mx-auto">
                <h2 className="text-base font-bold ">
                  ID: {selectedEncounter.identificador_paciente}
                </h2>
                <h2 className="text-base font-bold w-5/8">
                  Fecha:{" "}
                  {new Date(selectedEncounter.created_at).toLocaleString([], {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </h2>
              </div>
            ) : (
              <h2 className="text-xl font-bold">
                Ningún encuentro seleccionado
              </h2>
            )}
          </div>
          <ul className="mt-4">
            <li className="hover:bg-gray-500 bg-gray-700">
              <button
                onClick={() => setIsSecondSidebarOpen(!isSecondSidebarOpen)}
                className="block w-full p-4 text-center"
              >
                Últimos Encuentros {isSecondSidebarOpen ? "◀" : "▶"}
              </button>
            </li>
            <li className="hover:bg-gray-500 bg-gray-700">
              <Link to="/home" className="block p-4">
                Home
              </Link>
            </li>
            <li className="hover:bg-gray-500 bg-gray-700">
              <Link to="/documentacion" className="block p-4">
                Documentacion
              </Link>
            </li>
            <li className="hover:bg-gray-500 bg-gray-700">
              <Link to="/chat" className="block p-4">
                Chat IA
              </Link>
            </li>
          </ul>
        </div>
        <ul className="mb-4">
          <li className="hover:bg-gray-500 bg-gray-700">
            <Link to="/configuracion" className="block p-4">
              Configuración
            </Link>
          </li>
          <li className="hover:bg-gray-500 bg-gray-700">
            <button
              onClick={cerrarSesion}
              className="block w-full p-4 text-center"
            >
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>

      {/* Second Sidebar */}
      <div
        className={`fixed left-64 min-h-screen bg-gray-700 transition-all duration-300 ease-in-out ${
          isSecondSidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-4">
          <UltimosEncuentrosBar
            onSelectEncuentro={(encuentro: Encounter | null) => {
              // Explicitly type the parameter
              if (encuentro) {
                secureStore.set(encuentro);
                setSelectedEncounter(encuentro);
              } else {
                secureStore.clear();
                setSelectedEncounter(null);
              }
              setIsSecondSidebarOpen(false);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
