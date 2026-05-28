import { useState } from "react";
import DashboardHome from "./DashboardHome";
import Clientes from "./Clientes";
import Agendamentos from "./Agendamentos";
import Produtos from "./Produtos";
import Servicos from "./Servicos";
import Profissionais from "./Profissionais";
import Relatorios from "./Relatorios";

const menu = [
  { id: "inicio", label: "Início" },
  { id: "clientes", label: "Clientes" },
  { id: "agendamentos", label: "Agendamentos" },
  { id: "relatorios", label: "Relatórios" },
  {
    label: "Gestão",
    submenu: [
      { id: "profissionais", label: "Profissionais" },
      { id: "servicos", label: "Serviços" },
      { id: "produtos", label: "Produtos" },
    ],
  },
];

export default function Dashboard({ onLogout, userNome }) {
  const nomeUtilizador = userNome || "utilizador";
  const [pagina, setPagina] = useState("inicio");
  const [gestaoAberto, setGestaoAberto] = useState(false);

  const isGestao = ["profissionais", "servicos", "produtos"].includes(pagina);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <p className="text-xs text-gray-400 mb-1">Olá, <span className="font-medium text-gray-600">{nomeUtilizador}</span></p>
          <img src="/logo.png" alt="PJManage" className="h-40 w-auto my-1" />
          <button
            onClick={onLogout}
            className="mt-3 w-full text-left px-0 py-0 text-xs text-red-400 hover:text-red-600 transition font-medium"
          >
            Sair
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item) =>
            item.submenu ? (
              <div key={item.label}>
                <button
                  onClick={() => setGestaoAberto(!gestaoAberto)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${
                    isGestao
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                  <span className="text-xs">{gestaoAberto || isGestao ? "▲" : "▼"}</span>
                </button>
                {(gestaoAberto || isGestao) && (
                  <div className="ml-3 mt-1 space-y-1">
                    {item.submenu.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setPagina(sub.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                          pagina === sub.id
                            ? "bg-blue-600 text-white font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                key={item.id}
                onClick={() => setPagina(item.id)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                  pagina === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            )
          )}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {pagina === "inicio" && <DashboardHome />}
        {pagina === "clientes" && <Clientes />}
        {pagina === "agendamentos" && <Agendamentos />}
        {pagina === "relatorios" && <Relatorios />}
        {pagina === "profissionais" && <Profissionais />}
        {pagina === "servicos" && <Servicos />}
        {pagina === "produtos" && <Produtos />}
      </main>
    </div>
  );
}