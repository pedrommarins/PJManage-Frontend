import { useNavigate } from "react-router-dom";

function FeatureIcon({ path, path2 }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      {path2 && <path strokeLinecap="round" strokeLinejoin="round" d={path2} />}
    </svg>
  );
}

const features = [
  {
    icon: <FeatureIcon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    title: "Agendamentos sem conflitos",
    desc: "Gere marcações com deteção automática de sobreposições. Confirmações e lembretes por email incluídos.",
    color: "from-indigo-500/20 to-indigo-600/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
  },
  {
    icon: <FeatureIcon path="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
    title: "Clientes em detalhe",
    desc: "Ficha completa, histórico de visitas, programa de fidelização por pontos e conta corrente integrada.",
    color: "from-violet-500/20 to-violet-600/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
  },
  {
    icon: <FeatureIcon path="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
    title: "Gestão do negócio",
    desc: "Relatórios de faturação, comissões, controlo de stock com alertas e comunicação em massa com clientes.",
    color: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
];

const stats = [
  { value: "24/7", label: "Marcações online" },
  { value: "24h", label: "Lembretes automáticos" },
  { value: "∞", label: "Clientes e agendamentos" },
];

const bookingSteps = [
  {
    n: "1",
    title: "Partilha o link",
    desc: "O salão recebe um link personalizado para partilhar com os clientes.",
  },
  {
    n: "2",
    title: "O cliente escolhe",
    desc: "Serviço, profissional, data e hora disponível — em segundos.",
  },
  {
    n: "3",
    title: "Marcação confirmada",
    desc: "O agendamento entra automaticamente no sistema, sem nenhuma ação manual.",
  },
];

function BookingMockup() {
  return (
    <div className="relative">
      <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/30">
        {/* Barra de topo */}
        <div className="border-b border-white/5 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-white/5 rounded-md h-5 flex items-center px-3">
              <span className="text-slate-600 text-xs">pjmanage.pt/agendar/1</span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Progress */}
          <div className="flex items-center gap-1.5 mb-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center gap-1.5 flex-1 last:flex-none">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${i === 1 ? "bg-indigo-600 border-indigo-600 text-white" : i < 3 ? "bg-indigo-600/60 border-indigo-600/60 text-white" : "border-white/10 text-slate-600"}`}>
                  {i < 3 ? "✓" : i}
                </div>
                {i < 4 && <div className={`flex-1 h-px ${i < 3 ? "bg-indigo-600/60" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">Passo 3 de 4 — <span className="text-slate-400">Data & Hora</span></p>

          {/* Calendário mini */}
          <div className="bg-white/5 border border-white/8 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Junho 2026</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-white/5 text-slate-500 text-xs flex items-center justify-center">‹</div>
                <div className="w-4 h-4 rounded bg-white/5 text-slate-500 text-xs flex items-center justify-center">›</div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {["S","T","Q","Q","S","S","D"].map((d,i) => (
                <div key={i} className="text-center text-slate-600 text-xs py-0.5">{d}</div>
              ))}
              {[...Array(5)].map((_,i) => <div key={`e${i}`} />)}
              {[...Array(30)].map((_,i) => (
                <div key={i} className={`text-center text-xs py-1 rounded ${i+1 === 14 ? "bg-indigo-600 text-white font-bold" : i+1 < 5 ? "text-slate-700" : "text-slate-400 hover:text-white"}`}>
                  {i+1}
                </div>
              ))}
            </div>
          </div>

          {/* Slots */}
          <div className="grid grid-cols-4 gap-1.5">
            {["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30"].map((h, i) => (
              <div key={h} className={`py-1.5 rounded-lg text-xs font-medium text-center border transition ${i === 3 ? "bg-indigo-600 border-indigo-600 text-white" : "border-white/10 text-slate-400"}`}>
                {h}
              </div>
            ))}
          </div>

          <button className="w-full bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-lg mt-1">
            Continuar →
          </button>
        </div>
      </div>

      {/* Badge flutuante */}
      <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-green-900/40">
        Marcação confirmada!
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060612] text-white overflow-x-hidden">
      {/* Glow de fundo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-900/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <img
          src="/logo.png"
          alt="PJManage"
          className="h-10 w-auto brightness-0 invert opacity-90"
        />
        <button
          onClick={() => navigate("/login")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-900/40"
        >
          Entrar no sistema →
        </button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-800/50 rounded-full px-4 py-1.5 text-indigo-300 text-xs font-medium mb-10 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Software de gestão para salões de beleza
        </div>

        <img
          src="/logo.png"
          alt="PJManage"
          className="h-32 w-auto mx-auto mb-10 brightness-0 invert opacity-95 drop-shadow-2xl"
        />

        <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight">
          Gere o teu salão{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            com simplicidade
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Agendamentos, clientes, stock, relatórios e marcações online 24/7.
          Tudo num só lugar, para que te focuses no que realmente importa — o teu negócio.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all shadow-xl shadow-indigo-900/50 hover:shadow-indigo-800/60 hover:scale-105"
          >
            Aceder ao sistema →
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 max-w-4xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#060612] px-8 py-6 text-center">
              <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-slate-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marcação Online — secção de destaque */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pb-28">
        <div className="bg-gradient-to-br from-indigo-900/25 to-violet-900/15 border border-indigo-700/25 rounded-3xl p-8 md:p-14">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 text-indigo-400 text-xs font-semibold mb-6 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                Novo
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Os seus clientes marcam online,{" "}
                <span className="text-indigo-400">a qualquer hora</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Partilhe o seu link de marcação nas redes sociais, WhatsApp ou website. Os clientes agendam em segundos, sem telefonemas, sem esperas.
              </p>

              <div className="space-y-5">
                {bookingSteps.map((step) => (
                  <div key={step.n} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0 mt-0.5">
                      {step.n}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">{step.title}</p>
                      <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div className="hidden md:block">
              <BookingMockup />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pb-28">
        <p className="text-center text-slate-500 text-sm font-medium uppercase tracking-widest mb-10">
          Tudo o que o teu salão precisa
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl p-6 backdrop-blur-sm hover:scale-[1.02] transition-transform`}
            >
              <div className={`${f.text} mb-4`}>{f.icon}</div>
              <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <div className="relative z-10 max-w-2xl mx-auto px-8 pb-24 text-center">
        <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/20 border border-indigo-800/30 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para começar?</h2>
          <p className="text-slate-400 mb-8">
            Faz login e activa as marcações online do teu salão hoje mesmo.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          >
            Entrar no sistema →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/5 py-8 text-center text-slate-600 text-sm">
        © 2026 PJManage · Todos os direitos reservados
      </div>
    </div>
  );
}
