import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ConsultaProcessoModal } from "./ConsultaProcessoModal";

export default function ConsultaProcessoSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Padrão decorativo de fundo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue rounded-full"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-blue rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            {/* Título destacado */}
            <h2 className="text-3xl md:text-4xl font-bold text-brand-blue mb-3">
              Consulta Online de Processos
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Acompanhe o andamento do seu processo de forma rápida e prática
            </p>

            {/* Container do botão com efeito de brilho */}
            <div className="inline-block relative">
              {/* Efeito de pulso atrás do botão */}
              <div className="absolute inset-0 bg-brand-blue rounded-full animate-ping opacity-10"></div>

              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="relative bg-brand-blue hover:bg-blue-700 text-white font-bold px-10 py-7 text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-blue/20"
              >
                <Search className="mr-3 h-6 w-6" />
                Consulte seu Processo Aqui
              </Button>
            </div>

            {/* Informações adicionais */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">100% Online</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Consulta Imediata</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Seguro e Confiável</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ConsultaProcessoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}