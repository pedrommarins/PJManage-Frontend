const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token");
}

function handle401() {
  localStorage.removeItem("token");
  localStorage.removeItem("userNome");
  localStorage.removeItem("salaoId");
  localStorage.removeItem("role");
  localStorage.removeItem("nivel");
  window.dispatchEvent(new CustomEvent("auth:logout"));
}

export async function login(codigo, senha) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo, senha }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.erro || "Erro ao fazer login");
  return data;
}

export async function primeiroAcesso(codigo, senha) {
  const response = await fetch(`${BASE_URL}/auth/primeiro-acesso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo, senha }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.erro || "Erro ao definir senha");
  return data;
}

export async function get(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (response.status === 401) { handle401(); throw new Error("Sessão expirada. Faz login novamente."); }
  if (!response.ok) throw new Error("Erro ao carregar dados");
  return response.json();
}

export async function post(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  if (response.status === 401) { handle401(); throw new Error("Sessão expirada. Faz login novamente."); }
  const data = await response.json();
  if (!response.ok) throw new Error(data.erro || "Erro ao guardar");
  return data;
}

export async function put(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  if (response.status === 401) { handle401(); throw new Error("Sessão expirada. Faz login novamente."); }
  const data = await response.json();
  if (!response.ok) throw new Error(data.erro || "Erro ao atualizar");
  return data;
}

export async function del(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (response.status === 401) { handle401(); throw new Error("Sessão expirada. Faz login novamente."); }
  if (!response.ok) throw new Error("Erro ao apagar");
}
