import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function CertidaoSubstabelecimento() {
  const [formData, setFormData] = useState({
    tipoPessoa: "Pessoa Física",
    cpf: "",
    nomeCompleto: "",
    email: "",
    telefone: "",
    telefone2: "",
    endereco: "",
    bairro: "",
    numero: "",
    cidade: "",
    estado: "",
    cep: "",
    tipoCertidao: "Pessoa Física",
    livro: "",
    folha: "",
    protocolo: "",
    data: "",
    informacoes: "",
    tipoEntrega: "Internet",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tipoSolicitacao: "certidao-de-substabelecimento",
          nomeSolicitacao: "Certidão de Substabelecimento",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        // Limpar formulário
        setFormData({
          tipoPessoa: "Pessoa Física",
          cpf: "",
          nomeCompleto: "",
          email: "",
          telefone: "",
          telefone2: "",
          endereco: "",
          bairro: "",
          numero: "",
          cidade: "",
          estado: "",
          cep: "",
          tipoCertidao: "Pessoa Física",
          livro: "",
          folha: "",
          protocolo: "",
          data: "",
          informacoes: "",
          tipoEntrega: "Internet",
        });
      } else {
        setErrorMessage(data.message || "Erro ao enviar solicitação");
      }
    } catch (error) {
      setErrorMessage("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white font-sans text-gray-800">
      <Header />

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* INSIRA OS SEUS DADOS */}
              <div>
                <h2 className="text-2xl font-serif text-gray-700 mb-6">
                  INSIRA OS SEUS DADOS:
                </h2>

                <div className="space-y-4">
                  {/* Tipo de Pessoa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TIPO DE PESSOA *
                    </label>
                    <select
                      name="tipoPessoa"
                      value={formData.tipoPessoa}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    >
                      <option>Pessoa Física</option>
                      <option>Pessoa Jurídica</option>
                    </select>
                  </div>

                  {/* CPF/CNPJ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.tipoPessoa === "Pessoa Física" ? "CPF" : "CNPJ"} *
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder={
                        formData.tipoPessoa === "Pessoa Física"
                          ? "000.000.000-00"
                          : "00.000.000/0000-00"
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>

                  {/* Nome Completo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NOME COMPLETO *
                    </label>
                    <input
                      type="text"
                      name="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={handleChange}
                      placeholder="Nome Completo"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>

                  {/* E-Mail */}
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
                        placeholder="Inserir o E-Mail"
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Confirmar E-Mail"
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        required
                      />
                    </div>
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TELEFONE *
                    </label>
                    <input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>

                  {/* Telefone 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TELEFONE
                    </label>
                    <input
                      type="tel"
                      name="telefone2"
                      value={formData.telefone2}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  {/* Endereço */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ENDEREÇO *
                    </label>
                    <input
                      type="text"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      placeholder="Rua Exemplo"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>

                  {/* Bairro, Número */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        BAIRRO
                      </label>
                      <input
                        type="text"
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NÚMERO
                      </label>
                      <input
                        type="text"
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  {/* Cidade, Estado */}
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
                      <input
                        type="text"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  {/* CEP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                </div>
              </div>

              {/* INSIRA OS DADOS DO ATO QUE VOCÊ DESEJA CERTIDÃO */}
              <div>
                <h2 className="text-2xl font-serif text-gray-700 mb-6">
                  INSIRA OS DADOS DO ATO QUE VOCÊ DESEJA CERTIDÃO
                </h2>

                <div className="space-y-4">
                  {/* Tipo de Certidão */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TIPO DE CERTIDÃO *
                    </label>
                    <select
                      name="tipoCertidao"
                      value={formData.tipoCertidao}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    >
                      <option>Pessoa Física</option>
                      <option>Pessoa Jurídica</option>
                    </select>
                  </div>

                  {/* Livro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LIVRO
                    </label>
                    <input
                      type="text"
                      name="livro"
                      value={formData.livro}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  {/* Folha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FOLHA
                    </label>
                    <input
                      type="text"
                      name="folha"
                      value={formData.folha}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  {/* Protocolo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PROTOCOLO
                    </label>
                    <input
                      type="text"
                      name="protocolo"
                      value={formData.protocolo}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  {/* Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DATA
                    </label>
                    <input
                      type="date"
                      name="data"
                      value={formData.data}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  {/* Informações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      INFORMAÇÕES
                    </label>
                    <textarea
                      name="informacoes"
                      value={formData.informacoes}
                      onChange={handleChange}
                      rows={6}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                    ></textarea>
                  </div>

                  {/* Tipo de Entrega */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      TIPO DE ENTREGA *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tipoEntrega"
                          value="Internet"
                          checked={formData.tipoEntrega === "Internet"}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-sm">INTERNET</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tipoEntrega"
                          value="Sedex"
                          checked={formData.tipoEntrega === "Sedex"}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-sm">SEDEX</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tipoEntrega"
                          value="Retirada Balcão"
                          checked={formData.tipoEntrega === "Retirada Balcão"}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-sm">RETIRADA NO BALCÃO</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensagens de Sucesso e Erro */}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>

              {/* Atenção */}
              <div className="mt-6 text-xs text-gray-600">
                <p className="font-bold mb-1">ATENÇÃO:</p>
                <p>
                  A presente solicitação é apenas uma solicitação de certidão e
                  não garante sua emissão. Após análise, a certidão será
                  enviada ao email cadastrado.{" "}
                  <a
                    href="/politica-de-privacidade"
                    className="text-brand-blue underline"
                  >
                    Políticas de Privacidade/Cadastro aqui
                  </a>
                </p>
              </div>
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
                  className="block text-sm bg-brand-gold text-gray-900 px-3 py-2 rounded font-medium"
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
              </nav>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
