// src/axiosConfig.ts
import axios from "axios";
const isDevelopment = process.env.NODE_ENV === "development";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // Enviar cookies en cada solicitud
});

export default instance;
