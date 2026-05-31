import { useEffect, useState } from "react";
import { get, post, put } from "../services/api";
import Spinner from "../components/Spinner";
import TelemovelInput from "../components/TelemovelInput";

const FERRAMENTAS = [
  { id: "funcionarios", label: "Cadastro de Funcionários", icone: "👥" },
  { id: "marcacao-online", label: "Marcação Online", icone: "🔗" },
];

const NIVEIS = [
  { value: "ADMIN", label: "Administrador (nível 0)" },
  { value: "RECECAO", label: "Receção (nível 1)" },
  { value: "PROFISSIONAL", label: "Profissional (nível 2)" },
];

const ESTADOS_CIVIS = ["Solteiro(a)", "Casado(a)", "União de facto", "Divorciado(a)", "Viúvo(a)"];

const DOCUMENTOS = [
  { value: "CARTAO_CIDADAO", label: "Cartão de Cidadão" },
  { value: "PASSAPORTE", label: "Passaporte" },
  { value: "TITULO_RESIDENCIA", label: "Título de Residência" },
];

const rotuloNivel = (role) => NIVEIS.find((n) => n.value === role)?.label || role;

export default function FerramentasAdmin() {
  const [ferramenta, setFerramenta] = useState("funcionarios");

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Ferramentas Administrativas</h2>
      <p className="text-gray-500 text-sm mb-6">Ferramentas de gestão reservadas ao administrador.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FERRAMENTAS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFerramenta(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              ferramenta === f.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
            }`}
          >
            {f.icone} {f.label}
          </button>
        ))}
      </div>

      {ferramenta === "funcionarios" && <CadastroFuncionarios />}
      {ferramenta === "marcacao-online" && <LinkMarcacaoOnline />}
    </div>
  );
}

const FORM_VAZIO = {
  senha: "", role: "PROFISSIONAL", ativo: true, codigoLogin: "",
  nomeCompleto: "", dataNascimento: "", nacionalidade: "", estadoCivil: "",
  nif: "", niss: "", documentoTipo: "", documentoNumero: "", morada: "", telefone: "", email: "",
  cargo: "", departamento: "", dataAdmissao: "", iban: "",
  contatoEmergencia: "", observacoes: "",
};

function CadastroFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function carregar() {
    setCarregando(true);
    try { setFuncionarios(await get("/funcionarios")); }
    catch (err) { setErro(err.message); }
    finally { setCarregando(false); }
  }
  useEffect(() => { carregar(); }, []);

  function handleEditar(f) {
    setEditandoId(f.id);
    setForm({
      senha: "",
      role: f.usuario?.role || "PROFISSIONAL",
      ativo: f.ativo !== false,
      codigoLogin: f.usuario?.codigo || "",
      nomeCompleto: f.nomeCompleto || "",
      dataNascimento: f.dataNascimento || "",
      nacionalidade: f.nacionalidade || "",
      estadoCivil: f.estadoCivil || "",
      nif: f.nif || "",
      niss: f.niss || "",
      documentoTipo: f.documentoTipo || "",
      documentoNumero: f.documentoNumero || "",
      morada: f.morada || "",
      telefone: f.telefone || "",
      email: f.email || "",
      cargo: f.cargo || "",
      departamento: f.departamento || "",
      dataAdmissao: f.dataAdmissao || "",
      iban: f.iban || "",
      contatoEmergencia: f.contatoEmergencia || "",
      observacoes: f.observacoes || "",
    });
    setSucesso("");
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelar() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      const body = {
        ...form,
        senha: form.senha && form.senha.trim() ? form.senha : null,
        dataNascimento: form.dataNascimento || null,
        dataAdmissao: form.dataAdmissao || null,
      };
      if (editandoId) {
        const upd = await put(`/funcionarios/${editandoId}`, body);
        setSucesso(`Funcionário "${upd.nomeCompleto}" atualizado.`);
        setEditandoId(null);
      } else {
        const criado = await post("/funcionarios", body);
        const semSenha = !body.senha;
        setSucesso(
          `Funcionário "${criado.nomeCompleto}" criado. Código de acesso: ${criado.usuario?.codigo}` +
          (semSenha ? " — a senha será definida pelo funcionário no primeiro acesso." : ".")
        );
      }
      setForm(FORM_VAZIO);
      await carregar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function alternarAtivo(f) {
    const acao = f.ativo !== false ? "desativar" : "ativar";
    if (!confirm(`Tens a certeza que queres ${acao} "${f.nomeCompleto}"?`)) return;
    try {
      await put(`/funcionarios/${f.id}/ativo`, { ativo: f.ativo === false });
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  const input = "border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div>
      {erro && <p className="text-red-500 mb-4">{erro}</p>}
      {sucesso && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">{sucesso}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Acesso */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-1">🔐 Acesso ao sistema</h3>
          <p className="text-xs text-gray-400 mb-4">
            O código de acesso é gerado automaticamente. A senha é opcional — se não a definires, o funcionário define-a no primeiro acesso.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {editandoId && (
              <div>
                <label className={labelCls}>Código de acesso</label>
                <input type="text" value={form.codigoLogin} readOnly
                  className={`w-full ${input} bg-gray-50 font-mono text-gray-500`} />
              </div>
            )}
            <div>
              <label className={labelCls}>{editandoId ? "Senha (vazio = manter)" : "Senha (opcional)"}</label>
              <input type="password" value={form.senha} onChange={set("senha")} className={`w-full ${input}`}
                minLength={6} placeholder={editandoId ? "••••••" : "Mínimo 6 caracteres"} />
            </div>
            <div>
              <label className={labelCls}>Nível de acesso *</label>
              <select value={form.role} onChange={set("role")} className={`w-full ${input}`} required>
                {NIVEIS.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            {editandoId && (
              <div>
                <label className={labelCls}>Estado</label>
                <select value={form.ativo ? "true" : "false"}
                  onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.value === "true" }))}
                  className={`w-full ${input}`}>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Dados pessoais */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">👤 Dados pessoais</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Nome completo *</label>
              <input type="text" value={form.nomeCompleto} onChange={set("nomeCompleto")} className={`w-full ${input}`} required />
            </div>
            <div>
              <label className={labelCls}>Data de nascimento</label>
              <input type="date" value={form.dataNascimento} onChange={set("dataNascimento")} className={`w-full ${input}`} />
            </div>
            <div>
              <label className={labelCls}>Nacionalidade</label>
              <input type="text" value={form.nacionalidade} onChange={set("nacionalidade")} className={`w-full ${input}`} />
            </div>
            <div>
              <label className={labelCls}>Estado civil</label>
              <select value={form.estadoCivil} onChange={set("estadoCivil")} className={`w-full ${input}`}>
                <option value="">—</option>
                {ESTADOS_CIVIS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>NIF</label>
              <input type="text" value={form.nif} onChange={set("nif")} className={`w-full ${input}`} />
            </div>
            <div>
              <label className={labelCls}>NISS</label>
              <input type="text" value={form.niss} onChange={set("niss")} className={`w-full ${input}`} />
            </div>
            <div>
              <label className={labelCls}>Tipo de documento</label>
              <select value={form.documentoTipo} onChange={set("documentoTipo")} className={`w-full ${input}`}>
                <option value="">—</option>
                {DOCUMENTOS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Nº do documento</label>
              <input type="text" value={form.documentoNumero} onChange={set("documentoNumero")} className={`w-full ${input}`} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Morada completa</label>
              <input type="text" value={form.morada} onChange={set("morada")} className={`w-full ${input}`} />
            </div>
            <div>
              <label className={labelCls}>Telemóvel</label>
              <TelemovelInput value={form.telefone} onChange={(v) => setForm((f) => ({ ...f, telefone: v }))} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>E-mail (contacto)</label>
              <input type="email" value={form.email} onChange={set("email")} className={`w-full ${input}`} />
            </div>
          </div>
        </section>

        {/* Dados profissionais */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">💼 Dados profissionais</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Cargo / Função</label>
              <input type="text" value={form.cargo} onChange={set("cargo")} className={`w-full ${input}`} />
            </div>
            <div>
              <label className={labelCls}>Departamento</label>
              <input type="text" value={form.departamento} onChange={set("departamento")} className={`w-full ${input}`} />
            </div>
            <div>
              <label className={labelCls}>Data de admissão</label>
              <input type="date" value={form.dataAdmissao} onChange={set("dataAdmissao")} className={`w-full ${input}`} />
            </div>
            <div className="col-span-3">
              <label className={labelCls}>IBAN</label>
              <input type="text" value={form.iban} onChange={set("iban")} className={`w-full ${input}`} placeholder="PT50 ..." />
            </div>
          </div>
        </section>

        {/* Informações adicionais */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">📝 Informações adicionais</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls}>Contacto de emergência</label>
              <input type="text" value={form.contatoEmergencia} onChange={set("contatoEmergencia")} className={`w-full ${input}`} />
            </div>
            <div>
              <label className={labelCls}>Observações</label>
              <textarea value={form.observacoes} onChange={set("observacoes")} rows={3} className={`w-full ${input}`} />
            </div>
          </div>
        </section>

        <div className="flex gap-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg transition disabled:opacity-50">
            {loading ? "A guardar..." : editandoId ? "Guardar alterações" : "Cadastrar funcionário"}
          </button>
          {editandoId && (
            <button type="button" onClick={handleCancelar}
              className="px-6 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50 transition">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b">
          <h3 className="text-base font-semibold text-gray-800">Funcionários ({funcionarios.length})</h3>
        </div>
        {carregando ? <Spinner /> : <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">Cargo</th>
              <th className="px-6 py-3 text-left">Departamento</th>
              <th className="px-6 py-3 text-left">Código acesso</th>
              <th className="px-6 py-3 text-left">Nível</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Telemóvel</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {funcionarios.map((f) => {
              const inativo = f.ativo === false;
              return (
              <tr key={f.id} className={`hover:bg-gray-50 ${inativo ? "opacity-50" : ""}`}>
                <td className="px-6 py-4 font-medium text-gray-800">{f.nomeCompleto}</td>
                <td className="px-6 py-4 text-gray-600">{f.cargo || "—"}</td>
                <td className="px-6 py-4 text-gray-600">{f.departamento || "—"}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{f.usuario?.codigo || "—"}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {rotuloNivel(f.usuario?.role)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    inativo ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                    {inativo ? "Inativo" : "Ativo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{f.telefone || "—"}</td>
                <td className="px-6 py-4 text-right flex gap-3 justify-end">
                  <button onClick={() => handleEditar(f)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-medium">Editar</button>
                  <button onClick={() => alternarAtivo(f)}
                    className={`text-xs font-medium ${inativo ? "text-green-600 hover:text-green-800" : "text-red-500 hover:text-red-700"}`}>
                    {inativo ? "Ativar" : "Desativar"}
                  </button>
                </td>
              </tr>
              );
            })}
            {funcionarios.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">Nenhum funcionário cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>}
      </div>
    </div>
  );
}

function sanitizarSlug(v) {
  return v
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function LinkMarcacaoOnline() {
  const [salao, setSalao] = useState(null);
  const [slugEdit, setSlugEdit] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [erroSlug, setErroSlug] = useState("");
  const [sucessoSlug, setSucessoSlug] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    get("/saloes/meu").then(s => {
      setSalao(s);
      setSlugEdit(s.slug || "");
    }).catch(() => {});
  }, []);

  const link = salao?.slug ? `${window.location.origin}/agendar/${salao.slug}` : null;

  function handleSlugChange(e) {
    setSlugEdit(sanitizarSlug(e.target.value));
    setErroSlug("");
    setSucessoSlug(false);
  }

  async function guardarSlug(e) {
    e.preventDefault();
    if (slugEdit.length < 3) { setErroSlug("Mínimo 3 caracteres."); return; }
    setErroSlug("");
    setGuardando(true);
    try {
      const atualizado = await put("/saloes/meu/slug", { slug: slugEdit });
      setSalao(atualizado);
      setSucessoSlug(true);
      setTimeout(() => setSucessoSlug(false), 3000);
    } catch (err) {
      setErroSlug(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function copiar() {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  const inputCls = "border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  if (!salao) return <div className="py-8 text-center text-gray-400 text-sm">A carregar...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">🔗 Link de Marcação Online</h3>
        <p className="text-gray-500 text-sm">
          Personalize o link do seu salão e partilhe com os clientes para marcações 24/7.
        </p>
      </div>

      {/* Personalizar link */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <label className="block text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
          Personalizar link do salão
        </label>
        <form onSubmit={guardarSlug} className="space-y-3">
          <div className="flex items-center gap-0 border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <span className="bg-gray-50 px-3 py-2.5 text-gray-400 text-sm border-r border-gray-300 whitespace-nowrap shrink-0">
              {window.location.origin}/agendar/
            </span>
            <input
              type="text"
              value={slugEdit}
              onChange={handleSlugChange}
              placeholder="nome-do-salao"
              className="flex-1 px-3 py-2.5 text-sm text-gray-800 focus:outline-none min-w-0"
            />
          </div>
          <p className="text-xs text-gray-400">
            Apenas letras minúsculas, números e hífens. Ex: <span className="font-mono">salao-da-maria</span>
          </p>
          {erroSlug && <p className="text-xs text-red-500">{erroSlug}</p>}
          {sucessoSlug && <p className="text-xs text-green-600">Link atualizado com sucesso!</p>}
          <button
            type="submit"
            disabled={guardando || slugEdit === salao.slug}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
          >
            {guardando ? "A guardar..." : "Guardar link"}
          </button>
        </form>
      </div>

      {/* Link atual */}
      {link && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
            Seu link atual
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={link}
              className={`flex-1 ${inputCls} bg-gray-50 text-gray-700 font-mono min-w-0`}
            />
            <button
              onClick={copiar}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition shrink-0 ${
                copiado ? "bg-green-100 text-green-700 border border-green-200" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
          >
            Ver página de marcação
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">Como partilhar?</p>
            <ul className="space-y-1 text-blue-600 text-xs list-disc list-inside">
              <li>Cole o link na bio do Instagram ou Facebook</li>
              <li>Envie por WhatsApp ou SMS aos clientes</li>
              <li>Adicione ao seu website ou Google Meu Negócio</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
