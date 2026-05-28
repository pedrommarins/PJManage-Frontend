import { useEffect, useState } from "react";
import { get, post, put, del } from "../services/api";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtroData, setFiltroData] = useState(new Date().toISOString().split("T")[0]);
  const [historicoCliente, setHistoricoCliente] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  async function carregar(p = pagina) {
    try {
      const data = await get(`/clientes?page=${p}&size=20`);
      setClientes(data.content);
      setTotalPaginas(data.totalPages);
      setTotalElementos(data.totalElements);
    } catch (err) {
      setErro(err.message);
    }
  }

  useEffect(() => { carregar(pagina); }, [pagina]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editandoId) {
        await put(`/clientes/${editandoId}`, form);
        setEditandoId(null);
      } else {
        await post("/clientes", form);
      }
      setForm({ nome: "", email: "", telefone: "" });
      await carregar(pagina);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEditar(c) {
    setForm({ nome: c.nome, email: c.email || "", telefone: c.telefone || "" });
    setEditandoId(c.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelar() {
    setForm({ nome: "", email: "", telefone: "" });
    setEditandoId(null);
  }

  async function handleApagar(id) {
    if (!confirm("Tens a certeza que queres apagar este cliente?")) return;
    try {
      await del(`/clientes/${id}`);
      await carregar(pagina);
    } catch (err) {
      setErro(err.message);
    }
  }

  async function abrirHistorico(cliente) {
    setHistoricoCliente(cliente);
    setLoadingHistorico(true);
    try {
      const data = await get(`/clientes/${cliente.id}/historico`);
      setHistorico(data);
    } catch (err) {
      setHistorico([]);
    } finally {
      setLoadingHistorico(false);
    }
  }

  const clientesFiltrados = clientes.filter((c) => {
    if (!filtroData) return true;
    const dataCriacao = new Date(c.criadoEm).toISOString().split("T")[0];
    return dataCriacao === filtroData;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Clientes</h2>

      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {editandoId ? "Editar cliente" : "Novo cliente"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <input type="text" placeholder="Nome" value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Telefone" value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="col-span-3 flex gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50">
              {loading ? "A guardar..." : editandoId ? "Guardar alterações" : "Adicionar cliente"}
            </button>
            {editandoId && (
              <button type="button" onClick={handleCancelar}
                className="px-6 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Filtrar por data:</span>
        <input type="date" value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        <button onClick={() => setFiltroData("")}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium">Ver todos</button>
        <span className="text-sm text-gray-400 ml-auto">
          {totalElementos} cliente{totalElementos !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Telefone</th>
              <th className="px-6 py-3 text-left">Registado em</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientesFiltrados.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{c.nome}</td>
                <td className="px-6 py-4 text-gray-600">{c.email}</td>
                <td className="px-6 py-4 text-gray-600">{c.telefone}</td>
                <td className="px-6 py-4 text-gray-400">{new Date(c.criadoEm).toLocaleDateString("pt-PT")}</td>
                <td className="px-6 py-4 text-right flex gap-3 justify-end">
                  <button onClick={() => abrirHistorico(c)}
                    className="text-purple-500 hover:text-purple-700 text-xs font-medium">Histórico</button>
                  <button onClick={() => handleEditar(c)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-medium">Editar</button>
                  <button onClick={() => handleApagar(c.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium">Apagar</button>
                </td>
              </tr>
            ))}
            {clientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Nenhum cliente encontrado para esta data.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-600">
            <button onClick={() => setPagina(p => p - 1)} disabled={pagina === 0}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-50">← Anterior</button>
            <span>Página {pagina + 1} de {totalPaginas}</span>
            <button onClick={() => setPagina(p => p + 1)} disabled={pagina >= totalPaginas - 1}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-50">Seguinte →</button>
          </div>
        )}
      </div>

      {/* Modal Histórico */}
      {historicoCliente && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                Histórico — {historicoCliente.nome}
              </h3>
              <button onClick={() => setHistoricoCliente(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto flex-1">
              {loadingHistorico ? (
                <p className="p-6 text-center text-gray-400">A carregar...</p>
              ) : historico.length === 0 ? (
                <p className="p-6 text-center text-gray-400">Nenhum agendamento encontrado.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left">Data e hora</th>
                      <th className="px-6 py-3 text-left">Serviço</th>
                      <th className="px-6 py-3 text-left">Profissional</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historico.map((a) => (
                      <tr key={a.id}>
                        <td className="px-6 py-3 text-gray-600">{new Date(a.dataHora).toLocaleString("pt-PT")}</td>
                        <td className="px-6 py-3 text-gray-600">{a.servico?.nome}</td>
                        <td className="px-6 py-3 text-gray-600">{a.profissional?.nome || "—"}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            a.status === "CONFIRMADO" ? "bg-green-100 text-green-700" :
                            a.status === "PENDENTE"   ? "bg-yellow-100 text-yellow-700" :
                            a.status === "CONCLUIDO"  ? "bg-blue-100 text-blue-700" :
                            "bg-red-100 text-red-700"}`}>
                            {a.status}
                          </span>
                        </td>
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
