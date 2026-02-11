import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface Service {
  id: number;
  name: string;
  description: string;
}

export default function ServicosPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const { data: servicesData } = useQuery<{ services: Service[] }>({
    queryKey: ["/api/services"],
  });

  const activeServices = servicesData?.services || [];

  // Função para mapear ícone baseado no nome do serviço
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('escritura')) return 'mdi:file-document-edit';
    if (name.includes('reconhecimento')) return 'mdi:signature';
    if (name.includes('autenticação')) return 'mdi:certificate';
    if (name.includes('procuração')) return 'mdi:file-certificate';
    if (name.includes('protesto')) return 'mdi:file-alert';
    if (name.includes('registro')) return 'mdi:file-check';
    if (name.includes('certidão')) return 'mdi:file-document';
    return 'mdi:file-document-outline';
  };

  const onlineServices = [
    { title: "Certidão de Escritura", link: "/certidao-de-escritura", icon: "mdi:file-document" },
    { title: "Certidão de Protesto", link: "/certidao-de-protesto", icon: "mdi:file-alert" },
    { title: "Certidão de Procuração", link: "/certidao-de-procuracao", icon: "mdi:file-certificate" },
    { title: "Certidão de Substabelecimento", link: "/certidao-de-substabelecimento", icon: "mdi:file-multiple" },
    { title: "Confirmação de Procuração", link: "/confirmacao-de-procuracao", icon: "mdi:file-check" },
    { title: "Solicite Escritura", link: "/solicite-sua-escritura", icon: "mdi:file-edit" }
  ];

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
                {onlineServices.map((service, index) => (
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
                Nossos Serviços
              </h1>
              <div className="w-16 h-1 bg-brand-gold"></div>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                Conheça todos os serviços oferecidos pelo nosso cartório. Estamos prontos para atender você com excelência e profissionalismo.
              </p>
            </div>

            {activeServices.length === 0 ? (
              <div className="bg-gray-100 p-12 text-center rounded-lg">
                <p className="text-gray-600 text-lg">Nenhum serviço disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white border-2 border-gray-200 p-6 rounded-lg hover:border-brand-blue hover:shadow-lg transition-all group cursor-pointer"
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span
                          className="iconify text-brand-blue group-hover:text-brand-gold group-hover:scale-110 transition-all"
                          data-icon={getServiceIcon(service.name)}
                          data-width="48"
                        ></span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-brand-blue mb-2 group-hover:text-brand-gold transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {service.description}
                        </p>
                        <div className="mt-4 flex items-center text-brand-blue group-hover:text-brand-gold transition-colors">
                          <span className="text-sm font-semibold">Ver detalhes</span>
                          <span
                            className="iconify ml-2 group-hover:translate-x-1 transition-transform"
                            data-icon="mdi:arrow-right"
                            data-width="20"
                          ></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <span
                    className="iconify text-brand-blue flex-shrink-0"
                    data-icon={getServiceIcon(selectedService.name)}
                    data-width="48"
                  ></span>
                  <h2 className="font-serif text-3xl text-brand-blue font-bold">
                    {selectedService.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="iconify" data-icon="mdi:close" data-width="24"></span>
                </button>
              </div>
              <div className="w-16 h-1 bg-brand-gold mb-6"></div>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>{selectedService.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
