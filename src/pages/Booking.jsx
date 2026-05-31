import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { publicGet, publicPost } from "../services/publicApi";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

function formatarHora(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatarData(d) {
  return d.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function Calendario({ mesVista, setMesVista, dataSel, onSelect }) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const ano = mesVista.getFullYear();
  const mes = mesVista.getMonth();
  const offset = (new Date(ano, mes, 1).getDay() + 6) % 7;
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const podePrevMes = new Date(ano, mes, 1) > new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const celulas = [];
  for (let i = 0; i < offset; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(new Date(ano, mes, d));

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMesVista(new Date(ano, mes - 1, 1))}
          disabled={!podePrevMes}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-lg text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition"
        >
          ‹
        </button>
        <span className="text-white font-semibold text-sm">{MESES[mes]} {ano}</span>
        <button
          onClick={() => setMesVista(new Date(ano, mes + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-lg text-white hover:bg-white/10 transition"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-xs text-slate-600 py-1 font-medium">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celulas.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const passado = d < hoje;
          const sel = dataSel && d.toDateString() === dataSel.toDateString();
          const eHoje = d.toDateString() === hoje.toDateString();
          return (
            <button
              key={d.getDate()}
              disabled={passado}
              onClick={() => onSelect(d)}
              className={[
                "aspect-square flex items-center justify-center rounded-lg text-sm transition",
                passado ? "text-slate-700 cursor-not-allowed" : "cursor-pointer",
                sel
                  ? "bg-indigo-600 text-white font-bold"
                  : passado
                  ? ""
                  : "text-slate-300 hover:bg-indigo-500/20 hover:text-white",
                eHoje && !sel ? "ring-1 ring-indigo-500/60" : "",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PASSOS = ["Serviço", "Profissional", "Data & Hora", "Os seus dados"];

export default function Booking() {
  const { slug } = useParams();
  const [passo, setPasso] = useState(0);

  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroInicial, setErroInicial] = useState("");

  const [servicoSel, setServicoSel] = useState(null);
  const [profissionalSel, setProfissionalSel] = useState(null);
  const [dataSel, setDataSel] = useState(null);
  const [horaSel, setHoraSel] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [erroSlots, setErroSlots] = useState("");

  const [form, setForm] = useState({ nome: "", email: "", telefone: "", observacoes: "" });
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  const hoje = new Date();
  const [mesVista, setMesVista] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));

  useEffect(() => {
    async function init() {
      try {
        const [s, p] = await Promise.all([
          publicGet(`/public/saloes/${slug}/servicos`),
          publicGet(`/public/saloes/${slug}/profissionais`),
        ]);
        setServicos(s);
        setProfissionais(p);
      } catch (err) {
        setErroInicial(err.message);
      } finally {
        setCarregando(false);
      }
    }
    init();
  }, [salaoId]);

  async function carregarSlots(data) {
    setLoadingSlots(true);
    setSlots([]);
    setHoraSel(null);
    setErroSlots("");
    try {
      const iso = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
      const result = await publicGet(
        `/public/saloes/${slug}/disponibilidade?profissionalId=${profissionalSel.id}&servicoId=${servicoSel.id}&dia=${iso}`
      );
      setSlots(result);
    } catch (err) {
      setErroSlots(err.message);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleSelecionarData(d) {
    setDataSel(d);
    carregarSlots(d);
  }

  async function submeter() {
    setErroEnvio("");
    setEnviando(true);
    try {
      await publicPost(`/public/saloes/${slug}/marcacoes`, {
        nome: form.nome,
        email: form.email || null,
        telefone: form.telefone || null,
        profissionalId: profissionalSel.id,
        servicoId: servicoSel.id,
        dataHora: horaSel,
        observacoes: form.observacoes || null,
      });
      setPasso(4);
    } catch (err) {
      setErroEnvio(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#060612] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (erroInicial) {
    return (
      <div className="min-h-screen bg-[#060612] flex items-center justify-center text-white px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-sm">{erroInicial}</p>
          <button onClick={() => window.location.reload()} className="text-indigo-400 hover:text-indigo-300 text-sm transition">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060612] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-900/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="PJManage" className="h-8 w-auto brightness-0 invert opacity-80" />
          <span className="text-slate-500 text-xs">Marcação Online</span>
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Sucesso */}
        {passo === 4 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Pedido recebido!</h2>
            <p className="text-slate-400 text-sm mb-2 leading-relaxed">
              O seu pedido de marcação está <span className="text-amber-400 font-medium">pendente de aprovação</span>.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              Receberá um email de confirmação assim que o salão aprovar a marcação.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left max-w-sm mx-auto space-y-3 text-sm mb-8">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 shrink-0">Serviço</span>
                <span className="text-white font-medium text-right">{servicoSel?.nome}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 shrink-0">Profissional</span>
                <span className="text-white font-medium text-right">{profissionalSel?.nome}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 shrink-0">Data</span>
                <span className="text-white font-medium text-right capitalize">{dataSel && formatarData(dataSel)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 shrink-0">Hora</span>
                <span className="text-white font-medium">{horaSel && formatarHora(horaSel)}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setPasso(0);
                setServicoSel(null);
                setProfissionalSel(null);
                setDataSel(null);
                setHoraSel(null);
                setSlots([]);
                setForm({ nome: "", email: "", telefone: "", observacoes: "" });
              }}
              className="text-indigo-400 hover:text-indigo-300 text-sm transition"
            >
              Fazer nova marcação →
            </button>
          </div>
        ) : (
          <>
            {/* Barra de progresso */}
            <div className="mb-8">
              <div className="flex items-center">
                {PASSOS.map((p, i) => (
                  <div key={p} className={`flex items-center ${i < PASSOS.length - 1 ? "flex-1" : ""}`}>
                    <div className={[
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 transition",
                      i < passo ? "bg-indigo-600 border-indigo-600 text-white" :
                      i === passo ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" :
                      "border-white/10 text-slate-600 bg-transparent",
                    ].join(" ")}>
                      {i < passo ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : i + 1}
                    </div>
                    {i < PASSOS.length - 1 && (
                      <div className={`flex-1 h-px mx-1 transition ${i < passo ? "bg-indigo-600" : "bg-white/10"}`} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Passo {passo + 1} de {PASSOS.length} — <span className="text-slate-400 font-medium">{PASSOS[passo]}</span>
              </p>
            </div>

            {/* Passo 1 — Serviço */}
            {passo === 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Que serviço deseja?</h2>
                <p className="text-slate-400 text-sm mb-6">Escolha o serviço que pretende agendar.</p>
                <div className="space-y-3">
                  {servicos.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setServicoSel(s); setPasso(1); }}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/8 transition text-left group"
                    >
                      <div>
                        <p className="text-white font-medium text-sm group-hover:text-indigo-200 transition">{s.nome}</p>
                        {s.duracaoMinutos && (
                          <p className="text-slate-500 text-xs mt-0.5">{s.duracaoMinutos} min</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-indigo-300 font-semibold text-sm">{Number(s.preco).toFixed(2)} €</span>
                        <svg className="w-4 h-4 text-slate-600 mt-1 ml-auto group-hover:text-indigo-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </button>
                  ))}
                  {servicos.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-8">Nenhum serviço disponível de momento.</p>
                  )}
                </div>
              </div>
            )}

            {/* Passo 2 — Profissional */}
            {passo === 1 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Escolha o profissional</h2>
                <p className="text-slate-400 text-sm mb-6">Com quem deseja ser atendido(a)?</p>
                <div className="space-y-3">
                  {profissionais.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setProfissionalSel(p); setDataSel(null); setHoraSel(null); setSlots([]); setPasso(2); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/8 transition text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
                        {p.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm group-hover:text-indigo-200 transition">{p.nome}</p>
                        {p.especialidade && <p className="text-slate-500 text-xs mt-0.5 truncate">{p.especialidade}</p>}
                      </div>
                      <svg className="w-4 h-4 text-slate-600 shrink-0 group-hover:text-indigo-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  ))}
                  {profissionais.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-8">Nenhum profissional disponível de momento.</p>
                  )}
                </div>
                <button onClick={() => setPasso(0)} className="mt-6 text-sm text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Voltar
                </button>
              </div>
            )}

            {/* Passo 3 — Data & Hora */}
            {passo === 2 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Quando pretende vir?</h2>
                <p className="text-slate-400 text-sm mb-6">Escolha um dia no calendário e depois o horário disponível.</p>

                <Calendario
                  mesVista={mesVista}
                  setMesVista={setMesVista}
                  dataSel={dataSel}
                  onSelect={handleSelecionarData}
                />

                {dataSel && (
                  <div className="mt-6">
                    <p className="text-sm text-slate-400 mb-3 capitalize">{formatarData(dataSel)}</p>
                    {loadingSlots ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : erroSlots ? (
                      <p className="text-red-400 text-sm text-center py-4">{erroSlots}</p>
                    ) : slots.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-6 bg-white/3 rounded-xl border border-white/5">
                        Não há horários disponíveis neste dia.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {slots.map((s) => (
                          <button
                            key={s}
                            onClick={() => setHoraSel(s)}
                            className={[
                              "py-2.5 rounded-lg text-sm font-medium border transition",
                              horaSel === s
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-white/10 bg-white/5 text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/10",
                            ].join(" ")}
                          >
                            {formatarHora(s)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <button onClick={() => setPasso(1)} className="text-sm text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Voltar
                  </button>
                  {horaSel && (
                    <button
                      onClick={() => setPasso(3)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-900/40"
                    >
                      Continuar →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Passo 4 — Dados do cliente */}
            {passo === 3 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Os seus dados</h2>
                <p className="text-slate-400 text-sm mb-6">Para confirmar a marcação precisamos de alguns dados.</p>

                {/* Resumo */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Serviço</span>
                    <span className="text-white font-medium text-right">{servicoSel?.nome}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Profissional</span>
                    <span className="text-white font-medium text-right">{profissionalSel?.nome}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Data & Hora</span>
                    <span className="text-white font-medium text-right capitalize">
                      {dataSel && formatarData(dataSel)} às {horaSel && formatarHora(horaSel)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
                    <span className="text-slate-400 shrink-0">Preço</span>
                    <span className="text-indigo-300 font-semibold">{servicoSel && Number(servicoSel.preco).toFixed(2)} €</span>
                  </div>
                </div>

                {erroEnvio && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-sm text-red-400">{erroEnvio}</div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome completo *</label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                      placeholder="O seu nome"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Telemóvel *</label>
                    <input
                      type="tel"
                      value={form.telefone}
                      onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                      placeholder="+351 9XX XXX XXX"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Observações (opcional)</label>
                    <textarea
                      value={form.observacoes}
                      onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                      placeholder="Alguma preferência ou informação adicional..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <button onClick={() => setPasso(2)} className="text-sm text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Voltar
                  </button>
                  <button
                    onClick={submeter}
                    disabled={!form.nome.trim() || !form.email.trim() || !form.telefone.trim() || enviando}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-900/40 flex items-center gap-2"
                  >
                    {enviando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        A confirmar...
                      </>
                    ) : "Confirmar marcação"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="relative z-10 border-t border-white/5 py-6 text-center text-slate-700 text-xs mt-8">
        Powered by PJManage
      </div>
    </div>
  );
}
