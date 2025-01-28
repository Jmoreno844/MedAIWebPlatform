import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/token`,
        data,
        {
          withCredentials: true,
          headers: {
            "Access-Control-Allow-Origin": process.env.REACT_APP_API_URL,
          },
        }
      );
      login();
      toast.success("Inicio de sesión exitoso");
      navigate("/home");
    } catch (err) {
      toast.error("Correo o contraseña inválidos");
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-[35%] p-12 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-600 text-center">
          MediScribe
        </h1>
        <p className="text-center text-gray-600">
          Por favor ingresa usando tus credenciales
        </p>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Correo
            </label>
            <input
              {...register("email", {
                required: "El correo es requerido",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Correo inválido",
                },
              })}
              type="text"
              id="email"
              placeholder="tucorreo@prueba.com"
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.email ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              {...register("password", {
                required: "La contraseña es requerida",
                minLength: {
                  value: 3,
                  message: "La contraseña debe tener al menos 3 caracteres",
                },
              })}
              type="password"
              id="password"
              placeholder="*****"
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.password ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Entra
          </button>
          <button
            type="button"
            onClick={handleRegister}
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Registrate
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
