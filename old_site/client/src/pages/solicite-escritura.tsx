import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useToast } from "@/hooks/use-toast";

export default function SoliciteEscritura() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Dados do Solicitante
    nome: "",
    sobrenome: "",
    endereco: "",
    cidade: "",
    estado: "",
    telefone: "",
    email: "",

    // Vendedores
    nomeVendedores: "",
    documentosVendedores: [] as File[],

    // Pessoas Físicas - Vendedores
    pessoasFisicasVendedores: "",
    documentosPessoasFisicasVendedores: [] as File[],

    // Compradores
    nomeCompradores: "",
    documentosCompradores: [] as File[],

    // Pessoas Físicas - Compradores
    pessoasFisicasCompradores: "",
    documentosPessoasFisicasCompradores: [] as File[],

    // Objeto
    descricaoImoveis: "",
    documentosImoveis: [] as File[],

    // Preço e Forma de Pagamento
    precoFormaPagamento: "",

    // Especificações
    especificacoes: [] as string[],

    // Outros Acordos
    outrosAcordos: "",

    // Declaração Adicional
    declaracaoAdicional: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = Array.from(e.target.files || []);

    // Validar quantidade de arquivos
    if (files.length > 5) {
      toast({
        title: "Erro",
        description: "Máximo de 5 arquivos permitidos por campo",
        variant: "destructive",
      });
      return;
    }

    // Validar tipo e tamanho dos arquivos
    for (const file of files) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Erro",
          description: "Apenas arquivos PDF são permitidos",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Erro",
          description: `O arquivo ${file.name} excede o tamanho máximo de 5MB`,
          variant: "destructive",
        });
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [fieldName]: files }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => {
      const especificacoes = prev.especificacoes.includes(value)
        ? prev.especificacoes.filter((e) => e !== value)
        : [...prev.especificacoes, value];
      return { ...prev, especificacoes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const formDataToSend = new FormData();

      // Adicionar tipo e nome da solicitação
      formDataToSend.append("tipoSolicitacao", "solicite-sua-escritura");
      formDataToSend.append("nomeSolicitacao", "Solicite sua Escritura");

      // Adicionar todos os campos de texto
      Object.entries(formData).forEach(([key, value]) => {
        if (value && !(value instanceof File) && !Array.isArray(value)) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Adicionar especificações como JSON
      formDataToSend.append("especificacoes", JSON.stringify(formData.especificacoes));

      // Adicionar arquivos (múltiplos)
      formData.documentosVendedores.forEach((file) => {
        formDataToSend.append("documentosVendedores", file);
      });

      formData.documentosPessoasFisicasVendedores.forEach((file) => {
        formDataToSend.append("documentosPessoasFisicasVendedores", file);
      });

      formData.documentosCompradores.forEach((file) => {
        formDataToSend.append("documentosCompradores", file);
      });

      formData.documentosPessoasFisicasCompradores.forEach((file) => {
        formDataToSend.append("documentosPessoasFisicasCompradores", file);
      });

      formData.documentosImoveis.forEach((file) => {
        formDataToSend.append("documentosImoveis", file);
      });

      const response = await fetch("/api/solicitacoes", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Solicitação enviada com sucesso, aguarde nosso contato.",
        });

        // Resetar formulário
        setFormData({
          nome: "",
          sobrenome: "",
          endereco: "",
          cidade: "",
          estado: "",
          telefone: "",
          email: "",
          nomeVendedores: "",
          documentosVendedores: [],
          pessoasFisicasVendedores: "",
          documentosPessoasFisicasVendedores: [],
          nomeCompradores: "",
          documentosCompradores: [],
          pessoasFisicasCompradores: "",
          documentosPessoasFisicasCompradores: [],
          descricaoImoveis: "",
          documentosImoveis: [],
          precoFormaPagamento: "",
          especificacoes: [],
          outrosAcordos: "",
          declaracaoAdicional: "",
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || "Erro ao enviar solicitação");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao enviar solicitação. Tente novamente.");
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white font-sans text-gray-800">
      <Header />

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-serif text-gray-700 mb-8">
              Solicite sua Escritura
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Encaminhamento de Escritura */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                Encaminhamento de Escritura
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Solicitamos que preencha o formulário abaixo para que possamos elaborar o encaminhamento da sua escritura
              </p>
            </div>

            {/* Dados do Solicitante */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                Dados do Solicitante
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NOME *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SOBRENOME
                    </label>
                    <input
                      type="text"
                      name="sobrenome"
                      value={formData.sobrenome}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ENDEREÇO
                  </label>
                  <input
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CIDADE
                    </label>
                    <input
                      type="text"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ESTADO
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                      <option value="">Selecione</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espirito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TELEFONE
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-MAIL *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="DIGITE O E-MAIL"
                      className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                    <input
                      type="email"
                      placeholder="CONFIRMAR O E-MAIL"
                      className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vendedores */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Vendedores</h3>
              <p className="text-xs text-gray-600 mb-4">
                Insira o nome completo e estado civil de todos os vendedores. Se houver mais de um vendedor, separe-os por vírgula.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NOME DOS VENDEDORES *
                  </label>
                  <input
                    type="text"
                    name="nomeVendedores"
                    value={formData.nomeVendedores}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DOCUMENTOS - VENDEDORES
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handleFileChange(e, "documentosVendedores")}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 5 arquivos PDF de até 5MB cada</p>
                  <button
                    type="button"
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Adicionar Arquivo
                  </button>
                </div>
              </div>
            </div>

            {/* Pessoas Físicas - Vendedores */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                PESSOAS FÍSICAS - VENDEDORES
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Favor inserir os documentos abaixo como segue:
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PESSOAS FÍSICAS - VENDEDORES
                  </label>
                  <input
                    type="text"
                    name="pessoasFisicasVendedores"
                    value={formData.pessoasFisicasVendedores}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DOCUMENTOS - PESSOAS FÍSICAS VENDEDORES
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handleFileChange(e, "documentosPessoasFisicasVendedores")}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 5 arquivos PDF de até 5MB cada</p>
                  <button
                    type="button"
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Adicionar Arquivo
                  </button>
                </div>
              </div>
            </div>

            {/* Compradores */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Compradores</h3>
              <p className="text-xs text-gray-600 mb-4">
                Insira o nome completo e estado civil de todos os compradores. Se houver mais de um comprador, separe-os por vírgula.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NOME DOS COMPRADORES *
                  </label>
                  <input
                    type="text"
                    name="nomeCompradores"
                    value={formData.nomeCompradores}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DOCUMENTOS - COMPRADORES
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handleFileChange(e, "documentosCompradores")}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 5 arquivos PDF de até 5MB cada</p>
                  <button
                    type="button"
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Adicionar Arquivo
                  </button>
                </div>
              </div>
            </div>

            {/* Pessoas Físicas - Compradores */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                PESSOAS FÍSICAS - COMPRADORES
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Favor inserir os documentos abaixo como segue:
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PESSOAS FÍSICAS - COMPRADORES
                  </label>
                  <input
                    type="text"
                    name="pessoasFisicasCompradores"
                    value={formData.pessoasFisicasCompradores}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DOCUMENTOS - PESSOAS FÍSICAS COMPRADORES
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handleFileChange(e, "documentosPessoasFisicasCompradores")}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 5 arquivos PDF de até 5MB cada</p>
                  <button
                    type="button"
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Adicionar Arquivo
                  </button>
                </div>
              </div>
            </div>

            {/* Objeto */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Objeto</h3>
              <p className="text-xs text-gray-600 mb-4">
                Insira a descrição completa do bem
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DESCRIÇÃO DOS IMÓVEIS *
                  </label>
                  <textarea
                    name="descricaoImoveis"
                    value={formData.descricaoImoveis}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DOCUMENTOS - IMÓVEIS E/OU OUTROS DOCUMENTOS
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handleFileChange(e, "documentosImoveis")}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 5 arquivos PDF de até 5MB cada</p>
                  <button
                    type="button"
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Adicionar Arquivo
                  </button>
                </div>
              </div>
            </div>

            {/* Preço e Forma de Pagamento */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                PREÇO E/OU FORMA DE PAGAMENTO *
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Insira o preço total ou as condições de pagamento
              </p>

              <textarea
                name="precoFormaPagamento"
                value={formData.precoFormaPagamento}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                required
              ></textarea>
            </div>

            {/* Especificações */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                ESPECIFICAÇÕES *
              </h3>

              <div className="space-y-2">
                {[
                  "A ESCRITURA SERÁ LAVRADA EM MOEDA CORRENTE",
                  "OS VENDEDORES RECEBERAM TODO O PREÇO",
                  "O VENDEDOR(A) FIRMOU A PRESENTE ESCRITURA SEM ASSISTÊNCIA DO CÔNJUGE POR SER SOLTEIRO(A)",
                  "O COMPRADOR(A) FIRMOU A PRESENTE ESCRITURA SEM ASSISTÊNCIA DO CÔNJUGE POR SER SOLTEIRO(A)",
                  "O ADQUIRENTE DECLAROU SOBRE SUA RESPONSABILIDADE QUE O IMÓVEL DESTINA-SE A SUA RESIDÊNCIA E/OU DE SUA FAMÍLIA",
                  "A IMPORTÂNCIA DECLARADA CORRESPONDE AO REAL VALOR DO IMÓVEL",
                  "O(A) VENDEDOR(A) PAGARÁ DÉBITOS DE ITBI/LAUDÊMIO",
                  "O(A) COMPRADOR(A) PAGARÁ DÉBITOS DE ITBI/LAUDÊMIO",
                  "ISENTO DE ITBI/LAUDÊMIO PELA LEI N° ______",
                  "O(A) COMPRADOR(A) ESTÁ SUJEITO AO PAGAMENTO DE LAUDÊMIO",
                  "É(SÃO) BRASILEIRO(S) A(S) PARTE(S) VENDEDORA E COMPRADORA",
                  "IMÓVEL RURAL",
                  "HOUVE OU NÃO DIFERIMENTO PARA O VENDEDOR(A) E COMPRADOR(A)",
                  "OPERAÇÃO ISENTA DE IMPOSTO EM RAZÃO DO ART.____",
                ].map((spec) => (
                  <label key={spec} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.especificacoes.includes(spec)}
                      onChange={() => handleCheckboxChange(spec)}
                      className="mt-1 mr-2"
                    />
                    <span className="text-sm text-gray-700">{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Outros Acordos */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                OUTROS ACORDOS E CONDIÇÕES *
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Insira informações adicionais relevantes, como por exemplo: condições especiais, acordos, etc
              </p>

              <textarea
                name="outrosAcordos"
                value={formData.outrosAcordos}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                required
              ></textarea>
            </div>

            {/* Declaração */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Declaração</h3>
              <p className="text-xs text-gray-600 mb-4">
                Declaro estar ciente de que os documentos enviados serão utilizados exclusivamente
                para a elaboração da escritura solicitada e que todas as informações fornecidas são
                verdadeiras.
              </p>
            </div>

            {/* Declaração Adicional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                COMENTÁRIOS POR E-MAIL OU DECLARAÇÃO ADICIONAL *
              </label>
              <textarea
                name="declaracaoAdicional"
                value={formData.declaracaoAdicional}
                onChange={handleChange}
                rows={6}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
            >
              Enviar
            </button>
          </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 text-white p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-6 border-b border-gray-700 pb-3">
                SERVIÇOS ONLINE
              </h3>
              <nav className="space-y-3">
                <a
                  href="/certidao-de-procuracao"
                  className="block text-sm hover:text-brand-gold transition-colors py-2"
                >
                  Certidão de Procuração
                </a>
                <a
                  href="/certidao-de-substabelecimento"
                  className="block text-sm hover:text-brand-gold transition-colors py-2"
                >
                  Certidão de Substabelecimento
                </a>
                <a
                  href="/certidao-de-escritura"
                  className="block text-sm hover:text-brand-gold transition-colors py-2"
                >
                  Certidão de Escritura
                </a>

                <div className="border-t border-gray-700 my-4 pt-4">
                  <h4 className="text-sm font-bold mb-3">REGISTRO</h4>
                  <a
                    href="/certidao-de-protesto"
                    className="block text-sm hover:text-brand-gold transition-colors py-2"
                  >
                    Certidão de Protesto
                  </a>
                  <a
                    href="/confirmacao-de-procuracao"
                    className="block text-sm hover:text-brand-gold transition-colors py-2"
                  >
                    Confirmação de Procuração
                  </a>
                </div>

                <div className="border-t border-gray-700 my-4 pt-4">
                  <h4 className="text-sm font-bold mb-3">NOTARIAL</h4>
                  <a
                    href="/solicite-sua-escritura"
                    className="block text-sm bg-brand-gold text-gray-900 px-3 py-2 rounded font-medium"
                  >
                    Solicite sua Escritura
                  </a>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
