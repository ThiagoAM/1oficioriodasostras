import { useQuery } from "@tanstack/react-query";
import type { Contacts } from "@shared/schema";

export default function WhatsAppButton() {
  const { data: contactsData } = useQuery<{ contacts: Contacts }>({
    queryKey: ["/api/contacts"],
  });

  const contacts = contactsData?.contacts;

  if (!contacts?.phone) {
    return null;
  }

  const whatsappLink = `https://wa.me/55${contacts.phone.replace(/\D/g, '')}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
      aria-label="Contato via WhatsApp"
    >
      <span className="iconify" data-icon="mdi:whatsapp" data-width="32"></span>
    </a>
  );
}
