import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faCheckCircle,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";

const Home: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-400 text-white p-6 text-center w-3/4 mx-auto rounded-lg mt-4">
        <h1 className="text-4xl font-bold">Servicios de IA y Medicina</h1>
        <p className="mt-2 text-lg">
          Simplificando procesos médicos con inteligencia artificial.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold text-center mb-8">
          ¿Cómo Funciona?
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
          {/* Step 1 */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center w-full md:w-1/3">
            <div className="text-6xl text-blue-600 mb-4">1️⃣</div>
            <h3 className="text-2xl font-bold mb-2">Graba</h3>
            <p>
              Registra tus citas médicas o entrevistas utilizando nuestra
              aplicación de grabación segura.
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center w-full md:w-1/3">
            <div className="text-6xl text-blue-600 mb-4">2️⃣</div>
            <h3 className="text-2xl font-bold mb-2">Transcribe</h3>
            <p>
              Nuestro sistema convierte automáticamente las grabaciones en texto
              preciso y estructurado.
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center w-full md:w-1/3">
            <div className="text-6xl text-blue-600 mb-4">3️⃣</div>
            <h3 className="text-2xl font-bold mb-2">
              Pregunta o Genera Documentación
            </h3>
            <p>
              Utiliza la transcripción para hacer preguntas o generar documentos
              médicos detallados.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-12">
          <h2 className="text-3xl font-semibold text-center mb-8">
            Características
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
            <div className="bg-white shadow-md rounded-lg p-6 text-center w-full md:w-1/3">
              <FontAwesomeIcon
                icon={faShieldAlt}
                className="text-6xl text-blue-600 mb-4"
              />
              <h3 className="text-2xl font-bold mb-2">Seguridad</h3>
              <p>
                Tus datos están protegidos con las mejores prácticas de
                seguridad.
              </p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 text-center w-full md:w-1/3">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-6xl text-blue-600 mb-4"
              />
              <h3 className="text-2xl font-bold mb-2">Precisión</h3>
              <p>
                Nuestro sistema garantiza transcripciones precisas y confiables.
              </p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 text-center w-full md:w-1/3">
              <FontAwesomeIcon
                icon={faUserFriends}
                className="text-6xl text-blue-600 mb-4"
              />
              <h3 className="text-2xl font-bold mb-2">Facilidad de Uso</h3>
              <p>Interfaz intuitiva y fácil de usar para todos los usuarios.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
