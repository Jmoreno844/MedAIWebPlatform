import React, { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import axios from "../../axiosConfig";

import { useAuth } from "../../context/AuthContext";

interface Paciente {
  id: number;
  identificador: string;
}

interface CheckPacienteResponse {
  exists: boolean;
  paciente_id: number;
}

interface CrearEncuentroProps {
  onClose: () => void;
}

const CrearEncuentro: React.FC<CrearEncuentroProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await axios.get<Paciente[]>(
          `${process.env.REACT_APP_API_URL}/api/pacientes`
        );
        setPacientes(response.data);
      } catch (err) {
        console.error("Error fetching pacientes:", err);
      }
    };
    fetchPacientes();
  }, []);

  useEffect(() => {
    if (!userId.trim()) {
      setFilteredPacientes([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = pacientes.filter((p) =>
      p.identificador.toLowerCase().includes(userId.toLowerCase())
    );
    setFilteredPacientes(filtered);
    setShowSuggestions(true);
  }, [userId, pacientes]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !userId.trim()) {
      alert("Invalid user data");
      return;
    }
    setIsLoading(true);

    try {
      let paciente = pacientes.find(
        (p) => p.identificador.toLowerCase() === userId.toLowerCase()
      );

      const encodedId = encodeURIComponent(userId.trim().toLowerCase());
      // If paciente is not found locally, check if it exists in the system
      if (!paciente) {
        const checkResponse = await axios.get<CheckPacienteResponse>(
          `${process.env.REACT_APP_API_URL}/api/paciente/${encodedId}`
        );
        console.log(checkResponse.data);
        if (checkResponse.data.exists) {
          // Patient exists, associate with current medico
          const associateRes = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/medico-paciente/asociar`,
            {
              paciente_id: checkResponse.data.paciente_id,
              medico_id: user.id,
            }
          );
        } else {
          // Create new patient
          const createRes = await axios.post<Paciente>(
            `${process.env.REACT_APP_API_URL}/api/crear-paciente`,
            {
              identificador: userId.trim(),
            }
          );
          paciente = createRes.data;
        }
        setPacientes((prev) =>
          prev.map((p) => {
            // Always return a valid Paciente or filter instead of returning undefined
            return {
              ...p,
              // ...some updated fields...
            };
          })
        );
      }

      // Create encounter
      await axios.post(`${process.env.REACT_APP_API_URL}/api/crear-encuentro`, {
        identificador_paciente: encodedId,
        id_medico: user.id,
      });

      alert("Encuentro creado exitosamente."); // Add success alert
      onClose();
    } catch (err) {
      if (isAxiosError(err)) {
        console.error("Axios error creating encounter:", err.response?.data);
      } else if (err instanceof Error) {
        console.error("Error creating encounter:", err.message);
      } else {
        console.error("Error creating encounter:", err);
      }
      alert("Error creating encounter. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  const handleSuggestionClick = (identificador: string) => {
    setUserId(identificador);
    setShowSuggestions(false);
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 p-4">
      <form onSubmit={handleCreate} className="flex flex-col space-y-2">
        <label htmlFor="userId" className="text-gray-700 font-medium">
          Identificador de Usuario:
        </label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={handleUserIdChange}
          className="border border-gray-300 rounded-md px-2 py-1 text-gray-900"
          required
        />
        {showSuggestions && filteredPacientes.length > 0 && (
          <ul className="border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
            {filteredPacientes.map((p) => (
              <li
                key={`${p.id}-${p.identificador}`}
                onClick={() => handleSuggestionClick(p.identificador)}
                className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-gray-900"
              >
                {p.identificador}
              </li>
            ))}
          </ul>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
};

export default CrearEncuentro;
