export default function Statistics() {
  const services = [
    { title: "Certidão de Escritura", link: "/certidao-de-escritura", icon: "mdi:file-document" },
    { title: "Certidão de Protesto", link: "/certidao-de-protesto", icon: "mdi:file-alert" },
    { title: "Certidão de Procuração", link: "/certidao-de-procuracao", icon: "mdi:file-certificate" },
    { title: "Certidão de Substabelecimento", link: "/certidao-de-substabelecimento", icon: "mdi:file-multiple" },
    { title: "Confirmação de Procuração", link: "/confirmacao-de-procuracao", icon: "mdi:file-check" },
    { title: "Solicite Escritura", link: "/solicite-sua-escritura", icon: "mdi:file-edit" }
  ];

  return (
    <section className="max-lg:py-16 py-24 bg-brand-blue text-white" id="services-online">
      <div className="container mx-auto max-lg:px-4 px-6">
        <div className="text-center max-lg:mb-8 mb-12">
          <h2 className="font-serif max-lg:text-2xl text-4xl font-bold text-white max-lg:mb-6" data-testid="text-services-online-title">
            Serviços Online
          </h2>
          <div className="w-16 h-0.5 bg-brand-gold max-lg:my-2 my-4 mx-auto max-lg:hidden"></div>
        </div>

        <div className="grid max-lg:grid-cols-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-lg:gap-4 gap-6">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.link}
              className="bg-white text-brand-blue max-lg:p-4 p-6 max-lg:rounded-md rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
              data-testid={`service-card-${index}`}
            >
              <div className="flex flex-col items-center text-center">
                <span
                  className="iconify text-brand-gold max-lg:mb-2 mb-4 group-hover:text-brand-blue transition-colors"
                  data-icon={service.icon}
                  data-width="48"
                ></span>
                <h3 className="font-bold max-lg:text-sm text-lg group-hover:text-brand-gold transition-colors">
                  {service.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
