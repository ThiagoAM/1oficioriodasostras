import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Service } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const serviceIcons = [
  "mdi:file-document-edit",
  "mdi:gavel",
  "mdi:home-city",
  "mdi:briefcase",
  "mdi:account-multiple",
  "mdi:certificate",
  "mdi:file-sign",
  "mdi:file-check",
  "mdi:shield-account",
  "mdi:handshake",
  "mdi:scale-balance",
  "mdi:bank",
];

const getServiceIcon = (index: number) => {
  return serviceIcons[index % serviceIcons.length];
};

export default function PracticeAreas() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const itemsPerPage = 6;

  const { data: servicesData } = useQuery<{ services: Service[] }>({
    queryKey: ["/api/services"],
  });

  const services = servicesData?.services || [];
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentServices = services.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="max-lg:py-16 py-24 max-lg:bg-white bg-brand-light-gray" id="servicos">
      <div className="container mx-auto px-6 max-lg:text-center">
        <p className="max-lg:text-sm max-lg:text-gray-500 max-lg:mb-2 text-brand-blue font-semibold" data-testid="text-practice-areas-subtitle">Serviços</p>
        <h2 className="font-serif max-lg:text-3xl text-4xl max-lg:font-bold text-brand-blue font-bold max-lg:mb-12 mb-16" data-testid="text-practice-areas-title">
          Nossos Serviços
        </h2>

        <div className="relative">
          {services.length > itemsPerPage && (
            <>
              <button
                onClick={prevPage}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-brand-blue text-white p-3 rounded-full hover:bg-opacity-90 transition-colors z-10 shadow-lg max-lg:hidden"
                aria-label="Página anterior"
              >
                <span className="iconify" data-icon="mdi:chevron-left" data-width="24"></span>
              </button>

              <button
                onClick={nextPage}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-brand-blue text-white p-3 rounded-full hover:bg-opacity-90 transition-colors z-10 shadow-lg max-lg:hidden"
                aria-label="Próxima página"
              >
                <span className="iconify" data-icon="mdi:chevron-right" data-width="24"></span>
              </button>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentServices.map((service, index) => {
              const globalIndex = startIndex + index;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="bg-white p-8 max-lg:rounded-lg max-lg:shadow-md max-lg:text-left hover:shadow-xl transition-all group cursor-pointer"
                  data-testid={`service-${service.id}`}
                >
                  <span className="iconify max-lg:text-4xl text-brand-blue max-lg:mb-4 group-hover:scale-110 transition-transform inline-block" data-icon={getServiceIcon(globalIndex)} data-width="60"></span>
                  <h3 className="font-serif max-lg:font-bold max-lg:text-lg text-2xl text-brand-blue font-bold max-lg:mb-2 mt-6 mb-4">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-gray-600 max-lg:text-sm mb-4 line-clamp-3">
                      {service.description}
                    </p>
                  )}
                  <span className="max-lg:text-sm text-brand-blue font-semibold max-lg:font-bold hover:underline inline-flex items-center">
                    Ver mais
                    <span className="iconify ml-1 max-lg:inline-block" data-icon="mdi:arrow-right" data-width="20"></span>
                  </span>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentPage === i ? 'bg-brand-blue w-8' : 'bg-brand-blue/30'
                  }`}
                  aria-label={`Ir para página ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedService && (
        <Dialog open={true} onOpenChange={(open) => !open && setSelectedService(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl text-brand-blue flex items-center gap-4">
                <span className="iconify text-brand-blue" data-icon={getServiceIcon(services.indexOf(selectedService))} data-width="48"></span>
                {selectedService.name}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
              {selectedService.description}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
