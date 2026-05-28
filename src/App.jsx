import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [autenticado, setAutenticado] = useState(
    !!localStorage.getItem("token")
  );

  function handleLogin() {
    setAutenticado(true);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userNome");
    localStorage.removeItem("salaoId");
    setAutenticado(false);
  }

  const userNome = localStorage.getItem("userNome") || "";

  return autenticado ? (
    <Dashboard onLogout={handleLogout} userNome={userNome} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}