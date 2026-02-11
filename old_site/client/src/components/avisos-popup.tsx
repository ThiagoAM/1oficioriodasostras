import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

interface Aviso {
  id: number;
  texto: string;
  imagemUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AvisosPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: avisosData } = useQuery<{ avisos: Aviso[] }>({
    queryKey: ["/api/avisos"],
  });

  const avisos = avisosData?.avisos || [];

  useEffect(() => {
    // Abre o popup automaticamente se houver avisos
    if (avisos.length > 0) {
      // Verifica se o usuário já viu os avisos hoje
      const lastSeen = localStorage.getItem("avisos-last-seen");
      const today = new Date().toDateString();

      if (lastSeen !== today) {
        setIsOpen(true);
      }
    }
  }, [avisos.length]);

  const handleClose = () => {
    setIsOpen(false);
    // Salva a data que o usuário viu os avisos
    localStorage.setItem("avisos-last-seen", new Date().toDateString());
  };

  const handleNext = () => {
    if (currentIndex < avisos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!isOpen || avisos.length === 0) {
    return null;
  }

  const currentAviso = avisos[currentIndex];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-lg shadow-2xl mx-4 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-yellow-400 p-6 text-gray-900 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-900/20 rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-serif font-bold pr-12">
              Aviso Importante
            </h2>
            {avisos.length > 1 && (
              <p className="text-sm mt-1 text-gray-700">
                {currentIndex + 1} de {avisos.length}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-180px)]">
            {currentAviso.imagemUrl && (
              <div>
                <img
                  src={currentAviso.imagemUrl}
                  alt="Imagem do aviso"
                  className="w-full object-contain"
                />
              </div>
            )}
            {currentAviso.texto && (
              <div className="px-6 pt-4 prose prose-lg max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {currentAviso.texto}
                </p>
              </div>
            )}
            <div className="px-6 py-4 text-sm text-gray-500">
              Publicado em {new Date(currentAviso.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-yellow-400 px-6 py-4 flex justify-between items-center">
            <div className="flex gap-2">
              {avisos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-900 rounded-md hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-900"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === avisos.length - 1}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-900 rounded-md hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-900"
                  >
                    Próximo
                  </button>
                </>
              )}
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors shadow-md"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
