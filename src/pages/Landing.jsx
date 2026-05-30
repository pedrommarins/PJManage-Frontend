import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicPost } from "../services/publicApi";

/* ── Ícones ─────────────────────────────────────────────────── */
function Icon({ d, d2, size = "w-6 h-6" }) {
  return (
    <svg className={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      {d2 && <path strokeLinecap="round" strokeLinejoin="round" d={d2} />}
    </svg>
  );
}

/* ── Dados ───────────────────────────────────────────────────── */
const features = [
  {
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    title: "Agendamentos inteligentes",
    desc: "Deteção automática de conflitos, lembretes por email e vista de agenda do dia.",
    color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
    title: "Marcação online 24/7",
    desc: "Os seus clientes marcam pelo link do salão, a qualquer hora, sem telefonemas.",
    color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    title: "Gestão de clientes",
    desc: "Ficha completa, histórico, fidelização por pontos e conta corrente integrada.",
    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
    title: "Stock e fornecedores",
    desc: "Controlo de inventário com alertas de stock mínimo e gestão de fornecedores.",
    color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    title: "Relatórios e faturação",
    desc: "Resumos de receita, comissões por profissional e histórico de faturação.",
    color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
    title: "Multi-utilizador",
    desc: "Administrador, receção e profissional, cada um com o seu nível de acesso.",
    color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20",
  },
];

const planIncludes = [
  "Agendamentos ilimitados",
  "Marcação online 24/7 (link partilhável)",
  "Gestão completa de clientes",
  "Programa de fidelização",
  "Controlo de stock com alertas",
  "Relatórios de faturação",
  "Comissões por profissional",
  "Lembretes automáticos por email",
  "Multi-utilizador (admin, receção, profissional)",
  "Suporte por email incluído",
];

const faqs = [
  {
    q: "Preciso de instalar alguma aplicação?",
    a: "Não. O PJManage é 100% web, funciona em qualquer dispositivo com browser, sem instalações.",
  },
  {
    q: "Como funciona a marcação online?",
    a: "Após o registo, o salão recebe um link personalizado. Partilha-o nas redes sociais, WhatsApp ou website e os clientes agendam diretamente.",
  },
  {
    q: "Quantos utilizadores posso ter?",
    a: "Ilimitados. Podes criar contas para administradores, rececionistas e profissionais, cada um com o seu nível de acesso.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem fidelização, sem taxas de cancelamento. Cancelas quando quiseres.",
  },
];

/* ── Mockup da página de marcação ───────────────────────────── */
function BookingMockup() {
  return (
    <div className="relative select-none">
      <div className="bg-[#08081a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-950/60">
        <div className="border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/10" />)}
          </div>
          <div className="flex-1 bg-white/5 rounded h-5 flex items-center px-3">
            <span className="text-slate-600 text-xs">pjmanage.pt/agendar/o-meu-salao</span>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-1.5 mb-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center gap-1.5 flex-1 last:flex-none">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                  i <= 2 ? "bg-indigo-600 border-indigo-600 text-white" : "border-white/10 text-slate-600"
                }`}>
                  {i <= 2 ? "✓" : i}
                </div>
                {i < 4 && <div className={`flex-1 h-px ${i < 2 ? "bg-indigo-600" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">Passo 3 de 4: <span className="text-slate-400">Data e Hora</span></p>
          <div className="bg-white/5 border border-white/8 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Junho 2026</span>
              <div className="flex gap-1">
                {["‹","›"].map(c => <div key={c} className="w-5 h-5 rounded bg-white/5 text-slate-500 text-xs flex items-center justify-center">{c}</div>)}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {["S","T","Q","Q","S","S","D"].map((d,i) => (
                <div key={i} className="text-center text-slate-600 text-xs py-0.5">{d}</div>
              ))}
              {[...Array(5)].map((_,i) => <div key={`e${i}`} />)}
              {[...Array(30)].map((_,i) => (
                <div key={i} className={`text-center text-xs py-1 rounded ${
                  i+1 === 14 ? "bg-indigo-600 text-white font-bold" :
                  i+1 < 5 ? "text-slate-700" : "text-slate-400"
                }`}>{i+1}</div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {["09:00","10:00","11:00","11:30","14:00","14:30","15:00","16:00"].map((h, i) => (
              <div key={h} className={`py-1.5 rounded-lg text-xs font-medium text-center border ${
                i === 2 ? "bg-indigo-600 border-indigo-600 text-white" : "border-white/10 text-slate-500"
              }`}>{h}</div>
            ))}
          </div>
          <div className="bg-indigo-600 text-white text-xs font-semibold py-2 rounded-lg text-center">
            Continuar →
          </div>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-900/50 whitespace-nowrap">
        Marcação confirmada!
      </div>
    </div>
  );
}

/* ── FAQ item ────────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition"
      >
        <span className="text-white text-sm font-medium">{q}</span>
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 ml-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const precosRef = useRef(null);
  const contactoRef = useRef(null);

  const [form, setForm] = useState({ nome: "", nomeSalao: "", email: "", telefone: "", mensagem: "" });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function scrollTo(ref) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setF(campo) {
    return (e) => setForm(f => ({ ...f, [campo]: e.target.value }));
  }

  async function handleContacto(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await publicPost("/public/contacto", form);
      setSucesso(true);
      setForm({ nome: "", nomeSalao: "", email: "", telefone: "", mensagem: "" });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-[#060612] text-white overflow-x-hidden">

      {/* Glows de fundo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-3xl" />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="relative z-10 border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="PJManage" className="h-9 w-auto brightness-0 invert opacity-90" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo(contactoRef)}
              className="text-slate-400 hover:text-white text-sm font-medium transition hidden sm:block"
            >
              Contacto
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg shadow-indigo-900/40"
            >
              Entrar →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-800/40 rounded-full px-4 py-1.5 text-indigo-300 text-xs font-medium mb-10 uppercase tracking-wide">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Software de gestão para salões de beleza
        </div>

        <img
          src="/logo.png"
          alt="PJManage"
          className="h-28 w-auto mx-auto mb-10 brightness-0 invert opacity-95 drop-shadow-2xl"
        />

        <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight">
          O seu salão a{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            trabalhar por si
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Gestão completa de agendamentos, clientes e stock, com marcações online 24/7 para os seus clientes agendarem sem precisar de telefonar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => scrollTo(precosRef)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl text-base font-semibold transition shadow-xl shadow-indigo-900/50 hover:scale-105"
          >
            Ver preços →
          </button>
          <button
            onClick={() => scrollTo(contactoRef)}
            className="border border-white/15 hover:border-white/30 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-base font-medium transition hover:bg-white/5"
          >
            Falar conosco
          </button>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {[
            { v: "24/7", l: "Marcações online" },
            { v: "100%", l: "Gestão no browser" },
            { v: "∞", l: "Clientes e agendamentos" },
          ].map(s => (
            <div key={s.l} className="bg-[#060612] px-6 py-6 text-center">
              <p className="text-3xl font-bold text-white mb-1">{s.v}</p>
              <p className="text-slate-500 text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <p className="text-center text-slate-500 text-xs font-semibold uppercase tracking-widest mb-10">
          Tudo o que o seu salão precisa
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.title} className={`border ${f.bg} rounded-2xl p-5 hover:scale-[1.02] transition-transform`}>
              <div className={`${f.color} mb-3`}>
                <Icon d={f.icon} />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1.5">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marcação Online — destaque ────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="bg-gradient-to-br from-indigo-900/25 to-violet-900/15 border border-indigo-700/25 rounded-3xl p-8 md:p-14">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 text-indigo-400 text-xs font-semibold mb-6 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                Incluído no plano
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Os seus clientes marcam online,{" "}
                <span className="text-indigo-400">a qualquer hora</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Partilhe o seu link de marcação nas redes sociais, WhatsApp ou website. Os clientes escolhem o serviço, o profissional, a data e a hora em segundos, sem telefonemas.
              </p>
              <div className="space-y-5">
                {[
                  { n: "1", title: "Partilha o link", desc: "Recebe um link personalizado para partilhar com os seus clientes." },
                  { n: "2", title: "O cliente escolhe", desc: "Serviço, profissional, data e hora disponível, em segundos." },
                  { n: "3", title: "Entra no sistema automaticamente", desc: "O agendamento aparece no dashboard sem nenhuma ação manual." },
                ].map(step => (
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
            <div className="hidden md:block">
              <BookingMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Preços ───────────────────────────────────────────────── */}
      <section ref={precosRef} className="relative z-10 max-w-2xl mx-auto px-6 pb-28 scroll-mt-8">
        <p className="text-center text-slate-500 text-xs font-semibold uppercase tracking-widest mb-4">
          Preços
        </p>
        <h2 className="text-center text-3xl font-bold text-white mb-12">
          Um plano. Tudo incluído.
        </h2>

        <div className="relative bg-gradient-to-br from-indigo-900/30 to-violet-900/20 border border-indigo-600/40 rounded-3xl p-8 shadow-2xl shadow-indigo-950/50">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
            Mais popular
          </div>

          <div className="text-center mb-8">
            <p className="text-slate-400 text-sm mb-2">Plano Profissional</p>
            <div className="flex items-end justify-center gap-1">
              <span className="text-6xl font-bold text-white">35</span>
              <div className="mb-2 text-left">
                <span className="text-2xl text-slate-300 font-medium">€</span>
                <p className="text-slate-400 text-sm">/mês</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-2">por salão · sem fidelização</p>
          </div>

          <ul className="space-y-3 mb-8">
            {planIncludes.map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={() => scrollTo(contactoRef)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-indigo-900/50 hover:scale-[1.02]"
          >
            Quero experimentar →
          </button>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 pb-28">
        <h2 className="text-center text-2xl font-bold text-white mb-8">Perguntas frequentes</h2>
        <div className="space-y-2">
          {faqs.map(faq => <FaqItem key={faq.q} {...faq} />)}
        </div>
      </section>

      {/* ── Formulário de contacto ────────────────────────────────── */}
      <section ref={contactoRef} className="relative z-10 max-w-2xl mx-auto px-6 pb-28 scroll-mt-8">
        <h2 className="text-center text-2xl font-bold text-white mb-2">Fale conosco</h2>
        <p className="text-center text-slate-400 text-sm mb-10">
          Preencha o formulário e entramos em contacto em menos de 24h.
        </p>

        {sucesso ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
            <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-white font-semibold text-lg mb-2">Pedido recebido!</h3>
            <p className="text-slate-400 text-sm">Entraremos em contacto em breve. Obrigado pelo seu interesse.</p>
          </div>
        ) : (
          <form onSubmit={handleContacto} className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome *</label>
                <input type="text" value={form.nome} onChange={setF("nome")} placeholder="O seu nome" required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome do salão *</label>
                <input type="text" value={form.nomeSalao} onChange={setF("nomeSalao")} placeholder="Nome do seu salão" required className={inputCls} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={setF("email")} placeholder="email@exemplo.com" required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Telemóvel</label>
                <input type="tel" value={form.telefone} onChange={setF("telefone")} placeholder="+351 9XX XXX XXX" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Mensagem</label>
              <textarea value={form.mensagem} onChange={setF("mensagem")} rows={4} placeholder="Tem alguma questão ou informação adicional?" className={`${inputCls} resize-none`} />
            </div>

            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">{erro}</div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2"
            >
              {enviando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  A enviar...
                </>
              ) : "Enviar pedido"}
            </button>
          </form>
        )}
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo.png" alt="PJManage" className="h-7 w-auto brightness-0 invert opacity-50" />
          <p className="text-slate-600 text-sm">© 2026 PJManage · Todos os direitos reservados</p>
          <button onClick={() => navigate("/login")} className="text-slate-500 hover:text-slate-300 text-sm transition">
            Acesso clientes →
          </button>
        </div>
      </footer>

    </div>
  );
}
