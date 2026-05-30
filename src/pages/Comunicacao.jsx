import { useEffect, useState } from "react";
import { get, post } from "../services/api";
import Spinner from "../components/Spinner";

export default function Comunicacao() {
  const [historico, setHistorico] = useState([]);
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  async function carregar() {
    setCarregando(true);
    try { setHistorico(await get("/mensagens")); }
    catch { setHistorico([]); }
    finally { setCarregando(false); }
  }
  useEffect(() => { carregar(); }, []);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setResultado(null);
    if (!confirm("Enviar esta mensagem para TODOS os clientes do salão?")) return;
    setLoading(true);
    try {
      const r = await post("/mensagens/broadcast", { assunto, mensagem });
      setResultado(r);
      setAssunto("");
      setMensagem("");
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Comunicação</h2>
      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-sm text-blue-800 space-y-1">
        <p>✉️ As mensagens são enviadas por <strong>email</strong> para todos os clientes com email registado.</p>
        <p>⏰ Os clientes recebem automaticamente um <strong>lembrete 24h antes</strong> de cada marcação.</p>
        <p className="text-blue-600">
          ℹ️ O envio real de email ativa-se ao configurar as credenciais SMTP no servidor (variável <code>MAIL_ENABLED=true</code>).
          Sem isso, os envios são simulados e registados no log.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Nova mensagem em massa</h3>
        {resultado && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
            Campanha registada — {resultado.totalDestinatarios} destinatário(s) com email,
            {" "}{resultado.totalEnviados} envio(s) efetivo(s).
          </div>
        )}
        <form onSubmit={enviar} className="space-y-4">
          <input type="text" placeholder="Assunto (ex: Promoção de Verão!)" value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <textarea placeholder="Escreve aqui a tua mensagem..." value={mensagem}
            onChange={(e) => setMensagem(e.target.value)} rows={6}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50">
            {loading ? "A enviar..." : "Disparar para todos os clientes"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-base font-semibold text-gray-800">Histórico de campanhas</h3>
        </div>
        {carregando ? <Spinner /> : <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Data</th>
              <th className="px-6 py-3 text-left">Assunto</th>
              <th className="px-6 py-3 text-left">Canal</th>
              <th className="px-6 py-3 text-left">Destinatários</th>
              <th className="px-6 py-3 text-left">Enviados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {historico.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">{new Date(m.dataEnvio).toLocaleString("pt-PT")}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{m.assunto}</td>
                <td className="px-6 py-4 text-gray-600">{m.canal}</td>
                <td className="px-6 py-4 text-gray-600">{m.totalDestinatarios}</td>
                <td className="px-6 py-4 text-gray-600">{m.totalEnviados}</td>
              </tr>
            ))}
            {historico.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhuma campanha enviada ainda.</td></tr>
            )}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
