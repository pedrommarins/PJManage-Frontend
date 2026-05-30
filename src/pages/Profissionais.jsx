import { useEffect, useState } from "react";
import { get, post, put, del } from "../services/api";
import Spinner from "../components/Spinner";
import TelemovelInput from "../components/TelemovelInput";

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ nome: "", especialidade: "", telefone: "", percentualComissao: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);

  async function carregar() {
    setCarregando(true);
    try {
      const data = await get("/profissionais");
      setProfissionais(data);
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
        especialidade: form.especialidade,
        telefone: form.telefone,
        percentualComissao: form.percentualComissao === "" ? 0 : parseFloat(form.percentualComissao),
      };
      if (editandoId) {
        await put(`/profissionais/${editandoId}`, { ...body, ativo: true });
        setEditandoId(null);
      } else {
        await post("/profissionais", body);
      }
      setForm({ nome: "", especialidade: "", telefone: "", percentualComissao: "" });
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
      especialidade: p.especialidade || "",
      telefone: p.telefone || "",
      percentualComissao: p.percentualComissao ?? "",
    });
    setEditandoId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelar() {
    setForm({ nome: "", especialidade: "", telefone: "", percentualComissao: "" });
    setEditandoId(null);
  }

  async function handleApagar(id) {
    if (!confirm("Tens a certeza?")) return;
    try {
      await del(`/profissionais/${id}`);
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profissionais</h2>

      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {editandoId ? "Editar profissional" : "Novo profissional"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Especialidade"
            value={form.especialidade}
            onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <TelemovelInput value={form.telefone}
            onChange={(v) => setForm({ ...form, telefone: v })} />
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="% Comissão"
            value={form.percentualComissao}
            onChange={(e) => setForm({ ...form, percentualComissao: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="col-span-3 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "A guardar..." : editandoId ? "Guardar alterações" : "Adicionar profissional"}
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
        {carregando ? <Spinner /> : <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Código</th>
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">Especialidade</th>
              <th className="px-6 py-3 text-left">Telemóvel</th>
              <th className="px-6 py-3 text-left">Comissão</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {profissionais.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.codigo || "—"}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{p.nome}</td>
                <td className="px-6 py-4 text-gray-600">{p.especialidade || "-"}</td>
                <td className="px-6 py-4 text-gray-600">{p.telefone || "-"}</td>
                <td className="px-6 py-4 text-gray-600">{p.percentualComissao ? `${p.percentualComissao}%` : "—"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {p.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
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
            {profissionais.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  Nenhum profissional registado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>}
      </div>
    </div>
  );
}