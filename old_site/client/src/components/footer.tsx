import { useQuery } from "@tanstack/react-query";

interface Contacts {
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  businessHours?: string;
}

interface SiteSettings {
  browserTabName?: string;
  footerLogo?: string;
}

interface SocialMedia {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

export default function Footer() {
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
  const siteName = settingsData?.settings?.browserTabName || "Tabelionato";
  const footerLogo = settingsData?.settings?.footerLogo;
  const socialMedia = socialMediaData?.socialMedia;

  return (
    <footer className="text-gray-300" style={{ backgroundColor: '#202841' }}>
      <div className="container mx-auto max-lg:px-4 px-6 max-lg:py-12 py-16">
        <div className="flex flex-col md:flex-row justify-center max-lg:items-center items-start max-lg:gap-6 gap-8 max-w-7xl mx-auto">
          {/* Logo Column */}
          <div className="flex-1 flex flex-col items-center md:items-start" data-testid="footer-logo">
            {footerLogo && (
              <div className="max-lg:mb-3 mb-4">
                <img src={footerLogo} alt={siteName} style={{ height: '200px', width: 'auto' }} className="max-lg:!h-32" />
              </div>
            )}
            <div className="flex max-lg:gap-3 gap-4 max-lg:mt-2 mt-4">
              {socialMedia?.youtube && (
                <a
                  href={socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-brand-gold transition-colors"
                  aria-label="YouTube"
                >
                  <span className="iconify max-lg:text-2xl" data-icon="mdi:youtube" data-width="28"></span>
                </a>
              )}
              {socialMedia?.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-brand-gold transition-colors"
                  aria-label="Instagram"
                >
                  <span className="iconify max-lg:text-2xl" data-icon="mdi:instagram" data-width="28"></span>
                </a>
              )}
              {socialMedia?.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-brand-gold transition-colors"
                  aria-label="Facebook"
                >
                  <span className="iconify max-lg:text-2xl" data-icon="mdi:facebook" data-width="28"></span>
                </a>
              )}
              {socialMedia?.tiktok && (
                <a
                  href={socialMedia.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-brand-gold transition-colors"
                  aria-label="TikTok"
                >
                  <span className="iconify max-lg:text-2xl" data-icon="ic:baseline-tiktok" data-width="28"></span>
                </a>
              )}
            </div>
          </div>

          {/* Serviços */}
          <div className="flex-1 max-lg:text-center" data-testid="footer-quick-links">
            <h3 className="text-white font-bold max-lg:text-base max-lg:mb-4 mb-6" data-testid="text-footer-quick-links-title">Serviços</h3>
            <ul className="max-lg:space-y-2 space-y-3 max-lg:text-xs text-sm">
              <li><a href="/certidao-de-escritura" className="hover:text-brand-gold transition-colors" data-testid="link-footer-certidao-escritura">Certidão de Escritura</a></li>
              <li><a href="/certidao-de-protesto" className="hover:text-brand-gold transition-colors" data-testid="link-footer-certidao-protesto">Certidão de Protesto</a></li>
              <li><a href="/certidao-de-procuracao" className="hover:text-brand-gold transition-colors" data-testid="link-footer-certidao-procuracao">Certidão de Procuração</a></li>
              <li><a href="/certidao-de-substabelecimento" className="hover:text-brand-gold transition-colors" data-testid="link-footer-certidao-substabelecimento">Certidão de Substabelecimento</a></li>
              <li><a href="/confirmacao-de-procuracao" className="hover:text-brand-gold transition-colors" data-testid="link-footer-confirmacao-procuracao">Confirmação de Procuração</a></li>
              <li><a href="/solicite-sua-escritura" className="hover:text-brand-gold transition-colors" data-testid="link-footer-solicite-escritura">Solicite Escritura</a></li>
              <li><a href="/contato" className="hover:text-brand-gold transition-colors" data-testid="link-footer-contato">Contato</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex-1 max-lg:text-center" data-testid="footer-contact">
            <h3 className="text-white font-bold max-lg:text-base max-lg:mb-4 mb-6" data-testid="text-footer-contact-title">Contato</h3>
            <ul className="max-lg:space-y-3 space-y-4 max-lg:text-xs text-sm">
              {contacts?.address && (
                <li className="flex max-lg:justify-center items-start max-lg:space-x-2 space-x-3" data-testid="footer-contact-address">
                  <span className="iconify text-brand-gold mt-1 max-lg:text-base" data-icon="mdi:map-marker" data-width="20"></span>
                  <span className="max-lg:text-left">{contacts.address}</span>
                </li>
              )}
              {contacts?.phone && (
                <li className="flex max-lg:justify-center items-start max-lg:space-x-2 space-x-3" data-testid="footer-contact-phone">
                  <span className="iconify text-brand-gold mt-1 max-lg:text-base" data-icon="mdi:phone" data-width="20"></span>
                  <a
                    href={`https://wa.me/55${contacts.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-gold transition-colors"
                  >
                    {contacts.phone}
                  </a>
                </li>
              )}
              {contacts?.email && (
                <li className="flex max-lg:justify-center items-start max-lg:space-x-2 space-x-3" data-testid="footer-contact-email">
                  <span className="iconify text-brand-gold mt-1 max-lg:text-base" data-icon="mdi:email" data-width="20"></span>
                  <div className="flex flex-col space-y-1">
                    {contacts.email.replace(/[\[\]"]/g, '').split(',').map((email, index) => (
                      <a
                        key={index}
                        href={`mailto:${email.trim()}`}
                        className="hover:text-brand-gold transition-colors"
                      >
                        {email.trim()}
                      </a>
                    ))}
                  </div>
                </li>
              )}
              {contacts?.businessHours && (
                <li className="flex max-lg:justify-center items-start max-lg:space-x-2 space-x-3" data-testid="footer-contact-hours">
                  <span className="iconify text-brand-gold mt-1 max-lg:text-base" data-icon="mdi:clock-outline" data-width="20"></span>
                  <span className="max-lg:text-left">{contacts.businessHours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto max-lg:px-4 px-6 max-lg:py-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center max-lg:text-xs text-sm max-lg:gap-2 gap-4">
            <div className="text-gray-400">
              Feito pela <a href="https://halarum.dev" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-white transition-colors">Halarum.dev</a>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
              <a href="/politica-de-privacidade" className="hover:text-brand-gold transition-colors" data-testid="link-footer-privacy">Política de Privacidade</a>
              <span className="hidden md:inline text-gray-500">|</span>
              <span className="text-gray-400">Cartório 1° Ofício de Rio das Ostras - CNPJ 56.886.764/0001-80</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
