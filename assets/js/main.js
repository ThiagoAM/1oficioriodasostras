document.addEventListener("DOMContentLoaded", () => {
  const data = window.SiteData || null;
  const siteRoot = document.getElementById("siteRoot");

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const linkAttrs = (href, forceExternal = false) => {
    const isExternal = forceExternal || /^https?:\/\//i.test(String(href || ""));
    return isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
  };

  const numberFormatter = new Intl.NumberFormat("pt-BR");

  const getStatsItems = (statsData) =>
    Object.values(statsData?.years || {}).flatMap((yearData) => (Array.isArray(yearData.items) ? yearData.items : []));

  const sumStatsItems = (statsData, predicate) =>
    getStatsItems(statsData).reduce((total, item) => total + (predicate(item) ? Number(item.value) || 0 : 0), 0);

  const getMetricTotal = (key) => {
    const statsData = data?.stats;
    if (!statsData) {
      return null;
    }

    if (key === "lavratura-escritura") {
      return sumStatsItems(statsData, (item) => item.id === "lavratura-escritura" || item.id === "total-escrituras");
    }

    if (key === "registro-casamento") {
      return sumStatsItems(statsData, (item) => item.id === "registro-casamento" || item.id === "registros-casamento");
    }

    if (key === "visitas-site") {
      return sumStatsItems(statsData, (item) => item.id === "visitas-site");
    }

    return null;
  };

  const updateWhyMetrics = () => {
    document.querySelectorAll("[data-metric-key]").forEach((metricElement) => {
      const key = metricElement.getAttribute("data-metric-key");
      const valueElement = metricElement.querySelector("strong");
      const total = getMetricTotal(key);
      if (!valueElement || total === null) {
        return;
      }
      valueElement.textContent = numberFormatter.format(total);
    });
  };

  const renderHeader = () => {
    const header = document.querySelector("[data-site-header]");
    if (!header || !data) {
      return;
    }

    const navLinks = data.navigation
      .map((item) => `<a class="menu-link" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
      .join("");
    const socialLinks = [
      data.contact.instagramUrl
        ? {
            href: data.contact.instagramUrl,
            label: "Instagram",
            icon: "IG",
          }
        : null,
      data.contact.facebookUrl
        ? {
            href: data.contact.facebookUrl,
            label: "Facebook",
            icon: "FB",
          }
        : null,
    ]
      .filter(Boolean)
      .map(
        (item) => `
          <a class="menu-social-link" href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(item.label)}">
            <span aria-hidden="true">${escapeHtml(item.icon)}</span>
          </a>
        `,
      )
      .join("");
    const existingMenu = document.getElementById("siteNav");
    if (existingMenu) {
      existingMenu.remove();
    }

    header.innerHTML = `
      <div class="container header-inner">
        <a href="#topo" class="brand" aria-label="${escapeHtml(data.brand.name)}">
          <img src="${escapeHtml(data.brand.logo)}" alt="${escapeHtml(data.brand.logoAlt)}" class="brand-logo" />
          <span class="brand-text">
            <span class="brand-title">${escapeHtml(data.brand.name)}</span>
            <span class="brand-subtitle">${escapeHtml(data.brand.subtitle)}</span>
          </span>
        </a>
        <div class="header-actions">
          <a class="consultation-link" href="#contato"><span aria-hidden="true"></span>Fale conosco</a>
          <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="siteNav" aria-label="Abrir menu">
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
          </button>
        </div>
      </div>
    `;

    header.insertAdjacentHTML(
      "afterend",
      `
        <nav class="menu-panel" id="siteNav" aria-hidden="true" hidden>
        <div class="container menu-grid">
          <div class="menu-aside">
            <img src="assets/images/gallery/cartorio/10.jpg" alt="Atendimento do cartório" class="menu-image" loading="lazy" />
            <a href="${escapeHtml(data.contact.phoneHref)}">${escapeHtml(data.contact.phoneLabel)}</a>
            <span>Atendimento em horário comercial</span>
            <a href="mailto:${escapeHtml(data.contact.email)}">${escapeHtml(data.contact.email)}</a>
            <span>Envie sua dúvida ou solicitação</span>
            <div class="menu-social-links" aria-label="Redes sociais">${socialLinks}</div>
          </div>
          <div class="menu-links">${navLinks}</div>
        </div>
      </nav>
      `,
    );
  };

  const renderHero = () => `
    <section class="hero" aria-labelledby="heroTitle">
      <div class="container hero-grid">
        <p class="hero-intro">${escapeHtml(data.hero.intro)}</p>
        <figure class="hero-portrait${data.hero.imageVariant === "logo" ? " hero-portrait-logo" : ""}">
          <img src="${escapeHtml(data.hero.image)}" alt="${escapeHtml(data.hero.imageAlt)}" fetchpriority="high" decoding="async" />
        </figure>
        <div class="hero-contact" aria-label="Contato rápido">
          <a href="${escapeHtml(data.contact.phoneHref)}">${escapeHtml(data.contact.phoneLabel)}</a>
          <span>Telefone / WhatsApp</span>
          <a href="mailto:${escapeHtml(data.contact.email)}">${escapeHtml(data.contact.email)}</a>
          <span>E-mail geral</span>
        </div>
        <div class="hero-title-wrap">
          ${data.hero.eyebrow ? `<p class="hero-kicker">${escapeHtml(data.hero.eyebrow)}</p>` : ""}
          <h1 class="hero-title" id="heroTitle">
            ${data.hero.titleLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
          </h1>
        </div>
        ${data.hero.sideNote ? `<p class="hero-note">${escapeHtml(data.hero.sideNote)}</p>` : ""}
      </div>
    </section>
  `;

  const renderPhilosophy = () => `
    <section class="section section-light philosophy-section">
      <div class="container philosophy-grid">
        <div>
          <p class="section-kicker">${escapeHtml(data.philosophy.kicker)}</p>
          <blockquote class="philosophy-quote">“${escapeHtml(data.philosophy.quote)}”</blockquote>
        </div>
        <figure class="philosophy-media">
          <img src="${escapeHtml(data.philosophy.image)}" alt="${escapeHtml(data.philosophy.imageAlt)}" loading="lazy" decoding="async" />
        </figure>
        ${
          data.philosophy.link
            ? `<a class="text-link" href="${escapeHtml(data.philosophy.link.href)}">${escapeHtml(data.philosophy.link.label)} <span aria-hidden="true">→</span></a>`
            : ""
        }
      </div>
    </section>
  `;

  const renderPracticeAreas = () => `
    <section class="section section-light" id="servicos">
      <div class="container editorial-grid">
        <p class="section-kicker">${escapeHtml(data.practiceAreas.kicker)}</p>
        <figure class="editorial-image">
          <img src="${escapeHtml(data.practiceAreas.image)}" alt="${escapeHtml(data.practiceAreas.imageAlt)}" loading="lazy" decoding="async" />
        </figure>
        <div class="editorial-copy">
          <h2 class="section-title">${escapeHtml(data.practiceAreas.title)}</h2>
          <p class="section-subtitle">${escapeHtml(data.practiceAreas.text)}</p>
        </div>
      </div>
      <div class="container practice-list">
        ${data.practiceAreas.items
          .map(
            (item) => `
              <article class="practice-card">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;

  const renderWhyChoose = () => `
    <section class="section section-dark why-section">
      <div class="container why-grid">
        <div class="why-copy">
          <p class="section-kicker">${escapeHtml(data.whyChoose.kicker)}</p>
          <h2 class="section-title">${escapeHtml(data.whyChoose.title)}</h2>
          <p>${escapeHtml(data.whyChoose.text)}</p>
          <ul class="line-list">
            ${data.whyChoose.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
        <figure class="why-image">
          <img src="${escapeHtml(data.whyChoose.image)}" alt="${escapeHtml(data.whyChoose.imageAlt)}" loading="lazy" decoding="async" />
        </figure>
        <div class="metric-stack">
          ${data.whyChoose.metrics
            .map(
              (metric) => `
                <div class="metric" data-metric-key="${escapeHtml(metric.key || "")}">
                  <span>${escapeHtml(metric.label)}</span>
                  <strong>${escapeHtml(metric.value)}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;

  const renderOnlineServices = () => `
    <section class="section section-light" id="online">
      <div class="container split-heading">
        <p class="section-kicker">${escapeHtml(data.onlineServices.kicker)}</p>
        <div>
          <h2 class="section-title">${escapeHtml(data.onlineServices.title)}</h2>
          <p class="section-subtitle">${escapeHtml(data.onlineServices.text)}</p>
        </div>
      </div>
      <div class="container case-grid">
        ${data.onlineServices.cards
          .map(
            (item) => `
              <a class="case-card" href="${escapeHtml(item.href)}"${linkAttrs(item.href, item.external)}>
                <span>${escapeHtml(item.meta)}</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
                <strong>Iniciar <span aria-hidden="true">→</span></strong>
              </a>
            `,
          )
          .join("")}
      </div>
    </section>
    <section class="section section-muted" id="formularios-impressao">
      <div class="container split-heading">
        <p class="section-kicker">${escapeHtml(data.paperForms.kicker)}</p>
        <h2 class="section-title">${escapeHtml(data.paperForms.title)}</h2>
      </div>
      <div class="container paper-forms-grid">
        ${data.paperForms.cards
          .map(
            (item) => `
              <article class="paper-form-card">
                <h3 class="paper-form-title">${escapeHtml(item.title)}</h3>
                <p class="paper-form-meta">${escapeHtml(item.text)}</p>
                <a class="btn btn-primary paper-form-download" href="${escapeHtml(item.href)}">Preencher e imprimir</a>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;

  const renderGuides = () => `
    <section class="section section-light" id="guias-cidadao">
      <div class="container guides-layout">
        <div class="guides-intro">
          <p class="section-kicker">${escapeHtml(data.guides.kicker)}</p>
          <h2 class="section-title">${escapeHtml(data.guides.title)}</h2>
          <p class="section-subtitle">${escapeHtml(data.guides.text)}</p>
        </div>
        <div class="guide-groups">
          ${data.guides.groups
            .map(
              (group, index) => `
                <details class="guide-group"${index === 0 ? " open" : ""}>
                  <summary>${escapeHtml(group.title)} <span aria-hidden="true">+</span></summary>
                  <div class="guide-links">
                    ${group.links
                      .map(
                        (link) => `
                          <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">
                            ${escapeHtml(link.title)}
                          </a>
                        `,
                      )
                      .join("")}
                  </div>
                </details>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;

  const renderHoursLocation = () => `
    <section class="section section-dark" id="horario">
      <div class="container hours-grid">
        <div>
          <p class="section-kicker">${escapeHtml(data.hours.kicker)}</p>
          <h2 class="section-title">${escapeHtml(data.hours.title)}</h2>
          <p class="section-subtitle">${escapeHtml(data.hours.intro)}</p>
        </div>
        <div class="hours-list">
          ${data.hours.items
            .map(
              (item) => `
                <article class="hours-item">
                  <strong>${escapeHtml(item.title)}</strong>
                  <p>${escapeHtml(item.text)}</p>
                </article>
              `,
            )
            .join("")}
          <p class="hours-note">${escapeHtml(data.hours.note)}</p>
        </div>
      </div>
    </section>
    <section class="section section-light" id="localizacao">
      <div class="container location-grid">
        <div class="location-text">
          <p class="section-kicker">${escapeHtml(data.location.kicker)}</p>
          <h2 class="section-title">${escapeHtml(data.location.title)}</h2>
          <p class="section-subtitle">${escapeHtml(data.location.text)}</p>
          <ul class="contact-list">
            <li><strong>Endereço</strong><span>${escapeHtml(data.contact.addressName)}</span>${data.contact.addressLines
              .map((line) => `<span>${escapeHtml(line)}</span>`)
              .join("")}</li>
            <li><strong>Telefone / WhatsApp</strong><a href="${escapeHtml(data.contact.phoneHref)}">${escapeHtml(data.contact.phoneLabel)}</a></li>
            <li><strong>E-mail</strong><a href="mailto:${escapeHtml(data.contact.email)}">${escapeHtml(data.contact.email)}</a></li>
          </ul>
          <a class="btn btn-primary" href="${escapeHtml(data.contact.mapsUrl)}" target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a>
        </div>
        <a class="location-map-wrapper location-map-link" href="${escapeHtml(data.contact.mapsUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir localização do cartório no Google Maps">
          <span class="map-pin" aria-hidden="true"></span>
          <span class="map-label">
            <strong>1º Ofício de Justiça</strong>
            <span>${escapeHtml(data.contact.addressLines[0])}</span>
          </span>
          <span class="map-action">Abrir no Google Maps <span aria-hidden="true">→</span></span>
        </a>
      </div>
    </section>
  `;

  const renderAbout = () => `
    <section class="section section-muted" id="sobre">
      <div class="container about-grid">
        <p class="section-kicker">${escapeHtml(data.about.kicker)}</p>
        <figure class="about-image-wrapper">
          <img src="${escapeHtml(data.about.image)}" alt="${escapeHtml(data.about.imageAlt)}" class="about-image" loading="lazy" decoding="async" />
        </figure>
        <div class="about-text">
          <h2 class="section-title">${escapeHtml(data.about.title)}</h2>
          ${data.about.body.map((paragraph) => `<p class="about-body">${escapeHtml(paragraph)}</p>`).join("")}
        </div>
      </div>
    </section>
  `;

  const renderGallery = () => `
    <section class="section section-dark gallery-section" id="galeria">
      <div class="container split-heading">
        <p class="section-kicker">Cartório e cidade</p>
        <div>
          <h2 class="section-title">Rio das Ostras em fotos.</h2>
          <p class="section-subtitle">Registros do cartório e de pontos da cidade, preservados em uma galeria leve e filtrável.</p>
        </div>
      </div>
      <div class="container gallery-toolbar">
        <div class="stats-year-switch" id="galleryCategoryControls" role="group" aria-label="Filtrar fotos da galeria">
          <button type="button" class="stats-year-btn is-active" data-gallery-filter="all" aria-pressed="true">Tudo</button>
          <button type="button" class="stats-year-btn" data-gallery-filter="cartorio" aria-pressed="false">Cartório</button>
          <button type="button" class="stats-year-btn" data-gallery-filter="rio-das-ostras" aria-pressed="false">Rio das Ostras</button>
        </div>
      </div>
      <div class="container gallery-stage">
        <button class="gallery-page-btn gallery-page-prev" id="galleryPagePrev" type="button" aria-label="Fotos anteriores">&lt;</button>
        <div class="gallery-masonry" id="galleryMasonry" aria-label="Galeria de fotos do cartório e de Rio das Ostras"></div>
        <button class="gallery-page-btn gallery-page-next" id="galleryPageNext" type="button" aria-label="Próximas fotos">&gt;</button>
      </div>
      <p class="container gallery-page-status" id="galleryPageStatus" aria-live="polite"></p>
      <div class="gallery-lightbox" id="galleryLightbox" aria-hidden="true">
        <button class="lightbox-close" id="lightboxClose" type="button" aria-label="Fechar visualização">×</button>
        <button class="lightbox-nav lightbox-nav-prev" id="lightboxPrev" type="button" aria-label="Imagem anterior">‹</button>
        <figure class="lightbox-figure">
          <div class="lightbox-loading" id="lightboxLoading">Carregando imagem...</div>
          <img id="lightboxImage" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Visualização ampliada da galeria" />
        </figure>
        <button class="lightbox-nav lightbox-nav-next" id="lightboxNext" type="button" aria-label="Próxima imagem">›</button>
      </div>
    </section>
  `;

  const renderStats = () => {
    const stats = data.stats;
    const yearButtons = Object.keys(stats.years)
      .map(
        (year) => `
          <button type="button" class="stats-year-btn${year === stats.preferredYear ? " is-active" : ""}" data-stats-year="${escapeHtml(year)}" aria-pressed="${year === stats.preferredYear ? "true" : "false"}">${escapeHtml(year)}</button>
        `,
      )
      .join("");
    const categoryButtons = Object.entries(stats.categories)
      .map(
        ([key, label]) => `
          <button type="button" class="stats-type-btn${key === "all" ? " is-active" : ""}" data-stats-type="${escapeHtml(key)}" aria-pressed="${key === "all" ? "true" : "false"}">${escapeHtml(label)}</button>
        `,
      )
      .join("");

    return `
      <section class="section section-dark stats-section" id="estatisticas">
        <div class="container split-heading">
          <p class="section-kicker">Números do cartório</p>
          <div>
            <h2 class="section-title">Indicadores por ano.</h2>
            <p class="section-subtitle">Consulte os principais números do cartório, organizados por período e tipo de serviço.</p>
          </div>
        </div>
        <div class="container stats-toolbar stats-controls">
          <div class="stats-year-switch" id="statsYearControls" role="group" aria-label="Selecionar ano dos dados">${yearButtons}</div>
          <div class="stats-type-switch" id="statsTypeControls" role="group" aria-label="Filtrar por tipo de ato">${categoryButtons}</div>
        </div>
        <div class="container">
          <div class="stats-grid" id="statsGrid" aria-live="polite"></div>
          <p class="stats-period stats-period-bottom" id="statsPeriodLabel" aria-live="polite"></p>
        </div>
      </section>
    `;
  };

  const renderUsefulLinks = () => `
    <section class="section section-light useful-links-section" id="links-uteis">
      <div class="container split-heading">
        <p class="section-kicker">${escapeHtml(data.usefulLinks.kicker)}</p>
        <h2 class="section-title">${escapeHtml(data.usefulLinks.title)}</h2>
      </div>
      <div class="container useful-links-grid">
        ${data.usefulLinks.links
          .map(
            (link) => `
              <a class="useful-link-card" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">
                <h3 class="useful-link-title">${escapeHtml(link.title)}</h3>
                <p class="useful-link-text">${escapeHtml(link.text)}</p>
                <span class="useful-link-action">Acessar <span aria-hidden="true">→</span></span>
              </a>
            `,
          )
          .join("")}
      </div>
    </section>
  `;

  const renderFaq = () => `
    <section class="section section-muted faq-section" id="faq">
      <div class="container split-heading">
        <p class="section-kicker">Perguntas frequentes</p>
        <div>
          <h2 class="section-title">Dúvidas mais comuns.</h2>
          <p class="section-subtitle">Encontre respostas sobre os serviços, documentos, valores e prazos do atendimento.</p>
        </div>
      </div>
      <div class="container faq-controls">
        <div class="faq-search-wrap">
          <label for="faqSearchInput" class="faq-search-label">Buscar na FAQ</label>
          <input id="faqSearchInput" type="search" class="faq-search-input" placeholder="Ex.: documentos casamento, valores, óbito..." autocomplete="off" />
        </div>
        <div class="faq-chip-row" id="faqCategoryChips" aria-label="Filtrar por categoria"></div>
      </div>
      <div class="container faq-meta">
        <p class="faq-result-count" id="faqResultCount" aria-live="polite"></p>
        <button type="button" class="faq-reset-btn" id="faqResetBtn">Limpar filtros</button>
      </div>
      <div class="container faq-list" id="faqList"></div>
      <div class="faq-show-more-wrap">
        <button type="button" class="faq-show-more-btn" id="faqShowMoreBtn" hidden>Mostrar mais</button>
      </div>
    </section>
  `;

  const renderContact = () => `
    <section class="section section-light" id="contato">
      <div class="container contact-grid">
        <div class="contact-text">
          <p class="section-kicker">Fale conosco</p>
          <h2 class="section-title">${escapeHtml(data.contactForm.title)}</h2>
          <p class="section-subtitle">${escapeHtml(data.contactForm.text)}</p>
          <ul class="contact-list contact-list-inline">
            <li><strong>Horário</strong><span>Segunda a sexta-feira, das 9h às 17h.</span></li>
            <li><strong>WhatsApp</strong><a href="${escapeHtml(data.contact.whatsappUrl)}" target="_blank" rel="noopener">${escapeHtml(data.contact.phoneLabel)}</a></li>
            <li><strong>E-mail</strong><a href="mailto:${escapeHtml(data.contact.email)}">${escapeHtml(data.contact.email)}</a></li>
            <li><strong>Instagram</strong><a href="${escapeHtml(data.contact.instagramUrl)}" target="_blank" rel="noopener">${escapeHtml(data.contact.instagramLabel)}</a></li>
            <li><strong>Facebook</strong><a href="${escapeHtml(data.contact.facebookUrl)}" target="_blank" rel="noopener">${escapeHtml(data.contact.facebookLabel)}</a></li>
          </ul>
        </div>
        <div class="contact-form-card">
          <form id="contactForm" action="${escapeHtml(data.contactForm.action)}" method="POST" class="contact-form">
            <input type="hidden" name="access_key" value="${escapeHtml(data.contactForm.accessKey)}" />
            <input type="hidden" name="subject" value="${escapeHtml(data.contactForm.subject)}" />
            <input type="hidden" name="from_name" value="Site 1º Ofício Rio das Ostras" />
            <input type="hidden" name="redirect" value="${escapeHtml(data.contactForm.redirect)}" />
            <input type="checkbox" name="botcheck" class="hidden" style="display:none" />
            <div class="field-group">
              <label for="nome" class="field-label">Nome completo *</label>
              <input type="text" id="nome" name="name" class="field-input" required />
            </div>
            <div class="field-grid">
              <div class="field-group">
                <label for="email" class="field-label">E-mail *</label>
                <input type="email" id="email" name="email" class="field-input" required />
              </div>
              <div class="field-group">
                <label for="telefone" class="field-label">Telefone / WhatsApp *</label>
                <input type="tel" id="telefone" name="phone" class="field-input" placeholder="(22) 99999-9999" required />
              </div>
            </div>
            <div class="field-group">
              <label for="tipo" class="field-label">Assunto / tipo de serviço *</label>
              <select id="tipo" name="tipo_de_servico" class="field-input" required>
                <option value="">Selecione uma opção</option>
                ${data.contactForm.options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
              </select>
            </div>
            <div class="field-group">
              <label for="mensagem" class="field-label">Mensagem *</label>
              <textarea id="mensagem" name="message" class="field-input field-textarea" rows="5" required></textarea>
            </div>
            <p class="form-helper">Ao enviar esta mensagem, você concorda com o tratamento dos dados informados exclusivamente para retorno de contato e prestação de informações sobre os serviços do cartório.</p>
            <button type="submit" class="btn btn-primary btn-full">Enviar mensagem</button>
            <p id="formStatus" class="form-status" aria-live="polite"></p>
          </form>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => {
    const footer = document.querySelector("[data-site-footer]");
    if (!footer || !data) {
      return;
    }

    footer.innerHTML = `
      <section class="hero-news" id="heroNews" aria-labelledby="heroNewsTitle">
        <div class="container split-heading">
          <p class="section-kicker">Últimas notícias</p>
          <h2 class="hero-news-title" id="heroNewsTitle">Atualizações do setor extrajudicial.</h2>
        </div>
        <div class="container">
          <p class="hero-news-status" id="heroNewsStatus" role="status" aria-live="polite">Carregando notícias...</p>
          <div class="hero-news-marquee" id="heroNewsMarquee" hidden>
            <div class="hero-news-track" id="heroNewsTrack"></div>
          </div>
        </div>
      </section>
      <div class="container footer-grid">
        <div class="footer-brand">
          <div class="footer-logo-row">
            <img src="${escapeHtml(data.brand.logo)}" alt="${escapeHtml(data.brand.logoAlt)}" class="footer-logo" />
            <div class="footer-brand-text">
              <span class="footer-brand-title">${escapeHtml(data.brand.name)} de Rio das Ostras</span>
              <span class="footer-brand-subtitle">${escapeHtml(data.brand.subtitle)}</span>
            </div>
          </div>
          <p class="footer-copy">&copy; 2026, 1º Ofício de Justiça da Comarca de Rio das Ostras/RJ. Todos os direitos reservados.</p>
        </div>
        <div class="footer-column">
          <h3 class="footer-title">Menu</h3>
          <ul class="footer-contact-list">
            ${data.navigation.map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`).join("")}
          </ul>
        </div>
        <div class="footer-column">
          <h3 class="footer-title">Contato</h3>
          <ul class="footer-contact-list">
            <li><strong>Telefone / WhatsApp</strong><br /><a href="${escapeHtml(data.contact.phoneHref)}">${escapeHtml(data.contact.phoneLabel)}</a></li>
            <li><strong>E-mail geral</strong><br /><a href="mailto:${escapeHtml(data.contact.email)}">${escapeHtml(data.contact.email)}</a></li>
            <li><strong>Endereço</strong><br />${data.contact.addressLines.map(escapeHtml).join("<br />")}</li>
          </ul>
        </div>
      </div>
      <a href="${escapeHtml(data.contact.whatsappUrl)}" target="_blank" rel="noopener" class="whatsapp-float" aria-label="Iniciar conversa no WhatsApp">
        <svg aria-hidden="true" viewBox="0 0 32 32" focusable="false">
          <path d="M16 4.2A11.6 11.6 0 0 0 6.1 21.8L4.7 27.3l5.6-1.4A11.6 11.6 0 1 0 16 4.2Zm0 2.3a9.3 9.3 0 0 1 0 18.6 9.1 9.1 0 0 1-4.7-1.3l-.4-.2-3.1.8.8-3-.3-.5A9.3 9.3 0 0 1 16 6.5Zm-3.6 4.7c-.2 0-.5.1-.7.4-.2.3-.9 1-.9 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.2 5 4.3 2.4.9 3 .7 3.5.6.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.4l-1.9-.9c-.3-.1-.5-.2-.7.1l-.9 1.1c-.2.2-.4.3-.7.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5.1-.2.1-.4 0-.6l-.8-1.9c-.2-.4-.4-.4-.6-.4h-.8Z" />
        </svg>
      </a>
    `;
  };

  const renderHomePage = () => {
    if (!siteRoot || !data) {
      return;
    }

    siteRoot.innerHTML = [
      renderHero(),
      renderPhilosophy(),
      renderPracticeAreas(),
      renderWhyChoose(),
      renderOnlineServices(),
      renderGuides(),
      renderHoursLocation(),
      renderAbout(),
      renderGallery(),
      renderStats(),
      renderUsefulLinks(),
      renderFaq(),
      renderContact(),
    ].join("");
  };

  const initNavigation = () => {
    const navToggle = document.getElementById("navToggle");
    const siteNav = document.getElementById("siteNav");

    if (!navToggle || !siteNav) {
      return;
    }

    const setOpen = (isOpen) => {
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
      siteNav.hidden = !isOpen;
      siteNav.setAttribute("aria-hidden", isOpen ? "false" : "true");
      document.body.classList.toggle("no-scroll", isOpen);
    };

    navToggle.addEventListener("click", () => {
      setOpen(siteNav.hidden);
    });

    siteNav.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (target) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !siteNav.hidden) {
        setOpen(false);
      }
    });
  };

  const initStatsSection = () => {
    const statsGrid = document.getElementById("statsGrid");
    const statsYearControls = document.getElementById("statsYearControls");
    const statsTypeControls = document.getElementById("statsTypeControls");
    const statsPeriodLabel = document.getElementById("statsPeriodLabel");
    const statsData = data?.stats;

    if (!statsGrid || !statsYearControls || !statsTypeControls || !statsPeriodLabel || !statsData) {
      return;
    }

    const yearButtons = Array.from(statsYearControls.querySelectorAll("[data-stats-year]"));
    const typeButtons = Array.from(statsTypeControls.querySelectorAll("[data-stats-type]"));
    const years = Object.keys(statsData.years);
    let activeYear = statsData.years[statsData.preferredYear] ? statsData.preferredYear : years[0];
    let activeType = "all";

    const setPressed = (buttons, attr, value) => {
      buttons.forEach((button) => {
        const isActive = button.getAttribute(attr) === value;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    const render = () => {
      const yearData = statsData.years[activeYear];
      if (!yearData) {
        return;
      }

      const items =
        activeType === "all" ? yearData.items : yearData.items.filter((item) => item.category === activeType);

      statsGrid.classList.toggle("stats-grid--compact", items.length <= 2);
      statsGrid.innerHTML = items
        .map(
          (item) => `
            <article class="stats-card">
              <span>${escapeHtml(statsData.categories[item.category] || item.category)}</span>
              <strong>${escapeHtml(numberFormatter.format(item.value))}</strong>
              <h3>${escapeHtml(item.label)}</h3>
            </article>
          `,
        )
        .join("");

      statsPeriodLabel.textContent = yearData.period;
      setPressed(yearButtons, "data-stats-year", activeYear);
      setPressed(typeButtons, "data-stats-type", activeType);
      updateWhyMetrics();
    };

    yearButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const year = button.getAttribute("data-stats-year");
        if (!year || !statsData.years[year] || year === activeYear) {
          return;
        }
        activeYear = year;
        render();
      });
    });

    typeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.getAttribute("data-stats-type") || "all";
        if (type === activeType) {
          return;
        }
        activeType = type;
        render();
      });
    });

    render();

    const getSiteVisitsApi = () =>
      new Promise((resolve) => {
        if (window.SiteVisits && typeof window.SiteVisits.loadYearlyVisits === "function") {
          resolve(window.SiteVisits);
          return;
        }

        const timeoutId = window.setTimeout(() => {
          window.removeEventListener("sitevisits:ready", handleReady);
          resolve(window.SiteVisits || null);
        }, 4000);

        const handleReady = () => {
          window.clearTimeout(timeoutId);
          resolve(window.SiteVisits || null);
        };

        window.addEventListener("sitevisits:ready", handleReady, { once: true });
      });

    void (async () => {
      const siteVisitsApi = await getSiteVisitsApi();
      try {
        if (siteVisitsApi && typeof siteVisitsApi.loadYearlyVisits === "function") {
          const visitCounts = await siteVisitsApi.loadYearlyVisits(years);
          years.forEach((year) => {
            const visits = Number(visitCounts[year]) || 0;
            const yearData = statsData.years[year];
            if (!yearData) {
              return;
            }
            yearData.items = yearData.items.map((item) =>
              item.id === "visitas-site" ? { ...item, value: visits } : item,
            );
          });
          render();
          updateWhyMetrics();
        }
      } catch (_error) {
        render();
      } finally {
        if (siteVisitsApi && typeof siteVisitsApi.startInitialVisitTracking === "function") {
          void siteVisitsApi.startInitialVisitTracking();
        }
      }
    })();
  };

  const initFaq = () => {
    const faqList = document.getElementById("faqList");
    const faqSearchInput = document.getElementById("faqSearchInput");
    const faqCategoryChips = document.getElementById("faqCategoryChips");
    const faqResultCount = document.getElementById("faqResultCount");
    const faqResetBtn = document.getElementById("faqResetBtn");
    const faqShowMoreBtn = document.getElementById("faqShowMoreBtn");

    if (!faqList || !faqSearchInput || !faqCategoryChips || !faqResultCount || !faqResetBtn || !faqShowMoreBtn) {
      return;
    }

    const faqItems = Array.isArray(window.FAQ_ITEMS) ? window.FAQ_ITEMS : [];
    const maxVisible = 12;
    let activeCategory = "Todas";
    let searchTerm = "";
    let showAll = false;

    if (faqItems.length === 0) {
      faqResultCount.textContent = "FAQ em atualização.";
      faqList.innerHTML = '<p class="faq-empty">As perguntas frequentes estão sendo atualizadas no momento.</p>';
      return;
    }

    const categories = ["Todas", ...new Set(faqItems.map((item) => item.category).filter(Boolean))];

    const buildAnswerHtml = (lines) => {
      const normalizedLines = Array.isArray(lines) ? lines : [String(lines ?? "")];
      let html = "";
      let listOpen = false;

      normalizedLines.forEach((lineRaw) => {
        const line = String(lineRaw ?? "").trim();
        if (!line) {
          if (listOpen) {
            html += "</ul>";
            listOpen = false;
          }
          return;
        }

        if (line.startsWith("- ")) {
          if (!listOpen) {
            html += '<ul class="faq-answer-list">';
            listOpen = true;
          }
          html += `<li>${escapeHtml(line.slice(2).trim())}</li>`;
          return;
        }

        if (listOpen) {
          html += "</ul>";
          listOpen = false;
        }

        html += `<p>${escapeHtml(line)}</p>`;
      });

      if (listOpen) {
        html += "</ul>";
      }

      return html;
    };

    const tokenize = (value) =>
      normalize(value)
        .split(/[\s,.;:!?()[\]{}"'/\\-]+/)
        .filter(Boolean);

    const getFilteredItems = () => {
      const tokens = tokenize(searchTerm);
      return faqItems.filter((item) => {
        if (activeCategory !== "Todas" && item.category !== activeCategory) {
          return false;
        }

        if (tokens.length === 0) {
          return true;
        }

        const haystack = normalize(
          [
            item.question,
            item.category,
            ...(Array.isArray(item.tags) ? item.tags : []),
            ...(Array.isArray(item.answer) ? item.answer : [item.answer]),
          ].join(" "),
        );

        return tokens.every((token) => haystack.includes(token));
      });
    };

    const renderCategoryChips = () => {
      faqCategoryChips.innerHTML = categories
        .map(
          (category) => `
            <button type="button" class="faq-chip${category === activeCategory ? " is-active" : ""}" data-faq-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
          `,
        )
        .join("");

      faqCategoryChips.querySelectorAll(".faq-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const category = chip.getAttribute("data-faq-category");
          if (!category || category === activeCategory) {
            return;
          }
          activeCategory = category;
          showAll = false;
          renderCategoryChips();
          renderFaqItems();
        });
      });
    };

    const renderFaqItems = () => {
      const filtered = getFilteredItems();
      const visible = showAll ? filtered : filtered.slice(0, maxVisible);
      const canToggle = filtered.length > maxVisible;

      faqResultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "pergunta encontrada" : "perguntas encontradas"}.`;
      faqShowMoreBtn.hidden = !canToggle;
      faqShowMoreBtn.textContent = showAll ? "Mostrar menos" : "Mostrar mais";

      if (filtered.length === 0) {
        faqList.innerHTML = '<p class="faq-empty">Nenhum resultado encontrado. Tente outro termo ou escolha outra categoria.</p>';
        return;
      }

      faqList.innerHTML = visible
        .map(
          (item, index) => `
            <details class="faq-item">
              <summary class="faq-question">
                <span>${escapeHtml(item.question)}</span>
                <span aria-hidden="true">+</span>
              </summary>
              <div class="faq-answer">${buildAnswerHtml(item.answer)}</div>
            </details>
          `,
        )
        .join("");
    };

    faqSearchInput.addEventListener("input", () => {
      searchTerm = faqSearchInput.value;
      showAll = false;
      renderFaqItems();
    });

    faqResetBtn.addEventListener("click", () => {
      activeCategory = "Todas";
      searchTerm = "";
      showAll = false;
      faqSearchInput.value = "";
      renderCategoryChips();
      renderFaqItems();
      faqSearchInput.focus();
    });

    faqShowMoreBtn.addEventListener("click", () => {
      showAll = !showAll;
      renderFaqItems();
    });

    renderCategoryChips();
    renderFaqItems();
  };

  const initGallery = () => {
    const galleryMasonry = document.getElementById("galleryMasonry");
    const controls = document.getElementById("galleryCategoryControls");
    const pagePrevBtn = document.getElementById("galleryPagePrev");
    const pageNextBtn = document.getElementById("galleryPageNext");
    const pageStatus = document.getElementById("galleryPageStatus");
    const lightbox = document.getElementById("galleryLightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxLoading = document.getElementById("lightboxLoading");
    const closeBtn = document.getElementById("lightboxClose");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");

    if (!galleryMasonry) {
      return;
    }

    const normalizeCategory = (value, pathValue) => {
      const raw = String(value || "").trim().toLowerCase();
      if (raw === "cartorio" || raw === "rio-das-ostras") {
        return raw;
      }
      const pathRaw = String(pathValue || "").toLowerCase();
      if (pathRaw.includes("/gallery/cartorio/")) {
        return "cartorio";
      }
      if (pathRaw.includes("/gallery/rio-das-ostras/")) {
        return "rio-das-ostras";
      }
      return "";
    };

    const images = Array.isArray(window.GALLERY_IMAGES)
      ? window.GALLERY_IMAGES.map((entry) => {
          const full = typeof entry === "string" ? entry : String(entry?.full || entry?.src || entry?.path || "");
          const category = normalizeCategory(typeof entry === "object" ? entry.category : "", full);
          if (!full || !category) {
            return null;
          }
          return {
            full,
            thumb: typeof entry === "object" && entry.thumb ? entry.thumb : full,
            category,
          };
        }).filter(Boolean)
      : [];

    if (images.length === 0) {
      galleryMasonry.innerHTML = '<p class="faq-empty">Galeria em atualização.</p>';
      return;
    }

    let activeFilter = "all";
    let displayImages = images;
    let activeIndex = 0;
    let galleryPage = 0;
    let currentPageSize = 8;

    const getGalleryPageSize = () => {
      const columns = window.matchMedia("(max-width: 820px)").matches ? 1 : window.matchMedia("(max-width: 1080px)").matches ? 2 : 4;
      return columns * 2;
    };

    const renderImages = () => {
      displayImages =
        activeFilter === "all" ? images : images.filter((image) => image.category === activeFilter);
      currentPageSize = getGalleryPageSize();
      const pageCount = Math.max(1, Math.ceil(displayImages.length / currentPageSize));
      galleryPage = Math.min(galleryPage, pageCount - 1);
      const start = galleryPage * currentPageSize;
      const pageImages = displayImages.slice(start, start + currentPageSize);

      galleryMasonry.innerHTML = pageImages
        .map(
          (image, index) => `
            <button class="gallery-tile" type="button" data-index="${start + index}" aria-label="Abrir foto ${start + index + 1}">
              <img src="${escapeHtml(image.thumb)}" data-full="${escapeHtml(image.full)}" alt="Foto da galeria do cartório e de Rio das Ostras" loading="${index < 6 ? "eager" : "lazy"}" decoding="async" />
            </button>
          `,
        )
        .join("");

      const hasMultiplePages = pageCount > 1;
      if (pagePrevBtn) {
        pagePrevBtn.disabled = !hasMultiplePages;
      }
      if (pageNextBtn) {
        pageNextBtn.disabled = !hasMultiplePages;
      }
      if (pageStatus) {
        pageStatus.textContent = hasMultiplePages ? `Página ${galleryPage + 1} de ${pageCount}` : "";
      }
    };

    const setFilter = (filter) => {
      activeFilter = filter === "cartorio" || filter === "rio-das-ostras" ? filter : "all";
      galleryPage = 0;
      controls?.querySelectorAll("[data-gallery-filter]").forEach((button) => {
        const isActive = button.getAttribute("data-gallery-filter") === activeFilter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      renderImages();
    };

    const loadLightboxImage = (index) => {
      if (!lightboxImage || !lightboxLoading || displayImages.length === 0) {
        return;
      }
      activeIndex = (index + displayImages.length) % displayImages.length;
      const item = displayImages[activeIndex];
      lightboxLoading.classList.remove("is-hidden");
      lightboxImage.src = item.thumb;
      const loader = new Image();
      loader.decoding = "async";
      loader.onload = () => {
        lightboxImage.src = item.full;
        lightboxLoading.classList.add("is-hidden");
      };
      loader.onerror = () => {
        lightboxLoading.classList.add("is-hidden");
      };
      loader.src = item.full;
    };

    const openLightbox = (index) => {
      if (!lightbox) {
        return;
      }
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      loadLightboxImage(index);
    };

    const closeLightbox = () => {
      if (!lightbox || !lightboxImage) {
        return;
      }
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      document.body.classList.remove("no-scroll");
    };

    galleryMasonry.addEventListener("click", (event) => {
      const tile = event.target instanceof Element ? event.target.closest(".gallery-tile") : null;
      if (!tile) {
        return;
      }
      const index = Number(tile.getAttribute("data-index"));
      if (Number.isFinite(index)) {
        openLightbox(index);
      }
    });

    controls?.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-gallery-filter]") : null;
      if (!button) {
        return;
      }
      setFilter(button.getAttribute("data-gallery-filter") || "all");
    });

    pagePrevBtn?.addEventListener("click", () => {
      const pageCount = Math.max(1, Math.ceil(displayImages.length / currentPageSize));
      galleryPage = (galleryPage - 1 + pageCount) % pageCount;
      renderImages();
    });
    pageNextBtn?.addEventListener("click", () => {
      const pageCount = Math.max(1, Math.ceil(displayImages.length / currentPageSize));
      galleryPage = (galleryPage + 1) % pageCount;
      renderImages();
    });
    window.addEventListener("resize", renderImages);

    closeBtn?.addEventListener("click", closeLightbox);
    prevBtn?.addEventListener("click", () => loadLightboxImage(activeIndex - 1));
    nextBtn?.addEventListener("click", () => loadLightboxImage(activeIndex + 1));
    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (!lightbox?.classList.contains("is-open")) {
        return;
      }
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        loadLightboxImage(activeIndex - 1);
      } else if (event.key === "ArrowRight") {
        loadLightboxImage(activeIndex + 1);
      }
    });

    setFilter("all");
  };

  const initHeroNews = () => {
    const status = document.getElementById("heroNewsStatus");
    const marquee = document.getElementById("heroNewsMarquee");
    const track = document.getElementById("heroNewsTrack");
    if (!status || !marquee || !track) {
      return;
    }

    const newsFeedUrl = "https://thiagoam.github.io/noticias-cartorio-rio-das-ostras/noticias.json";
    const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

    const parseDate = (value) => {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const truncate = (value, maxLength) => {
      const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
      if (normalized.length <= maxLength) {
        return normalized;
      }
      return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
    };

    const renderNews = (items) => {
      const selectedItems = items.slice(0, 8);
      const cardsHtml = selectedItems
        .map(
          (item) => `
            <a class="news-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
              <span>${escapeHtml(item.fonte)} · ${escapeHtml(dateFormatter.format(item.date))}</span>
              <h3>${escapeHtml(item.titulo)}</h3>
              <p>${escapeHtml(truncate(item.descricao, 150))}</p>
            </a>
          `,
        )
        .join("");
      track.innerHTML = `
        <div class="hero-news-group">${cardsHtml}</div>
        <div class="hero-news-group" aria-hidden="true">${cardsHtml}</div>
      `;
      marquee.hidden = false;
      status.hidden = true;
    };

    fetch(newsFeedUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`news-feed-${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        const items = Array.isArray(payload?.noticias)
          ? payload.noticias
              .map((item) => {
                const date = parseDate(item?.data_publicacao);
                const url = String(item?.url || "").trim();
                if (!item?.titulo || !item?.descricao || !item?.fonte || !date || !url) {
                  return null;
                }
                return {
                  titulo: String(item.titulo).trim(),
                  descricao: String(item.descricao).trim(),
                  fonte: String(item.fonte).trim(),
                  url,
                  date,
                };
              })
              .filter(Boolean)
              .sort((a, b) => b.date.getTime() - a.date.getTime())
          : [];

        if (items.length === 0) {
          throw new Error("empty-news-feed");
        }
        renderNews(items);
      })
      .catch(() => {
        status.hidden = false;
        status.textContent = "Não foi possível carregar as notícias agora.";
      });
  };

  const initScrollReveal = () => {
    const targets = Array.from(document.querySelectorAll(".section, .practice-card, .case-card, .stats-card"));
    if (targets.length === 0 || !("IntersectionObserver" in window)) {
      return;
    }

    targets.forEach((target) => target.classList.add("reveal-on-scroll"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
  };

  renderHeader();
  renderHomePage();
  renderFooter();
  updateWhyMetrics();
  initNavigation();
  initStatsSection();
  initFaq();
  initGallery();
  initHeroNews();
  initScrollReveal();
});
