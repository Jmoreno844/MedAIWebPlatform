// filepath: /src/components/DocumentationPage/Documentation/hooks/useTemplates.ts
import { useState, useEffect } from "react";
import axios from "../../../../axiosConfig";
import { ResumenTemplate } from "../types";

export const useTemplates = () => {
  const [templates, setTemplates] = useState<ResumenTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/plantillas/resumido`
        );
        setTemplates(response.data);
      } catch {
        setError("Error al cargar las plantillas.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return { templates, loading, error };
};
