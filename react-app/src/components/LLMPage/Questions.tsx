// src/pages/Questions.tsx
import React, { useState } from "react";
import axios from "../../axiosConfig";
import { toast } from "react-toastify";

// Types for API response
interface ApiResponse {
  generatedQuestion: string;
  success: boolean;
}

// Types for component props
interface Message {
  type: "user" | "ai";
  content: string;
}

/**
 * Questions Component
 * Handles generation of questions based on user input
 */
const Questions: React.FC = () => {
  // State management
  const [inputText, setInputText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  /**
   * Validates input before making API call
   */
  const validateInput = (input: string): boolean => {
    if (!input.trim()) {
      toast.error("Por favor ingrese un texto");
      return false;
    }
    return true;
  };

  /**
   * Handles the question generation process
   */
  const handleGenerateQuestion = async (): Promise<void> => {
    if (!validateInput(inputText)) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.post<ApiResponse>(
        `${API_URL}/generarPregunta`,
        { message: inputText },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessages((prev) => [
        ...prev,
        { type: "user", content: inputText },
        { type: "ai", content: response.data.generatedQuestion },
      ]);

      setInputText("");
      toast.success("Pregunta generada exitosamente");
    } catch (error) {
      const errorMessage = "Error al generar la pregunta";
      console.error(errorMessage, error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setInputText("");
    setMessages([]);
    setError("");
  };

  return (
    <div
      className="bg-gray-100 flex p-6"
      style={{ height: "calc(100vh - 10rem)" }}
    >
      {/* Input Section */}
      <div className="w-1/2 bg-white shadow-md rounded-lg p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Entrada de Consulta</h2>
        <textarea
          className="flex-grow border border-gray-300 rounded-lg p-4 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ingrese su consulta aquí..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
        />
        <div className="mt-4 flex space-x-4">
          <button
            onClick={handleGenerateQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow 
                     hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !inputText.trim()}
          >
            {loading ? "Generando..." : "Generar Respuesta"}
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow 
                     hover:bg-gray-600 disabled:opacity-50"
            disabled={loading || (!inputText && messages.length === 0)}
          >
            Limpiar
          </button>
        </div>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>

      {/* Output Section */}
      <div className="w-1/2 bg-white shadow-md rounded-lg p-6 flex flex-col ml-4">
        <h2 className="text-2xl font-bold mb-4">Historial de Consultas</h2>
        <div
          className="flex-grow border border-gray-300 rounded-lg p-4 
                      overflow-y-auto bg-gray-50 space-y-4"
        >
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">
              No hay consultas realizadas
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;
