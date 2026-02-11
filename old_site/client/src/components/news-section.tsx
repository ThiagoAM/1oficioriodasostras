import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NewsSection() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const items = data.news || [];
        const activeItems = items.filter((item: NewsItem) => item.active);
        setNewsItems(activeItems);
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    }
  };

  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  const displayedItems = newsItems.slice(
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

  const openModal = (item: NewsItem) => {
    setSelectedNews(item);
  };

  const closeModal = () => {
    setSelectedNews(null);
  };

  if (newsItems.length === 0) {
    return null;
  }

  return (
    <>
      <section className="max-lg:py-16 py-24 bg-white" id="news">
        <div className="container mx-auto max-lg:px-4 px-6">
          <div className="max-lg:text-center text-center max-lg:mb-8 mb-16">
            <p className="max-lg:text-sm max-lg:text-gray-500 max-lg:mb-2 text-brand-gold font-semibold" data-testid="text-news-subtitle">Notícias</p>
            <div className="w-16 h-0.5 bg-brand-gold my-4 mx-auto max-lg:hidden"></div>
            <h2 className="font-serif max-lg:text-3xl max-lg:font-bold text-4xl text-brand-blue font-bold" data-testid="text-news-title">
              Últimas Notícias
            </h2>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-lg:gap-4 gap-6">
              {displayedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white shadow-lg max-lg:rounded-md rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow"
                  onClick={() => openModal(item)}
                  data-testid={`news-item-${item.id}`}
                >
                  {item.imageUrl && (
                    <div className="max-lg:h-40 h-48 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="max-lg:p-4 p-6">
                    <h3 className="font-bold max-lg:text-lg text-xl text-brand-blue max-lg:mb-2 mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <div
                      className="text-gray-600 max-lg:text-xs text-sm line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </div>
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
                  data-testid="news-prev-button"
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
                      data-testid={`news-page-${i}`}
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
                  data-testid="news-next-button"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
          data-testid="news-modal"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-brand-gold transition-colors z-10"
            data-testid="news-modal-close"
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedNews.imageUrl && (
              <div className="w-full h-64 md:h-96 overflow-hidden">
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8 md:p-12">
              <h2 className="font-serif text-3xl md:text-4xl text-brand-blue font-bold mb-6">
                {selectedNews.title}
              </h2>
              <div className="w-16 h-1 bg-brand-gold mb-8"></div>
              <div
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
