import { useEffect, useState } from "react";
import { get, post, put, del } from "../services/api";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ nome: "", quantidade: "", quantidadeMinima: "", preco: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  async function carregar() {
    try {
      const [data, alerta] = await Promise.all([
        get("/produtos"),
        get("/produtos/alertas"),
      ]);
      setProdutos(data);
      setAlertas(alerta);
    } catch (err) {
      setErro(err.message);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        nome: form.nome,
        quantidade: parseInt(form.quantidade),
        quantidadeMinima: parseInt(form.quantidadeMinima),
        preco: parseFloat(form.preco),
      };
      if (editandoId) {
        await put(`/produtos/${editandoId}`, body);
        setEditandoId(null);
      } else {
        await post("/produtos", body);
      }
      setForm({ nome: "", quantidade: "", quantidadeMinima: "", preco: "" });
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEditar(p) {
    setForm({ nome: p.nome, quantidade: p.quantidade, quantidadeMinima: p.quantidadeMinima, preco: p.preco || "" });
    setEditandoId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelar() {
    setForm({ nome: "", quantidade: "", quantidadeMinima: "", preco: "" });
    setEditandoId(null);
  }

  async function handleApagar(id) {
    if (!confirm("Tens a certeza?")) return;
    try {
      await del(`/produtos/${id}`);
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Produtos</h2>

      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      {alertas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-red-600 font-medium mb-2">⚠ Stock abaixo do mínimo</p>
          {alertas.map((p) => (
            <p key={p.id} className="text-red-500 text-sm">
              {p.nome} — {p.quantidade} unidades (mínimo: {p.quantidadeMinima})
            </p>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {editandoId ? "Editar produto" : "Novo produto"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Preço (€)"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Quantidade atual"
            value={form.quantidade}
            onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Quantidade mínima"
            value={form.quantidadeMinima}
            onChange={(e) => setForm({ ...form, quantidadeMinima: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "A guardar..." : editandoId ? "Guardar alterações" : "Adicionar produto"}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={handleCancelar}
                className="px-6 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Código</th>
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">Quantidade</th>
              <th className="px-6 py-3 text-left">Mínimo</th>
              <th className="px-6 py-3 text-left">Preço</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {produtos.map((p) => (
              <tr key={p.id} className={`hover:bg-gray-50 ${p.quantidade < p.quantidadeMinima ? "bg-red-50" : ""}`}>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.codigo || "—"}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{p.nome}</td>
                <td className="px-6 py-4 text-gray-600">{p.quantidade}</td>
                <td className="px-6 py-4 text-gray-600">{p.quantidadeMinima}</td>
                <td className="px-6 py-4 text-gray-600">{p.preco ? `${p.preco}€` : "-"}</td>
                <td className="px-6 py-4 text-right flex gap-3 justify-end">
                  <button
                    onClick={() => handleEditar(p)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleApagar(p.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Nenhum produto registado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}