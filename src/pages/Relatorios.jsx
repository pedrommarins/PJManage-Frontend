import { get } from "../services/api";

export default function Relatorios() {
  async function exportarClientes() {
    try {
      const agendamentos = await get("/agendamentos");
      const linhas = [
        ["Cliente", "Profissional", "Serviço", "Data do Serviço", "Hora", "Valor Pago"],
        ...agendamentos.map((a) => [
          a.cliente?.nome || "",
          a.profissional?.nome || "",
          a.servico?.nome || "",
          new Date(a.dataHora).toLocaleDateString("pt-PT"),
          new Date(a.dataHora).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          a.servico?.preco ? `${a.servico.preco}€` : "",
        ]),
      ];
      downloadCSV(linhas, "relatorio-clientes.csv");
    } catch (err) {
      alert("Erro ao exportar: " + err.message);
    }
  }

  async function exportarProfissionais() {
    try {
      const profissionais = await get("/profissionais");
      const linhas = [
        ["ID", "Nome", "Especialidade", "Telefone", "Ativo"],
        ...profissionais.map((p) => [
          p.id,
          p.nome,
          p.especialidade || "",
          p.telefone || "",
          p.ativo ? "Sim" : "Não",
        ]),
      ];
      downloadCSV(linhas, "profissionais.csv");
    } catch (err) {
      alert("Erro ao exportar profissionais: " + err.message);
    }
  }

  async function exportarEstoque() {
    try {
      const produtos = await get("/produtos");
      const linhas = [
        ["ID", "Nome", "Quantidade", "Quantidade Mínima", "Preço", "Alerta"],
        ...produtos.map((p) => [
          p.id,
          p.nome,
          p.quantidade,
          p.quantidadeMinima,
          p.preco ? `${p.preco}€` : "",
          p.quantidade < p.quantidadeMinima ? "Abaixo do mínimo" : "OK",
        ]),
      ];
      downloadCSV(linhas, "estoque.csv");
    } catch (err) {
      alert("Erro ao exportar estoque: " + err.message);
    }
  }

  function downloadCSV(linhas, nomeArquivo) {
    const conteudo = linhas
      .map((linha) =>
        linha.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(";")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + conteudo], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  }

  const relatorios = [
    {
      id: "clientes",
      titulo: "Relatório de Clientes",
      descricao: "Histórico de serviços por cliente com profissional, serviço e valor pago.",
      acao: exportarClientes,
    },
    {
      id: "profissionais",
      titulo: "Produção dos Profissionais",
      descricao: "Lista de profissionais com especialidade e estado.",
      acao: exportarProfissionais,
    },
    {
      id: "estoque",
      titulo: "Relatório de Estoque",
      descricao: "Estado atual do stock com alertas de produtos abaixo do mínimo.",
      acao: exportarEstoque,
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Relatórios</h2>
      <p className="text-gray-500 text-sm mb-8">
        Exporta os dados do teu salão em formato CSV.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {relatorios.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-3">
            <h3 className="text-base font-semibold text-gray-800">{r.titulo}</h3>
            <p className="text-sm text-gray-500">{r.descricao}</p>
            <button
              onClick={r.acao}
              className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition"
            >
              Exportar CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}