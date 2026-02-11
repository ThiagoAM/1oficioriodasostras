import Header from "@/components/header";
import Footer from "@/components/footer";

export default function ServicosOnlinePage() {
  const services = [
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
                Serviços Online
              </h1>
              <div className="w-16 h-1 bg-brand-gold"></div>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                Bem-vindo aos nossos serviços online! Aqui você pode solicitar certidões e documentos de forma rápida e prática, sem sair de casa.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <a
                  key={index}
                  href={service.link}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-brand-blue hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <span
                        className="iconify text-brand-gold group-hover:text-brand-blue transition-colors"
                        data-icon={service.icon}
                        data-width="48"
                      ></span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-brand-blue mb-2 group-hover:text-brand-gold transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {getServiceDescription(service.title)}
                      </p>
                      <div className="mt-4 flex items-center text-brand-blue group-hover:text-brand-gold transition-colors">
                        <span className="text-sm font-semibold">Acessar serviço</span>
                        <span className="iconify ml-2" data-icon="mdi:arrow-right" data-width="20"></span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-12 bg-blue-50 border-l-4 border-brand-blue p-6 rounded-r-lg">
              <div className="flex items-start gap-4">
                <span className="iconify text-brand-blue flex-shrink-0 mt-1" data-icon="mdi:information" data-width="24"></span>
                <div>
                  <h4 className="font-bold text-brand-blue mb-2">Importante</h4>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>• Todos os serviços estão disponíveis 24 horas por dia, 7 dias por semana</li>
                    <li>• As solicitações serão processadas em horário comercial</li>
                    <li>• Você receberá confirmação por e-mail após o envio</li>
                    <li>• Em caso de dúvidas, entre em contato conosco</li>
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Helper function to get service descriptions
function getServiceDescription(title: string): string {
  const descriptions: { [key: string]: string } = {
    "Certidão de Escritura": "Solicite certidões de escrituras públicas lavradas neste cartório de forma online.",
    "Certidão de Protesto": "Obtenha certidões de protestos realizados neste tabelionato.",
    "Certidão de Procuração": "Solicite certidões de procurações públicas registradas em nosso cartório.",
    "Certidão de Substabelecimento": "Certidões de substabelecimento de procurações disponíveis online.",
    "Confirmação de Procuração": "Confirme a autenticidade e validade de procurações públicas.",
    "Solicite Escritura": "Faça a solicitação prévia de escrituras públicas de forma online."
  };
  return descriptions[title] || "Acesse este serviço online para mais informações.";
}
