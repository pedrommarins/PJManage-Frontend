import { useEffect, useState } from "react";
import { get, post, put, del } from "../services/api";
import Spinner from "../components/Spinner";

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ nome: "", preco: "", duracaoMinutos: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);

  async function carregar() {
    setCarregando(true);
    try {
      const data = await get("/servicos");
      setServicos(data);
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
        preco: parseFloat(form.preco),
        duracaoMinutos: parseInt(form.duracaoMinutos),
      };
      if (editandoId) {
        await put(`/servicos/${editandoId}`, body);
        setEditandoId(null);
      } else {
        await post("/servicos", body);
      }
      setForm({ nome: "", preco: "", duracaoMinutos: "" });
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEditar(s) {
    setForm({ nome: s.nome, preco: s.preco, duracaoMinutos: s.duracaoMinutos || "" });
    setEditandoId(s.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelar() {
    setForm({ nome: "", preco: "", duracaoMinutos: "" });
    setEditandoId(null);
  }

  async function handleApagar(id) {
    if (!confirm("Tens a certeza?")) return;
    try {
      await del(`/servicos/${id}`);
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Serviços</h2>

      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {editandoId ? "Editar serviço" : "Novo serviço"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome do serviço"
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
            required
          />
          <input
            type="number"
            placeholder="Duração (minutos)"
            value={form.duracaoMinutos}
            onChange={(e) => setForm({ ...form, duracaoMinutos: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="col-span-3 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "A guardar..." : editandoId ? "Guardar alterações" : "Adicionar serviço"}
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
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">Preço</th>
              <th className="px-6 py-3 text-left">Duração</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {servicos.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{s.nome}</td>
                <td className="px-6 py-4 text-gray-600">{s.preco}€</td>
                <td className="px-6 py-4 text-gray-600">
                  {s.duracaoMinutos ? `${s.duracaoMinutos} min` : "-"}
                </td>
                <td className="px-6 py-4 text-right flex gap-3 justify-end">
                  <button
                    onClick={() => handleEditar(s)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleApagar(s.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
            {servicos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Nenhum serviço registado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>}
      </div>
    </div>
  );
}