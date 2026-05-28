import { useEffect, useState } from "react";
import { get, post, put, del } from "../services/api";

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    clienteId: "",
    clienteNome: "",
    servicoId: "",
    profissionalId: "",
    dataHora: "",
    status: "CONFIRMADO",
    observacoes: "",
  });
  const [pesquisa, setPesquisa] = useState("");
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [filtroData, setFiltroData] = useState("");
  const [filtroProfissional, setFiltroProfissional] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");

  async function carregar(p = pagina) {
    try {
      const [ag, cl, sv, pr] = await Promise.all([
        get(`/agendamentos?page=${p}&size=20`),
        get("/clientes?size=1000"),
        get("/servicos"),
        get("/profissionais/ativos"),
      ]);
      setAgendamentos(ag.content ?? []);
      setTotalPaginas(ag.totalPages ?? 0);
      setTotalElementos(ag.totalElements ?? 0);
      setClientes(cl.content ?? []);
      setServicos(sv);
      setProfissionais(pr);
    } catch (err) {
      setErro(err.message);
    }
  }

  useEffect(() => { carregar(pagina); }, [pagina]);

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(pesquisa.toLowerCase()) && pesquisa.length > 0
  );

  function selecionarCliente(cliente) {
    setForm({ ...form, clienteId: cliente.id, clienteNome: cliente.nome });
    setPesquisa(cliente.nome);
    setMostrarSugestoes(false);
  }

  const agendamentosFiltrados = agendamentos.filter((a) => {
    const dataMatch = filtroData
      ? new Date(a.dataHora).toISOString().split("T")[0] === filtroData
      : true;
    const profissionalMatch = filtroProfissional
      ? a.profissional?.id === parseInt(filtroProfissional)
      : true;
    const statusMatch = filtroStatus ? a.status === filtroStatus : true;
    const clienteMatch = filtroCliente
      ? a.cliente?.nome?.toLowerCase().includes(filtroCliente.toLowerCase()) ||
        a.cliente?.telefone?.includes(filtroCliente)
      : true;
    return dataMatch && profissionalMatch && statusMatch && clienteMatch;
  });

  function limparFiltros() {
    setFiltroData("");
    setFiltroProfissional("");
    setFiltroStatus("");
    setFiltroCliente("");
  }

  function handleEditar(a) {
    setEditandoId(a.id);
    setPesquisa(a.cliente?.nome || "");
    setForm({
      clienteId: a.cliente?.id || "",
      clienteNome: a.cliente?.nome || "",
      servicoId: a.servico?.id || "",
      profissionalId: a.profissional?.id || "",
      dataHora: a.dataHora ? a.dataHora.substring(0, 16) : "",
      status: a.status,
      observacoes: a.observacoes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelarEdicao() {
    setEditandoId(null);
    setForm({ clienteId: "", clienteNome: "", servicoId: "", profissionalId: "", dataHora: "", status: "CONFIRMADO", observacoes: "" });
    setPesquisa("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clienteId) {
      setErro("Seleciona um cliente da lista de sugestões.");
      return;
    }
    setLoading(true);
    try {
      const body = {
        cliente: { id: parseInt(form.clienteId) },
        servico: { id: parseInt(form.servicoId) },
        profissional: { id: parseInt(form.profissionalId) },
        dataHora: form.dataHora,
        status: editandoId ? form.status : "CONFIRMADO",
        observacoes: form.observacoes,
      };
      if (editandoId) {
        await put(`/agendamentos/${editandoId}`, body);
        setEditandoId(null);
      } else {
        await post("/agendamentos", body);
      }
      setForm({ clienteId: "", clienteNome: "", servicoId: "", profissionalId: "", dataHora: "", status: "CONFIRMADO", observacoes: "" });
      setPesquisa("");
      await carregar(pagina);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAtualizarStatus(id, novoStatus) {
    try {
      await put(`/agendamentos/${id}/status`, { status: novoStatus });
      await carregar(pagina);
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleApagar(id) {
    if (!confirm("Tens a certeza?")) return;
    try {
      await del(`/agendamentos/${id}`);
      await carregar(pagina);
    } catch (err) {
      setErro(err.message);
    }
  }

  function badgeStatus(status) {
    switch (status) {
      case "CONFIRMADO": return "bg-green-100 text-green-700";
      case "PENDENTE":   return "bg-yellow-100 text-yellow-700";
      case "CONCLUIDO":  return "bg-blue-100 text-blue-700";
      case "CANCELADO":  return "bg-red-100 text-red-700";
      default:           return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Agendamentos</h2>

      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {editandoId ? "Editar agendamento" : "Novo agendamento"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="relative col-span-2">
            <input
              type="text"
              placeholder="Pesquisar cliente pelo nome..."
              value={pesquisa}
              onChange={(e) => {
                setPesquisa(e.target.value);
                setForm({ ...form, clienteId: "", clienteNome: "" });
                setMostrarSugestoes(true);
              }}
              onFocus={() => setMostrarSugestoes(true)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {mostrarSugestoes && clientesFiltrados.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {clientesFiltrados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selecionarCliente(c)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-gray-700"
                  >
                    {c.nome} {c.telefone ? `— ${c.telefone}` : ""}
                  </button>
                ))}
              </div>
            )}
            {form.clienteId && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Cliente selecionado: {form.clienteNome}
              </p>
            )}
          </div>

          <select
            value={form.servicoId}
            onChange={(e) => setForm({ ...form, servicoId: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleciona serviço</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>{s.nome} — {s.preco}€</option>
            ))}
          </select>

          <select
            value={form.profissionalId}
            onChange={(e) => setForm({ ...form, profissionalId: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleciona profissional</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>{p.nome} {p.especialidade ? `— ${p.especialidade}` : ""}</option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={form.dataHora}
            onChange={(e) => setForm({ ...form, dataHora: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {editandoId && (
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CONFIRMADO">Confirmado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          )}

          <input
            type="text"
            placeholder="Observações (opcional)"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            className="col-span-2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className={editandoId ? "col-span-2 flex gap-2" : "col-span-2"}>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "A guardar..." : editandoId ? "Guardar alterações" : "Adicionar agendamento"}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={handleCancelarEdicao}
                className="px-6 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Filtrar:</span>
        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filtroProfissional}
          onChange={(e) => setFiltroProfissional(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os profissionais</option>
          {profissionais.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="PENDENTE">Pendente</option>
          <option value="CANCELADO">Cancelado</option>
          <option value="CONCLUIDO">Concluído</option>
        </select>
        <input
          type="text"
          placeholder="Pesquisar por cliente..."
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={limparFiltros}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Limpar filtros
        </button>
        <span className="text-sm text-gray-400 ml-auto">
          {totalElementos} agendamento{totalElementos !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Cliente</th>
              <th className="px-6 py-3 text-left">Serviço</th>
              <th className="px-6 py-3 text-left">Profissional</th>
              <th className="px-6 py-3 text-left">Data e hora</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agendamentosFiltrados.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{a.cliente?.nome}</td>
                <td className="px-6 py-4 text-gray-600">{a.servico?.nome}</td>
                <td className="px-6 py-4 text-gray-600">{a.profissional?.nome || "-"}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(a.dataHora).toLocaleString("pt-PT")}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStatus(a.status)}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex gap-3 justify-end">
                  {a.status !== "CONCLUIDO" && a.status !== "CANCELADO" && (
                    <button
                      onClick={() => handleAtualizarStatus(a.id, "CONCLUIDO")}
                      className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                    >
                      Concluir
                    </button>
                  )}
                  <button
                    onClick={() => handleEditar(a)}
                    className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleApagar(a.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
            {agendamentosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>

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
    </div>
  );
}
