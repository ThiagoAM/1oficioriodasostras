(function () {
  const contact = {
    phoneLabel: "(22) 3190-0120",
    phoneHref: "tel:+552231900120",
    whatsappUrl: "https://wa.me/552231900120",
    whatsappServiceUrl:
      "https://wa.me/552231900120?text=Ol%C3%A1%21%20Vim%20pelo%20site%20do%201%C2%BA%20Of%C3%ADcio%20e%20gostaria%20de%20solicitar%20um%20servi%C3%A7o%20do%20cart%C3%B3rio.",
    email: "1oficiorioostras@gmail.com",
    instagramUrl: "https://www.instagram.com/cartorioderiodasostras",
    instagramLabel: "@cartorioderiodasostras",
    facebookUrl: "https://www.facebook.com/cartorioderiodasostras",
    facebookLabel: "@cartorioderiodasostras",
    addressName: "Ofício de Justiça da Comarca de Rio das Ostras",
    addressLines: [
      "Rua Luíza Vianna, nº 87, Loja 1",
      "Novo Rio das Ostras – Rio das Ostras/RJ",
      "CEP 28893-470",
    ],
    mapsUrl: "https://maps.app.goo.gl/VQS7zjTKEZ4Dpodv5",
    mapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3677.8397282875484!2d-41.93736!3d-22.523978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x97b30020fba24b%3A0x220ae06be19b9dec!2s1%C2%B0%20Of%C3%ADcio%20de%20Justi%C3%A7a%20de%20Rio%20das%20Ostras%2FRJ%20-%20Notas%2C%20RCPN%20e%20Protesto!5e0!3m2!1spt-BR!2sbr!4v1725846459574!5m2!1spt-BR!2sbr",
  };

  window.SiteData = {
    brand: {
      name: "1º Ofício de Justiça de Rio das Ostras",
      shortName: "1º Ofício",
      subtitle: "Notas · Protesto · Registro Civil",
      logo: "assets/images/display/cartorio-icon-140.png",
      logoAlt: "Logo do Cartório do 1º Ofício de Justiça de Rio das Ostras",
    },
    contact,
    navigation: [
      { label: "Início", href: "#topo" },
      { label: "Inteligência Artificial 24h", href: "#inteligencia-artificial" },
      { label: "Serviços do cartório", href: "#servicos" },
      { label: "Calculadora de emolumentos", href: "#calculadora-emolumentos" },
      { label: "Localização", href: "#localizacao" },
      { label: "Horário de atendimento", href: "#horario" },
      { label: "Perguntas frequentes", href: "perguntas-frequentes.html" },
      { label: "Explore mais", href: "#conteudos" },
      { label: "Fale conosco", href: "#contato" },
      { label: "Agenda 2030", href: "#agenda-2030" },
    ],
    featurePages: {
      kicker: "Explore mais",
      title:
        "Mais informações",
      text:
        "Acesse guias, links oficiais, fotos e informações sobre o cartório.",
      cards: [
        {
          title: "Serviços online",
          text: "Solicite serviços sem sair de casa e receba orientação da equipe.",
          href: "servicos-online.html",
          image: "assets/images/display/feature-servicos-online-1100.webp",
          imageAlt: "Notebook com formulário online em mesa de cartório",
        },
        {
          title: "Formulários para impressão",
          text: "Preencha formulários antes do atendimento presencial.",
          href: "formularios-impressao.html",
          image: "assets/images/display/feature-formularios-impressao-1100.webp",
          imageAlt: "Formulários impressos em mesa de atendimento",
        },
        {
          title: "Perguntas frequentes",
          text: "Consulte orientações por assunto, documentos, prazos e valores.",
          href: "perguntas-frequentes.html",
          image: "assets/images/display/feature-perguntas-frequentes-1100.webp",
          imageAlt: "Atendimento com tablet exibindo perguntas frequentes",
        },
        {
          title: "Guias ao cidadão",
          text: "Orientações práticas por assunto antes do atendimento.",
          href: "guias.html",
          image: "assets/images/display/feature-guias-1100.webp",
          imageAlt: "Documentos, chaves e balança em mesa de cartório",
        },
        {
          title: "Sobre o tabelião",
          text: "Trajetória e atuação do titular do 1º Ofício.",
          href: "sobre-tabeliao.html",
          image: "assets/images/display/robson-720.webp",
          imageAlt: "Robson Martins, Tabelião do 1º Ofício de Rio das Ostras",
        },
        {
          title: "Galeria de fotos",
          text: "Fotos do cartório e de Rio das Ostras.",
          href: "cartorio-e-cidade.html",
          image: "assets/images/display/rio-das-ostras-5-1000.webp",
          imageAlt: "Rio das Ostras ao pôr do sol",
        },
        {
          title: "Números do cartório",
          text: "Indicadores por ano e tipo de serviço.",
          href: "numeros-cartorio.html",
          image: "assets/images/display/feature-numeros-1100.webp",
          imageAlt: "Indicadores do cartório em notebook sobre mesa de documentos",
        },
        {
          title: "Links úteis",
          text: "Portais oficiais para consultas e serviços.",
          href: "links-uteis.html",
          image: "assets/images/display/feature-links-1100.webp",
          imageAlt: "Cartões com atalhos de serviços oficiais em mesa de cartório",
        },
      ],
    },
    hero: {
      eyebrow: "Notas · Protesto · Registro Civil",
      titleLines: ["Cartório do", "1º Ofício", "de Justiça"],
      place: "Rio das Ostras · Rio de Janeiro",
      intro:
        "Atendimento presencial: segunda a sexta, das 9h às 17h. Plantão para nascimento e óbito: fins de semana e feriados, das 9h às 12h.",
      introHtml:
        "<strong>Atendimento presencial:</strong> segunda a sexta, das 9h às 17h.<br><strong>Plantão para nascimento e óbito:</strong> fins de semana e feriados, das 9h às 12h.",
      actions: [
        {
          kind: "whatsapp",
          label: "Solicitar atendimento",
          href: contact.whatsappServiceUrl,
          external: true,
        },
        {
          kind: "location",
          label: "Como chegar",
          href: "#localizacao",
          external: false,
        },
      ],
      slideInterval: 6500,
      slides: [
        {
          image: "assets/images/hero/slides/rio-das-ostras-1-1800.webp",
          imageSmall: "assets/images/hero/slides/rio-das-ostras-1-1000.webp",
          alt: "Vista aérea de uma praia de Rio das Ostras, com costões de pedra e mar esverdeado",
          caption: "Praias e costões",
        },
        {
          image: "assets/images/hero/slides/rio-das-ostras-2-1800.webp",
          imageSmall: "assets/images/hero/slides/rio-das-ostras-2-1000.webp",
          alt: "Píer avançando sobre o mar de Rio das Ostras sob um céu rosado no fim da tarde",
          caption: "Entardecer no píer",
        },
        {
          image: "assets/images/hero/slides/rio-das-ostras-3-1800.webp",
          imageSmall: "assets/images/hero/slides/rio-das-ostras-3-1000.webp",
          alt: "Vista aérea do encontro do rio com o mar em Rio das Ostras, com morro coberto de mata",
          caption: "Onde o rio encontra o mar",
        },
        {
          image: "assets/images/hero/slides/rio-das-ostras-4-1800.webp",
          imageSmall: "assets/images/hero/slides/rio-das-ostras-4-1000.webp",
          alt: "Silhueta do monumento da ostra recortada contra o céu alaranjado do pôr do sol",
          caption: "Pôr do sol na cidade das ostras",
        },
        {
          image: "assets/images/hero/slides/rio-das-ostras-5-1800.webp",
          imageSmall: "assets/images/hero/slides/rio-das-ostras-5-1000.webp",
          alt: "Praia de Rio das Ostras ao amanhecer, com píer ao fundo e reflexo dourado na areia",
          caption: "Amanhecer na orla",
        },
        {
          image: "assets/images/hero/slides/rio-das-ostras-6-1800.webp",
          imageSmall: "assets/images/hero/slides/rio-das-ostras-6-1000.webp",
          alt: "Vista aérea da orla urbana de Rio das Ostras, com praia, ruas e casas à beira-mar",
          caption: "A cidade à beira-mar",
        },
      ],
    },
    welcome: {
      titleGreeting: "Boas-vindas",
      titleRest: "a um dos cartórios mais digitais do Estado do Rio de Janeiro",
      text:
        "Aqui boa parte do atendimento começa — e muitas vezes termina — sem sair de casa. Fale com a nossa equipe pelo WhatsApp de segunda a sexta, das 9h às 17h, tire dúvidas a qualquer hora com o nosso assistente de inteligência artificial ou resolva você mesmo pelos serviços online.",
      actions: [
        {
          kind: "whatsapp",
          label: "Solicitar pelo WhatsApp",
          href: contact.whatsappServiceUrl,
          external: true,
        },
        {
          kind: "ai",
          label: "Tirar dúvidas 24h com IA",
          href: "#inteligencia-artificial",
          external: false,
          roboOpen: "widget",
        },
        {
          kind: "online",
          label: "Serviços online",
          href: "servicos-online.html",
          external: false,
        },
      ],
    },
    philosophy: {
      kicker: "Nosso compromisso",
      quote:
        "Atuar com técnica, transparência e respeito ao cidadão, tornando cada ato cartorário mais claro, seguro e acessível.",
      proof: {
        text:
          "Somos um dos cartórios mais bem avaliados do Brasil no Google — reconhecimento da confiança e da excelência do nosso atendimento, inclusive nos atos eletrônicos.",
        highlight: "um dos cartórios mais bem avaliados do Brasil no Google",
      },
      link: null,
      reviews: {
        rating: "4,9",
        totalLabel: "1.161 avaliações no Google",
        rateUrl: "https://maps.app.goo.gl/4ah3aHAuX1gf2aVs5",
        items: [
          {
            name: "Lene Barcelos",
            text:
              "Minha experiência foi ótima! Atendimento impecável e humanizado. Sou de outra cidade e moro aqui há 11 anos, e consegui resolver minha demanda de maneira prática, rápida e muito respeitosa.",
          },
          {
            name: "José Luiz Costa da Silva",
            text:
              "Gostaria de registrar um elogio ao atendimento prestado pela colaboradora Maria Eduarda durante o processo de certificação digital realizado recentemente.",
          },
          {
            name: "Patrícia Pathy",
            text:
              "Excelente atendimento! Rápido e eficiente. A atendente super pró-ativa e educada. Sempre tenho ótimas experiências nesse cartório. Todos sempre são bem atenciosos.",
          },
          {
            name: "Eduardo Hygino",
            text:
              "Atendimento extremamente rápido e eficiente. Entrei em contato por volta de 12h e antes das 16h meu problema já estava totalmente resolvido, incluindo a baixa do protesto.",
          },
          {
            name: "Gleiciane Santiago",
            text:
              "Profissionais atenciosos, educados e com boa vontade. Sempre que preciso de um serviço faço contato pelo WhatsApp e sou muito bem atendida.",
          },
          {
            name: "Vanderlam Xavier",
            text:
              "Parabéns pelo excelente serviço. Agora temos um cartório que respeita o cidadão.",
          },
          {
            name: "Patricinha Mercedes",
            text:
              "Quero agradecer o atendimento da Vitória da Silva Borges por toda atenção, esclarecimentos e auxílio, sendo essencial para que eu pudesse resolver o que precisava. Agradeço também a todos os demais por tamanha gentileza e educação. Estão de parabéns por exercer tão bem os seus ofícios. Gratidão!",
          },
          {
            name: "David Rodrigues",
            text:
              "Excelente atendimento realizado pela colaboradora Letícia Rosa!",
          },
          {
            name: "Taiane Cardial",
            text:
              "Ótimo atendimento! O Dr. Robson é super prestativo!",
          },
          {
            name: "Joyce Hellen",
            text:
              "Venho parabenizar o cartório pelo excelente trabalho prestado com a sociedade! E também quero parabenizar a funcionária Kamily Ferreira, que me atendeu e prestou um ótimo serviço, com toda atenção e carinho com o meu caso. Novamente parabéns a todos!",
          },
          {
            name: "Mouriel",
            text: "Melhor cartório da região!",
          },
          {
            name: "Gerson Junio Arantes",
            text:
              "Fui atendido pela Letícia Rosa, muito solícita!",
          },
          {
            name: "Idenir da Silva",
            text:
              "Fui muito bem atendida pela atendente Ana Carolina Dantas!",
          },
          {
            name: "Renato Madruga Fernandes",
            text:
              "Atendimento cordial, funcionários muito educados e atenciosos, local limpo e organizado. Estão de parabéns, Deus os abençoe sempre.",
          },
          {
            name: "Cileymar Borges",
            text:
              "O cartório está modernizado, está lindo! Sem contar o atendimento, que é nota 10! Ressalto o atendimento do funcionário Willian, que me atendeu na entrada e me direcionou para o setor responsável. Muito simpático e atencioso! Com funcionários assim, Rio das Ostras só tem a ganhar!",
          },
        ],
      },
    },
    aiAssistance: {
      kicker: "Inteligência Artificial",
      title: "Atendimento com inteligência artificial 24h",
      text:
        "Este cartório está entre os poucos no Brasil que oferecem serviços com inteligência artificial. Usuários podem tirar dúvidas ou iniciar um serviço a qualquer hora, com nossos atendentes dando prosseguimento em horário comercial.",
      logo: "assets/images/display/cartorio-icon-420.png",
      logoAlt: "Logo do Cartório do 1º Ofício de Justiça de Rio das Ostras",
      placeholder: "Pergunte qualquer coisa",
      submitLabel: "Enviar pergunta",
    },
    practiceAreas: {
      kicker: "Serviços do cartório",
      image: "assets/images/display/cartorio-13-900.webp",
      imageAlt: "Ambiente interno do cartório",
      title:
        "Resolva serviços de notas, protesto e Registro Civil com orientação da equipe.",
      text:
        "Antes de iniciar o atendimento, você pode consultar documentos necessários, prazos e formas de solicitação.",
      items: [
        {
          title: "Escrituras públicas",
          text: "Compra e venda, doação, permuta, inventário, divórcio consensual, união estável e outros atos notariais.",
          faqCategory: "Escrituras e Notas",
          faqQuery: "escrituras",
        },
        {
          title: "Registro Civil",
          text: "Nascimento, casamento, óbito, averbações e transcrições de registros ocorridos no exterior.",
          faqCategory: "Registro Civil",
          faqQuery: "",
        },
        {
          title: "Protesto de títulos",
          text: "Protocolo, intimação, lavratura, pagamento e cancelamento de protestos com observância dos prazos legais.",
          faqCategory: "Quadros-resumo",
          faqQuery: "protesto",
        },
        {
          title: "Firmas e autenticações",
          text: "Reconhecimento de firma, autenticação de cópias, apostilamento de Haia e serviços eletrônicos pelo e-Notariado.",
          faqCategory: "Escrituras e Notas",
          faqQuery: "autenticação firma",
        },
        {
          title: "Certidões",
          text: "Certidões de atos notariais, protesto, Registro Civil e certidão negativa de Interdição, Tutela e Curatela.",
          faqCategory: "Todas",
          faqQuery: "certidões",
        },
        {
          title: "Orientação ao cidadão",
          text: "Guias práticos e atendimento para esclarecer documentos necessários antes do serviço presencial ou online.",
          faqCategory: "Atendimento",
          faqQuery: "",
        },
      ],
    },
    whyChoose: {
      kicker: "Por que escolher nosso cartório",
      title:
        "Atendimento técnico e humano para transformar procedimentos complexos em etapas compreensíveis.",
      text:
        "No setor de Notas, todos os escreventes são pós-graduados em Direito Imobiliário e Registral, reunindo conhecimento especializado, segurança jurídica e atenção em cada atendimento.",
      secondaryText:
        "Nossa equipe também conta com profissionais qualificados para atender estrangeiros em inglês, espanhol, italiano e chinês.",
      bullets: ["Orientação antes do atendimento", "Serviços presenciais e online", "Integração com plataformas oficiais"],
      metrics: [
        { label: "Lavraturas de escritura", key: "lavratura-escritura", value: "0" },
        { label: "Registros de casamento", key: "registro-casamento", value: "0" },
        { label: "Visitas ao site", key: "visitas-site", value: "0" },
      ],
    },
    onlineServices: {
      kicker: "Serviços online",
      title: "Solicite sem sair de casa e receba orientação da equipe.",
      text:
        "Após a análise, nossa equipe informa os documentos necessários, valores, prazos e como concluir o serviço.",
      cards: [
        {
          title: "Escrituras e atos notariais",
          text: "Inicie pedidos de escrituras, inventários, divórcios consensuais e outros atos de notas.",
          href: "servico-escrituras.html",
          meta: "Formulário online",
        },
        {
          title: "Atos notariais eletrônicos",
          text: "Escrituras, procurações e atas por videoconferência pelo e-Notariado: quais atos são possíveis, quem pode praticá-los aqui e como solicitar.",
          href: "servico-atos-eletronicos.html",
          meta: "Como funciona",
        },
        {
          title: "Certidões",
          text: "Peça certidões de escritura, procuração, substabelecimento, protesto e outros atos.",
          href: "servico-certidoes.html",
          meta: "Formulário online",
        },
        {
          title: "Certidão negativa de ITC",
          text: "Solicite a certidão de Interdição, Tutela e Curatela e envie o comprovante de pagamento.",
          href: "servico-certidao-negativa-itc.html",
          meta: "Formulário online",
        },
        {
          title: "2ª via e Registro Civil pelo cartório",
          text: "Solicite 2ª via de certidões de nascimento, casamento e óbito e outros serviços do Registro Civil diretamente ao cartório.",
          href: "servico-registro-civil.html",
          meta: "Atendimento do cartório",
        },
        {
          title: "Registro Civil e 2ª via digital",
          text: "Acesse a plataforma oficial para pedir segunda via de certidões e outros serviços do Registro Civil.",
          href: "https://home.registrocivil.org.br",
          meta: "Portal oficial",
          external: true,
        },
      ],
    },
    paperForms: {
      kicker: "Formulários para impressão",
      title: "Ganhe tempo no atendimento presencial.",
      text: "Preencha antes de ir ao cartório e agilize o atendimento presencial.",
      cards: [
        {
          title: "Casamentos em Rio das Ostras",
          text:
            "Formulários para iniciar o processo de habilitação de casamento civil.",
          href: "formularios-casamento.html",
        },
        {
          title: "Transcrições e anotações do Registro Civil",
          text:
            "Pedidos relacionados a nascimento, casamento e óbito ocorridos no exterior.",
          href: "formularios-registro-civil.html",
        },
      ],
    },
    guides: {
      kicker: "Guias ao cidadão",
      title: "Consulte orientações práticas antes do seu atendimento.",
      text:
        "Materiais organizados por assunto ajudam a entender documentos, etapas e cuidados comuns nos principais serviços.",
      groups: [
        {
          title: "Escrituras, Atas e Procurações",
          links: [
            { title: "Tabelionato de Notas", href: "guides/roteiro-notas.html" },
            { title: "Enotariado", href: "guides/enotariado.html" },
            { title: "Atos Notariais", href: "guides/atos-notariais.html" },
            { title: "Ata Notarial de WhatsApp para Imóveis", href: "guides/ata-notarial-whatsapp-imoveis.html" },
            { title: "Adjudicação Compulsória Extrajudicial", href: "guides/adjudicacao-compulsoria-extrajudicial.html" },
            { title: "Usucapião Extrajudicial", href: "guides/usucapiao-extrajudicial-tabelionato.html" },
            { title: "União Estável", href: "guides/uniao-estavel.html" },
            { title: "Procuração Pública", href: "guides/procuracao-publica.html" },
            { title: "Mudança de Regime de Bens", href: "guides/mudanca-regime-bens.html" },
            { title: "Inventário e Partilha", href: "guides/inventario-partilha.html" },
            { title: "Testamento Público", href: "guides/testamento-publico.html" },
            { title: "Escrituras", href: "guides/escrituras.html" },
            { title: "Escritura de Compra e Venda e Dação em Pagamento", href: "guides/guia-escritura-compra-venda-dacao-pagamento.html" },
            { title: "Direitos Possessórios", href: "guides/direitos-possessorios.html" },
            { title: "Escritura de Estremação", href: "guides/estremacao.html" },
            { title: "Escritura de Investidura", href: "guides/investidura.html" },
            { title: "Incorporação Imobiliária", href: "guides/incorporacao-imobiliaria.html" },
          ],
        },
        {
          title: "Firmas, apostilamento e certificado digital",
          links: [
            { title: "Setor de Firmas", href: "guides/setor-firmas.html" },
            { title: "Apostilamento de Haia", href: "guides/apostilamento-haia.html" },
          ],
        },
        {
          title: "Registro Civil",
          links: [
            { title: "Registro Civil", href: "guides/roteiro-RCPN.html" },
            { title: "Habilitação para Casamento", href: "guides/habilitacao-casamento.html" },
            { title: "Conversão de União Estável em Casamento", href: "guides/conversao-uniao-estavel.html" },
            { title: "Mudança de Nome e Sobrenome", href: "guides/mudanca-nome-sobrenome.html" },
            { title: "Óbito", href: "guides/obito.html" },
            { title: "Nascimento", href: "guides/nascimento.html" },
            { title: "Livro E", href: "guides/livro-e-rcpn.html" },
          ],
        },
        {
          title: "Protesto",
          links: [{ title: "Protesto de Títulos", href: "guides/roteiro-protesto.html" }],
        },
      ],
    },
    hours: {
      kicker: "Horário de atendimento",
      title: "Horários presenciais e plantão do Registro Civil.",
      intro: "Atos urgentes de nascimento e óbito contam com plantão em fins de semana e feriados.",
      items: [
        { title: "Balcão presencial", text: "Segunda a sexta-feira, das 9h às 17h." },
        { title: "Plantão de nascimento e óbito", text: "Sábados, domingos e feriados, das 9h às 12h." },
        { title: "Serviços online", text: "Solicitações podem ser enviadas a qualquer momento, com análise em horário comercial." },
      ],
      note: "",
    },
    about: {
      kicker: "Sobre o tabelião",
      title: "Dr. Robson Martins",
      role: "Tabelião titular do 1º Ofício de Justiça",
      statement:
        "Com forte compromisso com a cidadania, celeridade, segurança jurídica e modernização dos serviços cartorários, lidero uma equipe dedicada a oferecer atendimento eficiente, transparente e próximo da comunidade de Rio das Ostras e região.",
      bio: [
        "Titular do Cartório do 1º Ofício de Rio das Ostras, aprovado em concurso público de provas e títulos organizado pelo Tribunal de Justiça do Estado do Rio de Janeiro. Possui larga experiência em serviços notariais e de registro e exerceu os cargos de Técnico da Justiça Federal, Promotor de Justiça e Procurador da República.",
        "Pós-Doutor em Direito pela UENP, Doutor pela UERJ e pelo CEUB-ITE e Mestre pela UFRJ e pela UNIPAR. É especialista em Direito Notarial e Registral, Negócios Imobiliários e Direito Civil pela Anhanguera e pelo Damásio, e professor de graduação e pós-graduação desde 2009.",
      ],
      image: "assets/images/display/robson-720.webp",
      imageAlt: "Robson Martins, Tabelião do 1º Ofício de Rio das Ostras",
      body: [
        "Titular do Cartório do 1º Ofício de Rio das Ostras, aprovado em concurso público de provas e títulos organizado pelo Tribunal de Justiça do Estado do Rio de Janeiro. Possui larga experiência em serviços notariais e de registro e exerceu os cargos de Técnico da Justiça Federal, Promotor de Justiça e Procurador da República.",
        "Pós-Doutor em Direito pela UENP, Doutor pela UERJ e pelo CEUB-ITE e Mestre pela UFRJ e pela UNIPAR. É especialista em Direito Notarial e Registral, Negócios Imobiliários e Direito Civil pela Anhanguera e pelo Damásio, e professor de graduação e pós-graduação desde 2009.",
        "Com forte compromisso com cidadania, celeridade, segurança jurídica e modernização dos serviços cartorários, lidera uma equipe dedicada a oferecer atendimento eficiente, transparente e próximo da comunidade de Rio das Ostras e região.",
      ],
    },
    location: {
      kicker: "Localização",
      title: "Como chegar ao cartório",
      text: "Estamos em região central e de fácil acesso em Rio das Ostras/RJ.",
    },
    usefulLinks: {
      kicker: "Links úteis",
      title: "Portais oficiais para consultas e serviços.",
      links: [
        { title: "Enotariado", text: "Plataforma nacional para atos notariais eletrônicos e assinatura digital.", href: "https://www.notariado.org.br/" },
        { title: "Consulta de Abertura de Firmas no RJ", text: "Verifique informações de abertura de firmas no estado do Rio de Janeiro.", href: "https://www3.tjrj.jus.br/PORTALEXTRAJUDICIAL/consultafirma/" },
        { title: "Consulta on-line de protestos", text: "Pesquise protestos de forma eletrônica em base nacional integrada.", href: "https://www.pesquisaprotesto.com.br/pesquisaProtesto" },
        { title: "Tribunal de Justiça do Rio de Janeiro", text: "Portal oficial do TJRJ com serviços judiciais e extrajudiciais.", href: "https://www.tjrj.jus.br/" },
        { title: "Central de Registro Civil", text: "Central oficial para serviços e solicitações de registro civil.", href: "https://home.registrocivil.org.br/login" },
        { title: "ANOREG", text: "Associação dos Notários e Registradores do Brasil.", href: "https://www.anoreg.org.br/" },
        { title: "Secretaria da Receita Federal", text: "Portal da Receita Federal para consultas, documentos e serviços fiscais.", href: "https://www.receita.fazenda.gov.br/" },
      ],
    },
    contactForm: {
      title: "Precisa de orientação?",
      text:
        "Envie sua mensagem com o serviço desejado. Nossa equipe responderá em horário comercial.",
      privacyText:
        "Ao enviar, você autoriza o uso dos dados informados apenas para resposta ao seu contato e orientação sobre os serviços do cartório.",
      action: "https://api.web3forms.com/submit",
      accessKey: "2a703f7e-b77b-4478-97f2-c9d8379ad11b",
      subject: "Novo formulário de contato - Site 1º Ofício Rio das Ostras",
      fromName: "Site 1º Ofício Rio das Ostras",
      submitLabel: "Enviar mensagem",
      sendingLabel: "Enviando...",
      sendingText: "Enviando sua mensagem, aguarde.",
      successTitle: "Mensagem enviada",
      successText:
        "Obrigado por entrar em contato com o 1º Ofício de Justiça de Rio das Ostras. Nossa equipe responderá pelos dados informados, de segunda a sexta-feira, das 9h às 17h.",
      successAgainLabel: "Enviar outra mensagem",
      errorText:
        "Não foi possível enviar sua mensagem agora. Tente novamente em instantes ou fale conosco pelo WhatsApp.",
      timeoutText:
        "O envio demorou mais que o esperado e pode ter sido concluído mesmo assim. Antes de enviar de novo, confirme conosco pelo WhatsApp.",
      whatsappLabel: "Falar no WhatsApp agora",
      options: [
        "Dúvida geral",
        "Certidão",
        "Escritura / ato notarial",
        "Registro civil",
        "Protesto de títulos",
        "Outro",
      ],
    },
    civilConsultation: {
      kicker: "Consulta de casamento",
      title: "Acompanhe seu processo de habilitação",
      text:
        "Veja a situação registrada pelo cartório sem precisar ligar ou vir até o balcão. Basta o número do processo e o CPF de um dos nubentes.",
      steps: [
        "Tenha em mãos o número do processo informado pelo cartório.",
        "Informe o CPF de um dos nubentes.",
        "Veja a situação atual, as datas e o que ainda falta.",
      ],
      formTitle: "Consultar agora",
      processLabel: "Número do processo",
      processPlaceholder: "10000",
      cpfLabel: "CPF de um dos nubentes",
      cpfPlaceholder: "000.000.000-00",
      submitLabel: "Consultar processo",
      note:
        "A consulta mostra a situação registrada no processo de habilitação deste cartório. Em caso de divergência ou dúvida sobre alguma etapa, fale com a nossa equipe pelo WhatsApp.",
    },
    emolumentCalculator: {
      kicker: "Calculadora de emolumentos",
      title: "Simule o custo da escritura do seu imóvel",
      text:
        "Informe o valor do imóvel e o seu WhatsApp. Nossa equipe calcula os emolumentos com base na tabela vigente no Estado do Rio de Janeiro e envia a simulação para você, junto com a lista de documentos necessários.",
      steps: [
        "Você informa o valor do imóvel e o seu contato.",
        "A equipe calcula pela tabela de emolumentos vigente no Estado do Rio de Janeiro.",
        "Você recebe a simulação e a lista de documentos pelo WhatsApp.",
      ],
      action: "https://api.web3forms.com/submit",
      accessKey: "2a703f7e-b77b-4478-97f2-c9d8379ad11b",
      subject: "Calculadora de emolumentos - Site 1º Ofício Rio das Ostras",
      fromName: "Calculadora de emolumentos - Site 1º Ofício",
      formTitle: "Peça sua simulação",
      nameLabel: "Seu nome",
      namePlaceholder: "Nome completo",
      phoneLabel: "Seu WhatsApp",
      phonePlaceholder: "(22) 99999-9999",
      valueLabel: "Valor do imóvel (R$)",
      valuePlaceholder: "0,00",
      submitLabel: "Solicitar cálculo",
      sendingLabel: "Enviando...",
      successTitle: "Recebemos seus dados",
      successText:
        "O cartório entrará em contato pelo WhatsApp em breve com a simulação dos emolumentos. Nosso atendimento é de segunda a sexta-feira, das 9h às 17h.",
      successAgainLabel: "Fazer nova simulação",
      whatsappLabel: "Falar no WhatsApp agora",
      errorText:
        "Não foi possível enviar agora. Tente novamente em instantes ou fale conosco pelo WhatsApp.",
      privacyText:
        "Ao enviar, você autoriza o uso dos dados informados apenas para o cálculo solicitado e para o contato da equipe do cartório.",
      note:
        "A simulação é uma estimativa calculada pela tabela de emolumentos vigente no Estado do Rio de Janeiro, já com os acréscimos legais e os tributos incidentes sobre o ato notarial. Não inclui o ITBI devido ao município nem os custos de registro no Cartório de Registro de Imóveis. O valor final pode variar conforme as particularidades de cada escritura.",
    },
    agenda2030: {
      kicker: "Agenda 2030",
      title: "Nosso compromisso com os Objetivos de Desenvolvimento Sustentável",
      intro:
        "Adotada em 2015 pelos 193 Estados-membros da ONU, a Agenda 2030 reúne 17 Objetivos de Desenvolvimento Sustentável e 169 metas. O trabalho de um cartório está no centro desse compromisso: é do registro civil que nasce a identidade jurídica de uma pessoa, e é da atividade notarial e de protesto que vem boa parte da segurança jurídica e da solução de conflitos fora do Judiciário.",
      statement: {
        badge: "Provimento CNJ nº 85/2019",
        title: "Esta serventia internalizou a Agenda 2030",
        quote:
          "As Corregedorias e as Serventias Extrajudiciais deverão inserir em seus portais ou sites, expressamente, a informação de que internalizaram a Agenda 2030, bem como a correspondência dos respectivos assuntos e atos normativos à cada um dos ODS.",
        quoteSource:
          "Art. 3º do Provimento nº 85, de 19 de agosto de 2019, da Corregedoria Nacional de Justiça do CNJ",
        link: {
          label: "Ler o Provimento nº 85/2019",
          href: "https://atos.cnj.jus.br/atos/detalhar/2988",
        },
      },
      goalsTitle: "Os 17 Objetivos de Desenvolvimento Sustentável",
      goalsText:
        "Adotados por todos os países membros da ONU, os 17 objetivos formam a estrutura da Agenda 2030. A atividade notarial, de protesto e de registro civil se conecta de forma direta a boa parte deles.",
      goalsLegend: "O ponto no canto do quadro marca os objetivos a que os atos praticados por esta serventia se relacionam diretamente.",
      goals: [
        { number: 1, name: "Erradicação da pobreza", color: "#E5243B", ink: "light" },
        { number: 2, name: "Fome zero e agricultura sustentável", color: "#DDA63A", ink: "dark" },
        { number: 3, name: "Saúde e bem-estar", color: "#4C9F38", ink: "dark", focus: true },
        { number: 4, name: "Educação de qualidade", color: "#C5192D", ink: "light", focus: true },
        { number: 5, name: "Igualdade de gênero", color: "#FF3A21", ink: "dark", focus: true },
        { number: 6, name: "Água potável e saneamento", color: "#26BDE2", ink: "dark" },
        { number: 7, name: "Energia limpa e acessível", color: "#FCC30B", ink: "dark" },
        { number: 8, name: "Trabalho decente e crescimento econômico", color: "#A21942", ink: "light", focus: true },
        { number: 9, name: "Indústria, inovação e infraestrutura", color: "#FD6925", ink: "dark", focus: true },
        { number: 10, name: "Redução das desigualdades", color: "#DD1367", ink: "light", focus: true },
        { number: 11, name: "Cidades e comunidades sustentáveis", color: "#FD9D24", ink: "dark", focus: true },
        { number: 12, name: "Consumo e produção responsáveis", color: "#BF8B2E", ink: "dark", focus: true },
        { number: 13, name: "Ação contra a mudança global do clima", color: "#3F7E44", ink: "light", focus: true },
        { number: 14, name: "Vida na água", color: "#0A97D9", ink: "dark" },
        { number: 15, name: "Vida terrestre", color: "#56C02B", ink: "dark" },
        { number: 16, name: "Paz, justiça e instituições eficazes", color: "#00689D", ink: "light", focus: true },
        { number: 17, name: "Parcerias e meios de implementação", color: "#19486A", ink: "light", focus: true },
      ],
      matrixTitle: "Como os atos deste cartório se relacionam aos ODS",
      matrixText:
        "Correspondência entre as atividades desta serventia, o fundamento de cada uma e os Objetivos de Desenvolvimento Sustentável, na forma do Anexo I do Provimento nº 85/2019.",
      matrix: [
        {
          activity: "Registro civil de nascimento",
          text:
            "Ato gratuito para todos, que dá à pessoa sua identidade jurídica e abre o acesso a documentos, escola, saúde e programas sociais.",
          norm: "Art. 30 da Lei nº 6.015/1973, com a redação dada pela Lei nº 9.534/1997",
          goals: [16, 10, 4],
        },
        {
          activity: "Registro de nascimento em maternidade",
          text:
            "Rio das Ostras conta com unidade interligada em maternidade: o registro é feito no próprio hospital e a família recebe alta já com a certidão de nascimento em mãos.",
          norm: "Art. 54, § 5º, da Lei nº 6.015/1973, incluído pela Lei nº 14.382/2022",
          goals: [3, 16],
        },
        {
          activity: "Registro de óbito e estatísticas vitais",
          text:
            "Os dados enviados pelos cartórios alimentam as estatísticas oficiais de mortalidade do país e orientam políticas públicas de saúde.",
          norm: "Lei nº 6.015/1973 e Sistema de Estatísticas Vitais do IBGE",
          goals: [3, 16, 17],
        },
        {
          activity: "Reconhecimento de paternidade",
          text:
            "Feito diretamente no cartório, sem processo judicial, garantindo à criança o nome do pai no registro e os direitos que dele decorrem.",
          norm: "Art. 1.609 do Código Civil, Lei nº 8.560/1992 e programa Pai Presente, do CNJ",
          goals: [5, 10, 16],
        },
        {
          activity: "Alteração de prenome e gênero",
          text:
            "A pessoa maior de 18 anos pode adequar prenome e gênero à identidade autopercebida diretamente no registro civil, sem autorização judicial.",
          norm: "Código Nacional de Normas do Foro Extrajudicial (Provimento CNJ nº 149/2023)",
          goals: [5, 10, 16],
        },
        {
          activity: "Gratuidades e isenções",
          text:
            "O registro de nascimento, o assento de óbito e a primeira certidão de cada um são gratuitos para todos. Os reconhecidamente pobres são isentos das demais certidões do registro civil.",
          norm: "Art. 30, caput e § 1º, da Lei nº 6.015/1973 e art. 5º, LXXVI, da Constituição Federal",
          goals: [10, 1, 16],
        },
        {
          activity: "Escrituras públicas e atas notariais",
          text:
            "Formalizam a compra e venda, a doação e os demais negócios sobre imóveis e produzem a prova que instrui a regularização fundiária e a usucapião extrajudicial, processadas no Registro de Imóveis. É a base da segurança da moradia.",
          norm: "Lei nº 8.935/1994 e Código Nacional de Normas do Foro Extrajudicial (Provimento CNJ nº 149/2023)",
          goals: [11, 16, 8],
        },
        {
          activity: "Inventário, divórcio e demais atos extrajudiciais",
          text:
            "Resolvem no cartório, de forma consensual, o que antes exigia processo judicial — menos litígio, menos custo e menos tempo de espera.",
          norm: "Código de Processo Civil (Lei nº 13.105/2015)",
          goals: [16, 5],
        },
        {
          activity: "Protesto de títulos",
          text:
            "Recupera créditos e resolve a inadimplência fora do Judiciário, com custo menor para quem cobra e caminho simples de regularização para quem deve.",
          norm: "Lei nº 9.492/1997",
          goals: [8, 16],
        },
        {
          activity: "Atos eletrônicos e certidões digitais",
          text:
            "Escrituras, procurações e certidões por meio digital reduzem consumo de papel, deslocamentos e emissões associadas ao transporte.",
          norm: "Sistema Eletrônico dos Registros Públicos (Lei nº 14.382/2022) e Provimento CNJ nº 149/2023",
          goals: [12, 13, 9],
        },
        {
          activity: "Atendimento por WhatsApp e inteligência artificial 24h",
          text:
            "Amplia o acesso ao serviço público delegado a qualquer hora do dia, inclusive fins de semana, sem exigir deslocamento até o balcão.",
          norm: "Iniciativa de modernização da serventia",
          goals: [9, 10, 16],
        },
        {
          activity: "Guias ao cidadão, perguntas frequentes e formulários online",
          text:
            "Informação clara e gratuita sobre documentos, prazos e valores antes do atendimento, para que ninguém perca uma viagem ao cartório.",
          norm: "Iniciativa de transparência da serventia",
          goals: [4, 16],
        },
        {
          activity: "Integração com centrais nacionais e órgãos públicos",
          text:
            "A serventia opera conectada às centrais eletrônicas do registro civil e do notariado e a outros órgãos, o que evita retrabalho e novas viagens do cidadão.",
          norm: "Centrais de serviços eletrônicos compartilhados do foro extrajudicial",
          goals: [17, 9],
        },
      ],
      spotlight: {
        title: "A meta 16.9 e o registro civil de nascimento",
        badge: "Meta 16.9",
        quote: "Até 2030, fornecer identidade legal para todos, incluindo o registro de nascimento.",
        quoteSource: "Meta 16.9 do ODS 16, da Agenda 2030 das Nações Unidas",
        text:
          "O registro civil de nascimento é o ato que faz uma pessoa existir juridicamente. Sem ele não há CPF, matrícula escolar, atendimento previdenciário nem acesso a programas sociais. É a meta da Agenda 2030 que mais diretamente depende do trabalho dos cartórios de registro civil — e o Brasil vem se aproximando dela.",
        stats: [
          {
            value: "0,95%",
            label: "Sub-registro de nascimentos no Brasil em 2024",
            note: "Primeira vez abaixo de 1% desde o início da série, em 2015, quando era 4,21%.",
          },
          {
            value: "22.902",
            label: "Crianças nascidas em 2024 sem registro no ano",
            note: "É o que a taxa de 0,95% representa em números absolutos, segundo o IBGE.",
          },
          {
            value: "0,14%",
            label: "Sub-registro de óbitos no Rio de Janeiro em 2024",
            note: "A menor taxa entre todas as unidades da federação.",
          },
        ],
        source:
          "Fonte: IBGE, Estimativas de Sub-Registro de Nascimentos e Óbitos 2024, divulgadas em 20 de maio de 2026.",
      },
      sourcesTitle: "Fontes oficiais",
      sources: [
        {
          label: "Provimento CNJ nº 85/2019",
          text: "Adoção dos ODS pelas Corregedorias e pelo Serviço Extrajudicial.",
          href: "https://atos.cnj.jus.br/atos/detalhar/2988",
        },
        {
          label: "CNJ · Agenda 2030 no Poder Judiciário",
          text: "Programa, atos normativos e ações do Conselho Nacional de Justiça.",
          href: "https://www.cnj.jus.br/programas-e-acoes/agenda-2030/",
        },
        {
          label: "ONU Brasil · Os 17 ODS",
          text: "Objetivos, metas e indicadores da Agenda 2030 em português.",
          href: "https://brasil.un.org/pt-br/sdgs",
        },
        {
          label: "Nações Unidas · ODS 16",
          text: "Texto oficial do objetivo e de todas as suas metas, incluindo a meta 16.9.",
          href: "https://sdgs.un.org/goals/goal16",
        },
        {
          label: "IBGE · Estimativas de Sub-Registro",
          text: "Série histórica do sub-registro de nascimentos e óbitos no Brasil.",
          href: "https://www.ibge.gov.br/estatisticas/sociais/populacao/26176-estimativa-do-sub-registro.html",
        },
        {
          label: "ANOREG/BR · ODS nos cartórios",
          text: "Como as serventias extrajudiciais brasileiras atuam em cada objetivo.",
          href: "https://www.anoreg.org.br/ods/",
        },
      ],
      supportLine:
        "O 1º Ofício de Justiça de Rio das Ostras apoia os Objetivos de Desenvolvimento Sustentável.",
      disclaimer:
        "As denominações e as cores dos Objetivos de Desenvolvimento Sustentável seguem o padrão das Nações Unidas. Este site não é uma publicação das Nações Unidas e seu conteúdo não reflete a posição oficial da organização.",
    },
    stats: {
      preferredYear: "2026",
      categories: {
        all: "Todos",
        civil: "Registro Civil",
        notas: "Notas e Escrituras",
        protesto: "Protesto",
        autenticacao: "Firmas",
        interdicoes: "Interdições e Tutelas",
        site: "Site",
      },
      years: {
        "2025": {
          period: "Período: 01/01/2025 a 31/12/2025.",
          items: [
            { id: "nascimentos", label: "Nascimentos", value: 1743, category: "civil" },
            { id: "obitos", label: "Óbitos", value: 994, category: "civil" },
            { id: "habilitacoes-casamento", label: "Habilitações de casamento", value: 800, category: "civil" },
            { id: "registros-casamento", label: "Registros de casamento", value: 866, category: "civil" },
            { id: "certidoes-outras-cidades", label: "Certidões externas", value: 1355, category: "civil" },
            { id: "apostilamentos-haia", label: "Apostilamentos de Haia", value: 957, category: "autenticacao" },
            { id: "total-escrituras", label: "Total de escrituras", value: 2236, category: "notas" },
            { id: "atas-notariais", label: "Atas notariais", value: 101, category: "notas" },
            { id: "compra-venda", label: "Escrituras compra e venda", value: 1048, category: "notas" },
            { id: "inventario", label: "Escrituras de inventário", value: 81, category: "notas" },
            { id: "uniao-estavel", label: "Declaração de união estável", value: 461, category: "notas" },
            { id: "dissolucao-uniao-estavel", label: "Dissolução de união estável", value: 40, category: "notas" },
            { id: "pacto-antenupcial", label: "Pacto antenupcial", value: 42, category: "notas" },
            { id: "divorcio", label: "Escrituras de divórcio", value: 70, category: "notas" },
            { id: "doacao", label: "Escrituras de doação", value: 82, category: "notas" },
            { id: "emancipacao", label: "Emancipações", value: 10, category: "notas" },
            { id: "procuracoes", label: "Procurações", value: 524, category: "notas" },
            { id: "testamentos", label: "Testamentos", value: 23, category: "notas" },
            { id: "autenticacoes", label: "Autenticações", value: 9421, category: "autenticacao" },
            { id: "reconhecimentos-firma", label: "Reconhecimentos de firma", value: 71095, category: "autenticacao" },
            { id: "protestados", label: "Títulos protestados", value: 25890, category: "protesto" },
            { id: "cancelados", label: "Títulos cancelados", value: 3232, category: "protesto" },
            { id: "pagos", label: "Títulos pagos", value: 2664, category: "protesto" },
            { id: "total-protestos", label: "Total de títulos em protesto", value: 31142, category: "protesto" },
          ],
        },
        "2026": {
          period:
            "Atos cartorários: 01/01/2026 a 13/05/2026. Visitas do site: acumulado a partir de 17/03/2026.",
          items: [
            { id: "visitas-site", label: "Visitas ao site", value: 0, category: "site" },
            { id: "reconhecimento-semelhanca", label: "Reconhecimento por semelhança", value: 13038, category: "autenticacao" },
            { id: "reconhecimento-autenticidade", label: "Reconhecimento por autenticidade", value: 10893, category: "autenticacao" },
            { id: "autenticacoes", label: "Autenticação", value: 3420, category: "autenticacao" },
            { id: "abertura-firma", label: "Abertura de firma", value: 2412, category: "autenticacao" },
            { id: "lavratura-escritura", label: "Lavratura de escritura", value: 932, category: "notas" },
            { id: "lavratura-procuracao", label: "Lavratura de procuração", value: 176, category: "notas" },
            { id: "apostilamento", label: "Apostilamento", value: 373, category: "autenticacao" },
            { id: "materializacao-documento", label: "Materialização de documento", value: 439, category: "autenticacao" },
            { id: "assinatura-eletronica-enot", label: "Assinatura eletrônica (e-Not)", value: 322, category: "autenticacao" },
            { id: "certidoes-notas", label: "Certidões (todas)", value: 165, category: "autenticacao" },
            { id: "registro-testamento", label: "Registro de testamento", value: 4, category: "notas" },
            { id: "outros-notas", label: "Outros (Notas)", value: 10, category: "autenticacao" },
            { id: "instrumento-protesto", label: "Instrumento de protesto", value: 8954, category: "protesto" },
            { id: "intimacao-protesto", label: "Intimação", value: 9931, category: "protesto" },
            { id: "protocolizacao-protesto", label: "Protocolização", value: 9076, category: "protesto" },
            { id: "liquidacao-protesto", label: "Liquidação", value: 1323, category: "protesto" },
            { id: "cancelamento-protesto", label: "Cancelamento", value: 1288, category: "protesto" },
            { id: "desistencia-protesto", label: "Desistência", value: 205, category: "protesto" },
            { id: "certidao-protesto", label: "Certidão de protesto", value: 226, category: "protesto" },
            { id: "outros-protesto", label: "Outros (Protesto)", value: 0, category: "protesto" },
            { id: "certidao-casamento", label: "Certidão de casamento", value: 410, category: "civil" },
            { id: "certidao-nascimento", label: "Certidão de nascimento", value: 318, category: "civil" },
            { id: "certidao-crc", label: "Certidão CRC", value: 380, category: "civil" },
            { id: "certidao-habilitacao-casamento", label: "Certidão de habilitação de casamento", value: 205, category: "civil" },
            { id: "certidao-obito", label: "Certidão de óbito", value: 106, category: "civil" },
            { id: "outras-certidoes-rcpn", label: "Outras certidões", value: 77, category: "civil" },
            { id: "habilitacao-casamento", label: "Habilitação de casamento", value: 261, category: "civil" },
            { id: "registro-casamento", label: "Registro de casamento", value: 236, category: "civil" },
            { id: "averbacao-casamento", label: "Averbação de casamento", value: 100, category: "civil" },
            { id: "averbacao-nascimento", label: "Averbação de nascimento", value: 44, category: "civil" },
            { id: "averbacao-obito", label: "Averbação de óbito", value: 10, category: "civil" },
            { id: "registro-nascimento-gratuito", label: "Registro de nascimento", value: 341, category: "civil" },
            { id: "registro-obito-gratuito", label: "Registro de óbito", value: 365, category: "civil" },
            { id: "processos-administrativos", label: "Processos administrativos", value: 50, category: "civil" },
            { id: "reconhecimento-paternidade", label: "Reconhecimento de paternidade", value: 16, category: "civil" },
            { id: "certidao-generica-interdicao", label: "Certidão genérica", value: 746, category: "interdicoes" },
            { id: "certidao-interdicao", label: "Certidão de interdição", value: 6, category: "interdicoes" },
            { id: "registro-interdicao", label: "Registro de interdição", value: 6, category: "interdicoes" },
          ],
        },
      },
    },
  };
})();
