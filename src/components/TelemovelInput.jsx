import { useEffect, useState } from "react";

// Países com indicativo telefónico (ordenados com Portugal/Brasil no topo)
export const PAISES = [
  { nome: "Portugal", sigla: "PT", codigo: "+351", flag: "🇵🇹" },
  { nome: "Brasil", sigla: "BR", codigo: "+55", flag: "🇧🇷" },
  { nome: "Espanha", sigla: "ES", codigo: "+34", flag: "🇪🇸" },
  { nome: "França", sigla: "FR", codigo: "+33", flag: "🇫🇷" },
  { nome: "Reino Unido", sigla: "GB", codigo: "+44", flag: "🇬🇧" },
  { nome: "Alemanha", sigla: "DE", codigo: "+49", flag: "🇩🇪" },
  { nome: "Itália", sigla: "IT", codigo: "+39", flag: "🇮🇹" },
  { nome: "Suíça", sigla: "CH", codigo: "+41", flag: "🇨🇭" },
  { nome: "Bélgica", sigla: "BE", codigo: "+32", flag: "🇧🇪" },
  { nome: "Países Baixos", sigla: "NL", codigo: "+31", flag: "🇳🇱" },
  { nome: "Luxemburgo", sigla: "LU", codigo: "+352", flag: "🇱🇺" },
  { nome: "Angola", sigla: "AO", codigo: "+244", flag: "🇦🇴" },
  { nome: "Moçambique", sigla: "MZ", codigo: "+258", flag: "🇲🇿" },
  { nome: "Cabo Verde", sigla: "CV", codigo: "+238", flag: "🇨🇻" },
  { nome: "EUA / Canadá", sigla: "US", codigo: "+1", flag: "🇺🇸" },
];

const CODIGO_PADRAO = "+351";

function detetarPais(valor) {
  if (!valor) return null;
  return (
    PAISES.filter((p) => valor.startsWith(p.codigo))
      .sort((a, b) => b.codigo.length - a.codigo.length)[0] || null
  );
}

/**
 * Campo de telemóvel com seletor de país. Ao escolher o país, o indicativo
 * é preenchido automaticamente. O valor emitido é, p.ex., "+351 912345678"
 * (ou "" quando não há número).
 */
export default function TelemovelInput({ value, onChange, className = "" }) {
  const [codigo, setCodigo] = useState(CODIGO_PADRAO);
  const [numero, setNumero] = useState("");

  // Inicializa a partir do valor recebido (modo edição)
  useEffect(() => {
    const pais = detetarPais(value);
    if (pais) {
      setCodigo(pais.codigo);
      setNumero((value.slice(pais.codigo.length) || "").trim());
    } else if (value) {
      setNumero(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emitir(novoCodigo, novoNumero) {
    const limpo = novoNumero.trim();
    onChange(limpo ? `${novoCodigo} ${limpo}` : "");
  }

  function aoMudarPais(e) {
    const novo = e.target.value;
    setCodigo(novo);
    emitir(novo, numero);
  }

  function aoMudarNumero(e) {
    const novo = e.target.value;
    setNumero(novo);
    emitir(codigo, novo);
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        value={codigo}
        onChange={aoMudarPais}
        title="Indicativo do país"
        className="border border-gray-300 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {PAISES.map((p) => (
          <option key={p.sigla} value={p.codigo}>
            {p.flag} {p.sigla} {p.codigo}
          </option>
        ))}
      </select>
      <input
        type="tel"
        placeholder="Telemóvel"
        value={numero}
        onChange={aoMudarNumero}
        className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
