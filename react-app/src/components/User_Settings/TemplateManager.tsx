import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { toast } from "react-toastify";

interface Template {
  id: number;
  titulo: string;
  contenido: string;
  id_medico: number;
}

interface TemplateFormData {
  titulo: string;
  contenido: string;
}

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    titulo: "",
    contenido: "",
  });

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/plantillas`
      );
      setTemplates(response.data);
    } catch (error) {
      toast.error("Error al cargar las plantillas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing && selectedTemplate) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/plantillas/${selectedTemplate.id}`,
          formData
        );
        toast.success("Plantilla actualizada exitosamente");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/plantillas`,
          formData
        );
        toast.success("Plantilla creada exitosamente");
      }
      fetchTemplates();
      resetForm();
    } catch (error) {
      toast.error("Error al guardar la plantilla");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ titulo: "", contenido: "" });
    setIsEditing(false);
    setIsCreating(false);
    setSelectedTemplate(null);
  };

  const handleDelete = async (templateId: number) => {
    if (
      !window.confirm("¿Estás seguro de que deseas eliminar esta plantilla?")
    ) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/plantillas/${templateId}`
      );
      toast.success("Plantilla eliminada exitosamente");
      fetchTemplates();
      resetForm();
    } catch (error) {
      toast.error("Error al eliminar la plantilla");
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setIsEditing(false);
    setFormData({ titulo: "", contenido: "" });
    setSelectedTemplate(null);
    setIsCreating(true);
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({
      titulo: template.titulo,
      contenido: template.contenido,
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Plantillas Médicas</h1>
        <button
          onClick={openCreateForm}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 
                   transition-colors duration-200 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nueva Plantilla
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Plantillas Disponibles
          </h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <ul className="space-y-2">
              {templates.map((template) => (
                <li
                  key={template.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${
                      selectedTemplate?.id === template.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  onClick={() => handleEdit(template)}
                >
                  <h3 className="font-medium text-gray-800">
                    {template.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {template.contenido}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Template Form */}
        <div className="md:col-span-2">
          {(isCreating || isEditing) && (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  {isEditing ? "Editar Plantilla" : "Nueva Plantilla"}
                </h2>
                {isEditing && selectedTemplate && (
                  <button
                    onClick={() => handleDelete(selectedTemplate.id)}
                    className="px-3 py-1 text-sm text-white bg-red-600 rounded-md 
                              hover:bg-red-700 focus:outline-none focus:ring-2 
                              focus:ring-red-500 transition-colors duration-200"
                    disabled={loading}
                  >
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenido
                  </label>
                  <textarea
                    value={formData.contenido}
                    onChange={(e) =>
                      setFormData({ ...formData, contenido: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent h-64"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 
                             hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                             transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
