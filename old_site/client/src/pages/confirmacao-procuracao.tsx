import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function ConfirmacaoProcuracao() {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cargo: "",
    serventia: "",
    email: "",
    telefone: "",
    nomeSolicitante: "",
    rgSolicitante: "",
    cpfSolicitante: "",
    protocolo: "",
    dataAto: "",
    livro: "",
    folha: "",
    partes: "",
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
          tipoSolicitacao: "confirmacao-de-procuracao",
          nomeSolicitacao: "Confirmação de Procuração",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        // Limpar formulário
        setFormData({
          nomeCompleto: "",
          cargo: "",
          serventia: "",
          email: "",
          telefone: "",
          nomeSolicitante: "",
          rgSolicitante: "",
          cpfSolicitante: "",
          protocolo: "",
          dataAto: "",
          livro: "",
          folha: "",
          partes: "",
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
            <h1 className="text-3xl font-serif text-gray-700 mb-8">
              Confirmação de Procuração
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* INSIRA OS DADOS DE SUA SERVENTIA */}
              <div>
                <h2 className="text-2xl font-serif text-gray-700 mb-6">
                  INSIRA OS DADOS DE SUA SERVENTIA:
                </h2>

                <div className="space-y-4">
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
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>

                  {/* Cargo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CARGO
                    </label>
                    <input
                      type="text"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  {/* Serventia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SERVENTIA *
                    </label>
                    <input
                      type="text"
                      name="serventia"
                      value={formData.serventia}
                      onChange={handleChange}
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
                      <div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="DIGITE O E-MAIL"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="CONFIRMAR E-MAIL"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Telefone */}
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

                  {/* Nome do Solicitante */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NOME DO SOLICITANTE *
                    </label>
                    <input
                      type="text"
                      name="nomeSolicitante"
                      value={formData.nomeSolicitante}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>

                  {/* RG do Solicitante */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RG DO SOLICITANTE
                    </label>
                    <input
                      type="text"
                      name="rgSolicitante"
                      value={formData.rgSolicitante}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  {/* CPF do Solicitante */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF DO SOLICITANTE *
                    </label>
                    <input
                      type="text"
                      name="cpfSolicitante"
                      value={formData.cpfSolicitante}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
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

                  {/* Data do Ato */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DATA DO ATO *
                    </label>
                    <input
                      type="date"
                      name="dataAto"
                      value={formData.dataAto}
                      onChange={handleChange}
                      placeholder="dd/mm/aaaa"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>

                  {/* Livro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LIVRO *
                    </label>
                    <input
                      type="text"
                      name="livro"
                      value={formData.livro}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>

                  {/* Folha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FOLHA *
                    </label>
                    <input
                      type="text"
                      name="folha"
                      value={formData.folha}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
                  </div>

                  {/* Partes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PARTES *
                    </label>
                    <input
                      type="text"
                      name="partes"
                      value={formData.partes}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      required
                    />
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
                    className="block text-sm bg-brand-gold text-gray-900 px-3 py-2 rounded font-medium"
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
