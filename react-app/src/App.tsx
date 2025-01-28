import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login/login";
import Register from "./components/login/register";
import Home from "./components/Home";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UserSettings from "./components/User_Settings/UserSettings";
import Layout from "./components/layout/Layout";
import axios from "axios";
import Container from "./components/DocumentationPage/Container";
import { ChatContainer } from "./components/Chat/ChatContainer";

axios.defaults.withCredentials = true;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/documentacion"
            element={
              <ProtectedRoute>
                <Layout>
                  <Container />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChatContainer />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserSettings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Add other protected routes here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
