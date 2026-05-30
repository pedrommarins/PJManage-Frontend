import { useEffect, useState } from "react";
import { get, post, put, del } from "../services/api";
import Spinner from "../components/Spinner";
import TelemovelInput from "../components/TelemovelInput";

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ nome: "", nif: "", telefone: "", email: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [contaFornecedor, setContaFornecedor] = useState(null);

  async function carregar() {
    setCarregando(true);
    try { setFornecedores(await get("/fornecedores")); }
    catch (err) { setErro(err.message); }
    finally { setCarregando(false); }
  }
  useEffect(() => { carregar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editandoId) { await put(`/fornecedores/${editandoId}`, form); setEditandoId(null); }
      else { await post("/fornecedores", form); }
      setForm({ nome: "", nif: "", telefone: "", email: "" });
      await carregar();
    } catch (err) { setErro(err.message); }
    finally { setLoading(false); }
  }

  function handleEditar(f) {
    setForm({ nome: f.nome, nif: f.nif || "", telefone: f.telefone || "", email: f.email || "" });
    setEditandoId(f.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleApagar(id) {
    if (!confirm("Tens a certeza?")) return;
    try { await del(`/fornecedores/${id}`); await carregar(); }
    catch (err) { setErro(err.message); }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Fornecedores</h2>
      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {editandoId ? "Editar fornecedor" : "Novo fornecedor"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
          <input type="text" placeholder="Nome" value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="NIF" value={form.nif}
            onChange={(e) => setForm({ ...form, nif: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <TelemovelInput value={form.telefone}
            onChange={(v) => setForm({ ...form, telefone: v })} />
          <input type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="col-span-4 flex gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50">
              {loading ? "A guardar..." : editandoId ? "Guardar alterações" : "Adicionar fornecedor"}
            </button>
            {editandoId && (
              <button type="button" onClick={() => { setEditandoId(null); setForm({ nome: "", nif: "", telefone: "", email: "" }); }}
                className="px-6 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {carregando ? <Spinner /> : <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">NIF</th>
              <th className="px-6 py-3 text-left">Telemóvel</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fornecedores.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{f.nome}</td>
                <td className="px-6 py-4 text-gray-600">{f.nif || "—"}</td>
                <td className="px-6 py-4 text-gray-600">{f.telefone || "—"}</td>
                <td className="px-6 py-4 text-gray-600">{f.email || "—"}</td>
                <td className="px-6 py-4 text-right flex gap-3 justify-end">
                  <button onClick={() => setContaFornecedor(f)} className="text-indigo-500 hover:text-indigo-700 text-xs font-medium">Conta</button>
                  <button onClick={() => handleEditar(f)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">Editar</button>
                  <button onClick={() => handleApagar(f.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Apagar</button>
                </td>
              </tr>
            ))}
            {fornecedores.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhum fornecedor registado ainda.</td></tr>
            )}
          </tbody>
        </table>}
      </div>

      {contaFornecedor && (
        <ContaFornecedorModal fornecedor={contaFornecedor} onClose={() => setContaFornecedor(null)} />
      )}
    </div>
  );
}

function ContaFornecedorModal({ fornecedor, onClose }) {
  const [lancamentos, setLancamentos] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [form, setForm] = useState({ tipo: "DEBITO", valor: "", descricao: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      const [ext, sld] = await Promise.all([
        get(`/contas/fornecedor/${fornecedor.id}`),
        get(`/contas/fornecedor/${fornecedor.id}/saldo`),
      ]);
      setLancamentos(ext);
      setSaldo(sld.saldo);
    } catch { setLancamentos([]); }
  }
  useEffect(() => { carregar(); }, []);

  async function guardar(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      await post("/contas/lancamentos", {
        fornecedorId: fornecedor.id,
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        descricao: form.descricao,
      });
      setForm({ tipo: "DEBITO", valor: "", descricao: "" });
      await carregar();
    } catch (err) { setErro(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Conta corrente — {fornecedor.nome}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className={`rounded-xl p-4 text-center mb-6 ${saldo > 0 ? "bg-red-50" : "bg-green-50"}`}>
            <p className={`text-sm font-medium ${saldo > 0 ? "text-red-600" : "text-green-600"}`}>Saldo a pagar</p>
            <p className={`text-3xl font-bold ${saldo > 0 ? "text-red-700" : "text-green-700"}`}>{Number(saldo).toFixed(2)}€</p>
          </div>
          {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}
          <form onSubmit={guardar} className="grid grid-cols-4 gap-2 mb-6">
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="DEBITO">Fatura (débito)</option>
              <option value="CREDITO">Pagamento (crédito)</option>
            </select>
            <input type="number" step="0.01" min="0.01" placeholder="Valor €" value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input type="text" placeholder="Descrição" value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {loading ? "..." : "Lançar"}
            </button>
          </form>

          {lancamentos.length === 0 ? (
            <p className="text-sm text-gray-400">Sem lançamentos.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Valor</th>
                  <th className="px-3 py-2 text-left">Descrição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lancamentos.map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2 text-gray-500">{new Date(l.data).toLocaleDateString("pt-PT")}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        l.tipo === "DEBITO" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {l.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{Number(l.valor).toFixed(2)}€</td>
                    <td className="px-3 py-2 text-gray-500">{l.descricao || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
