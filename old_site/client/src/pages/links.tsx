import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface Link {
  id: number;
  name: string;
  url: string;
  order: number;
  active: boolean;
}

export default function LinksPage() {
  const { data: linksData } = useQuery<{ links: Link[] }>({
    queryKey: ["/api/links"],
  });

  const activeLinks = linksData?.links?.filter(link => link.active) || [];

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
                Links Úteis
              </h1>
              <div className="w-16 h-1 bg-brand-gold"></div>
            </div>

            {activeLinks.length === 0 ? (
              <div className="bg-gray-100 p-12 text-center rounded-lg">
                <p className="text-gray-600 text-lg">Nenhum link disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border-2 border-gray-200 p-6 rounded-lg hover:border-brand-blue hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <span
                          className="iconify text-brand-blue group-hover:text-brand-gold group-hover:scale-110 transition-all"
                          data-icon="mdi:link-variant"
                          data-width="40"
                        ></span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-brand-blue mb-1 group-hover:text-brand-gold transition-colors">
                          {link.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{link.url}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className="iconify text-gray-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all"
                          data-icon="mdi:arrow-right"
                          data-width="24"
                        ></span>
                      </div>
                    </div>
                  </a>
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
