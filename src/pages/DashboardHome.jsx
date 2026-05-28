import { useEffect, useState } from "react";
import { get } from "../services/api";

export default function DashboardHome() {
  const [resumo, setResumo] = useState({
    totalClientes: 0,
    agendamentosHoje: 0,
    agendamentosConfirmados: 0,
    agendamentosPendentes: 0,
    alertasStock: 0,
  });

  useEffect(() => {
    async function carregar() {
      try {
        const [clientes, agendamentos, alertas] = await Promise.all([
          get("/clientes?size=1"),
          get("/agendamentos?size=1000"),
          get("/produtos/alertas"),
        ]);

        const lista = agendamentos.content ?? [];
        const hoje = new Date().toISOString().split("T")[0];

        setResumo({
          totalClientes: clientes.totalElements ?? 0,
          agendamentosHoje: lista.filter(
            (a) => new Date(a.dataHora).toISOString().split("T")[0] === hoje
          ).length,
          agendamentosConfirmados: lista.filter((a) => a.status === "CONFIRMADO").length,
          agendamentosPendentes: lista.filter((a) => a.status === "PENDENTE").length,
          alertasStock: alertas.length,
        });
      } catch (err) {
        console.error(err);
      }
    }
    carregar();
  }, []);

  const cards = [
    {
      titulo: "Total de clientes",
      valor: resumo.totalClientes,
      cor: "bg-blue-50 text-blue-700",
      icone: "👥",
    },
    {
      titulo: "Agendamentos hoje",
      valor: resumo.agendamentosHoje,
      cor: "bg-purple-50 text-purple-700",
      icone: "📅",
    },
    {
      titulo: "Confirmados",
      valor: resumo.agendamentosConfirmados,
      cor: "bg-green-50 text-green-700",
      icone: "✅",
    },
    {
      titulo: "Pendentes",
      valor: resumo.agendamentosPendentes,
      cor: "bg-yellow-50 text-yellow-700",
      icone: "⏳",
    },
    {
      titulo: "Alertas de stock",
      valor: resumo.alertasStock,
      cor: resumo.alertasStock > 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700",
      icone: "⚠️",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Início</h2>
      <p className="text-gray-500 text-sm mb-8">
        Resumo do dia — {new Date().toLocaleDateString("pt-PT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.titulo} className={`rounded-2xl p-6 flex items-center gap-4 ${c.cor}`}>
            <span className="text-3xl">{c.icone}</span>
            <div>
              <p className="text-sm font-medium opacity-75">{c.titulo}</p>
              <p className="text-3xl font-bold">{c.valor}</p>
            </div>
          </div>
        ))}
      </div>

      <AgendamentosHoje />
    </div>
  );
}

function AgendamentosHoje() {
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await get("/agendamentos/hoje");
        setAgendamentos(data);
      } catch (err) {
        console.error(err);
      }
    }
    carregar();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-base font-semibold text-gray-800">Agendamentos de hoje</h3>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-left">Cliente</th>
            <th className="px-6 py-3 text-left">Serviço</th>
            <th className="px-6 py-3 text-left">Profissional</th>
            <th className="px-6 py-3 text-left">Hora</th>
            <th className="px-6 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {agendamentos.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-800">{a.cliente?.nome}</td>
              <td className="px-6 py-4 text-gray-600">{a.servico?.nome}</td>
              <td className="px-6 py-4 text-gray-600">{a.profissional?.nome || "-"}</td>
              <td className="px-6 py-4 text-gray-600">
                {new Date(a.dataHora).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  a.status === "CONFIRMADO" ? "bg-green-100 text-green-700" :
                  a.status === "PENDENTE" ? "bg-yellow-100 text-yellow-700" :
                  a.status === "CONCLUIDO" ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
          {agendamentos.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                Nenhum agendamento para hoje.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}