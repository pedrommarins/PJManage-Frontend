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

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export async function login(codigo, senha) {
  let response;
  try {
    response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, senha }),
    });
  } catch {
    throw new Error("Sem ligação ao servidor. Verifica a tua ligação à internet.");
  }
  const data = await parseResponse(response);
  if (!data) throw new Error("O servidor não respondeu. Aguarda uns segundos e tenta novamente.");
  if (!response.ok) throw new Error(data.erro || data.message || "Código ou senha incorretos.");
  return data;
}

export async function primeiroAcesso(codigo, senha) {
  let response;
  try {
    response = await fetch(`${BASE_URL}/auth/primeiro-acesso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, senha }),
    });
  } catch {
    throw new Error("Sem ligação ao servidor.");
  }
  const data = await parseResponse(response);
  if (!response.ok) throw new Error((data && (data.erro || data.message)) || "Erro ao definir senha");
  return data;
}

export async function get(path) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch {
    throw new Error("Sem ligação ao servidor.");
  }
  if (response.status === 401) { handle401(); throw new Error("Sessão expirada. Faz login novamente."); }
  if (!response.ok) {
    const data = await parseResponse(response);
    throw new Error((data && (data.erro || data.message)) || "Erro ao carregar dados.");
  }
  const data = await parseResponse(response);
  return data ?? [];
}

export async function post(path, body) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Sem ligação ao servidor.");
  }
  if (response.status === 401) { handle401(); throw new Error("Sessão expirada. Faz login novamente."); }
  const data = await parseResponse(response);
  if (!response.ok) throw new Error((data && (data.erro || data.message)) || "Erro ao guardar.");
  return data;
}

export async function put(path, body) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Sem ligação ao servidor.");
  }
  if (response.status === 401) { handle401(); throw new Error("Sessão expirada. Faz login novamente."); }
  const data = await parseResponse(response);
  if (!response.ok) throw new Error((data && (data.erro || data.message)) || "Erro ao atualizar.");
  return data;
}

export async function del(path) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch {
    throw new Error("Sem ligação ao servidor.");
  }
  if (response.status === 401) { handle401(); throw new Error("Sessão expirada. Faz login novamente."); }
  if (!response.ok) {
    const data = await parseResponse(response);
    throw new Error((data && (data.erro || data.message)) || "Erro ao apagar.");
  }
}
