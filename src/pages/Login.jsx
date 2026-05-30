import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, primeiroAcesso } from "../services/api";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState("login");

  const [paId, setPaId] = useState("");
  const [paSenha, setPaSenha] = useState("");
  const [paSenha2, setPaSenha2] = useState("");
  const [paMsg, setPaMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const data = await login(codigo, senha);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userNome", data.nome);
      localStorage.setItem("salaoId", data.salaoId ?? "");
      localStorage.setItem("role", data.role ?? "");
      localStorage.setItem("nivel", data.nivel ?? "");
      onLogin();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePrimeiroAcesso(e) {
    e.preventDefault();
    setErro("");
    setPaMsg("");
    if (paSenha !== paSenha2) {
      setErro("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await primeiroAcesso(paId, paSenha);
      setPaMsg("Senha definida! Já podes entrar.");
      setCodigo(paId);
      setPaId(""); setPaSenha(""); setPaSenha2("");
      setModo("login");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — marca */}
      <div className="hidden lg:flex w-1/2 bg-[#060612] flex-col items-center justify-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-900/25 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <img
            src="/logo.png"
            alt="PJManage"
            className="h-40 w-auto brightness-0 invert opacity-90 mb-10 drop-shadow-2xl"
          />
          <h2 className="text-2xl font-bold text-white mb-3">
            Bem-vindo de volta
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Sistema de gestão profissional para salões de beleza. Agendamentos, clientes e muito mais.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-3 w-full max-w-xs text-left">
            {[
              "Agendamentos com deteção de conflitos",
              "Programa de fidelização integrado",
              "Relatórios e comissões em tempo real",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-400 text-sm">
                <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1.5 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar ao início
        </button>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo para mobile */}
          <div className="lg:hidden mb-8 text-center">
            <img src="/logo.png" alt="PJManage" className="h-20 w-auto mx-auto" />
          </div>

          {paMsg && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-sm text-green-700 text-center">
              {paMsg}
            </div>
          )}

          {modo === "login" ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Entrar</h1>
                <p className="text-slate-400 text-sm mt-1">Insere as tuas credenciais para aceder</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Usuário
                  </label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className={inputCls}
                    placeholder="0103040001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className={inputCls}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {erro && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      A entrar...
                    </span>
                  ) : "Entrar"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => { setModo("primeiro"); setErro(""); }}
                className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 text-center transition"
              >
                Primeiro acesso? Definir senha →
              </button>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Primeiro acesso</h1>
                <p className="text-slate-400 text-sm mt-1">Define a tua senha para começar</p>
              </div>

              <form onSubmit={handlePrimeiroAcesso} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Usuário
                  </label>
                  <input type="text" value={paId} onChange={(e) => setPaId(e.target.value)}
                    className={inputCls} placeholder="0103040002" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Nova senha
                  </label>
                  <input type="password" value={paSenha} onChange={(e) => setPaSenha(e.target.value)}
                    className={inputCls} placeholder="Mínimo 6 caracteres" minLength={6} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Confirmar senha
                  </label>
                  <input type="password" value={paSenha2} onChange={(e) => setPaSenha2(e.target.value)}
                    className={inputCls} minLength={6} required />
                </div>

                {erro && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                    {erro}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-200 disabled:opacity-50">
                  {loading ? "A definir..." : "Definir senha"}
                </button>
              </form>

              <button type="button" onClick={() => { setModo("login"); setErro(""); }}
                className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700 font-medium py-2 text-center transition">
                ← Voltar ao login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
