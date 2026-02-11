import { useQuery } from "@tanstack/react-query";

interface Link {
  id: number;
  name: string;
  url: string;
  order: number;
  active: boolean;
}

export default function LinksSection() {
  const { data: linksData } = useQuery<{ links: Link[] }>({
    queryKey: ["/api/links"],
  });

  const activeLinks = linksData?.links?.filter(link => link.active).slice(0, 6) || [];

  if (activeLinks.length === 0) {
    return null;
  }

  return (
    <section className="max-lg:py-16 py-24 max-lg:bg-white bg-gray-50" id="links">
      <div className="container mx-auto max-lg:px-4 px-6">
        <div className="max-lg:text-center text-center max-lg:mb-8 mb-16">
          <p className="max-lg:text-sm max-lg:text-gray-500 max-lg:mb-2 text-brand-gold font-semibold" data-testid="text-links-subtitle">Links</p>
          <div className="w-16 h-0.5 bg-brand-gold my-4 mx-auto max-lg:hidden"></div>
          <h2 className="font-serif max-lg:text-3xl max-lg:font-bold text-4xl text-brand-blue font-bold" data-testid="text-links-title">
            Links Úteis
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-lg:gap-4 gap-6 max-lg:mb-6 mb-8">
          {activeLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-gray-200 max-lg:p-4 p-6 max-lg:rounded-md rounded-lg hover:border-brand-blue hover:shadow-lg transition-all group"
              data-testid={`link-item-${link.id}`}
            >
              <div className="flex items-center max-lg:gap-3 gap-4">
                <div className="flex-shrink-0">
                  <span
                    className="iconify text-brand-blue group-hover:text-brand-gold group-hover:scale-110 transition-all max-lg:text-2xl"
                    data-icon="mdi:link-variant"
                    data-width="32"
                  ></span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold max-lg:text-base text-lg text-brand-blue group-hover:text-brand-gold transition-colors">
                    {link.name}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className="iconify text-gray-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all"
                    data-icon="mdi:arrow-right"
                    data-width="20"
                  ></span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/links"
            className="inline-flex items-center gap-2 bg-brand-blue text-white max-lg:px-6 max-lg:py-2 max-lg:text-sm px-8 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
          >
            Ver Todos os Links
            <span className="iconify" data-icon="mdi:arrow-right" data-width="20"></span>
          </a>
        </div>
      </div>
    </section>
  );
}
