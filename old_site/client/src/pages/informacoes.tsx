import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface Informacao {
  id: number;
  nome: string;
  descricao: string | null;
  conteudo: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function InformacoesPage() {
  const [openId, setOpenId] = useState<number | null>(null);

  const { data: informacoesData } = useQuery<{ informacoes: Informacao[] }>({
    queryKey: ["/api/informacoes"],
  });

  const informacoes = informacoesData?.informacoes || [];

  const services = [
    { title: "Certidão de Escritura", link: "/certidao-de-escritura", icon: "mdi:file-document" },
    { title: "Certidão de Protesto", link: "/certidao-de-protesto", icon: "mdi:file-alert" },
    { title: "Certidão de Procuração", link: "/certidao-de-procuracao", icon: "mdi:file-certificate" },
    { title: "Certidão de Substabelecimento", link: "/certidao-de-substabelecimento", icon: "mdi:file-multiple" },
    { title: "Confirmação de Procuração", link: "/confirmacao-de-procuracao", icon: "mdi:file-check" },
    { title: "Solicite Escritura", link: "/solicite-sua-escritura", icon: "mdi:file-edit" }
  ];

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="bg-white font-sans text-gray-800">
      <Header />

      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <div className="bg-brand-blue text-white p-6 rounded-lg sticky top-24">
              <h3 className="font-serif text-2xl font-bold mb-6">Serviços Online</h3>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a
                      href={service.link}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-white/10 transition-colors group"
                    >
                      <span
                        className="iconify text-brand-gold group-hover:scale-110 transition-transform"
                        data-icon={service.icon}
                        data-width="24"
                      ></span>
                      <span className="text-sm">{service.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <div className="mb-8">
              <h1 className="font-serif text-4xl text-brand-blue font-bold mb-4">
                Informações
              </h1>
              <div className="w-16 h-1 bg-brand-gold"></div>
            </div>

            {informacoes.length === 0 ? (
              <div className="bg-gray-100 p-12 text-center rounded-lg">
                <p className="text-gray-600 text-lg">Nenhuma informação disponível no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {informacoes.map((info) => (
                  <div
                    key={info.id}
                    className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-brand-blue transition-colors"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleAccordion(info.id)}
                      className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-brand-blue mb-1">
                          {info.nome}
                        </h3>
                        {info.descricao && (
                          <p className="text-sm text-gray-600">{info.descricao}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <span
                          className={`iconify text-brand-blue transition-transform ${
                            openId === info.id ? "rotate-180" : ""
                          }`}
                          data-icon="mdi:chevron-down"
                          data-width="32"
                        ></span>
                      </div>
                    </button>

                    {/* Accordion Content */}
                    {openId === info.id && (
                      <div className="border-t border-gray-200 p-6 bg-gray-50">
                        {info.conteudo ? (
                          <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: info.conteudo }}
                          />
                        ) : (
                          <p className="text-gray-500 italic">Sem conteúdo disponível.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
