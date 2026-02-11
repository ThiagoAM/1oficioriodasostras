import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Contacts } from "@shared/schema";

interface SiteSettings {
  mainLogo?: string;
  browserTabName?: string;
}

interface SocialMedia {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: contactsData } = useQuery<{ contacts: Contacts }>({
    queryKey: ["/api/contacts"],
  });

  const { data: settingsData } = useQuery<{ settings: SiteSettings }>({
    queryKey: ["/api/site-settings"],
  });

  const { data: socialMediaData } = useQuery<{ socialMedia: SocialMedia }>({
    queryKey: ["/api/social-media"],
  });

  const contacts = contactsData?.contacts;
  const mainLogo = settingsData?.settings?.mainLogo;
  const siteName = settingsData?.settings?.browserTabName || "Tabelionato";
  const socialMedia = socialMediaData?.socialMedia;

  return (
    <header className="bg-white shadow-md max-lg:sticky max-lg:top-0 max-lg:z-40">
      {/* Top bar */}
      <div className="bg-brand-blue text-white max-lg:text-xs max-lg:py-1 py-2">
        <div className="container mx-auto max-lg:px-4 px-6">
          <div className="flex items-center justify-between flex-wrap text-sm max-lg:text-xs">
            <div className="flex items-center max-lg:justify-start justify-center max-lg:space-x-4 space-x-6 flex-wrap flex-1">
              {contacts?.address && (
                <div className="flex items-center max-lg:space-x-1 space-x-2">
                  <span className="iconify" data-icon="mdi:map-marker" data-width="16"></span>
                  <span className="max-lg:block">{contacts.address}</span>
                </div>
              )}
              {contacts?.phone && (
                <a
                  href={`https://wa.me/55${contacts.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-brand-gold transition-colors max-lg:hidden"
                >
                  <span className="iconify" data-icon="mdi:whatsapp" data-width="16"></span>
                  <span>{contacts.phone}</span>
                </a>
              )}
              {contacts?.businessHours && (
                <div className="max-lg:hidden flex items-center space-x-2">
                  <span className="iconify" data-icon="mdi:clock-outline" data-width="16"></span>
                  <span>{contacts.businessHours}</span>
                </div>
              )}
            </div>
            <div className="flex max-lg:gap-2 gap-3">
              {socialMedia?.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                  aria-label="Instagram"
                >
                  <span className="iconify max-lg:text-base" data-icon="mdi:instagram" data-width="20"></span>
                </a>
              )}
              {socialMedia?.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                  aria-label="Facebook"
                >
                  <span className="iconify max-lg:text-base" data-icon="mdi:facebook" data-width="20"></span>
                </a>
              )}
              {socialMedia?.tiktok && (
                <a
                  href={socialMedia.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                  aria-label="TikTok"
                >
                  <span className="iconify max-lg:text-base" data-icon="mdi:tiktok" data-width="20"></span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="container mx-auto max-lg:px-1 px-6 py-4 max-lg:flex max-lg:justify-between max-lg:items-center">
        <div className="flex justify-between items-center lg:hidden max-lg:w-full">
          <a href="/" className="flex items-center justify-center flex-1" data-testid="link-logo">
            {mainLogo ? (
              <img
                src={mainLogo}
                alt={siteName}
                className="object-contain lg:hidden mx-auto"
                style={{ height: '120px', width: 'auto' }}
              />
            ) : (
              <div className="max-lg:block max-lg:text-center hidden">
                <h1 className="font-serif text-lg font-bold text-brand-blue leading-tight">{siteName}</h1>
                <p className="text-xs text-gray-500 tracking-widest">NOTAS | PROTESTO | RCPN</p>
                <p className="text-xs text-gray-500">Rio das Ostras/RJ</p>
              </div>
            )}
          </a>
          <button
            className="text-brand-blue lg:hidden max-lg:focus:outline-none max-lg:mr-2 absolute right-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <span className="iconify max-lg:text-3xl" data-icon="mdi:menu" data-width="30"></span>
          </button>
        </div>

        <div className="hidden lg:flex flex-col items-center w-full">
          <a href="/" className="flex items-center justify-center mb-4 w-full" data-testid="link-logo">
            {mainLogo ? (
              <img
                src={mainLogo}
                alt={siteName}
                style={{ height: '150px', width: 'auto' }}
                className="object-contain mx-auto"
              />
            ) : (
              <span className="font-serif text-3xl font-bold text-brand-blue mx-auto">{siteName}</span>
            )}
          </a>

          <nav className="hidden lg:flex items-center justify-center space-x-8 max-lg:text-sm max-lg:font-bold max-lg:text-gray-600 w-full" style={{ lineHeight: '60px' }}>
            <a href="/" className="nav-link text-brand-blue uppercase max-lg:hover:text-brand-blue" data-testid="link-home">Home</a>
            <a href="/servicos" className="nav-link text-brand-blue uppercase max-lg:hover:text-brand-blue" data-testid="link-servicos">Serviços</a>
            <a href="/servicos-online" className="nav-link text-brand-blue uppercase max-lg:hover:text-brand-blue" data-testid="link-services-online">Serviços Online</a>
            <a href="/informacoes" className="nav-link text-brand-blue uppercase max-lg:hover:text-brand-blue" data-testid="link-informacoes">Informações</a>
            <a href="/links" className="nav-link text-brand-blue uppercase max-lg:hover:text-brand-blue" data-testid="link-links">Links</a>
            <a href="/contato" className="nav-link text-brand-blue uppercase max-lg:hover:text-brand-blue" data-testid="link-contact">Contato</a>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <nav className="container mx-auto px-6 max-lg:py-0 py-4">
            <a href="/" className="block max-lg:text-center max-lg:py-2 max-lg:px-4 max-lg:text-sm max-lg:text-gray-700 max-lg:hover:bg-gray-100 nav-link text-brand-blue uppercase" data-testid="mobile-link-home">Home</a>
            <a href="/servicos" className="block max-lg:text-center max-lg:py-2 max-lg:px-4 max-lg:text-sm max-lg:text-gray-700 max-lg:hover:bg-gray-100 nav-link text-brand-blue uppercase" data-testid="mobile-link-servicos">Serviços</a>
            <a href="/servicos-online" className="block max-lg:text-center max-lg:py-2 max-lg:px-4 max-lg:text-sm max-lg:text-gray-700 max-lg:hover:bg-gray-100 nav-link text-brand-blue uppercase" data-testid="mobile-link-services-online">Serviços Online</a>
            <a href="/informacoes" className="block max-lg:text-center max-lg:py-2 max-lg:px-4 max-lg:text-sm max-lg:text-gray-700 max-lg:hover:bg-gray-100 nav-link text-brand-blue uppercase" data-testid="mobile-link-informacoes">Informações</a>
            <a href="/links" className="block max-lg:text-center max-lg:py-2 max-lg:px-4 max-lg:text-sm max-lg:text-gray-700 max-lg:hover:bg-gray-100 nav-link text-brand-blue uppercase" data-testid="mobile-link-links">Links</a>
            <a href="/contato" className="block max-lg:text-center max-lg:py-2 max-lg:px-4 max-lg:text-sm max-lg:text-gray-700 max-lg:hover:bg-gray-100 nav-link text-brand-blue uppercase" data-testid="mobile-link-contact">Contato</a>
          </nav>
        </div>
      )}
    </header>
  );
}
