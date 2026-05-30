import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";

export default function App() {
  const [autenticado, setAutenticado] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    function onLogout() {
      setAutenticado(false);
    }
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  function handleLogin() {
    setAutenticado(true);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userNome");
    localStorage.removeItem("salaoId");
    localStorage.removeItem("role");
    localStorage.removeItem("nivel");
    setAutenticado(false);
  }

  const userNome = localStorage.getItem("userNome") || "";

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/agendar/:salaoId" element={<Booking />} />
      <Route
        path="/login"
        element={autenticado ? <Navigate to="/inicio" replace /> : <Login onLogin={handleLogin} />}
      />
      <Route
        path="/:pagina"
        element={
          autenticado
            ? <Dashboard onLogout={handleLogout} userNome={userNome} />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
