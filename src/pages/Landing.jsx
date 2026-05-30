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
  { value: "100%", label: "Dados no teu servidor" },
  { value: "24h", label: "Lembretes automáticos" },
  { value: "∞", label: "Clientes e agendamentos" },
];

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
          Agendamentos, clientes, stock, relatórios e muito mais.
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
      <div className="relative z-10 max-w-4xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#060612] px-8 py-6 text-center">
              <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-slate-500 text-sm">{s.label}</p>
            </div>
          ))}
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
          <p className="text-slate-400 mb-8">Faz login e começa a gerir o teu salão agora mesmo.</p>
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
