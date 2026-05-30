import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../services/api";
import Spinner from "../components/Spinner";

// -------- Timeline Modal --------
function TimelineModal({ onClose }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const data = await get("/agendamentos/hoje");
        setAgendamentos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const PIXELS_POR_MINUTO = 3;
  const HORA_INICIO = 8;
  const HORA_FIM = 20;
  const TOTAL_MINUTOS = (HORA_FIM - HORA_INICIO) * 60;
  const LARGURA_TOTAL = TOTAL_MINUTOS * PIXELS_POR_MINUTO;

  const porProfissional = {};
  agendamentos.forEach((a) => {
    const nome = a.profissional?.nome || "Sem profissional";
    if (!porProfissional[nome]) porProfissional[nome] = [];
    porProfissional[nome].push(a);
  });

  function minutosDesdeInicio(dataHora) {
    const d = new Date(dataHora);
    return (d.getHours() - HORA_INICIO) * 60 + d.getMinutes();
  }

  function corStatus(status) {
    switch (status) {
      case "CONFIRMADO": return "bg-indigo-500";
      case "PENDENTE":   return "bg-amber-500";
      case "CONCLUIDO":  return "bg-emerald-600";
      case "CANCELADO":  return "bg-red-500";
      default:           return "bg-slate-500";
    }
  }

  const horas = [];
  for (let h = HORA_INICIO; h <= HORA_FIM; h++) horas.push(h);

  const agora = new Date();
  const minutosAgora =
    agora.getHours() >= HORA_INICIO && agora.getHours() <= HORA_FIM
      ? minutosDesdeInicio(agora)
      : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[88vh] flex flex-col shadow-2xl">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Agenda de hoje</h2>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">
              {agora.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-light leading-none transition"
          >
            ×
          </button>
        </div>

        {/* Linha do tempo */}
        <div className="flex-1 overflow-auto p-6">
          {carregando ? (
            <Spinner />
          ) : agendamentos.length === 0 ? (
            <p className="text-center text-slate-400 py-12 text-sm">
              Nenhum agendamento para hoje.
            </p>
          ) : (
            <div style={{ minWidth: LARGURA_TOTAL + 160 }}>
              {/* Marcadores de horas */}
              <div className="flex mb-2 ml-40">
                {horas.map((h) => (
                  <div
                    key={h}
                    className="shrink-0 text-xs text-slate-400 border-l border-slate-200 pl-1.5"
                    style={{ width: 60 * PIXELS_POR_MINUTO }}
                  >
                    {String(h).padStart(2, "0")}h
                  </div>
                ))}
              </div>

              {/* Linhas por profissional */}
              {Object.entries(porProfissional).map(([nome, apps]) => (
                <div key={nome} className="flex items-center mb-3">
                  {/* Nome do profissional */}
                  <div className="w-40 shrink-0 pr-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                      {nome.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-slate-700 truncate">{nome}</span>
                  </div>

                  {/* Área da linha do tempo */}
                  <div
                    className="relative h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden"
                    style={{ width: LARGURA_TOTAL }}
                  >
                    {/* Linhas de hora */}
                    {horas.map((h) => (
                      <div
                        key={h}
                        className="absolute top-0 bottom-0 border-l border-slate-100"
                        style={{ left: (h - HORA_INICIO) * 60 * PIXELS_POR_MINUTO }}
                      />
                    ))}

                    {/* Indicador da hora atual */}
                    {minutosAgora !== null && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-red-400 z-20"
                        style={{ left: minutosAgora * PIXELS_POR_MINUTO }}
                      >
                        <div className="w-2 h-2 rounded-full bg-red-400 -translate-x-0.5 mt-0.5" />
                      </div>
                    )}

                    {/* Blocos de agendamento */}
                    {apps.map((a) => {
                      const min = minutosDesdeInicio(a.dataHora);
                      const dur = a.servico?.duracaoMinutos || 30;
                      const left = min * PIXELS_POR_MINUTO;
                      const width = Math.max(dur * PIXELS_POR_MINUTO, 56);
                      const hora = new Date(a.dataHora).toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <div
                          key={a.id}
                          className={`absolute top-1.5 bottom-1.5 rounded-md px-2 flex flex-col justify-center overflow-hidden ${corStatus(a.status)} text-white shadow-sm z-10`}
                          style={{ left, width }}
                          title={`${hora} · ${a.cliente?.nome || "—"} · ${a.servico?.nome || "—"} (${dur} min)`}
                        >
                          <p className="text-xs font-semibold truncate leading-tight">
                            {hora} · {a.servico?.nome}
                          </p>
                          {width > 100 && (
                            <p className="text-xs opacity-80 truncate leading-tight">{a.cliente?.nome}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center gap-5 shrink-0">
          {[
            ["bg-indigo-500", "Confirmado"],
            ["bg-amber-500", "Pendente"],
            ["bg-emerald-600", "Concluído"],
            ["bg-red-500", "Cancelado"],
          ].map(([cor, label]) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className={`w-2.5 h-2.5 rounded-sm ${cor}`} />
              {label}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
            <div className="w-px h-3 bg-red-400" />
            Hora atual
          </div>
        </div>
      </div>
    </div>
  );
}

// -------- Dashboard Home --------
export default function DashboardHome() {
  const navigate = useNavigate();
  const [resumo, setResumo] = useState({
    totalClientes: 0,
    agendamentosHoje: 0,
    agendamentosConfirmados: 0,
    agendamentosPendentes: 0,
    alertasStock: 0,
  });
  const [carregando, setCarregando] = useState(true);
  const [timelineAberta, setTimelineAberta] = useState(false);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const [clientes, res, alertas] = await Promise.all([
          get("/clientes?size=1"),
          get("/agendamentos/resumo"),
          get("/produtos/alertas"),
        ]);
        setResumo({
          totalClientes: clientes.totalElements ?? 0,
          agendamentosHoje: res.agendamentosHoje,
          agendamentosConfirmados: res.confirmados,
          agendamentosPendentes: res.pendentes,
          alertasStock: alertas.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const cards = [
    {
      titulo: "Total de clientes",
      valor: resumo.totalClientes,
      bg: "bg-indigo-600",
      icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
      onClick: () => navigate("/agendamentos"),
    },
    {
      titulo: "Agendamentos hoje",
      valor: resumo.agendamentosHoje,
      bg: "bg-violet-600",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      onClick: () => setTimelineAberta(true),
      badge: "Ver agenda",
    },
    {
      titulo: "Confirmados",
      valor: resumo.agendamentosConfirmados,
      bg: "bg-emerald-600",
      icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      onClick: () => navigate("/agendamentos"),
    },
    {
      titulo: "Pendentes",
      valor: resumo.agendamentosPendentes,
      bg: "bg-amber-500",
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
      onClick: () => navigate("/agendamentos"),
    },
    {
      titulo: "Alertas de stock",
      valor: resumo.alertasStock,
      bg: resumo.alertasStock > 0 ? "bg-red-600" : "bg-slate-500",
      icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
      onClick: () => navigate("/produtos"),
    },
  ];

  return (
    <div>
      <p className="text-slate-400 text-sm mb-6">Resumo do dia em tempo real</p>

      {carregando ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {cards.map((c) => (
              <button
                key={c.titulo}
                onClick={c.onClick}
                className={`${c.bg} rounded-2xl p-5 text-white shadow-lg text-left hover:brightness-110 hover:scale-[1.03] transition-all active:scale-[0.98] group`}
              >
                <svg
                  className="w-6 h-6 opacity-80 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
                </svg>
                <p className="text-3xl font-bold mb-1">{c.valor}</p>
                <p className="text-xs font-medium opacity-75">{c.titulo}</p>
                {c.badge && (
                  <p className="text-xs mt-2 bg-white/20 rounded-md px-2 py-0.5 inline-block group-hover:bg-white/30 transition">
                    {c.badge} →
                  </p>
                )}
              </button>
            ))}
          </div>

          <AgendamentosHoje />
        </>
      )}

      {timelineAberta && <TimelineModal onClose={() => setTimelineAberta(false)} />}
    </div>
  );
}

// -------- Tabela de agendamentos de hoje --------
function AgendamentosHoje() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const data = await get("/agendamentos/hoje");
        setAgendamentos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Agendamentos de hoje</h3>
      </div>
      {carregando ? (
        <Spinner />
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Cliente</th>
              <th className="px-6 py-3 text-left">Serviço</th>
              <th className="px-6 py-3 text-left">Profissional</th>
              <th className="px-6 py-3 text-left">Hora</th>
              <th className="px-6 py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agendamentos.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{a.cliente?.nome}</td>
                <td className="px-6 py-4 text-gray-600">{a.servico?.nome}</td>
                <td className="px-6 py-4 text-gray-600">{a.profissional?.nome || "-"}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(a.dataHora).toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.status === "CONFIRMADO" ? "bg-green-100 text-green-700" :
                      a.status === "PENDENTE"   ? "bg-yellow-100 text-yellow-700" :
                      a.status === "CONCLUIDO"  ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}
                  >
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
      )}
    </div>
  );
}
