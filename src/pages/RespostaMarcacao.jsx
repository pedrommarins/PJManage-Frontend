import { useSearchParams, useNavigate } from "react-router-dom";

export default function RespostaMarcacao() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const status = params.get("status");
  const msg = params.get("msg");

  const cfg = {
    confirmado: {
      iconBg: "bg-green-500/20 border-green-500/40",
      iconColor: "text-green-400",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ),
      titulo: "Marcação confirmada!",
      desc: "A cliente foi notificada por email com a confirmação da marcação.",
      badge: "bg-green-500/10 border-green-500/30 text-green-400",
      badgeText: "Confirmado",
    },
    rejeitado: {
      iconBg: "bg-red-500/20 border-red-500/40",
      iconColor: "text-red-400",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      titulo: "Marcação rejeitada",
      desc: "A cliente foi notificada por email sobre o cancelamento.",
      badge: "bg-red-500/10 border-red-500/30 text-red-400",
      badgeText: "Rejeitado",
    },
    erro: {
      iconBg: "bg-amber-500/20 border-amber-500/40",
      iconColor: "text-amber-400",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      titulo: "Não foi possível processar",
      desc: msg ? decodeURIComponent(msg) : "Esta marcação já foi processada anteriormente.",
      badge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      badgeText: "Atenção",
    },
  };

  const c = cfg[status] ?? cfg.erro;

  return (
    <div className="min-h-screen bg-[#060612] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-900/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 border-b border-white/5 px-6 py-4">
        <div className="max-w-lg mx-auto">
          <img src="/logo.png" alt="PJManage" className="h-8 w-auto brightness-0 invert opacity-80" />
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className={`w-20 h-20 ${c.iconBg} border-2 rounded-full flex items-center justify-center mx-auto mb-6 ${c.iconColor}`}>
            {c.icon}
          </div>

          <span className={`inline-block border text-xs font-semibold px-3 py-1 rounded-full mb-4 ${c.badge}`}>
            {c.badgeText}
          </span>

          <h1 className="text-2xl font-bold text-white mb-3">{c.titulo}</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">{c.desc}</p>

          <button
            onClick={() => navigate("/login")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-900/40"
          >
            Ir para o dashboard →
          </button>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/5 py-6 text-center text-slate-700 text-xs">
        Powered by PJManage
      </div>
    </div>
  );
}
