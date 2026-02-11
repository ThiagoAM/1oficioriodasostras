import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewImage {
  id: number;
  imageUrl: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: reviewImagesData } = useQuery<{ reviewImages: ReviewImage[] }>({
    queryKey: ["/api/review-images"],
  });

  // Filtrar apenas imagens ativas
  const activeImages = reviewImagesData?.reviewImages?.filter(img => img.active) || [];

  // Auto-slide a cada 5 segundos
  useEffect(() => {
    if (activeImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Se estiver mostrando 3 imagens por vez, avançar de 3 em 3
        const nextIndex = prevIndex + 3;
        return nextIndex >= activeImages.length ? 0 : nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeImages.length]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 3;
      return newIndex < 0 ? Math.max(0, activeImages.length - 3) : newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 3;
      return newIndex >= activeImages.length ? 0 : newIndex;
    });
  };

  // Pegar 3 imagens a partir do índice atual
  const getVisibleImages = () => {
    if (activeImages.length === 0) return [];

    const visibleImages = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % activeImages.length;
      if (activeImages[index]) {
        visibleImages.push(activeImages[index]);
      }
    }
    return visibleImages;
  };

  const visibleImages = getVisibleImages();

  // Se não houver imagens, não mostrar nada ou mostrar mensagem
  if (activeImages.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-brand-light-gray">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-sm lg:text-base text-brand-blue font-semibold mb-2" data-testid="text-testimonials-subtitle">
            Avaliações
          </p>
          <div className="w-16 h-0.5 bg-brand-blue my-4 mx-auto hidden lg:block"></div>
          <h2 className="font-serif text-3xl lg:text-4xl text-brand-blue font-bold" data-testid="text-testimonials-title">
            O que nossos clientes dizem
          </h2>
        </div>

        {/* Carrossel */}
        <div className="relative">
          {/* Botões de navegação */}
          {activeImages.length > 3 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:bg-brand-blue hover:text-white transition-all duration-300"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:bg-brand-blue hover:text-white transition-all duration-300"
                aria-label="Próximo"
              >
                <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>
            </>
          )}

          {/* Grid de imagens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {visibleImages.map((image, index) => (
              <div
                key={`${image.id}-${index}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-xl"
              >
                <div className="aspect-[16/9] relative max-h-64">
                  <img
                    src={image.imageUrl}
                    alt={`Avaliação ${index + 1}`}
                    className="w-full h-full object-contain bg-gray-50"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Indicadores de paginação */}
          {activeImages.length > 3 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(activeImages.length / 3) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i * 3)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / 3) === i
                      ? "w-8 bg-brand-blue"
                      : "w-2 bg-gray-300 hover:bg-brand-blue/50"
                  }`}
                  aria-label={`Ir para página ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
