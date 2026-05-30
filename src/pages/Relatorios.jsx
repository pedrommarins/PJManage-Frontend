import { useEffect, useState } from "react";
import { get } from "../services/api";
import Spinner from "../components/Spinner";

function primeiroDiaMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}
function hoje() {
  return new Date().toISOString().split("T")[0];
}

export default function Relatorios() {
  const [inicio, setInicio] = useState(primeiroDiaMes());
  const [fim, setFim] = useState(hoje());
  const [faturacao, setFaturacao] = useState(null);
  const [topServicos, setTopServicos] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [stockBaixo, setStockBaixo] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setErro("");
    setCarregando(true);
    try {
      const q = `inicio=${inicio}&fim=${fim}`;
      const [f, t, c, s] = await Promise.all([
        get(`/relatorios/faturacao?${q}`),
        get(`/relatorios/top-servicos?${q}`),
        get(`/relatorios/comissoes?${q}`),
        get(`/relatorios/stock-baixo`),
      ]);
      setFaturacao(f);
      setTopServicos(t);
      setComissoes(c);
      setStockBaixo(s);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => { carregar(); }, []);

  // ----- Exportações CSV -----
  function downloadCSV(linhas, nomeArquivo) {
    const conteudo = linhas
      .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  }
  function exportarComissoes() {
    downloadCSV([
      ["Profissional", "Atendimentos", "Faturado (€)", "Comissão (€)"],
      ...comissoes.map((c) => [c.nome, c.quantidade, c.totalFaturado, c.comissao]),
    ], "comissoes.csv");
  }
  function exportarTopServicos() {
    downloadCSV([
      ["Serviço", "Quantidade", "Total (€)"],
      ...topServicos.map((s) => [s.nome, s.quantidade, s.total]),
    ], "top-servicos.csv");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Relatórios</h2>
      <p className="text-gray-500 text-sm mb-6">Análise do desempenho do salão por período.</p>

      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Início</label>
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fim</label>
          <input type="date" value={fim} onChange={(e) => setFim(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={carregar}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg">Atualizar</button>
      </div>

      {carregando && <Spinner />}

      {/* Cartões resumo */}
      {!carregando && <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 text-green-700 rounded-2xl p-6">
          <p className="text-sm font-medium opacity-75">Faturação no período</p>
          <p className="text-3xl font-bold">{faturacao ? Number(faturacao.totalFaturado).toFixed(2) : "0.00"}€</p>
        </div>
        <div className="bg-blue-50 text-blue-700 rounded-2xl p-6">
          <p className="text-sm font-medium opacity-75">Atendimentos concluídos</p>
          <p className="text-3xl font-bold">{faturacao ? faturacao.numeroAtendimentos : 0}</p>
        </div>
        <div className={`rounded-2xl p-6 ${stockBaixo.length > 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}`}>
          <p className="text-sm font-medium opacity-75">Produtos abaixo do mínimo</p>
          <p className="text-3xl font-bold">{stockBaixo.length}</p>
        </div>
      </div>}

      {!carregando && <div className="grid grid-cols-2 gap-6">
        {/* Top serviços */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Serviços mais vendidos</h3>
            <button onClick={exportarTopServicos} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Exportar CSV</button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Serviço</th>
                <th className="px-6 py-3 text-left">Qtd</th>
                <th className="px-6 py-3 text-left">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topServicos.map((s) => (
                <tr key={s.servicoId}>
                  <td className="px-6 py-3 text-gray-700">{s.nome}</td>
                  <td className="px-6 py-3 text-gray-600">{s.quantidade}</td>
                  <td className="px-6 py-3 text-gray-600">{Number(s.total).toFixed(2)}€</td>
                </tr>
              ))}
              {topServicos.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400">Sem dados no período.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Comissões */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Comissões por profissional</h3>
            <button onClick={exportarComissoes} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Exportar CSV</button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Profissional</th>
                <th className="px-6 py-3 text-left">Faturado</th>
                <th className="px-6 py-3 text-left">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comissoes.map((c) => (
                <tr key={c.profissionalId}>
                  <td className="px-6 py-3 text-gray-700">{c.nome}</td>
                  <td className="px-6 py-3 text-gray-600">{Number(c.totalFaturado).toFixed(2)}€</td>
                  <td className="px-6 py-3 font-medium text-green-700">{Number(c.comissao).toFixed(2)}€</td>
                </tr>
              ))}
              {comissoes.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400">Sem dados no período.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>}

      {/* Stock baixo */}
      {!carregando && stockBaixo.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-4 border-b">
            <h3 className="text-base font-semibold text-red-600">⚠ Produtos abaixo do mínimo</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Produto</th>
                <th className="px-6 py-3 text-left">Quantidade</th>
                <th className="px-6 py-3 text-left">Mínimo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stockBaixo.map((p) => (
                <tr key={p.id} className="bg-red-50">
                  <td className="px-6 py-3 text-gray-700">{p.nome}</td>
                  <td className="px-6 py-3 text-gray-600">{p.quantidade}</td>
                  <td className="px-6 py-3 text-gray-600">{p.quantidadeMinima}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
