import { useNavigate, useParams } from "react-router-dom";
import DashboardHome from "./DashboardHome";
import Agendamentos from "./Agendamentos";
import Produtos from "./Produtos";
import Servicos from "./Servicos";
import Profissionais from "./Profissionais";
import Relatorios from "./Relatorios";
import Pacotes from "./Pacotes";
import Fornecedores from "./Fornecedores";
import Comunicacao from "./Comunicacao";
import FerramentasAdmin from "./FerramentasAdmin";

// ---------- Ícones SVG ----------
function Icon({ id, className = "w-4 h-4 shrink-0" }) {
  const paths = {
    inicio:         ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"],
    agendamentos:   ["M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"],
    relatorios:     ["M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"],
    profissionais:  ["M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"],
    servicos:       ["M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"],
    pacotes:        ["M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"],
    produtos:       ["M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"],
    fornecedores:   ["M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"],
    comunicacao:    ["M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"],
    ferramentas:    ["M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"],
    logout:         ["M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"],
    chevronDown:    ["M19 9l-7 7-7-7"],
    chevronRight:   ["M9 5l7 7-7 7"],
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      {(paths[id] || []).map((d, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
      ))}
    </svg>
  );
}

// ---------- Menu config ----------
const PAGE_TITLES = {
  inicio: "Início",
  agendamentos: "Agendamentos",
  relatorios: "Relatórios",
  profissionais: "Profissionais",
  servicos: "Serviços",
  pacotes: "Pacotes de Sessões",
  produtos: "Produtos & Stock",
  fornecedores: "Fornecedores",
  comunicacao: "Comunicação",
  ferramentas: "Ferramentas Administrativas",
};

const menu = [
  { id: "inicio",      label: "Início",       icon: "inicio" },
  { id: "agendamentos",label: "Agendamentos", icon: "agendamentos" },
  {
    label: "Receção",
    nivelMax: 1,
    items: [
      { id: "relatorios",    label: "Relatórios",    icon: "relatorios" },
      { id: "profissionais", label: "Profissionais", icon: "profissionais" },
      { id: "servicos",      label: "Serviços",      icon: "servicos" },
      { id: "pacotes",       label: "Pacotes",       icon: "pacotes" },
    ],
  },
  {
    label: "Gestão",
    nivelMax: 0,
    items: [
      { id: "produtos",     label: "Produtos",      icon: "produtos" },
      { id: "fornecedores", label: "Fornecedores",  icon: "fornecedores" },
      { id: "comunicacao",  label: "Comunicação",   icon: "comunicacao" },
      { id: "ferramentas",  label: "Ferramentas",   icon: "ferramentas" },
    ],
  },
];

// ---------- Dashboard ----------
export default function Dashboard({ onLogout, userNome }) {
  const { pagina = "inicio" } = useParams();
  const navigate = useNavigate();

  const nivelRaw = localStorage.getItem("nivel");
  const nivel = nivelRaw === null || nivelRaw === "" ? 0 : Number(nivelRaw);

  const podeVer = (item) => item.nivelMax == null || nivel <= item.nivelMax;

  const paginasPermitidas = new Set(["inicio", "agendamentos"]);
  menu.forEach((item) => {
    if (item.items && podeVer(item)) item.items.forEach((s) => paginasPermitidas.add(s.id));
  });
  const pode = (id) => paginasPermitidas.has(id);

  function ir(id) { navigate("/" + id); }

  const inicial = (userNome || "U").charAt(0).toUpperCase();
  const pageTitle = PAGE_TITLES[pagina] || "Painel";
  const dataHoje = new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ---- Sidebar ---- */}
      <aside className="w-60 bg-slate-900 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <img src="/logo.png" alt="PJManage" className="h-20 w-auto brightness-0 invert opacity-90" />
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {menu.map((item) => {
            if (!item.items) {
              const ativo = pagina === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => ir(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    ativo
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                      : "text-slate-400 hover:bg-white/8 hover:text-slate-100"
                  }`}
                >
                  <Icon id={item.icon} />
                  {item.label}
                </button>
              );
            }

            if (!podeVer(item)) return null;

            const grupoAtivo = item.items.some((s) => s.id === pagina);

            return (
              <div key={item.label} className="pt-4">
                <p className="px-3 mb-1.5 text-xs font-semibold text-slate-600 uppercase tracking-widest">
                  {item.label}
                </p>
                {item.items.map((sub) => {
                  const ativo = pagina === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => ir(sub.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        ativo
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                          : "text-slate-400 hover:bg-white/8 hover:text-slate-100"
                      }`}
                    >
                      <Icon id={sub.icon} />
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Utilizador */}
        <div className="px-3 pb-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {inicial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{userNome || "Utilizador"}</p>
              <p className="text-xs text-slate-500 truncate">Disponível</p>
            </div>
            <button
              onClick={() => { navigate("/"); onLogout(); }}
              title="Sair"
              className="text-slate-500 hover:text-red-400 transition p-1 rounded"
            >
              <Icon id="logout" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ---- Área principal ---- */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
          </div>
          <p className="text-sm text-slate-400 capitalize">{dataHoje}</p>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 p-8">
          {pagina === "inicio"        && <DashboardHome />}
          {pagina === "agendamentos"  && <Agendamentos />}
          {pode("relatorios")    && pagina === "relatorios"    && <Relatorios />}
          {pode("profissionais") && pagina === "profissionais" && <Profissionais />}
          {pode("servicos")      && pagina === "servicos"      && <Servicos />}
          {pode("pacotes")       && pagina === "pacotes"       && <Pacotes />}
          {pode("produtos")      && pagina === "produtos"      && <Produtos />}
          {pode("fornecedores")  && pagina === "fornecedores"  && <Fornecedores />}
          {pode("comunicacao")   && pagina === "comunicacao"   && <Comunicacao />}
          {pode("ferramentas")   && pagina === "ferramentas"   && <FerramentasAdmin />}
        </main>
      </div>
    </div>
  );
}
