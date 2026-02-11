import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryItem {
  id: number;
  title: string;
  type: 'image' | 'video';
  mediaUrl: string;
  description?: string;
  active: boolean;
  order: number;
}

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10; // 5 items x 2 rows

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch('/api/gallery', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const items = data.gallery || [];
        const activeItems = items.filter((item: GalleryItem) => item.active);
        setGalleryItems(activeItems.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order));
      }
    } catch (error) {
      console.error('Erro ao carregar galeria:', error);
    }
  };

  const totalPages = Math.ceil(galleryItems.length / itemsPerPage);
  const displayedItems = galleryItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const openModal = (item: GalleryItem) => {
    setSelectedMedia(item);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (galleryItems.length === 0) {
    return null;
  }

  return (
    <>
      <section className="max-lg:py-16 py-24 max-lg:bg-white bg-gray-50" id="gallery">
        <div className="container mx-auto max-lg:px-4 px-6">
          <div className="max-lg:text-center text-center max-lg:mb-8 mb-16">
            <p className="max-lg:text-sm max-lg:text-gray-500 max-lg:mb-2 text-brand-gold font-semibold" data-testid="text-gallery-subtitle">Galeria</p>
            <div className="w-16 h-0.5 bg-brand-gold my-4 mx-auto max-lg:hidden"></div>
            <h2 className="font-serif max-lg:text-3xl max-lg:font-bold text-4xl text-brand-blue font-bold" data-testid="text-gallery-title">
              Nossa Galeria
            </h2>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-5 max-lg:gap-3 gap-4">
              {displayedItems.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square overflow-hidden cursor-pointer group relative max-lg:rounded-md"
                  onClick={() => openModal(item)}
                  data-testid={`gallery-item-${item.id}`}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                      <img
                        src={`https://img.youtube.com/vi/${item.mediaUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)?.[1]}/hqdefault.jpg`}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="max-lg:w-12 max-lg:h-12 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                          <svg className="max-lg:w-6 max-lg:h-6 w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 max-lg:mt-6 mt-8">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`max-lg:p-1.5 p-2 rounded-full max-lg:hidden ${
                    currentPage === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-brand-gold text-white hover:bg-brand-blue transition-colors'
                  }`}
                  data-testid="gallery-prev-button"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        currentPage === i ? 'bg-brand-gold' : 'bg-gray-300 hover:bg-brand-blue'
                      }`}
                      data-testid={`gallery-page-${i}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`max-lg:p-1.5 p-2 rounded-full max-lg:hidden ${
                    currentPage === totalPages - 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-brand-gold text-white hover:bg-brand-blue transition-colors'
                  }`}
                  data-testid="gallery-next-button"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
          data-testid="gallery-modal"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-brand-gold transition-colors"
            data-testid="gallery-modal-close"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-6xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.mediaUrl}
                alt={selectedMedia.title}
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
            ) : (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={getYoutubeEmbedUrl(selectedMedia.mediaUrl)}
                  title={selectedMedia.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
