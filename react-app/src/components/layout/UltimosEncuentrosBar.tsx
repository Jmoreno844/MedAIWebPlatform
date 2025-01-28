import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import CrearEncuentro from "./CrearEncuentro";

interface Encuentro {
  id: number;
  id_paciente: number; // Added property
  identificador_paciente: string;
  created_at: string;
}

interface UltimosEncuentrosBarProps {
  onSelectEncuentro: (encuentro: Encuentro | null) => void;
}

const UltimosEncuentrosBar: React.FC<UltimosEncuentrosBarProps> = ({
  onSelectEncuentro,
}) => {
  // State management
  const [encuentros, setEncuentros] = useState<Encuentro[]>([]);
  const [days, setDays] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showCrearEncuentro, setShowCrearEncuentro] = useState<boolean>(false);

  /**
   * Fetches encounters from the API with error handling and loading states
   */
  const fetchEncuentros = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/encuentros/ultimos?days=${days}`
      );
      setEncuentros(response.data);
    } catch (err) {
      console.error("Error fetching encounters:", err);
      setError("No se pudo cargar los encuentros.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch encounters when days change
  useEffect(() => {
    fetchEncuentros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  /**
   * Handles closing the CrearEncuentro modal and refreshes encounters
   */
  const handleCloseCrearEncuentro = async () => {
    setShowCrearEncuentro(false);
    await fetchEncuentros(); // Refresh encounters list
  };

  return (
    <div className="text-white relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Encuentros</h2>
        <button
          onClick={() => setShowCrearEncuentro(true)}
          className="bg-green-600 text-white mt-1 mb-2 font-medium px-3 py-0.5 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
          aria-label="Create new encounter"
        >
          Crear Encuentro
        </button>
      </div>

      {/* Time filter buttons */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setDays(1)}
          className={`px-3 py-1 mr-2 rounded ${
            days === 1 ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-300"
          } hover:bg-blue-700 focus:outline-none`}
        >
          Último Día
        </button>
        <button
          onClick={() => setDays(7)}
          className={`px-3 py-1 rounded ${
            days === 7 ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-300"
          } hover:bg-blue-700 focus:outline-none`}
        >
          Últimos 7 Días
        </button>
      </div>

      {/* Encounters list */}
      {isLoading ? (
        <div role="status" className="animate-pulse">
          <p>Cargando encuentros...</p>
        </div>
      ) : error ? (
        <div role="alert" className="text-red-500">
          {error}
        </div>
      ) : encuentros.length === 0 ? (
        <p>No se encontraron encuentros para este periodo de tiempo.</p>
      ) : (
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <ul>
            {encuentros.map((encuentro) => (
              <li key={encuentro.id} className="mb-2">
                <button
                  onClick={() => onSelectEncuentro(encuentro)}
                  className="p-2 bg-gray-600 rounded shadow w-full text-left hover:bg-gray-500 focus:outline-none"
                >
                  <p className="font-medium">
                    {encuentro.identificador_paciente}
                  </p>
                  <p className="text-sm text-gray-300">
                    Fecha: {new Date(encuentro.created_at).toLocaleString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CrearEncuentro Modal */}
      {showCrearEncuentro && (
        <div className="relative">
          <CrearEncuentro onClose={handleCloseCrearEncuentro} />
          {/* Click outside to close */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowCrearEncuentro(false)}
          />
        </div>
      )}
    </div>
  );
};

export default UltimosEncuentrosBar;
