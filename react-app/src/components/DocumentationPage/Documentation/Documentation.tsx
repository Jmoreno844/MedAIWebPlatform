import React, { useState, useEffect } from "react";
import { useTranscription } from "./hooks/useTranscription";
import { useTemplates } from "./hooks/useTemplates";
import TranscriptionBox from "./TranscriptionBox";
import ExtraInfoBox from "./ExtraInfoBox";
import GeneratedDocumentation from "./GeneratedDocumentation";
import axios from "../../../axiosConfig";
import { secureStore } from "../../../utils/secure-store";
import { useAuth } from "../../../context/AuthContext";

const Documentation: React.FC = () => {
  const [generatedText, setGeneratedText] = useState("");
  const [error, setError] = useState("");
  const [encuentroId, setEncuentroId] = useState<number | null>(null);
  const { user } = useAuth();
  const [documentationSavedExists, setDocumentationSavedExists] =
    useState(false);
  const [extraInfo, setExtraInfo] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );

  const { transcription, loading: transcriptionLoading } =
    useTranscription(encuentroId);
  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
  } = useTemplates();

  useEffect(() => {
    const fetchEncuentroData = () => {
      const encuentro = secureStore.get();
      if (encuentro) {
        setEncuentroId(encuentro.id);
        fetchDocumentacion(encuentro.id);
      } else {
        setError("No hay un encuentro seleccionado.");
      }
    };

    fetchEncuentroData();
  }, []);

  const fetchDocumentacion = async (encuentro_id: number) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/documentacion/${encuentro_id}`
      );
      if (response.data.length > 0) {
        setGeneratedText(response.data[0].contenido);
        setDocumentationSavedExists(true);
      } else {
        setDocumentationSavedExists(false);
      }
    } catch {
      setError("No se pudo cargar la documentación existente.");
    }
  };

  const handleSaveDocumentation = async () => {
    if (!encuentroId) return;
    try {
      if (documentationSavedExists) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/documentacion/${encuentroId}`,
          {
            tipo_documento: "Documentacion clinica",
            contenido: generatedText,
          }
        );
        alert("Documentación actualizada exitosamente.");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/documentacion/${encuentroId}`,
          {
            tipo_documento: "Documentacion clinica",
            contenido: generatedText,
          }
        );
        alert("Documentación guardada exitosamente.");
        setDocumentationSavedExists(true);
      }
    } catch {
      setError("Error al guardar la documentación.");
    }
  };

  const handleGenerateDocumentation = async () => {
    if (!selectedTemplateId || !user?.id) {
      setError("Selecciona una plantilla para continuar.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/generarDocumento`,
        {
          transcripcion_consulta: transcription,
          informacion_extra: extraInfo || "",
          id_plantilla: selectedTemplateId,
        }
      );
      const generatedContent = response.data.generated_text;
      console.log(generatedContent);
      setGeneratedText(generatedContent);
    } catch {
      setError("Error al generar el documento.");
    }
  };

  const handleDeleteDocumentation = async () => {
    if (
      !window.confirm(
        "¿Está seguro de eliminar la documentación? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/documentacion/${encuentroId}`
      );
      setGeneratedText("");
      setDocumentationSavedExists(false);
    } catch {
      setError("No se pudo borrar la documentación existente.");
    }
  };

  return (
    <div className="flex w-full p-6 bg-gray-100 h-full">
      {/* Left side: 2 stacked boxes */}
      <div className="w-1/2 flex flex-col space-y-4 pr-4">
        {/* Top box: Transcription */}
        <TranscriptionBox
          transcription={transcription}
          loading={transcriptionLoading}
        />

        {/* Bottom box: Extra Info + Template Selection */}
        <ExtraInfoBox
          extraInfo={extraInfo}
          setExtraInfo={setExtraInfo}
          templates={templates}
          loading={templatesLoading}
          selectedTemplateId={selectedTemplateId}
          setSelectedTemplateId={setSelectedTemplateId}
          handleGenerateDocumentation={handleGenerateDocumentation}
        />
      </div>

      {/* Right side: Generated documentation */}
      <GeneratedDocumentation
        generatedText={generatedText}
        loading={false}
        handleSaveDocumentation={handleSaveDocumentation}
        handleDeleteDocumentation={handleDeleteDocumentation}
      />
    </div>
  );
};

export default Documentation;
