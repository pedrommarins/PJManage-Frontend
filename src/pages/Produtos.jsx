import { useEffect, useState } from "react";
import { get, post, put, del } from "../services/api";
import Spinner from "../components/Spinner";
import ConfirmModal from "../components/ConfirmModal";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ nome: "", quantidade: "", quantidadeMinima: "", preco: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirmarApagarId, setConfirmarApagarId] = useState(null);
  const [loadingApagar, setLoadingApagar] = useState(false);
  const [movProduto, setMovProduto] = useState(null);
  const [movForm, setMovForm] = useState({ tipo: "ENTRADA", quantidade: "", motivo: "" });
  const [historico, setHistorico] = useState([]);
  const [movLoading, setMovLoading] = useState(false);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [data, alerta] = await Promise.all([
        get("/produtos"),
        get("/produtos/alertas"),
      ]);
      setProdutos(data);
      setAlertas(alerta);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    const qtd = parseInt(form.quantidade);
    const qtdMin = parseInt(form.quantidadeMinima);
    const preco = form.preco === "" ? null : parseFloat(form.preco);
    if (!form.nome.trim()) { setErro("O nome do produto é obrigatório."); return; }
    if (isNaN(qtd) || qtd < 0) { setErro("A quantidade deve ser um número igual ou superior a 0."); return; }
    if (isNaN(qtdMin) || qtdMin < 0) { setErro("A quantidade mínima deve ser um número igual ou superior a 0."); return; }
    if (preco !== null && (isNaN(preco) || preco < 0)) { setErro("O preço deve ser um valor positivo."); return; }
    if (loading) return;
    setLoading(true);
    try {
      const body = { nome: form.nome.trim(), quantidade: qtd, quantidadeMinima: qtdMin, preco };
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

  async function confirmarApagar() {
    setLoadingApagar(true);
    try {
      await del(`/produtos/${confirmarApagarId}`);
      setConfirmarApagarId(null);
      await carregar();
    } catch (err) {
      setErro(err.message);
      setConfirmarApagarId(null);
    } finally {
      setLoadingApagar(false);
    }
  }

  async function abrirMovimento(p) {
    setMovProduto(p);
    setMovForm({ tipo: "ENTRADA", quantidade: "", motivo: "" });
    setHistorico([]);
    try {
      const data = await get(`/movimentos-stock/produto/${p.id}`);
      setHistorico(data);
    } catch {
      setHistorico([]);
    }
  }

  async function registarMovimento(e) {
    e.preventDefault();
    const qtd = parseInt(movForm.quantidade);
    if (isNaN(qtd) || qtd <= 0) { setErro("A quantidade do movimento deve ser superior a 0."); return; }
    if (movLoading) return;
    setMovLoading(true);
    try {
      await post("/movimentos-stock", {
        produtoId: movProduto.id,
        tipo: movForm.tipo,
        quantidade: qtd,
        motivo: movForm.motivo,
      });
      setMovProduto(null);
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setMovLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Produtos</h2>

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-red-600 text-sm">{erro}</p>
          <button onClick={() => setErro("")} className="text-red-400 hover:text-red-600 ml-4 text-lg leading-none">×</button>
        </div>
      )}

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
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Preço (€)"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            min="0"
            placeholder="Quantidade atual"
            value={form.quantidade}
            onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            min="0"
            placeholder="Quantidade mínima"
            value={form.quantidadeMinima}
            onChange={(e) => setForm({ ...form, quantidadeMinima: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="md:col-span-2 flex gap-2">
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
        {carregando ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left hidden md:table-cell">Código</th>
                  <th className="px-6 py-3 text-left">Nome</th>
                  <th className="px-6 py-3 text-left">Qtd</th>
                  <th className="px-6 py-3 text-left hidden md:table-cell">Mínimo</th>
                  <th className="px-6 py-3 text-left">Preço</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produtos.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50 ${p.quantidade < p.quantidadeMinima ? "bg-red-50" : ""}`}>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 hidden md:table-cell">{p.codigo || "—"}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{p.nome}</td>
                    <td className="px-6 py-4 text-gray-600">{p.quantidade}</td>
                    <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{p.quantidadeMinima}</td>
                    <td className="px-6 py-4 text-gray-600">{p.preco ? `${p.preco}€` : "-"}</td>
                    <td className="px-6 py-4 text-right flex gap-3 justify-end">
                      <button onClick={() => abrirMovimento(p)}
                        className="text-green-600 hover:text-green-800 text-xs font-medium">Stock</button>
                      <button onClick={() => handleEditar(p)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium">Editar</button>
                      <button onClick={() => setConfirmarApagarId(p.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium">Apagar</button>
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
        )}
      </div>

      {confirmarApagarId && (
        <ConfirmModal
          mensagem="Tens a certeza que queres apagar este produto?"
          onConfirmar={confirmarApagar}
          onCancelar={() => setConfirmarApagarId(null)}
          loading={loadingApagar}
        />
      )}

      {/* Modal Movimento de Stock */}
      {movProduto && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                Stock — {movProduto.nome} <span className="text-gray-400 font-normal">({movProduto.quantidade} un.)</span>
              </h3>
              <button onClick={() => setMovProduto(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={registarMovimento} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <select value={movForm.tipo}
                  onChange={(e) => setMovForm({ ...movForm, tipo: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAIDA">Saída</option>
                </select>
                <input type="number" min="1" placeholder="Quantidade" value={movForm.quantidade}
                  onChange={(e) => setMovForm({ ...movForm, quantidade: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="text" placeholder="Motivo (opcional)" value={movForm.motivo}
                  onChange={(e) => setMovForm({ ...movForm, motivo: e.target.value })}
                  className="md:col-span-2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" disabled={movLoading}
                  className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50">
                  {movLoading ? "A registar..." : "Registar movimento"}
                </button>
              </form>

              <h4 className="text-sm font-semibold text-gray-600 mb-2">Histórico</h4>
              {historico.length === 0 ? (
                <p className="text-sm text-gray-400">Sem movimentos registados.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left">Data</th>
                      <th className="px-3 py-2 text-left">Tipo</th>
                      <th className="px-3 py-2 text-left">Qtd</th>
                      <th className="px-3 py-2 text-left">Saldo</th>
                      <th className="px-3 py-2 text-left">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historico.map((m) => (
                      <tr key={m.id}>
                        <td className="px-3 py-2 text-gray-500">{new Date(m.data).toLocaleString("pt-PT")}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            m.tipo === "ENTRADA" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600">{m.quantidade}</td>
                        <td className="px-3 py-2 text-gray-600">{m.quantidadeResultante}</td>
                        <td className="px-3 py-2 text-gray-500">{m.motivo || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
