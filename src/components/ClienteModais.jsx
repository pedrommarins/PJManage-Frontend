import { useEffect, useState } from "react";
import { get, post } from "../services/api";
import TelemovelInput from "./TelemovelInput";

export function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{titulo}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export function HistoricoModal({ cliente, onClose }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setHistorico(await get(`/clientes/${cliente.id}/historico`)); }
      catch { setHistorico([]); }
      finally { setLoading(false); }
    })();
  }, [cliente.id]);

  return (
    <Modal titulo={`Histórico — ${cliente.nome}`} onClose={onClose}>
      {loading ? (
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
                <td className="px-6 py-3 text-gray-600">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

export function FichasModal({ cliente, profissionais = [], onClose }) {
  const [fichas, setFichas] = useState([]);
  const [form, setForm] = useState({ marca: "", cor: "", formula: "", oxidante: "", tempoPoseMinutos: "", profissionalId: "", observacoes: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function carregar() {
    try { setFichas(await get(`/fichas-tecnicas/cliente/${cliente.id}`)); }
    catch { setFichas([]); }
  }
  useEffect(() => { carregar(); }, []);

  async function guardar(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      await post("/fichas-tecnicas", {
        cliente: { id: cliente.id },
        profissional: form.profissionalId ? { id: parseInt(form.profissionalId) } : null,
        marca: form.marca,
        cor: form.cor,
        formula: form.formula,
        oxidante: form.oxidante,
        tempoPoseMinutos: form.tempoPoseMinutos ? parseInt(form.tempoPoseMinutos) : null,
        observacoes: form.observacoes,
      });
      setForm({ marca: "", cor: "", formula: "", oxidante: "", tempoPoseMinutos: "", profissionalId: "", observacoes: "" });
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal titulo={`Fichas técnicas — ${cliente.nome}`} onClose={onClose}>
      <div className="p-6">
        {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}
        <form onSubmit={guardar} className="grid grid-cols-2 gap-3 mb-6">
          <input type="text" placeholder="Marca" value={form.marca}
            onChange={(e) => setForm({ ...form, marca: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Cor / tom" value={form.cor}
            onChange={(e) => setForm({ ...form, cor: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Oxidante / volume" value={form.oxidante}
            onChange={(e) => setForm({ ...form, oxidante: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="number" placeholder="Tempo de pose (min)" value={form.tempoPoseMinutos}
            onChange={(e) => setForm({ ...form, tempoPoseMinutos: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Fórmula" value={form.formula}
            onChange={(e) => setForm({ ...form, formula: e.target.value })}
            className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={form.profissionalId}
            onChange={(e) => setForm({ ...form, profissionalId: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Profissional (opcional)</option>
            {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <input type="text" placeholder="Observações" value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={loading}
            className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 text-sm">
            {loading ? "A guardar..." : "Adicionar ficha"}
          </button>
        </form>

        {fichas.length === 0 ? (
          <p className="text-sm text-gray-400">Sem fichas técnicas registadas.</p>
        ) : (
          <div className="space-y-3">
            {fichas.map((f) => (
              <div key={f.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{new Date(f.data).toLocaleDateString("pt-PT")}</span>
                  <span>{f.profissional?.nome || ""}</span>
                </div>
                <p className="text-gray-700">
                  <strong>{f.marca || "—"}</strong> · {f.cor || "—"} · ox: {f.oxidante || "—"} · {f.tempoPoseMinutos ? `${f.tempoPoseMinutos} min` : "—"}
                </p>
                {f.formula && <p className="text-gray-600 mt-1">Fórmula: {f.formula}</p>}
                {f.observacoes && <p className="text-gray-500 mt-1 italic">{f.observacoes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function PontosModal({ cliente, onClose, onChange }) {
  const [pontos, setPontos] = useState(cliente.pontos ?? 0);
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState("");

  async function recarregar() {
    try {
      const r = await get(`/fidelizacao/${cliente.id}`);
      setPontos(r.pontos);
      if (onChange) onChange(r.pontos);
    } catch {}
  }

  async function acao(tipo) {
    setErro("");
    const n = parseInt(valor);
    if (!n || n <= 0) { setErro("Indica um número de pontos válido."); return; }
    try {
      await post(`/fidelizacao/${cliente.id}/${tipo}`, { pontos: n });
      setValor("");
      await recarregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <Modal titulo={`Fidelização — ${cliente.nome}`} onClose={onClose}>
      <div className="p-6">
        <div className="bg-amber-50 rounded-xl p-6 text-center mb-6">
          <p className="text-sm text-amber-600 font-medium">Saldo de pontos</p>
          <p className="text-4xl font-bold text-amber-700">{pontos}</p>
        </div>
        {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}
        <div className="flex gap-2">
          <input type="number" min="1" placeholder="Pontos" value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={() => acao("resgatar")}
            className="px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg">Resgatar</button>
          <button onClick={() => acao("ajustar")}
            className="px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg">Adicionar</button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Os pontos são atribuídos automaticamente ao concluir um agendamento.</p>
      </div>
    </Modal>
  );
}

export function ContaModal({ cliente, onClose }) {
  const [lancamentos, setLancamentos] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [form, setForm] = useState({ tipo: "DEBITO", valor: "", descricao: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      const [ext, sld] = await Promise.all([
        get(`/contas/cliente/${cliente.id}`),
        get(`/contas/cliente/${cliente.id}/saldo`),
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
        clienteId: cliente.id,
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        descricao: form.descricao,
      });
      setForm({ tipo: "DEBITO", valor: "", descricao: "" });
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal titulo={`Conta corrente — ${cliente.nome}`} onClose={onClose}>
      <div className="p-6">
        <div className={`rounded-xl p-4 text-center mb-6 ${saldo > 0 ? "bg-red-50" : "bg-green-50"}`}>
          <p className={`text-sm font-medium ${saldo > 0 ? "text-red-600" : "text-green-600"}`}>Saldo devedor</p>
          <p className={`text-3xl font-bold ${saldo > 0 ? "text-red-700" : "text-green-700"}`}>{Number(saldo).toFixed(2)}€</p>
        </div>
        {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}
        <form onSubmit={guardar} className="grid grid-cols-4 gap-2 mb-6">
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="DEBITO">Dívida (débito)</option>
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
    </Modal>
  );
}

export function NovoClienteModal({ profissionais = [], onClose, onCriado }) {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", preferencialId: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function guardar(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const criado = await post("/clientes", {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        profissionalPreferencial: form.preferencialId ? { id: parseInt(form.preferencialId) } : null,
      });
      onCriado(criado);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal titulo="Nova cliente" onClose={onClose}>
      <div className="p-6">
        {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}
        <form onSubmit={guardar} className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Nome" value={form.nome} autoFocus
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <TelemovelInput value={form.telefone}
            onChange={(v) => setForm({ ...form, telefone: v })} />
          <select value={form.preferencialId}
            onChange={(e) => setForm({ ...form, preferencialId: e.target.value })}
            className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Profissional preferencial (opcional)</option>
            {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <button type="submit" disabled={loading}
            className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50">
            {loading ? "A criar..." : "Criar e selecionar cliente"}
          </button>
        </form>
      </div>
    </Modal>
  );
}
