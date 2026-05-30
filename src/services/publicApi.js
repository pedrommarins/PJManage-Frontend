const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function parseResponse(res) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export async function publicGet(path) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`);
  } catch {
    throw new Error("Sem ligação ao servidor.");
  }
  if (!res.ok) {
    const data = await parseResponse(res);
    throw new Error((data && (data.erro || data.message)) || "Erro ao carregar dados.");
  }
  return (await parseResponse(res)) ?? [];
}

export async function publicPost(path, body) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Sem ligação ao servidor.");
  }
  const data = await parseResponse(res);
  if (!res.ok) throw new Error((data && (data.erro || data.message)) || "Erro ao submeter.");
  return data;
}
