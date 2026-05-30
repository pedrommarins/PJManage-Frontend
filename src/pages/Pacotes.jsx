import { useEffect, useState } from "react";
import { get, post, put, del } from "../services/api";
import Spinner from "../components/Spinner";

export default function Pacotes() {
  const [pacotes, setPacotes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ nome: "", servicoId: "", numeroSessoes: "", preco: "", validadeDias: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);

  // Venda
  const [vendaClienteId, setVendaClienteId] = useState("");
  const [vendaPacoteId, setVendaPacoteId] = useState("");
  const [clientePacotes, setClientePacotes] = useState([]);

  async function carregar() {
    setCarregando(true);
    try {
      const [pac, sv, cl] = await Promise.all([
        get("/pacotes"),
        get("/servicos"),
        get("/clientes?size=1000"),
      ]);
      setPacotes(pac);
      setServicos(sv);
      setClientes(cl.content ?? []);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => { carregar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        nome: form.nome,
        servico: form.servicoId ? { id: parseInt(form.servicoId) } : null,
        numeroSessoes: parseInt(form.numeroSessoes),
        preco: parseFloat(form.preco),
        validadeDias: form.validadeDias ? parseInt(form.validadeDias) : null,
        ativo: true,
      };
      if (editandoId) {
        await put(`/pacotes/${editandoId}`, body);
        setEditandoId(null);
      } else {
        await post("/pacotes", body);
      }
      setForm({ nome: "", servicoId: "", numeroSessoes: "", preco: "", validadeDias: "" });
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEditar(p) {
    setForm({
      nome: p.nome,
      servicoId: p.servico?.id || "",
      numeroSessoes: p.numeroSessoes,
      preco: p.preco,
      validadeDias: p.validadeDias ?? "",
    });
    setEditandoId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleApagar(id) {
    if (!confirm("Tens a certeza?")) return;
    try { await del(`/pacotes/${id}`); await carregar(); }
    catch (err) { setErro(err.message); }
  }

  async function carregarClientePacotes(clienteId) {
    if (!clienteId) { setClientePacotes([]); return; }
    try {
      setClientePacotes(await get(`/pacotes/cliente/${clienteId}`));
    } catch { setClientePacotes([]); }
  }

  async function vender() {
    if (!vendaClienteId || !vendaPacoteId) { setErro("Seleciona cliente e pacote."); return; }
    try {
      await post(`/pacotes/${vendaPacoteId}/vender/${vendaClienteId}`, {});
      setVendaPacoteId("");
      await carregarClientePacotes(vendaClienteId);
    } catch (err) { setErro(err.message); }
  }

  async function consumir(cpId) {
    try {
      await post(`/pacotes/clientes-pacotes/${cpId}/consumir`, {});
      await carregarClientePacotes(vendaClienteId);
    } catch (err) { setErro(err.message); }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pacotes de sessões</h2>
      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {editandoId ? "Editar pacote" : "Novo pacote"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <input type="text" placeholder="Nome do pacote" value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <select value={form.servicoId} onChange={(e) => setForm({ ...form, servicoId: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Serviço (opcional)</option>
            {servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <input type="number" min="1" placeholder="Nº de sessões" value={form.numeroSessoes}
            onChange={(e) => setForm({ ...form, numeroSessoes: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="number" step="0.01" placeholder="Preço €" value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="number" placeholder="Validade (dias, opcional)" value={form.validadeDias}
            onChange={(e) => setForm({ ...form, validadeDias: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50">
              {loading ? "A guardar..." : editandoId ? "Guardar" : "Adicionar"}
            </button>
            {editandoId && (
              <button type="button" onClick={() => { setEditandoId(null); setForm({ nome: "", servicoId: "", numeroSessoes: "", preco: "", validadeDias: "" }); }}
                className="px-4 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        {carregando ? <Spinner /> : <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">Serviço</th>
              <th className="px-6 py-3 text-left">Sessões</th>
              <th className="px-6 py-3 text-left">Preço</th>
              <th className="px-6 py-3 text-left">Validade</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pacotes.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{p.nome}</td>
                <td className="px-6 py-4 text-gray-600">{p.servico?.nome || "—"}</td>
                <td className="px-6 py-4 text-gray-600">{p.numeroSessoes}</td>
                <td className="px-6 py-4 text-gray-600">{p.preco}€</td>
                <td className="px-6 py-4 text-gray-600">{p.validadeDias ? `${p.validadeDias} dias` : "—"}</td>
                <td className="px-6 py-4 text-right flex gap-3 justify-end">
                  <button onClick={() => handleEditar(p)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">Editar</button>
                  <button onClick={() => handleApagar(p.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Apagar</button>
                </td>
              </tr>
            ))}
            {pacotes.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Nenhum pacote criado ainda.</td></tr>
            )}
          </tbody>
        </table>}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Vender / gerir pacotes de um cliente</h3>
        <div className="flex gap-3 mb-4 flex-wrap">
          <select value={vendaClienteId}
            onChange={(e) => { setVendaClienteId(e.target.value); carregarClientePacotes(e.target.value); }}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Seleciona cliente</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select value={vendaPacoteId} onChange={(e) => setVendaPacoteId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Seleciona pacote</option>
            {pacotes.map((p) => <option key={p.id} value={p.id}>{p.nome} — {p.preco}€</option>)}
          </select>
          <button onClick={vender}
            className="px-5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg">Vender pacote</button>
        </div>

        {vendaClienteId && (
          clientePacotes.length === 0 ? (
            <p className="text-sm text-gray-400">Este cliente ainda não tem pacotes.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">Pacote</th>
                  <th className="px-4 py-2 text-left">Sessões restantes</th>
                  <th className="px-4 py-2 text-left">Validade</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientePacotes.map((cp) => (
                  <tr key={cp.id}>
                    <td className="px-4 py-2 text-gray-700">{cp.pacote?.nome}</td>
                    <td className="px-4 py-2 text-gray-600">{cp.sessoesRestantes}</td>
                    <td className="px-4 py-2 text-gray-500">{cp.dataValidade ? new Date(cp.dataValidade).toLocaleDateString("pt-PT") : "—"}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => consumir(cp.id)} disabled={cp.sessoesRestantes <= 0}
                        className="text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-40">Consumir sessão</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
