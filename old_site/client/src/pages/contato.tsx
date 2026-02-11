import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useToast } from "@/hooks/use-toast";

interface Contacts {
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  businessHours?: string;
}

interface SiteSettings {
  browserTabName?: string;
}

export default function Contato() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  const { data: contactsData } = useQuery<{ contacts: Contacts }>({
    queryKey: ["/api/contacts"],
  });

  const { data: settingsData } = useQuery<{ settings: SiteSettings }>({
    queryKey: ["/api/site-settings"],
  });

  const contacts = contactsData?.contacts;
  const siteName = settingsData?.settings?.browserTabName || "Tabelionato de Notas de Protestos";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Aplicar máscara de telefone
    if (name === "telefone") {
      let masked = value.replace(/\D/g, "");
      if (masked.length > 11) masked = masked.slice(0, 11);

      if (masked.length > 6) {
        masked = `(${masked.slice(0, 2)})${masked.slice(2, 7)}-${masked.slice(7)}`;
      } else if (masked.length > 2) {
        masked = `(${masked.slice(0, 2)})${masked.slice(2)}`;
      } else if (masked.length > 0) {
        masked = `(${masked}`;
      }

      setFormData((prev) => ({ ...prev, [name]: masked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Enviando dados de contato:', formData);

      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          mensagem: formData.mensagem,
          lido: false,
        }),
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro do servidor:', errorData);
        throw new Error("Erro ao enviar mensagem");
      }

      const result = await response.json();
      console.log('Mensagem salva com sucesso:', result);

      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });

      // Resetar formulário
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        mensagem: "",
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white font-sans text-gray-800">
      <Header />

      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-brand-blue">Página Inicial</a>
          <span className="mx-2">›</span>
          <span>Contato</span>
        </div>

        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl font-serif text-brand-blue mb-4">Contato</h1>
          <p className="text-gray-600 text-base leading-relaxed">
            Fale com o Cartório do 1º Ofício de Justiça da Comarca de Rio das Ostras. Use o formulário ao lado
            para enviar dúvidas, sugestões ou solicitações. Nossa equipe retornará o contato o mais breve possível.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Mapa e Informações */}
          <div className="space-y-6">
            {/* Google Maps */}
            <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3677.8397282875484!2d-41.93736!3d-22.523978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x97b30020fba24b%3A0x220ae06be19b9dec!2sCart%C3%B3rio%201%C2%B0%20Of%C3%ADcio%20de%20Justi%C3%A7a%20de%20Rio%20das%20Ostras%2FRJ%20-%20Notas%2C%20RCPN%20e%20Protesto!5e0!3m2!1spt-BR!2sbr!4v1234567890!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Card de Informações */}
            <div className="text-white p-8 rounded-lg" style={{ backgroundColor: '#202841' }}>
              <h2 className="text-xl font-bold mb-4">
                {siteName}
              </h2>

              {contacts?.address && (
                <p className="text-sm mb-4">
                  {contacts.address}
                </p>
              )}

              {(contacts?.phone || contacts?.whatsapp) && (
                <div className="mb-4">
                  {contacts.phone && (
                    <p className="text-sm">
                      <span className="font-semibold">Telefone Móvel:</span> {contacts.phone}
                    </p>
                  )}
                  {contacts.whatsapp && (
                    <p className="text-sm">
                      <span className="font-semibold">Telefone Fixo:</span> {contacts.whatsapp}
                    </p>
                  )}
                </div>
              )}

              {contacts?.email && (
                <div className="text-sm space-y-1">
                  {contacts.email.replace(/[\[\]"]/g, '').split(/[;,]/).map((email, index) => (
                    <p key={index}>
                      <a
                        href={`mailto:${email.trim()}`}
                        className="hover:text-brand-gold transition-colors"
                      >
                        {email.trim()}
                      </a>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Formulário */}
          <div>
            <h2 className="text-3xl font-serif mb-4" style={{ color: '#202841' }}>
              Enviar uma mensagem
            </h2>
            <p className="text-gray-600 mb-8">
              Preencha os campos abaixo para falar diretamente com nossa equipe. Informe seus dados de contato
              e descreva sua demanda com clareza para que possamos atender você com mais agilidade.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full border rounded px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#202841', focusRingColor: '#202841' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#202841', focusRingColor: '#202841' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(99)99999-9999"
                  className="w-full border rounded px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#202841', focusRingColor: '#202841' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  name="mensagem"
                  value={formData.mensagem}
                  onChange={handleChange}
                  rows={6}
                  className="w-full border rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: '#202841', focusRingColor: '#202841' }}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="text-white px-8 py-3 rounded text-sm font-medium transition-colors"
                style={{ backgroundColor: '#202841' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Enviar mensagem
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
