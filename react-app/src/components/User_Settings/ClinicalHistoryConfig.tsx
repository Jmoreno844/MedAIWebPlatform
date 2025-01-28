import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";

const ClinicalHistoryConfig: React.FC = () => {
  const [clinicalHistory, setClinicalHistory] = useState("");
  const email = localStorage.getItem("email") || "";

  useEffect(() => {
    const fetchClinicalHistory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/get_document/${email}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        setClinicalHistory(response.data.document_text);
      } catch (error) {
        console.error("Error fetching clinical history:", error);
      }
    };

    if (email) {
      fetchClinicalHistory();
    } else {
      console.error("No email found in localStorage");
    }
  }, [email]);

  const handleSave = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/save_document`, {
        email,
        document_text: clinicalHistory,
      });
      alert("Historial clínico guardado exitosamente.");
    } catch (error) {
      console.error("Error saving clinical history:", error);
      alert("Error guardando el historial clínico.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Configurar Historial Clínico</h1>
      <h2 className="text-xl font-bold mb-2">
        Da aqui un ejemplo de como quieres que la documentacion clinica sea
        generada.
      </h2>
      <textarea
        className="w-full h-64 border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Ingrese el historial clínico aquí..."
        value={clinicalHistory}
        onChange={(e) => setClinicalHistory(e.target.value)}
      />
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
      >
        Guardar
      </button>
    </div>
  );
};

export default ClinicalHistoryConfig;
