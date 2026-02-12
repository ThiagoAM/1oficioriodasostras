import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Banner } from "@shared/schema";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: bannersData } = useQuery<{ banners: Banner[] }>({
    queryKey: ["/api/banners"],
  });

  const activeBanners = bannersData?.banners?.filter(b => b.active) || [];

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (!activeBanners.length) {
    return (
      <section className="relative max-lg:h-96 h-[520px] overflow-hidden bg-cover bg-center hero-bg" id="home">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-6 h-full flex flex-col items-start justify-center text-white">
          <p
            className="text-sm md:text-base uppercase tracking-[0.25em] text-brand-gold mb-3"
            data-testid="text-hero-subtitle"
          >
            Cartório do 1º Ofício de Justiça
          </p>
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl"
            data-testid="text-hero-title"
          >
            Notas, Protesto e Registro Civil em Rio das Ostras
          </h1>
          <p className="mt-6 max-w-2xl text-sm md:text-lg text-gray-100/90">
            Serviços notariais e de registro com agilidade, segurança jurídica e atendimento humanizado
            à comunidade de Rio das Ostras e região.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/servicos-online"
              className="inline-flex items-center justify-center rounded-full bg-brand-gold px-8 py-3 text-sm md:text-base font-semibold text-gray-900 shadow-lg shadow-black/20 hover:bg-brand-gold/90 transition-colors"
              data-testid="button-servicos-online"
            >
              Acessar serviços online
            </a>
            <a
              href="#location"
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-8 py-3 text-sm md:text-base font-semibold text-white hover:bg-white/10 transition-colors"
              data-testid="button-localizacao"
            >
              Ver localização
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative max-lg:h-80 h-[800px] overflow-hidden bg-cover bg-center" id="home">
      {activeBanners.map((banner, index) => (
        <div
          key={banner.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: currentSlide === index ? 1 : 0,
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${banner.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
          }}
        >
          {banner.link && (
            <a
              href={banner.link}
              className="absolute inset-0"
              aria-label={banner.title}
            />
          )}
        </div>
      ))}

      <div className="absolute inset-0 max-lg:bg-black max-lg:bg-opacity-30"></div>

      {/* Indicadores */}
      {activeBanners.length > 1 && (
        <div className="absolute max-lg:bottom-4 bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index ? 'bg-white max-lg:w-3 w-8' : 'bg-white/50'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
