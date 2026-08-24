document.addEventListener("DOMContentLoaded", () => {
  const data = window.SiteData || null;
  const siteRoot = document.getElementById("siteRoot");
  const contentPage = document.body.dataset.contentPage || "home";
  const isHomePage = contentPage === "home";
  if (isHomePage) {
    document.documentElement.classList.add("is-hero-booting");
  }

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const WHY_LANGUAGES = ["inglês", "espanhol", "italiano", "chinês"];

  const renderWhySecondaryText = (value) =>
    WHY_LANGUAGES.reduce(
      (text, language) => text.replace(new RegExp(language, "g"), `<strong>${language}</strong>`),
      escapeHtml(value)
    );

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const linkAttrs = (href, forceExternal = false) => {
    const isExternal = forceExternal || /^https?:\/\//i.test(String(href || ""));
    return isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
  };

  // Âncoras que a própria página interna também possui não devem levar para a home.
  const PAGE_LOCAL_ANCHORS = {
    online: ["#calculadora-emolumentos"],
  };

  const resolveSiteHref = (href) => {
    const value = String(href || "");
    if (!value.startsWith("#")) {
      return value;
    }
    if (isHomePage) {
      return value;
    }
    const localAnchors = PAGE_LOCAL_ANCHORS[contentPage] || [];
    return localAnchors.indexOf(value) !== -1 ? value : `/${value}`;
  };

  const getFaqHref = (category = "Todas", query = "") => {
    const params = new URLSearchParams();
    if (category && category !== "Todas") {
      params.set("categoria", category);
    }
    if (query) {
      params.set("busca", query);
    }

    const queryString = params.toString();
    return `perguntas-frequentes.html${queryString ? `?${queryString}` : ""}`;
  };

  const numberFormatter = new Intl.NumberFormat("pt-BR");
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobileViewport = () => window.matchMedia("(max-width: 820px)").matches;
  const VISITS_METRIC_KEY = "visitas-site";
  const OWARI_ROBO_WIDGET = {
    scriptUrl: "https://dev-robo.owarilabs.com/widget.js?v=v1",
    slug: "cartorio-1-oficio-rio-das-ostras",
    version: "v1",
    locale: "pt-BR",
    host: "https://dev-robo.owarilabs.com/",
  };
  let siteVisitMetricsLoaded = false;
  let siteVisitMetricsPromise = null;
  let refreshStatsSection = null;
  let owariRoboWidgetPromise = null;

  const getStatsItems = (statsData) =>
    Object.values(statsData?.years || {}).flatMap((yearData) => (Array.isArray(yearData.items) ? yearData.items : []));

  const sumStatsItems = (statsData, predicate) =>
    getStatsItems(statsData).reduce((total, item) => total + (predicate(item) ? Number(item.value) || 0 : 0), 0);

  const toFiniteNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };

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

    if (key === VISITS_METRIC_KEY) {
      const total = toFiniteNumber(statsData.siteVisitsTotal);
      if (siteVisitMetricsLoaded && total !== null) {
        return total;
      }

      const yearlyTotal = sumStatsItems(statsData, (item) => item.id === VISITS_METRIC_KEY);
      return siteVisitMetricsLoaded || yearlyTotal > 0 ? yearlyTotal : null;
    }

    return null;
  };

  const updateWhyMetrics = () => {
    document.querySelectorAll("[data-metric-key]").forEach((metricElement) => {
      const key = metricElement.getAttribute("data-metric-key");
      const valueElement = metricElement.querySelector("strong");
      const total = getMetricTotal(key);
      if (!valueElement) {
        return;
      }

      if (total === null) {
        if (key === VISITS_METRIC_KEY) {
          valueElement.classList.add("is-loading");
          valueElement.removeAttribute("data-count-target");
          valueElement.removeAttribute("data-count-final");
          valueElement.textContent = "...";
        }
        return;
      }

      const finalValue = numberFormatter.format(total);
      valueElement.classList.remove("is-loading");
      valueElement.dataset.countTarget = String(total);
      valueElement.dataset.countFinal = finalValue;
      valueElement.textContent = finalValue;
    });
  };

  const animateMetricValues = (section) => {
    const metrics = Array.from(section.querySelectorAll(".metric"));
    metrics.forEach((metricElement) => {
      if (metricElement.dataset.countAnimated === "true") {
        return;
      }

      const valueElement = metricElement.querySelector("strong");
      if (!valueElement || valueElement.classList.contains("is-loading")) {
        return;
      }

      const target = Number(valueElement.dataset.countTarget || String(valueElement.textContent).replace(/[^\d]/g, ""));
      const finalValue = valueElement.dataset.countFinal || numberFormatter.format(target || 0);
      metricElement.dataset.countAnimated = "true";

      if (!Number.isFinite(target) || target <= 0 || prefersReducedMotion()) {
        valueElement.textContent = finalValue;
        return;
      }

      const duration = 1200;
      const start = performance.now();
      valueElement.textContent = numberFormatter.format(0);

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        valueElement.textContent = numberFormatter.format(Math.round(target * eased));

        if (progress < 1) {
          window.requestAnimationFrame(tick);
          return;
        }

        valueElement.textContent = finalValue;
      };

      window.requestAnimationFrame(tick);
    });
  };

  const getSiteVisitYears = () => Object.keys(data?.stats?.years || {});

  const applySiteVisitCounts = (counts) => {
    const statsData = data?.stats;
    if (!statsData?.years || !counts) {
      return false;
    }

    const yearlyCounts = counts.yearly && typeof counts.yearly === "object" ? counts.yearly : {};
    const summaryTotal = toFiniteNumber(counts.total);
    const visitItems = [];
    let yearlyTotal = 0;
    let hasYearlyCount = false;

    Object.entries(statsData.years).forEach(([year, yearData]) => {
      if (!Array.isArray(yearData.items)) {
        return;
      }

      const yearlyCount = toFiniteNumber(yearlyCounts[year]);
      yearData.items = yearData.items.map((item) => {
        if (item.id !== VISITS_METRIC_KEY) {
          return item;
        }

        visitItems.push({ item, year });
        if (yearlyCount === null) {
          return item;
        }

        hasYearlyCount = true;
        yearlyTotal += yearlyCount;
        return { ...item, value: yearlyCount };
      });
    });

    if (summaryTotal !== null) {
      statsData.siteVisitsTotal = summaryTotal;
    } else if (hasYearlyCount) {
      statsData.siteVisitsTotal = yearlyTotal;
    }

    if (summaryTotal !== null && summaryTotal > yearlyTotal && visitItems.length === 1) {
      const [{ year }] = visitItems;
      const yearData = statsData.years[year];
      yearData.items = yearData.items.map((item) =>
        item.id === VISITS_METRIC_KEY ? { ...item, value: summaryTotal } : item,
      );
      hasYearlyCount = true;
      yearlyTotal = summaryTotal;
    }

    if (summaryTotal !== null && hasYearlyCount) {
      statsData.siteVisitsTotal = Math.max(summaryTotal, yearlyTotal);
    }

    siteVisitMetricsLoaded = hasYearlyCount || summaryTotal !== null;
    return siteVisitMetricsLoaded;
  };

  const getSiteVisitsApi = () =>
    new Promise((resolve) => {
      if (window.SiteVisits && typeof window.SiteVisits.loadYearlyVisits === "function") {
        resolve(window.SiteVisits);
        return;
      }

      const handleReady = () => {
        window.clearTimeout(timeoutId);
        resolve(window.SiteVisits || null);
      };

      const timeoutId = window.setTimeout(() => {
        window.removeEventListener("sitevisits:ready", handleReady);
        resolve(window.SiteVisits || null);
      }, 4000);

      window.addEventListener("sitevisits:ready", handleReady, { once: true });
    });

  const refreshSiteVisitDisplays = () => {
    if (typeof refreshStatsSection === "function") {
      refreshStatsSection();
      return;
    }

    updateWhyMetrics();
  };

  const hydrateSiteVisitMetrics = () => {
    if (!data?.stats) {
      return Promise.resolve();
    }

    if (!siteVisitMetricsPromise) {
      siteVisitMetricsPromise = (async () => {
        const siteVisitsApi = await getSiteVisitsApi();
        if (!siteVisitsApi) {
          return;
        }

        try {
          if (typeof siteVisitsApi.startInitialVisitTracking === "function") {
            await siteVisitsApi.startInitialVisitTracking();
          }

          const years = getSiteVisitYears();
          const counts =
            typeof siteVisitsApi.loadVisitCounts === "function"
              ? await siteVisitsApi.loadVisitCounts(years)
              : { yearly: await siteVisitsApi.loadYearlyVisits(years) };

          if (applySiteVisitCounts(counts)) {
            refreshSiteVisitDisplays();
          }
        } catch (error) {
          console.error("Site visit metrics failed to load.", error);
        }
      })();
    }

    return siteVisitMetricsPromise;
  };

  const prepareStreamText = (target) => {
    if (target.dataset.streamPrepared === "true") {
      return;
    }

    const isRichText = target.dataset.streamRich === "true";
    const fullHtml = target.innerHTML.trim();
    const fullText = (target.dataset.streamText || target.textContent).trim();
    if (!fullText) {
      return;
    }

    const sizer = document.createElement("span");
    const output = document.createElement("span");
    const content = document.createElement("span");
    const cursor = document.createElement("span");

    target.dataset.streamPrepared = "true";
    target.dataset.streamText = fullText;
    if (isRichText) {
      target.dataset.streamHtml = fullHtml;
    }
    target.setAttribute("aria-label", fullText);
    target.textContent = "";
    target.classList.add("stream-text", "is-stream-ready");
    target.classList.toggle("stream-text-rich", isRichText);

    sizer.className = "stream-text-sizer";
    sizer.setAttribute("aria-hidden", "true");
    if (isRichText) {
      sizer.innerHTML = fullHtml;
    } else {
      sizer.textContent = fullText;
    }

    output.className = "stream-text-output";
    output.setAttribute("aria-hidden", "true");

    content.className = "stream-text-content";
    cursor.className = "stream-text-cursor";

    output.append(content, cursor);
    target.append(sizer, output);
  };

  const getTextNodeEntries = (root) => {
    const entries = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      const chars = Array.from(node.nodeValue || "");
      if (chars.length > 0) {
        entries.push({ node, chars });
      }
      node = walker.nextNode();
    }

    return entries;
  };

  const renderRichStreamText = (entries, visibleChars) => {
    let remaining = visibleChars;

    entries.forEach((entry) => {
      if (remaining <= 0) {
        entry.node.nodeValue = "";
        return;
      }

      if (remaining >= entry.chars.length) {
        entry.node.nodeValue = entry.chars.join("");
        remaining -= entry.chars.length;
        return;
      }

      entry.node.nodeValue = entry.chars.slice(0, remaining).join("");
      remaining = 0;
    });
  };

  const playStreamText = (target) => {
    if (target.dataset.streamComplete === "true") {
      return;
    }

    const content = target.querySelector(".stream-text-content");
    const fullText = target.dataset.streamText || "";
    const isRichText = target.dataset.streamRich === "true" && Boolean(target.dataset.streamHtml);
    const isFaqStream = target.classList.contains("faq-answer");
    if (!content || !fullText) {
      return;
    }

    if (prefersReducedMotion()) {
      target.dataset.streamComplete = "true";
      if (isRichText) {
        content.innerHTML = target.dataset.streamHtml;
      } else {
        content.textContent = fullText;
      }
      target.classList.add("is-stream-complete");
      return;
    }

    target.dataset.streamComplete = "true";
    const template = document.createElement("template");
    let richTextEntries = [];
    let chars = Array.from(fullText);

    if (isRichText) {
      template.innerHTML = target.dataset.streamHtml;
      content.textContent = "";
      content.append(template.content.cloneNode(true));
      richTextEntries = getTextNodeEntries(content);
      chars = richTextEntries.flatMap((entry) => entry.chars);
      renderRichStreamText(richTextEntries, 0);
    }

    const startDelay = isFaqStream ? 60 : 160;
    const delayMultiplier = isFaqStream ? 0.5 : 1;
    let index = 0;

    const tick = () => {
      const previous = chars[index - 1] || "";
      const step = chars[index] === " " ? 2 : Math.random() > 0.72 ? 2 : 1;
      index = Math.min(index + step, chars.length);
      if (isRichText) {
        renderRichStreamText(richTextEntries, index);
      } else {
        content.textContent = chars.slice(0, index).join("");
      }

      if (index >= chars.length) {
        if (isRichText) {
          content.innerHTML = target.dataset.streamHtml;
        }
        target.classList.remove("is-streaming");
        target.classList.add("is-stream-complete");
        return;
      }

      const baseDelay = /[.!?”]/.test(previous) ? 130 : /[,;]/.test(previous) ? 70 : 18 + Math.random() * 30;
      const delay = Math.max(8, baseDelay * delayMultiplier);
      window.setTimeout(tick, delay);
    };

    window.setTimeout(() => {
      target.classList.add("is-streaming");
      tick();
    }, startDelay);
  };

  const replayStreamText = (target) => {
    prepareStreamText(target);
    const content = target.querySelector(".stream-text-content");
    if (!content) {
      return;
    }
    delete target.dataset.streamComplete;
    target.classList.remove("is-streaming", "is-stream-complete");
    content.textContent = "";
    playStreamText(target);
  };

  const setupDetailsDropdownAnimations = (root, { itemSelector, summarySelector, panelSelector, onBeforeOpen, onOpen }) => {
    if (!root) {
      return;
    }

    root.querySelectorAll(itemSelector).forEach((item) => {
      if (item.dataset.dropdownAnimationBound === "true") {
        return;
      }

      const summary = item.querySelector(summarySelector);
      const panel = item.querySelector(panelSelector);

      if (!summary || !panel) {
        return;
      }

      let isAnimating = false;
      item.dataset.dropdownAnimationBound = "true";

      const clearPanelStyles = () => {
        panel.style.height = "";
        panel.style.opacity = "";
        panel.style.overflow = "";
        panel.style.paddingTop = "";
        panel.style.paddingBottom = "";
      };

      const getPanelPadding = () => {
        const styles = window.getComputedStyle(panel);
        return {
          top: styles.paddingTop,
          bottom: styles.paddingBottom,
        };
      };

      summary.addEventListener("click", (event) => {
        event.preventDefault();

        if (prefersReducedMotion()) {
          const willOpen = !item.open;
          item.open = willOpen;
          if (willOpen && typeof onBeforeOpen === "function") {
            onBeforeOpen(item, panel);
          }
          if (willOpen && typeof onOpen === "function") {
            onOpen(item, panel);
          }
          return;
        }

        if (isAnimating) {
          return;
        }

        isAnimating = true;

        if (item.open) {
          const padding = getPanelPadding();
          item.classList.add("is-closing");
          panel.style.height = `${panel.scrollHeight}px`;
          panel.style.opacity = "1";
          panel.style.overflow = "hidden";
          panel.style.paddingTop = padding.top;
          panel.style.paddingBottom = padding.bottom;
          panel.getBoundingClientRect();

          window.requestAnimationFrame(() => {
            panel.style.height = "0px";
            panel.style.opacity = "0";
            panel.style.paddingTop = "0px";
            panel.style.paddingBottom = "0px";
          });

          const finishClosing = () => {
            item.open = false;
            item.classList.remove("is-closing");
            clearPanelStyles();
            isAnimating = false;
          };
          const handleCloseEnd = (transitionEvent) => {
            if (transitionEvent.target !== panel || transitionEvent.propertyName !== "height") {
              return;
            }
            panel.removeEventListener("transitionend", handleCloseEnd);
            finishClosing();
          };

          panel.addEventListener("transitionend", handleCloseEnd);
          window.setTimeout(() => {
            if (isAnimating) {
              panel.removeEventListener("transitionend", handleCloseEnd);
              finishClosing();
            }
          }, 360);
          return;
        }

        const padding = getPanelPadding();
        item.open = true;
        if (typeof onBeforeOpen === "function") {
          onBeforeOpen(item, panel);
        }
        item.classList.add("is-opening");
        panel.style.height = "0px";
        panel.style.opacity = "0";
        panel.style.overflow = "hidden";
        panel.style.paddingTop = "0px";
        panel.style.paddingBottom = "0px";

        window.requestAnimationFrame(() => {
          panel.style.paddingTop = padding.top;
          panel.style.paddingBottom = padding.bottom;
          panel.style.height = `${panel.scrollHeight}px`;
          panel.style.opacity = "1";
        });

        const finishOpening = () => {
          item.classList.remove("is-opening");
          clearPanelStyles();
          isAnimating = false;
          if (typeof onOpen === "function") {
            onOpen(item, panel);
          }
        };
        const handleOpenEnd = (transitionEvent) => {
          if (transitionEvent.target !== panel || transitionEvent.propertyName !== "height") {
            return;
          }
          panel.removeEventListener("transitionend", handleOpenEnd);
          finishOpening();
        };

        panel.addEventListener("transitionend", handleOpenEnd);
        window.setTimeout(() => {
          if (isAnimating) {
            panel.removeEventListener("transitionend", handleOpenEnd);
            finishOpening();
          }
        }, 360);
      });
    });
  };

  const initStreamText = () => {
    const targets = Array.from(
      document.querySelectorAll(
        ".hero-intro, .philosophy-quote, .about-quote, #contato .contact-text .section-title, #contato .contact-text .section-subtitle",
      ),
    );
    if (targets.length === 0) {
      return;
    }

    targets.forEach(prepareStreamText);

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      targets.forEach(playStreamText);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playStreamText(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.32, rootMargin: "0px 0px -12% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
  };

  const socialIcon = (name) => {
    if (name === "Instagram") {
      return `
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="4" y="4" width="16" height="16" rx="5"></rect>
          <circle cx="12" cy="12" r="3.6"></circle>
          <circle cx="16.8" cy="7.2" r="0.8"></circle>
        </svg>
      `;
    }

    if (name === "Facebook") {
      return `
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path fill="currentColor" d="M14.2 8.2h2V5h-2.7c-3 0-4.6 1.8-4.6 4.7v2H6.5V15h2.4v6h3.5v-6h3l.5-3.3h-3.5v-1.6c0-1 .4-1.9 1.8-1.9Z"></path>
        </svg>
      `;
    }

    return "";
  };

  const renderSocialLinks = (linkClass) =>
    [
      data.contact.instagramUrl
        ? {
            href: data.contact.instagramUrl,
            label: "Instagram",
          }
        : null,
      data.contact.facebookUrl
        ? {
            href: data.contact.facebookUrl,
            label: "Facebook",
          }
        : null,
    ]
      .filter(Boolean)
      .map(
        (item) => `
          <a class="${escapeHtml(linkClass)}" href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(item.label)}">
            ${socialIcon(item.label)}
          </a>
        `,
      )
      .join("");

  const renderHeader = () => {
    const header = document.querySelector("[data-site-header]");
    if (!header || !data) {
      return;
    }

    const navLinks = data.navigation
      .map(
        (item) =>
          `<a class="menu-link" href="${escapeHtml(resolveSiteHref(item.href))}" data-nav-target="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`,
      )
      .join("");
    const socialLinks = renderSocialLinks("menu-social-link");
    const existingMenu = document.getElementById("siteNav");
    if (existingMenu) {
      existingMenu.remove();
    }

    header.innerHTML = `
      <div class="container header-inner">
        <a href="${escapeHtml(resolveSiteHref("#topo"))}" class="brand" aria-label="${escapeHtml(data.brand.name)}">
          <img src="${escapeHtml(data.brand.logo)}" alt="${escapeHtml(data.brand.logoAlt)}" class="brand-logo" />
          <span class="brand-text">
            <span class="brand-title">${escapeHtml(data.brand.name)}</span>
            <span class="brand-subtitle">${escapeHtml(data.brand.subtitle)}</span>
          </span>
        </a>
        <div class="header-actions">
          <a class="consultation-link" href="${escapeHtml(resolveSiteHref("#contato"))}"><span aria-hidden="true"></span>Solicitar atendimento</a>
          <a class="consultation-link consultation-link-location" href="${escapeHtml(resolveSiteHref("#localizacao"))}">
            <span class="consultation-icon consultation-icon-pin" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 21s7-6.15 7-12a7 7 0 1 0-14 0c0 5.85 7 12 7 12Z"></path>
                <circle cx="12" cy="9" r="2.4"></circle>
              </svg>
            </span>
            Como chegar
          </a>
          <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="siteNav" aria-label="Abrir menu">
            <span class="nav-toggle-bar"></span>
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
            <img src="assets/images/gallery/thumbs/rio-das-ostras/2.jpg" alt="Vista de Rio das Ostras ao entardecer" class="menu-image" loading="lazy" />
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

  const heroSlides = () => (Array.isArray(data.hero.slides) ? data.hero.slides : []);

  // Só a primeira foto entra com src no HTML; as demais são carregadas pelo carrossel.
  const renderHeroSlide = (slide, index) => `
          <figure class="hero-slide${index === 0 ? " is-active" : ""}" data-hero-slide="${index}" aria-hidden="${index === 0 ? "false" : "true"}">
            <img
              class="hero-slide-image"
              ${index === 0 ? `src="${escapeHtml(slide.image)}"` : `data-src="${escapeHtml(slide.image)}"`}
              ${index === 0 ? `srcset="${escapeHtml(slide.imageSmall)} 1000w, ${escapeHtml(slide.image)} 1800w"` : `data-srcset="${escapeHtml(slide.imageSmall)} 1000w, ${escapeHtml(slide.image)} 1800w"`}
              sizes="100vw"
              alt="${escapeHtml(slide.alt)}"
              ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}
              decoding="async" />
          </figure>`;

  const renderHeroAction = (action, index) => `
            <a
              class="btn hero-action${index === 0 ? " btn-primary" : " btn-ghost"}"
              href="${escapeHtml(resolveSiteHref(action.href))}"${action.roboOpen ? ` data-robo-open="${escapeHtml(action.roboOpen)}"` : ""}${linkAttrs(action.href, action.external)}>
              <span class="hero-action-icon" aria-hidden="true">${WELCOME_ICONS[action.kind] || ""}</span>
              ${escapeHtml(action.label)}
            </a>`;

  const renderHero = () => {
    const slides = heroSlides();
    const actions = Array.isArray(data.hero.actions) ? data.hero.actions : [];

    return `
    <section class="hero" aria-labelledby="heroTitle">
      <div class="hero-stage">
        <div class="hero-slides" data-hero-slides>
          ${slides.map(renderHeroSlide).join("")}
        </div>
        <div class="hero-scrim" aria-hidden="true"></div>

        <div class="container hero-content">
          ${data.hero.eyebrow ? `<p class="hero-kicker">${escapeHtml(data.hero.eyebrow)}</p>` : ""}
          <h1 class="hero-title" id="heroTitle">
            ${data.hero.titleLines.map((line) => `<span>${escapeHtml(line)}</span>`).join(" ")}
          </h1>
          ${data.hero.place ? `<p class="hero-place">${escapeHtml(data.hero.place)}</p>` : ""}
          ${actions.length ? `<div class="hero-actions">${actions.map(renderHeroAction).join("")}</div>` : ""}
          <p class="hero-intro" data-stream-rich="true" data-stream-text="${escapeHtml(data.hero.intro)}">${
            data.hero.introHtml ? data.hero.introHtml : escapeHtml(data.hero.intro)
          }</p>
        </div>

        ${
          slides.length > 1
            ? `
        <div class="container hero-bar">
          <p class="hero-caption">
            <span class="hero-caption-index" data-hero-index aria-hidden="true">01</span>
            <span class="hero-caption-text" data-hero-caption>${escapeHtml(slides[0].caption || "")}</span>
          </p>
          <div class="hero-controls" role="group" aria-label="Fotos de Rio das Ostras">
            <button class="hero-arrow" type="button" data-hero-prev aria-label="Foto anterior">
              <span aria-hidden="true"></span>
            </button>
            <div class="hero-dots" data-hero-dots>
              ${slides
                .map(
                  (slide, index) => `
              <button
                class="hero-dot${index === 0 ? " is-active" : ""}"
                type="button"
                data-hero-dot="${index}"
                aria-label="Foto ${index + 1} de ${slides.length}: ${escapeHtml(slide.caption || "")}"
                aria-current="${index === 0 ? "true" : "false"}">
                <span class="hero-dot-track"><span class="hero-dot-fill"></span></span>
              </button>`,
                )
                .join("")}
            </div>
            <button class="hero-arrow" type="button" data-hero-next aria-label="Próxima foto">
              <span aria-hidden="true"></span>
            </button>
          </div>
        </div>
        `
            : ""
        }

        <a class="hero-scroll" href="${escapeHtml(resolveSiteHref("#boas-vindas"))}" aria-label="Ir para o conteúdo do site">
          <span class="hero-scroll-label">Role a página</span>
          <span class="hero-scroll-line" aria-hidden="true"></span>
        </a>
      </div>
    </section>
  `;
  };

  const reviewStars = '<span class="review-stars" aria-hidden="true">★★★★★</span>';

  const renderReviewItem = (item, cloned = false) => `
          <li class="review-item"${cloned ? ' aria-hidden="true"' : ""}>
            ${reviewStars}
            <p class="review-text">“${escapeHtml(item.text)}”</p>
            <p class="review-name">${escapeHtml(item.name)}</p>
          </li>`;

  const shuffled = (arr) => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const reviewSetKey = (list) =>
    list
      .map((item) => `${item.name}|${item.text}`)
      .sort()
      .join("~~");

  // Pick `count` distinct reviews at random, avoiding the exact set shown on the previous load.
  const pickReviews = (items, count) => {
    const size = Math.min(count, items.length);
    let previous = null;
    try {
      previous = window.localStorage.getItem("reviewsLastSet");
    } catch (error) {
      previous = null;
    }
    let selection = shuffled(items).slice(0, size);
    if (items.length > size) {
      for (let attempt = 0; attempt < 10 && reviewSetKey(selection) === previous; attempt++) {
        selection = shuffled(items).slice(0, size);
      }
    }
    try {
      window.localStorage.setItem("reviewsLastSet", reviewSetKey(selection));
    } catch (error) {
      /* localStorage unavailable — nothing to persist */
    }
    return selection;
  };

  const renderGoogleReviews = (reviews) => {
    const selected = pickReviews(reviews.items, 6);
    const items = selected.map((item) => renderReviewItem(item)).join("");
    const clones = selected.map((item) => renderReviewItem(item, true)).join("");
    return `
    <aside class="reviews-card" aria-label="Avaliações no Google">
      <div class="reviews-head">
        <div class="reviews-score-line">
          <span class="reviews-score-value">${escapeHtml(reviews.rating)}</span>
          ${reviewStars}
        </div>
        <p class="reviews-count">${escapeHtml(reviews.totalLabel)}</p>
      </div>
      <div class="reviews-stream-viewport">
        <ul class="reviews-stream">${items}${clones}</ul>
      </div>
      <a class="btn btn-primary reviews-cta" href="${escapeHtml(reviews.rateUrl)}" target="_blank" rel="noopener noreferrer">Avaliar no Google</a>
    </aside>
  `;
  };

  const WELCOME_ICONS = {
    whatsapp:
      '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 4.2A11.6 11.6 0 0 0 6.1 21.8L4.7 27.3l5.6-1.4A11.6 11.6 0 1 0 16 4.2Zm0 2.3a9.3 9.3 0 0 1 0 18.6 9.1 9.1 0 0 1-4.7-1.3l-.4-.2-3.1.8.8-3-.3-.5A9.3 9.3 0 0 1 16 6.5Zm-3.6 4.7c-.2 0-.5.1-.7.4-.2.3-.9 1-.9 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.2 5 4.3 2.4.9 3 .7 3.5.6.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.4l-1.9-.9c-.3-.1-.5-.2-.7.1l-.9 1.1c-.2.2-.4.3-.7.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5.1-.2.1-.4 0-.6l-.8-1.9c-.2-.4-.4-.4-.6-.4h-.8Z" /></svg>',
    online:
      '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M4.6 6.2h22.8a1.6 1.6 0 0 1 1.6 1.6v13a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 20.8v-13a1.6 1.6 0 0 1 1.6-1.6Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" /><path d="M11 26.4h10" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" /><path d="M16 22.4v4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" /><path d="m12.6 11.4 3.4 3.4 3.4-3.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" /><path d="M16 14.8V9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" /></svg>',
    location:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s7-6.15 7-12a7 7 0 1 0-14 0c0 5.85 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" /><circle cx="12" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="1.9" /></svg>',
    ai:
      '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M26.2 5.8H5.8A2.8 2.8 0 0 0 3 8.6v10.8a2.8 2.8 0 0 0 2.8 2.8h3.4v5.2l5.8-5.2h11.2a2.8 2.8 0 0 0 2.8-2.8V8.6a2.8 2.8 0 0 0-2.8-2.8Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" /><path d="M16 8.9l1.35 3.65L21 13.9l-3.65 1.35L16 18.9l-1.35-3.65L11 13.9l3.65-1.35L16 8.9Z" /></svg>',
  };

  // Cena animada: o ato sendo lavrado, selado digitalmente e transmitido.
  const WELCOME_VISUAL = `
    <svg class="welcome-scene" viewBox="0 0 420 420" role="img" aria-label="Ilustração animada de um documento sendo lavrado e recebendo um selo digital">
      <g class="wa-rings" aria-hidden="true">
        <circle class="wa-ring wa-ring-outer" cx="210" cy="210" r="178" />
        <circle class="wa-ring wa-ring-inner" cx="210" cy="210" r="150" />
      </g>

      <g class="wa-nodes" aria-hidden="true">
        <circle class="wa-node wa-node-1" cx="66" cy="146" r="4.5" />
        <circle class="wa-node wa-node-2" cx="358" cy="126" r="3.5" />
        <circle class="wa-node wa-node-3" cx="84" cy="322" r="3.5" />
        <circle class="wa-node wa-node-4" cx="366" cy="292" r="4.5" />
      </g>

      <g class="wa-sheet">
        <rect class="wa-sheet-body" x="120" y="88" width="180" height="244" rx="3" />
        <line class="wa-title" x1="145" y1="126" x2="232" y2="126" />
        <line class="wa-line wa-line-1" x1="145" y1="160" x2="275" y2="160" />
        <line class="wa-line wa-line-2" x1="145" y1="184" x2="275" y2="184" />
        <line class="wa-line wa-line-3" x1="145" y1="208" x2="258" y2="208" />
        <line class="wa-line wa-line-4" x1="145" y1="232" x2="275" y2="232" />
        <line class="wa-line wa-line-5" x1="145" y1="256" x2="232" y2="256" />
        <path class="wa-sign" d="M148 296c10-14 17-14 21-4s7 16 13 8 9-14 15-10 8 10 16 4 11-12 18-8" />
      </g>

      <circle class="wa-pulse wa-pulse-1" cx="300" cy="306" r="36" aria-hidden="true" />
      <circle class="wa-pulse wa-pulse-2" cx="300" cy="306" r="36" aria-hidden="true" />

      <g class="wa-seal">
        <circle class="wa-seal-outer" cx="300" cy="306" r="36" />
        <circle class="wa-seal-inner" cx="300" cy="306" r="28" />
        <path class="wa-check" d="M287 306l9 9 18-19" />
      </g>
    </svg>
  `;

  const renderWelcome = () => {
    const welcome = data.welcome;
    if (!welcome) {
      return "";
    }

    return `
    <section class="section welcome-section" id="boas-vindas" aria-labelledby="welcomeTitle">
      <div class="container welcome-inner">
        <div class="welcome-copy">
          <h2 class="welcome-title" id="welcomeTitle">
            <span class="welcome-title-greeting">${escapeHtml(welcome.titleGreeting)}</span>
            ${escapeHtml(welcome.titleRest)}
          </h2>
          <p class="welcome-text">${escapeHtml(welcome.text)}</p>
          <div class="welcome-actions">
            ${(welcome.actions || [])
              .map(
                (action) => `
                <a
                  class="welcome-action welcome-action-${escapeHtml(action.kind)}"
                  href="${escapeHtml(resolveSiteHref(action.href))}"${action.roboOpen ? ` data-robo-open="${escapeHtml(action.roboOpen)}"` : ""}${linkAttrs(action.href, action.external)}>
                  <span class="welcome-action-icon" aria-hidden="true">${WELCOME_ICONS[action.kind] || ""}</span>
                  <span class="welcome-action-label">${escapeHtml(action.label)}</span>
                  <span class="welcome-action-arrow" aria-hidden="true">&rarr;</span>
                </a>
                `,
              )
              .join("")}
          </div>
        </div>
        <div class="welcome-visual">${WELCOME_VISUAL}</div>
      </div>
    </section>
  `;
  };

  const EMOLUMENT_ICONS = {
    name:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="3.6"></circle><path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0"></path></svg>',
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="6.5" y="2.6" width="11" height="18.8" rx="2.4"></rect><path d="M10.6 18.4h2.8"></path></svg>',
    value:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.6 12 12 4.4l8.4 7.6"></path><path d="M5.8 10.4v9.2h12.4v-9.2"></path><path d="M10 19.6v-4.6h4v4.6"></path></svg>',
  };

  const renderEmolumentPanel = ({ titleTag = "h2", subTitleTag = "h3" } = {}) => {
    const calc = data.emolumentCalculator;
    if (!calc) {
      return "";
    }

    const field = (icon, id, name, label, placeholder, extraAttrs) => `
      <div class="emolument-field">
        <label class="field-label emolument-label" for="${escapeHtml(id)}">${escapeHtml(label)} *</label>
        <div class="emolument-input-wrap">
          <span class="emolument-input-icon" aria-hidden="true">${icon}</span>
          <input
            class="emolument-input"
            id="${escapeHtml(id)}"
            name="${escapeHtml(name)}"
            placeholder="${escapeHtml(placeholder)}"
            required
            ${extraAttrs} />
        </div>
      </div>
    `;

    return `
      <section class="emolument-panel" data-emolument-calculator aria-labelledby="emolumentTitle">
        <div class="emolument-copy">
          <p class="section-kicker">${escapeHtml(calc.kicker)}</p>
          <${titleTag} class="emolument-title" id="emolumentTitle">${escapeHtml(calc.title)}</${titleTag}>
          <p class="emolument-text">${escapeHtml(calc.text)}</p>
          <ol class="emolument-steps">
            ${(calc.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
          </ol>
        </div>
        <div class="emolument-form-card">
          <${subTitleTag} class="emolument-form-title" data-emolument-form-title>${escapeHtml(calc.formTitle)}</${subTitleTag}>
          <form class="emolument-form" data-emolument-form novalidate>
            ${field(EMOLUMENT_ICONS.name, "emolumentName", "Nome completo", calc.nameLabel, calc.namePlaceholder, 'type="text" autocomplete="name" maxlength="120"')}
            ${field(EMOLUMENT_ICONS.phone, "emolumentPhone", "WhatsApp", calc.phoneLabel, calc.phonePlaceholder, 'type="tel" inputmode="numeric" autocomplete="tel" maxlength="16"')}
            <div class="emolument-field">
              <label class="field-label emolument-label" for="emolumentValue">${escapeHtml(calc.valueLabel)} *</label>
              <div class="emolument-input-wrap emolument-input-wrap-currency">
                <span class="emolument-input-icon" aria-hidden="true">${EMOLUMENT_ICONS.value}</span>
                <span class="emolument-currency-prefix" aria-hidden="true">R$</span>
                <input
                  class="emolument-input emolument-input-currency"
                  id="emolumentValue"
                  name="Valor do imóvel"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  placeholder="${escapeHtml(calc.valuePlaceholder)}"
                  maxlength="18"
                  required />
              </div>
            </div>
            <button class="btn btn-primary btn-full emolument-submit" type="submit" data-emolument-submit>${escapeHtml(calc.submitLabel)}</button>
            <p class="form-helper emolument-privacy">${escapeHtml(calc.privacyText)}</p>
            <p class="form-status emolument-status" data-emolument-status role="status" aria-live="polite"></p>
            <a
              class="emolument-error-link"
              data-emolument-error-link
              href="${escapeHtml(data.contact.whatsappServiceUrl || data.contact.whatsappUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              hidden>${escapeHtml(calc.whatsappLabel)}</a>
          </form>
          <div class="emolument-success" data-emolument-success tabindex="-1" hidden>
            <span class="emolument-success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m5 12.6 4.4 4.4L19 7.4"></path></svg>
            </span>
            <${subTitleTag} class="emolument-success-title">${escapeHtml(calc.successTitle)}</${subTitleTag}>
            <p class="emolument-success-text">${escapeHtml(calc.successText)}</p>
            <div class="emolument-success-actions">
              <a class="btn btn-primary" href="${escapeHtml(data.contact.whatsappServiceUrl || data.contact.whatsappUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(calc.whatsappLabel)}</a>
              <button class="btn emolument-reset" type="button" data-emolument-reset>${escapeHtml(calc.successAgainLabel)}</button>
            </div>
          </div>
        </div>
        <p class="emolument-note">${escapeHtml(calc.note)}</p>
      </section>
    `;
  };

  const renderEmolumentSection = () => {
    const panel = renderEmolumentPanel();
    if (!panel) {
      return "";
    }

    return `
    <section class="section section-muted emolument-section" id="calculadora-emolumentos">
      <div class="container">${panel}</div>
    </section>
  `;
  };

  // Frase-ponte entre o compromisso institucional e a prova social do Google.
  // Precisa ser irmã do blockquote: o efeito de máquina de escrever limpa o
  // conteúdo de .philosophy-quote, então nada pode viver dentro dele.
  const renderPhilosophyProof = (proof) => {
    if (!proof || !proof.text) {
      return "";
    }

    const index = proof.highlight ? proof.text.indexOf(proof.highlight) : -1;
    const body =
      index === -1
        ? escapeHtml(proof.text)
        : `${escapeHtml(proof.text.slice(0, index))}<strong class="philosophy-proof-strong">${escapeHtml(proof.highlight)}</strong>${escapeHtml(proof.text.slice(index + proof.highlight.length))}`;

    return `<p class="philosophy-proof">${body}</p>`;
  };

  const renderPhilosophy = () => `
    <section class="section section-light philosophy-section">
      <div class="container philosophy-grid">
        <div>
          <p class="section-kicker">${escapeHtml(data.philosophy.kicker)}</p>
          <blockquote class="philosophy-quote">“${escapeHtml(data.philosophy.quote)}”</blockquote>
          ${renderPhilosophyProof(data.philosophy.proof)}
        </div>
        ${data.philosophy.reviews ? renderGoogleReviews(data.philosophy.reviews) : ""}
        ${
          data.philosophy.link
            ? `<a class="text-link" href="${escapeHtml(data.philosophy.link.href)}">${escapeHtml(data.philosophy.link.label)} <span aria-hidden="true">→</span></a>`
            : ""
        }
      </div>
    </section>
  `;

  const renderAiAssistanceTitle = (title) => {
    const highlight = "inteligência artificial";
    const highlightIndex = title.toLowerCase().indexOf(highlight);

    if (highlightIndex === -1) {
      return escapeHtml(title);
    }

    const before = title.slice(0, highlightIndex);
    const highlighted = title.slice(highlightIndex, highlightIndex + highlight.length);
    const after = title.slice(highlightIndex + highlight.length);

    return `${escapeHtml(before)}<span class="ai-assistance-title-gradient">${escapeHtml(highlighted)}</span>${escapeHtml(after)}`;
  };

  const renderAiStarterPanel = (className = "") => `
    <div class="ai-starter-panel${className ? ` ${escapeHtml(className)}` : ""}">
      <img class="ai-assistance-logo" src="${escapeHtml(data.aiAssistance.logo)}" alt="${escapeHtml(data.aiAssistance.logoAlt)}" loading="lazy" decoding="async" />
      <form class="ai-starter-form" data-owari-robo-starter data-robo-target="widget">
        <div class="ai-starter-field">
          <input
            class="ai-starter-input"
            type="text"
            name="message"
            data-robo-starter-input
            placeholder="${escapeHtml(data.aiAssistance.placeholder)}"
            aria-label="${escapeHtml(data.aiAssistance.placeholder)}"
            autocomplete="off"
            maxlength="2000"
          />
          <button class="ai-starter-send" type="submit" aria-label="${escapeHtml(data.aiAssistance.submitLabel)}" disabled>
            <svg class="ai-starter-send-icon" aria-hidden="true" focusable="false" viewBox="0 0 18 18">
              <path d="M9 14.4V3.6"></path>
              <path d="m4.8 7.8 4.2-4.2 4.2 4.2"></path>
            </svg>
          </button>
        </div>
        <p class="ai-starter-status" data-robo-starter-status aria-live="polite"></p>
      </form>
    </div>
  `;

  const renderAiAssistance = () => `
    <section class="section ai-assistance-section" id="inteligencia-artificial" aria-labelledby="aiAssistanceTitle">
      <div class="container ai-assistance-inner">
        <p class="section-kicker">${escapeHtml(data.aiAssistance.kicker)}</p>
        <div class="ai-assistance-layout">
          <div class="ai-assistance-copy">
            <h2 class="ai-assistance-title" id="aiAssistanceTitle">${renderAiAssistanceTitle(data.aiAssistance.title)}</h2>
            <p class="ai-assistance-text">${escapeHtml(data.aiAssistance.text)}</p>
          </div>
          ${renderAiStarterPanel()}
        </div>
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
                <a
                  href="${escapeHtml(getFaqHref(item.faqCategory || "Todas", item.faqQuery || ""))}"
                  class="practice-card-action"
                  data-faq-jump-category="${escapeHtml(item.faqCategory || "Todas")}"
                  data-faq-jump-query="${escapeHtml(item.faqQuery || "")}">
                  Ver orientações <span aria-hidden="true">→</span>
                </a>
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
          <div class="why-details">
            <div class="why-qualification">
              <svg class="why-graduation-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 8.75 12 4l10 4.75L12 13.5 2 8.75Z"></path>
                <path d="M6 10.75v5.15c3.45 2.8 8.55 2.8 12 0v-5.15"></path>
                <path d="M22 8.75v6"></path>
              </svg>
              <p class="why-text">${escapeHtml(data.whyChoose.text)}</p>
            </div>
            <ul class="line-list">
              ${data.whyChoose.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
          ${
            data.whyChoose.secondaryText
              ? `<div class="why-secondary-block">
                  <hr class="why-divider" aria-hidden="true" />
                  <p class="why-text why-text-secondary">
                    <span class="why-flag-row" aria-label="Bandeiras do Brasil, Estados Unidos, Espanha, Itália e China">
                      <img class="why-flag-icon" src="assets/images/flags/br.png" alt="Brasil" loading="eager" decoding="async" />
                      <img class="why-flag-icon why-flag-icon-us" src="assets/images/flags/us.png" alt="Estados Unidos" loading="eager" decoding="async" />
                      <img class="why-flag-icon" src="assets/images/flags/es.png" alt="Espanha" loading="eager" decoding="async" />
                      <img class="why-flag-icon" src="assets/images/flags/it.png" alt="Itália" loading="eager" decoding="async" />
                      <img class="why-flag-icon" src="assets/images/flags/cn.png" alt="China" loading="eager" decoding="async" />
                    </span>
                    <span class="why-secondary-copy">${renderWhySecondaryText(data.whyChoose.secondaryText)}</span>
                  </p>
                </div>`
              : ""
          }
        </div>
        <div class="metric-stack">
          ${data.whyChoose.metrics
            .map(
              (metric) => {
                const isVisitMetric = metric.key === VISITS_METRIC_KEY;
                const value = isVisitMetric ? "..." : metric.value;
                return `
                <div class="metric" data-metric-key="${escapeHtml(metric.key || "")}">
                  <span>${escapeHtml(metric.label)}</span>
                  <strong${isVisitMetric ? ' class="is-loading"' : ""}>${escapeHtml(value)}</strong>
                </div>
              `;
              },
            )
            .join("")}
          <a class="btn metric-more-link" href="numeros-cartorio.html">Ver mais</a>
        </div>
      </div>
    </section>
  `;

  const renderFeaturePages = () => `
    <section class="feature-pages" id="conteudos">
      <div class="feature-pages-heading">
        <p class="section-kicker">${escapeHtml(data.featurePages.kicker)}</p>
        <div>
          <h2 class="section-title">${escapeHtml(data.featurePages.title)}</h2>
          <p class="section-subtitle">${escapeHtml(data.featurePages.text)}</p>
        </div>
      </div>
      <div class="feature-pages-grid" aria-label="Páginas de conteúdo do cartório">
        ${data.featurePages.cards
          .map(
            (card) => `
              <a class="feature-page-card" href="${escapeHtml(card.href)}">
                <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.imageAlt)}" loading="lazy" decoding="async" />
                <h3>${escapeHtml(card.title)}</h3>
                <p>${escapeHtml(card.text)}</p>
              </a>
            `,
          )
          .join("")}
      </div>
    </section>
  `;

  const CIVIL_ICONS = {
    process:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 2.8H6.6A1.8 1.8 0 0 0 4.8 4.6v14.8a1.8 1.8 0 0 0 1.8 1.8h10.8a1.8 1.8 0 0 0 1.8-1.8V7.8L14 2.8Z"></path><path d="M13.8 2.9v5.2h5.3"></path><path d="M8.4 13.2h7.2"></path><path d="M8.4 16.8h4.8"></path></svg>',
    cpf:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2"></rect><circle cx="8.6" cy="11" r="2.1"></circle><path d="M5.4 15.8a3.4 3.4 0 0 1 6.4 0"></path><path d="M14.8 10.4h4"></path><path d="M14.8 13.8h4"></path></svg>',
  };

  const renderCivilConsultation = () => {
    const civil = data.civilConsultation;
    if (!civil) {
      return "";
    }

    return `
    <div class="container civil-consultation-wrap" id="consulta-habilitacao-casamento">
      <section class="civil-consultation-panel" data-civil-consultation aria-labelledby="civilConsultationTitle">
        <div class="civil-consultation-copy">
          <p class="section-kicker">${escapeHtml(civil.kicker)}</p>
          <h3 class="civil-consultation-title" id="civilConsultationTitle">${escapeHtml(civil.title)}</h3>
          <p class="civil-consultation-text">${escapeHtml(civil.text)}</p>
          <ol class="civil-consultation-steps">
            ${(civil.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
          </ol>
        </div>
        <div class="civil-consultation-form-card">
          <h4 class="civil-consultation-form-title">${escapeHtml(civil.formTitle)}</h4>
          <form class="civil-consultation-form" data-civil-consultation-form novalidate>
            <div class="civil-field">
              <label class="field-label civil-label" for="civilProcess">${escapeHtml(civil.processLabel)} *</label>
              <div class="civil-input-wrap">
                <span class="civil-input-icon" aria-hidden="true">${CIVIL_ICONS.process}</span>
                <input
                  class="civil-input"
                  id="civilProcess"
                  data-civil-process-input
                  name="numeroProcesso"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  placeholder="${escapeHtml(civil.processPlaceholder)}"
                  required />
              </div>
            </div>
            <div class="civil-field">
              <label class="field-label civil-label" for="civilCpf">${escapeHtml(civil.cpfLabel)} *</label>
              <div class="civil-input-wrap">
                <span class="civil-input-icon" aria-hidden="true">${CIVIL_ICONS.cpf}</span>
                <input
                  class="civil-input"
                  id="civilCpf"
                  data-civil-cpf-input
                  name="cpf"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  placeholder="${escapeHtml(civil.cpfPlaceholder)}"
                  maxlength="14"
                  required />
              </div>
            </div>
            <button class="btn btn-primary btn-full civil-consultation-submit" type="submit" data-civil-submit>${escapeHtml(civil.submitLabel)}</button>
            <p class="civil-consultation-status" data-civil-status role="status" aria-live="polite"></p>
          </form>
        </div>
        <div class="civil-consultation-result" data-civil-result hidden></div>
        <p class="civil-consultation-note">${escapeHtml(civil.note)}</p>
      </section>
    </div>
  `;
  };

  const renderOnlineServices = () => `
    <section class="section section-light" id="online">
      <div class="container split-heading">
        <p class="section-kicker">${escapeHtml(data.onlineServices.kicker)}</p>
        <div>
          <h1 class="section-title">${escapeHtml(data.onlineServices.title)}</h1>
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
      <div class="container emolument-wrap" id="calculadora-emolumentos">${renderEmolumentPanel({ titleTag: "h3", subTitleTag: "h4" })}</div>
      ${renderCivilConsultation()}
    </section>
  `;

  const renderPaperForms = () => `
    <section class="section section-muted" id="formularios-impressao">
      <div class="container split-heading">
        <p class="section-kicker">${escapeHtml(data.paperForms.kicker)}</p>
        <div>
          <h1 class="section-title">${escapeHtml(data.paperForms.title)}</h1>
          ${data.paperForms.text ? `<p class="section-subtitle">${escapeHtml(data.paperForms.text)}</p>` : ""}
        </div>
      </div>
      <div class="container paper-forms-grid">
        ${data.paperForms.cards
          .map(
            (item) => `
              <a class="paper-form-card" href="${escapeHtml(item.href)}"${linkAttrs(item.href, item.external)}>
                <h3 class="paper-form-title">${escapeHtml(item.title)}</h3>
                <p class="paper-form-meta">${escapeHtml(item.text)}</p>
                <span class="btn btn-primary paper-form-download">Preencher e imprimir</span>
              </a>
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
          <h1 class="section-title">${escapeHtml(data.guides.title)}</h1>
          <p class="section-subtitle">${escapeHtml(data.guides.text)}</p>
        </div>
        <div class="guide-groups">
          ${data.guides.groups
            .map(
              (group, index) => `
                <details class="guide-group"${index === 0 && !isMobileViewport() ? " open" : ""}>
                  <summary>${escapeHtml(group.title)} <span class="dropdown-chevron" aria-hidden="true"></span></summary>
                  <div class="guide-links">
                    ${group.links
                      .map(
                        (link) => `
                          <a href="${escapeHtml(link.href)}"${/\.pdf($|[?#])/i.test(link.href) || /^https?:/i.test(link.href) ? ' target="_blank" rel="noopener noreferrer"' : ""}>
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
        <div class="location-map-wrapper">
          <iframe
            class="location-map-embed"
            src="${escapeHtml(data.contact.mapsEmbed)}"
            title="Mapa do Cartório do 1º Ofício de Justiça de Rio das Ostras"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    </section>
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
          ${data.hours.note ? `<p class="hours-note">${escapeHtml(data.hours.note)}</p>` : ""}
        </div>
      </div>
    </section>
  `;

  // A bio aceita um parágrafo só ou uma lista deles.
  const toParagraphs = (value) => (Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []);

  const renderAbout = () => `
    <section class="section section-muted" id="sobre">
      <div class="container about-grid">
        <div class="about-copy">
          <p class="section-kicker">${escapeHtml(data.about.kicker)}</p>
          <blockquote class="about-quote">“${escapeHtml(data.about.statement)}”</blockquote>
          ${toParagraphs(data.about.bio)
            .map((paragraph) => `<p class="about-person-bio">${escapeHtml(paragraph)}</p>`)
            .join("")}
          <div class="about-person">
            <h1>${escapeHtml(data.about.title)}</h1>
            <p>${escapeHtml(data.about.role)}</p>
          </div>
        </div>
        <figure class="about-image-wrapper">
          <img src="${escapeHtml(data.about.image)}" alt="${escapeHtml(data.about.imageAlt)}" class="about-image" loading="lazy" decoding="async" />
        </figure>
        <div class="about-text" aria-label="Resumo sobre ${escapeHtml(data.about.title)}">
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
          <h1 class="section-title">Cartório e Rio das Ostras em fotos.</h1>
        </div>
      </div>
      <div class="container gallery-toolbar">
        <div class="stats-year-switch" id="galleryCategoryControls" role="group" aria-label="Filtrar fotos da galeria">
          <button type="button" class="stats-year-btn is-active" data-gallery-filter="all" aria-pressed="true">Todos</button>
          <button type="button" class="stats-year-btn" data-gallery-filter="cartorio" aria-pressed="false">Cartório</button>
          <button type="button" class="stats-year-btn" data-gallery-filter="rio-das-ostras" aria-pressed="false">Rio das Ostras</button>
        </div>
      </div>
      <div class="container gallery-stage">
        <div class="gallery-masonry" id="galleryMasonry" aria-label="Galeria de fotos do cartório e de Rio das Ostras"></div>
      </div>
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
            <h1 class="section-title">Indicadores por ano.</h1>
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
        <h1 class="section-title">${escapeHtml(data.usefulLinks.title)}</h1>
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

  const renderFaqAiAssistance = () => `
    <section class="section section-light faq-ai-section" aria-label="Atendimento com inteligência artificial">
      <div class="container faq-ai-inner">
        <p class="section-kicker faq-ai-title">Inteligência artificial</p>
        ${renderAiStarterPanel("faq-ai-starter-panel")}
      </div>
    </section>
  `;

  const renderFaq = () => `
    <section class="section section-muted faq-section" id="faq">
      <div class="container split-heading">
        <h1 class="section-kicker">Perguntas frequentes</h1>
      </div>
      <div class="container faq-controls">
        <details class="faq-filter-menu" id="faqFilterMenu">
          <summary class="faq-filter-toggle">Pesquisar</summary>
          <div class="faq-filter-panel">
            <div class="faq-search-wrap">
              <label for="faqSearchInput" class="faq-search-label">Buscar na FAQ</label>
              <input id="faqSearchInput" type="search" class="faq-search-input" placeholder="Ex.: documentos casamento, valores, óbito..." autocomplete="off" />
            </div>
            <div class="faq-chip-row" id="faqCategoryChips" aria-label="Filtrar por categoria"></div>
          </div>
        </details>
      </div>
      <p class="sr-only" id="faqResultCount" aria-live="polite"></p>
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
            <input type="hidden" name="from_name" value="${escapeHtml(data.contactForm.fromName)}" />
            <input type="checkbox" name="botcheck" class="hidden" style="display:none" />
            <div class="field-group">
              <label for="nome" class="field-label">Nome completo *</label>
              <input type="text" id="nome" name="Nome completo" class="field-input" autocomplete="name" required />
            </div>
            <div class="field-grid">
              <div class="field-group">
                <label for="email" class="field-label">E-mail *</label>
                <input type="email" id="email" name="email" class="field-input" autocomplete="email" required />
              </div>
              <div class="field-group">
                <label for="telefone" class="field-label">Telefone / WhatsApp *</label>
                <input type="tel" id="telefone" name="Telefone / WhatsApp" class="field-input" placeholder="(22) 99999-9999" autocomplete="tel" required />
              </div>
            </div>
            <div class="field-group">
              <label for="tipo" class="field-label">Assunto / tipo de serviço *</label>
              <select id="tipo" name="Assunto" class="field-input" required>
                <option value="">Selecione uma opção</option>
                ${data.contactForm.options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
              </select>
            </div>
            <div class="field-group">
              <label for="mensagem" class="field-label">Mensagem *</label>
              <textarea id="mensagem" name="Mensagem" class="field-input field-textarea" rows="5" required></textarea>
            </div>
            <p class="form-helper">${escapeHtml(data.contactForm.privacyText)}</p>
            <button type="submit" class="btn btn-primary btn-full" data-contact-submit>${escapeHtml(data.contactForm.submitLabel)}</button>
            <p id="formStatus" class="form-status" role="status" aria-live="polite"></p>
            <a
              class="form-error-link"
              data-contact-error-link
              href="${escapeHtml(data.contact.whatsappServiceUrl || data.contact.whatsappUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              hidden>${escapeHtml(data.contactForm.whatsappLabel)}</a>
          </form>
          <div class="form-success" data-contact-success tabindex="-1" hidden>
            <span class="form-success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m5 12.6 4.4 4.4L19 7.4"></path></svg>
            </span>
            <h3 class="form-success-title">${escapeHtml(data.contactForm.successTitle)}</h3>
            <p class="form-success-text">${escapeHtml(data.contactForm.successText)}</p>
            <div class="form-success-actions">
              <a class="btn btn-primary" href="${escapeHtml(data.contact.whatsappServiceUrl || data.contact.whatsappUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.contactForm.whatsappLabel)}</a>
              <button class="btn form-success-reset" type="button" data-contact-reset>${escapeHtml(data.contactForm.successAgainLabel)}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const renderAgenda2030 = () => {
    const agenda = data.agenda2030;
    if (!agenda) {
      return "";
    }

    const goalsByNumber = new Map((agenda.goals || []).map((goal) => [goal.number, goal]));

    const goalChip = (number) => {
      const goal = goalsByNumber.get(number);
      if (!goal) {
        return "";
      }

      return `<span class="ods-chip ods-ink-${escapeHtml(goal.ink)}" style="--ods-color:${escapeHtml(goal.color)}" title="ODS ${escapeHtml(goal.number)} - ${escapeHtml(goal.name)}"><span aria-hidden="true">ODS ${escapeHtml(goal.number)}</span><span class="visually-hidden">ODS ${escapeHtml(goal.number)}: ${escapeHtml(goal.name)}</span></span>`;
    };

    const disclosure = (title, meta, body) => `
      <details class="agenda-disclosure">
        <summary class="agenda-disclosure-summary">
          <h3 class="agenda-disclosure-title">${escapeHtml(title)}</h3>
          ${meta ? `<span class="agenda-disclosure-meta">${escapeHtml(meta)}</span>` : ""}
          <span class="dropdown-chevron" aria-hidden="true"></span>
        </summary>
        <div class="agenda-disclosure-body">${body}</div>
      </details>
    `;

    const statement = agenda.statement || {};
    const spotlight = agenda.spotlight || {};

    const matrixBody = `
      <p class="agenda-disclosure-intro">${escapeHtml(agenda.matrixText)}</p>
      <ul class="agenda-matrix">
        ${(agenda.matrix || [])
          .map(
            (item) => `
              <li class="agenda-matrix-row">
                <div class="agenda-matrix-main">
                  <h4 class="agenda-matrix-activity">${escapeHtml(item.activity)}</h4>
                  <p class="agenda-matrix-text">${escapeHtml(item.text)}</p>
                  <p class="agenda-matrix-norm">${escapeHtml(item.norm)}</p>
                </div>
                <div class="agenda-matrix-goals">${(item.goals || []).map(goalChip).join("")}</div>
              </li>
            `,
          )
          .join("")}
      </ul>
    `;

    const spotlightBody = `
      <div class="agenda-spotlight">
        <div class="agenda-spotlight-copy">
          <blockquote class="agenda-spotlight-quote">“${escapeHtml(spotlight.quote)}”</blockquote>
          <p class="agenda-spotlight-source">${escapeHtml(spotlight.quoteSource)}</p>
          <p class="agenda-spotlight-text">${escapeHtml(spotlight.text)}</p>
        </div>
        <div class="agenda-stat-grid">
          ${(spotlight.stats || [])
            .map(
              (stat) => `
                <div class="agenda-stat">
                  <strong class="agenda-stat-value">${escapeHtml(stat.value)}</strong>
                  <span class="agenda-stat-label">${escapeHtml(stat.label)}</span>
                  <span class="agenda-stat-note">${escapeHtml(stat.note)}</span>
                </div>
              `,
            )
            .join("")}
          <p class="agenda-stat-source">${escapeHtml(spotlight.source)}</p>
        </div>
      </div>
    `;

    const sourcesBody = `
      <div class="agenda-sources">
        ${(agenda.sources || [])
          .map(
            (source) => `
              <a class="agenda-source-card" href="${escapeHtml(source.href)}" target="_blank" rel="noopener noreferrer">
                <strong>${escapeHtml(source.label)}</strong>
                <span>${escapeHtml(source.text)}</span>
                <em>Abrir <span aria-hidden="true">&rarr;</span></em>
              </a>
            `,
          )
          .join("")}
      </div>
    `;

    return `
    <section class="section agenda-section" id="agenda-2030" aria-labelledby="agendaTitle">
      <div class="container split-heading agenda-heading">
        <p class="section-kicker">${escapeHtml(agenda.kicker)}</p>
        <div>
          <h2 class="section-title" id="agendaTitle">${escapeHtml(agenda.title)}</h2>
          <p class="section-subtitle">${escapeHtml(agenda.intro)}</p>
        </div>
      </div>

      <div class="container agenda-body">
        <article class="agenda-statement">
          <p class="agenda-statement-badge">${escapeHtml(statement.badge)}</p>
          <h3 class="agenda-statement-title">${escapeHtml(statement.title)}</h3>
          <figure class="agenda-quote">
            <blockquote>“${escapeHtml(statement.quote)}”</blockquote>
            <figcaption>${escapeHtml(statement.quoteSource)}</figcaption>
          </figure>
          ${
            statement.link
              ? `<a class="text-link agenda-statement-link" href="${escapeHtml(statement.link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(statement.link.label)} <span aria-hidden="true">&rarr;</span></a>`
              : ""
          }
        </article>

        <div class="agenda-goals-block">
          <h3 class="agenda-block-title">${escapeHtml(agenda.goalsTitle)}</h3>
          <p class="ods-legend"><span class="ods-legend-dot" aria-hidden="true"></span>${escapeHtml(agenda.goalsLegend)}</p>
          <ul class="ods-grid" aria-label="${escapeHtml(agenda.goalsTitle)}">
            ${(agenda.goals || [])
              .map(
                (goal) => `
                  <li
                    class="ods-tile ods-ink-${escapeHtml(goal.ink)}${goal.focus ? " is-focus" : ""}"
                    style="--ods-color:${escapeHtml(goal.color)}"
                    aria-label="ODS ${escapeHtml(goal.number)}: ${escapeHtml(goal.name)}${goal.focus ? ". Objetivo com relação direta com os atos desta serventia." : ""}">
                    <span class="ods-tile-number" aria-hidden="true">${escapeHtml(String(goal.number).padStart(2, "0"))}</span>
                    <span class="ods-tile-name" aria-hidden="true">${escapeHtml(goal.name)}</span>
                  </li>
                `,
              )
              .join("")}
          </ul>
        </div>

        <div class="agenda-disclosures">
          ${disclosure(agenda.matrixTitle, `${(agenda.matrix || []).length} atividades`, matrixBody)}
          ${disclosure(spotlight.title, spotlight.badge, spotlightBody)}
          ${disclosure(agenda.sourcesTitle, `${(agenda.sources || []).length} links`, sourcesBody)}
        </div>

        <div class="agenda-footnote">
          <p class="agenda-support-line">${escapeHtml(agenda.supportLine)}</p>
          <p class="agenda-disclaimer">${escapeHtml(agenda.disclaimer)}</p>
        </div>
      </div>
    </section>
  `;
  };

  const renderFooter = () => {
    const footer = document.querySelector("[data-site-footer]");
    if (!footer || !data) {
      return;
    }

    footer.innerHTML = `
      <section class="hero-news" id="heroNews">
        <div class="container hero-news-heading">
          <p class="section-kicker">Últimas notícias</p>
        </div>
        <div class="container">
          <p class="hero-news-status" id="heroNewsStatus" role="status" aria-live="polite">Carregando notícias...</p>
          <div class="hero-news-carousel" id="heroNewsCarousel" hidden>
            <button class="hero-news-arrow hero-news-prev" id="heroNewsPrev" type="button" aria-label="Notícias anteriores">&lt;</button>
            <div class="hero-news-page" id="heroNewsPage" aria-live="polite"></div>
            <button class="hero-news-arrow hero-news-next" id="heroNewsNext" type="button" aria-label="Próximas notícias">&gt;</button>
          </div>
          <div class="hero-news-dots" id="heroNewsDots" aria-label="Páginas de notícias" hidden></div>
        </div>
      </section>
      <div class="container footer-grid">
        <div class="footer-brand">
          <a href="${escapeHtml(resolveSiteHref("#topo"))}" class="footer-logo-row" aria-label="Voltar ao início">
            <img src="${escapeHtml(data.brand.logo)}" alt="${escapeHtml(data.brand.logoAlt)}" class="footer-logo" />
            <div class="footer-brand-text">
              <span class="footer-brand-title">${escapeHtml(data.brand.name)}</span>
              <span class="footer-brand-subtitle">${escapeHtml(data.brand.subtitle)}</span>
            </div>
          </a>
          <p class="footer-copy">&copy; 2026, 1º Ofício de Justiça da Comarca de Rio das Ostras/RJ. Todos os direitos reservados.</p>
          <div class="footer-social-links" aria-label="Redes sociais">${renderSocialLinks("footer-social-link")}</div>
        </div>
        <div class="footer-column">
          <h3 class="footer-title">Menu</h3>
          <ul class="footer-contact-list">
            ${data.navigation.map((item) => `<li><a href="${escapeHtml(resolveSiteHref(item.href))}">${escapeHtml(item.label)}</a></li>`).join("")}
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
      <div class="container footer-credit">
        Criado por <a href="https://owarilabs.com" target="_blank" rel="nofollow noopener noreferrer">Owari Labs</a>
      </div>
      <a href="${escapeHtml(data.contact.whatsappUrl)}" target="_blank" rel="noopener noreferrer" class="whatsapp-float" aria-label="Iniciar conversa no WhatsApp">
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
      renderWelcome(),
      renderPhilosophy(),
      renderAiAssistance(),
      renderPracticeAreas(),
      renderEmolumentSection(),
      renderWhyChoose(),
      renderHoursLocation(),
      renderFeaturePages(),
      renderContact(),
      renderAgenda2030(),
    ].join("");
  };

  const renderContentPage = () => {
    if (!siteRoot || !data) {
      return;
    }

    const pageRenderers = {
      guias: renderGuides,
      sobre: renderAbout,
      galeria: renderGallery,
      numeros: renderStats,
      links: renderUsefulLinks,
      online: renderOnlineServices,
      formularios: renderPaperForms,
      faq: () => `${renderFaqAiAssistance()}${renderFaq()}`,
    };
    const renderPage = pageRenderers[contentPage];
    siteRoot.innerHTML = renderPage ? renderPage() : "";
  };

  const renderSiteContent = () => {
    if (isHomePage) {
      renderHomePage();
      return;
    }
    renderContentPage();
  };

  const initNavigation = () => {
    const navToggle = document.getElementById("navToggle");
    const siteNav = document.getElementById("siteNav");

    if (!navToggle || !siteNav) {
      return;
    }

    const menuLinks = Array.from(siteNav.querySelectorAll(".menu-link"));
    const topActionLinks = Array.from(document.querySelectorAll(".header-actions .consultation-link"));
    const navSections = menuLinks
      .map((link) => {
        const href = link.getAttribute("href") || "";
        if (!href.startsWith("#")) {
          return null;
        }

        const section = document.getElementById(href.slice(1));
        return section ? { href, section } : null;
      })
      .filter(Boolean);
    let closeTimer = null;
    let hashActiveTimer = null;
    let lockedActiveHash = "";
    let activeTicking = false;

    const setActiveNav = (activeHref) => {
      menuLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === activeHref;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const setActiveFromHash = () => {
      const activeHash = window.location.hash;
      if (!activeHash || !menuLinks.some((link) => link.getAttribute("href") === activeHash)) {
        return false;
      }

      setActiveNav(activeHash);
      lockedActiveHash = activeHash;
      window.clearTimeout(hashActiveTimer);
      hashActiveTimer = window.setTimeout(() => {
        if (lockedActiveHash === activeHash) {
          lockedActiveHash = "";
        }
      }, 800);
      return true;
    };

    const refreshActiveNav = () => {
      if (lockedActiveHash) {
        setActiveNav(lockedActiveHash);
        return;
      }

      if (window.scrollY < 80) {
        setActiveNav("#topo");
        return;
      }

      const headerOffset = 120;
      const lowerBound = window.innerHeight * 0.72;
      const activeSection = navSections.reduce((current, item) => {
        if (item.href === "#topo") {
          return current;
        }

        const { section } = item;
        const rect = section.getBoundingClientRect();
        if (rect.top > lowerBound || rect.bottom < headerOffset) {
          return current;
        }

        const distance = Math.abs(rect.top - headerOffset);
        return !current || distance < current.distance ? { ...item, distance } : current;
      }, null);

      if (activeSection) {
        setActiveNav(activeSection.href);
      }
    };

    const setOpen = (isOpen) => {
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
      siteNav.setAttribute("aria-hidden", isOpen ? "false" : "true");
      document.body.classList.toggle("no-scroll", isOpen);
      // Sem isto o conteúdo atrás do painel continua alcançável por Tab e pelas setas.
      document.querySelectorAll("main, .site-footer").forEach((region) => {
        region.toggleAttribute("inert", isOpen);
      });

      window.clearTimeout(closeTimer);

      if (isOpen) {
        siteNav.hidden = false;
        siteNav.classList.remove("is-closing");
        siteNav.offsetHeight;
        siteNav.classList.add("is-open");
        refreshActiveNav();
        return;
      }

      siteNav.classList.remove("is-open");
      siteNav.classList.add("is-closing");
      closeTimer = window.setTimeout(() => {
        siteNav.hidden = true;
        siteNav.classList.remove("is-closing");
      }, 360);
    };

    const closeMenu = () => {
      if (siteNav.hidden && !siteNav.classList.contains("is-open")) {
        return;
      }
      setOpen(false);
    };

    navToggle.addEventListener("click", () => {
      setOpen(siteNav.hidden || !siteNav.classList.contains("is-open"));
    });

    siteNav.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (target) {
        const href = target.getAttribute("href") || "";
        if (href.startsWith("#")) {
          setActiveNav(href);
        }
        closeMenu();
      }
    });

    topActionLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href") || "";
        if (href.startsWith("#")) {
          setActiveNav(href);
        }
        closeMenu();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !siteNav.hidden) {
        closeMenu();
      }
    });

    window.addEventListener(
      "scroll",
      () => {
        if (activeTicking) {
          return;
        }

        activeTicking = true;
        window.requestAnimationFrame(() => {
          refreshActiveNav();
          activeTicking = false;
        });
      },
      { passive: true },
    );
    window.addEventListener("hashchange", () => {
      if (!setActiveFromHash()) {
        refreshActiveNav();
      }
    });
    if (!setActiveFromHash()) {
      refreshActiveNav();
    }
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
    let statsTransitionTimer = null;

    const setPressed = (buttons, attr, value) => {
      buttons.forEach((button) => {
        const isActive = button.getAttribute(attr) === value;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    const render = ({ animate = false } = {}) => {
      window.clearTimeout(statsTransitionTimer);
      const yearData = statsData.years[activeYear];
      if (!yearData) {
        return;
      }

      const items =
        activeType === "all" ? yearData.items : yearData.items.filter((item) => item.category === activeType);

      setPressed(yearButtons, "data-stats-year", activeYear);
      setPressed(typeButtons, "data-stats-type", activeType);

      const updateStatsContent = () => {
        statsGrid.classList.toggle("stats-grid--compact", items.length <= 2);
        statsGrid.innerHTML = items
          .map((item) => {
            const isVisitMetricLoading = item.id === VISITS_METRIC_KEY && !siteVisitMetricsLoaded;
            const displayValue = isVisitMetricLoading ? "..." : numberFormatter.format(item.value);
            return `
              <article class="stats-card" data-stat-id="${escapeHtml(item.id)}">
                <span>${escapeHtml(statsData.categories[item.category] || item.category)}</span>
                <strong${isVisitMetricLoading ? ' class="is-loading" aria-busy="true"' : ""}>${escapeHtml(displayValue)}</strong>
                <h3>${escapeHtml(item.label)}</h3>
              </article>
            `;
          })
          .join("");

        statsPeriodLabel.textContent = yearData.period;
        updateWhyMetrics();
      };

      if (animate && !prefersReducedMotion()) {
        statsGrid.classList.add("is-transitioning");
        statsTransitionTimer = window.setTimeout(() => {
          updateStatsContent();
          window.requestAnimationFrame(() => {
            statsGrid.classList.remove("is-transitioning");
          });
        }, 180);
        return;
      }

      statsGrid.classList.remove("is-transitioning");
      updateStatsContent();
    };

    yearButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const year = button.getAttribute("data-stats-year");
        if (!year || !statsData.years[year] || year === activeYear) {
          return;
        }
        activeYear = year;
        render({ animate: true });
      });
    });

    typeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.getAttribute("data-stats-type") || "all";
        if (type === activeType) {
          return;
        }
        activeType = type;
        render({ animate: true });
      });
    });

    refreshStatsSection = render;
    render();
  };

  const initFaq = () => {
    const faqList = document.getElementById("faqList");
    const faqSearchInput = document.getElementById("faqSearchInput");
    const faqCategoryChips = document.getElementById("faqCategoryChips");
    const faqResultCount = document.getElementById("faqResultCount");
    const faqShowMoreBtn = document.getElementById("faqShowMoreBtn");

    if (!faqList || !faqSearchInput || !faqCategoryChips || !faqResultCount || !faqShowMoreBtn) {
      return;
    }

    const faqItems = Array.isArray(window.FAQ_ITEMS) ? window.FAQ_ITEMS : [];
    const maxVisible = 3;
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
            <button type="button" class="faq-chip${category === activeCategory ? " is-active" : ""}" data-faq-category="${escapeHtml(category)}" aria-pressed="${category === activeCategory ? "true" : "false"}">${escapeHtml(category)}</button>
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

    const setupFaqItemAnimations = () => {
      faqList.querySelectorAll(".faq-answer").forEach((answer) => {
        answer.dataset.streamRich = "true";
        prepareStreamText(answer);
      });

      setupDetailsDropdownAnimations(faqList, {
        itemSelector: ".faq-item",
        summarySelector: ".faq-question",
        panelSelector: ".faq-answer",
        onBeforeOpen: (_item, panel) => {
          replayStreamText(panel);
        },
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
                <span class="dropdown-chevron" aria-hidden="true"></span>
              </summary>
              <div class="faq-answer">${buildAnswerHtml(item.answer)}</div>
            </details>
          `,
        )
        .join("");

      setupFaqItemAnimations();
    };

    const scrollToFaqAfterCollapse = () => {
      const faqSection = faqList.closest(".faq-section");
      if (!faqSection) {
        return;
      }

      const behavior = prefersReducedMotion() ? "auto" : "smooth";
      const delay = prefersReducedMotion() ? 0 : 180;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.setTimeout(() => {
            faqSection.scrollIntoView({ behavior, block: "start" });
          }, delay);
        });
      });
    };

    const applyExternalFaqFilter = (category, query) => {
      activeCategory = categories.includes(category) ? category : "Todas";
      searchTerm = String(query || "");
      showAll = true;
      faqSearchInput.value = searchTerm;
      const filterMenu = document.getElementById("faqFilterMenu");
      if (filterMenu) {
        filterMenu.open = true;
      }
      renderCategoryChips();
      renderFaqItems();
      scrollToFaqAfterCollapse();
    };

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-faq-jump-category]");
      if (!trigger) {
        return;
      }
      event.preventDefault();
      applyExternalFaqFilter(
        trigger.getAttribute("data-faq-jump-category") || "Todas",
        trigger.getAttribute("data-faq-jump-query") || "",
      );
    });

    faqSearchInput.addEventListener("input", () => {
      searchTerm = faqSearchInput.value;
      showAll = false;
      renderFaqItems();
    });

    faqShowMoreBtn.addEventListener("click", () => {
      const shouldScrollToFaq = showAll;
      showAll = !showAll;
      renderFaqItems();

      if (shouldScrollToFaq) {
        scrollToFaqAfterCollapse();
      }
    });

    renderCategoryChips();
    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get("categoria") || params.get("category") || "Todas";
    const initialQuery = params.get("busca") || params.get("q") || params.get("query") || "";
    if (initialCategory !== "Todas" || initialQuery) {
      applyExternalFaqFilter(initialCategory, initialQuery);
      return;
    }

    renderFaqItems();
  };

  const initGuideGroups = () => {
    const guideGroups = document.querySelector(".guide-groups");

    if (isMobileViewport()) {
      guideGroups?.querySelectorAll(".guide-group[open]").forEach((group) => {
        group.open = false;
      });
    }

    setupDetailsDropdownAnimations(guideGroups, {
      itemSelector: ".guide-group",
      summarySelector: "summary",
      panelSelector: ".guide-links",
    });
  };

  const initGallery = () => {
    const galleryMasonry = document.getElementById("galleryMasonry");
    const controls = document.getElementById("galleryCategoryControls");
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
            alt: typeof entry === "object" && entry.alt ? String(entry.alt) : "",
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
    let galleryTransitionTimer = null;

    const renderImages = ({ animate = false } = {}) => {
      window.clearTimeout(galleryTransitionTimer);

      const updateImages = () => {
        displayImages =
          activeFilter === "all" ? images : images.filter((image) => image.category === activeFilter);

        galleryMasonry.innerHTML = displayImages
          .map(
            (image, index) => `
              <button class="gallery-tile" type="button" data-index="${index}" aria-label="Abrir foto ${index + 1}">
                <img src="${escapeHtml(image.thumb)}" data-full="${escapeHtml(image.full)}" alt="${escapeHtml(image.alt || "Foto da galeria do cartório e de Rio das Ostras")}" loading="${index < 8 ? "eager" : "lazy"}" decoding="async" />
              </button>
            `,
          )
          .join("");
      };

      if (animate && !prefersReducedMotion()) {
        galleryMasonry.classList.add("is-transitioning");
        galleryTransitionTimer = window.setTimeout(() => {
          updateImages();
          window.requestAnimationFrame(() => {
            galleryMasonry.classList.remove("is-transitioning");
          });
        }, 180);
        return;
      }

      galleryMasonry.classList.remove("is-transitioning");
      updateImages();
    };

    const setFilter = (filter) => {
      activeFilter = filter === "cartorio" || filter === "rio-das-ostras" ? filter : "all";
      controls?.querySelectorAll("[data-gallery-filter]").forEach((button) => {
        const isActive = button.getAttribute("data-gallery-filter") === activeFilter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      renderImages({ animate: true });
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
    const carousel = document.getElementById("heroNewsCarousel");
    const page = document.getElementById("heroNewsPage");
    const dots = document.getElementById("heroNewsDots");
    const prevBtn = document.getElementById("heroNewsPrev");
    const nextBtn = document.getElementById("heroNewsNext");
    if (!status || !carousel || !page || !dots || !prevBtn || !nextBtn) {
      return;
    }

    const newsFeedUrl = "https://thiagoam.github.io/noticias-cartorio-rio-das-ostras/noticias.json";
    const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });
    const pageSizeQuery = window.matchMedia("(max-width: 820px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const getPageSize = () => (pageSizeQuery.matches ? 1 : 3);
    let currentPage = 0;
    let pageCount = 0;
    let pageTransitionTimer = null;

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
      let pageSize = getPageSize();

      const renderPage = ({ animate = false } = {}) => {
        window.clearTimeout(pageTransitionTimer);
        pageSize = getPageSize();
        pageCount = Math.max(1, Math.ceil(selectedItems.length / pageSize));
        currentPage = Math.min(currentPage, pageCount - 1);
        const pageItems = selectedItems.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
        const updatePage = () => {
          page.innerHTML = pageItems
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

          dots.innerHTML =
            pageCount > 1
              ? Array.from({ length: pageCount }, (_, index) => {
                  const isActive = index === currentPage;
                  return `
                    <button
                      type="button"
                      class="hero-news-dot${isActive ? " is-active" : ""}"
                      data-news-page="${index}"
                      aria-label="Ir para página ${index + 1} de ${pageCount}"
                      ${isActive ? 'aria-current="page"' : ""}>
                    </button>
                  `;
                }).join("")
              : "";
          dots.hidden = pageCount <= 1;
          prevBtn.disabled = pageCount <= 1;
          nextBtn.disabled = pageCount <= 1;
        };

        if (animate && !reducedMotionQuery.matches) {
          page.classList.add("is-transitioning");
          pageTransitionTimer = window.setTimeout(() => {
            updatePage();
            window.requestAnimationFrame(() => {
              page.classList.remove("is-transitioning");
            });
          }, 180);
          return;
        }

        page.classList.remove("is-transitioning");
        updatePage();
      };

      const goToPage = (nextPage) => {
        currentPage = (nextPage + pageCount) % pageCount;
        renderPage({ animate: true });
      };

      prevBtn.addEventListener("click", () => {
        goToPage(currentPage - 1);
      });
      nextBtn.addEventListener("click", () => {
        goToPage(currentPage + 1);
      });
      dots.addEventListener("click", (event) => {
        const button = event.target instanceof Element ? event.target.closest("[data-news-page]") : null;
        if (!button) {
          return;
        }
        const nextPage = Number(button.getAttribute("data-news-page"));
        if (!Number.isInteger(nextPage) || nextPage < 0 || nextPage >= pageCount || nextPage === currentPage) {
          return;
        }
        goToPage(nextPage);
      });
      pageSizeQuery.addEventListener("change", renderPage);

      renderPage();
      carousel.hidden = false;
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

  const promoteFloatingWhatsApp = () => {
    const whatsappLink = document.querySelector(".whatsapp-float");
    if (whatsappLink && whatsappLink.parentElement !== document.body) {
      document.body.appendChild(whatsappLink);
    }
  };

  const isOwariRoboReady = () =>
    Boolean(window.OwariRobo && typeof window.OwariRobo.open === "function");

  const loadOwariRoboWidget = () => {
    if (!document.querySelector(".whatsapp-float")) {
      return Promise.resolve(false);
    }

    if (isOwariRoboReady()) {
      return Promise.resolve(true);
    }

    if (owariRoboWidgetPromise) {
      return owariRoboWidgetPromise;
    }

    owariRoboWidgetPromise = new Promise((resolve) => {
      let settled = false;
      let script = document.querySelector(`script[data-robo="${OWARI_ROBO_WIDGET.slug}"]`);

      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        resolve(isOwariRoboReady());
      };

      if (!script) {
        script = document.createElement("script");
        script.defer = true;
        script.src = OWARI_ROBO_WIDGET.scriptUrl;
        script.dataset.robo = OWARI_ROBO_WIDGET.slug;
        script.dataset.roboVersion = OWARI_ROBO_WIDGET.version;
        script.dataset.roboLocale = OWARI_ROBO_WIDGET.locale;
        script.dataset.roboHost = OWARI_ROBO_WIDGET.host;
      }

      script.addEventListener("load", finish, { once: true });
      script.addEventListener("error", finish, { once: true });
      if (!script.parentElement) {
        document.body.appendChild(script);
      }
      window.setTimeout(finish, 5000);
    });

    return owariRoboWidgetPromise;
  };

  const initOwariRoboStarterForms = () => {
    const starterForms = Array.from(document.querySelectorAll("[data-owari-robo-starter]"));
    starterForms.forEach((form) => {
      if (!(form instanceof HTMLFormElement) || form.dataset.starterControllerBound === "true") {
        return;
      }

      const input = form.querySelector("[data-robo-starter-input]");
      const button = form.querySelector("button[type='submit']");
      const status = form.querySelector("[data-robo-starter-status]");

      if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) || !(button instanceof HTMLButtonElement)) {
        return;
      }

      form.dataset.starterControllerBound = "true";

      const setStatus = (message) => {
        if (status) {
          status.textContent = message;
        }
      };
      const syncStarterButton = () => {
        button.disabled = input.value.trim().length === 0;
      };

      input.addEventListener("input", () => {
        setStatus("");
        syncStarterButton();
      });

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const message = input.value.trim();
        if (!message) {
          syncStarterButton();
          return;
        }

        button.disabled = true;
        setStatus("");

        const isReady = await loadOwariRoboWidget();
        const didOpen = isReady && window.OwariRobo.open({ target: form.dataset.roboTarget || "widget", message });

        if (didOpen) {
          input.value = "";
        } else {
          setStatus("Não foi possível abrir a IA agora. Tente novamente em instantes.");
        }

        syncStarterButton();
      });

      syncStarterButton();
    });

    window.addEventListener("owari-robo:starter-error", () => {
      document.querySelectorAll("[data-robo-starter-status]").forEach((status) => {
        status.textContent = "Não foi possível abrir a IA agora. Tente novamente em instantes.";
      });
    });
  };

  // Qualquer elemento com data-robo-open abre o widget de IA; o href continua
  // valendo como alternativa caso o widget não carregue.
  const initRoboOpenTriggers = () => {
    Array.from(document.querySelectorAll("[data-robo-open]")).forEach((trigger) => {
      if (trigger.dataset.roboOpenBound === "true") {
        return;
      }

      trigger.dataset.roboOpenBound = "true";
      trigger.addEventListener("click", async (event) => {
        event.preventDefault();

        const isReady = await loadOwariRoboWidget();
        const didOpen =
          isReady && window.OwariRobo.open({ target: trigger.dataset.roboOpen || "widget" });

        if (didOpen) {
          return;
        }

        const fallbackHref = trigger.getAttribute("href");
        if (fallbackHref) {
          window.location.assign(fallbackHref);
        }
      });
    });
  };

  const initHeroCarousel = () => {
    const hero = document.querySelector(".hero");
    const track = hero ? hero.querySelector("[data-hero-slides]") : null;
    if (!hero || !track) {
      return;
    }

    const slides = Array.from(track.querySelectorAll(".hero-slide"));
    if (slides.length === 0) {
      return;
    }

    const captions = (data.hero && Array.isArray(data.hero.slides) ? data.hero.slides : []).map(
      (slide) => slide.caption || "",
    );
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const captionText = hero.querySelector("[data-hero-caption]");
    const captionIndex = hero.querySelector("[data-hero-index]");
    const prevButton = hero.querySelector("[data-hero-prev]");
    const nextButton = hero.querySelector("[data-hero-next]");
    const interval = Math.max(2500, Number(data.hero && data.hero.slideInterval) || 6500);
    hero.style.setProperty("--hero-interval", `${interval}ms`);

    let current = 0;
    let timer = 0;
    let hovered = false;
    let pageVisible = !document.hidden;
    let onScreen = true;
    let uncovered = true;

    const loadSlide = (index) => {
      const image = slides[index] ? slides[index].querySelector(".hero-slide-image") : null;
      if (!image || !image.dataset.src) {
        return;
      }

      if (image.dataset.srcset) {
        image.srcset = image.dataset.srcset;
        delete image.dataset.srcset;
      }
      image.src = image.dataset.src;
      delete image.dataset.src;
    };

    // A barrinha de progresso do ponto ativo acompanha o tempo do próximo slide.
    const restartDotProgress = () => {
      const fill = dots[current] ? dots[current].querySelector(".hero-dot-fill") : null;
      if (!fill) {
        return;
      }

      fill.style.animation = "none";
      void fill.offsetWidth;
      fill.style.animation = "";
    };

    const stop = () => {
      window.clearTimeout(timer);
      timer = 0;
    };

    const play = () => {
      stop();
      if (slides.length < 2 || hovered || !pageVisible || !onScreen || !uncovered || prefersReducedMotion()) {
        hero.classList.add("is-hero-paused");
        return;
      }

      hero.classList.remove("is-hero-paused");
      restartDotProgress();
      timer = window.setTimeout(() => goTo(current + 1), interval);
    };

    // Precisa acompanhar o fade de .hero-slide no main.css (1400ms).
    const FADE_MS = 1400;
    const leavingTimers = new Map();

    const clearLeaving = (slide) => {
      const pending = leavingTimers.get(slide);
      if (pending) {
        window.clearTimeout(pending);
        leavingTimers.delete(slide);
      }
      slide.classList.remove("is-leaving", "is-holding");
    };

    // A foto que sai continua com o ken burns até o fade terminar: sem isso
    // ela volta ao enquadramento inicial ainda visível, o que pisca.
    const markLeaving = (slide, hold) => {
      const pending = leavingTimers.get(slide);
      if (pending) {
        window.clearTimeout(pending);
      }

      slide.classList.add("is-leaving");
      // Só segura a foto anterior se a próxima já estiver carregada; caso contrário
      // o que ficaria por cima é um quadro vazio.
      slide.classList.toggle("is-holding", Boolean(hold));
      leavingTimers.set(
        slide,
        window.setTimeout(() => {
          leavingTimers.delete(slide);
          slide.classList.remove("is-leaving", "is-holding");
        }, FADE_MS + 120),
      );
    };

    function goTo(index) {
      const next = ((index % slides.length) + slides.length) % slides.length;
      if (next !== current) {
        loadSlide(next);
        slides[current].classList.remove("is-active");
        slides[current].setAttribute("aria-hidden", "true");
        const incoming = slides[next].querySelector(".hero-slide-image");
        markLeaving(slides[current], incoming && incoming.complete && incoming.naturalWidth > 0);
        clearLeaving(slides[next]);
        slides[next].classList.add("is-active");
        slides[next].setAttribute("aria-hidden", "false");
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === next);
          dot.setAttribute("aria-current", dotIndex === next ? "true" : "false");
        });

        if (captionText) {
          captionText.textContent = captions[next] || "";
          captionText.classList.remove("is-in");
          void captionText.offsetWidth;
          captionText.classList.add("is-in");
        }

        if (captionIndex) {
          captionIndex.textContent = String(next + 1).padStart(2, "0");
        }

        current = next;
        loadSlide((next + 1) % slides.length);
      }

      play();
    }

    prevButton?.addEventListener("click", () => goTo(current - 1));
    nextButton?.addEventListener("click", () => goTo(current + 1));
    dots.forEach((dot) => {
      dot.addEventListener("click", () => goTo(Number(dot.getAttribute("data-hero-dot")) || 0));
    });

    hero.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(current - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(current + 1);
      }
    });

    const setHovered = (value) => {
      hovered = value;
      play();
    };

    // Só a barra de controles pausa a troca automática: o herói ocupa a tela inteira.
    const bar = hero.querySelector(".hero-bar");
    bar?.addEventListener("pointerenter", () => setHovered(true));
    bar?.addEventListener("pointerleave", () => setHovered(false));
    hero.addEventListener("focusin", () => setHovered(true));
    hero.addEventListener("focusout", (event) => {
      if (!hero.contains(event.relatedTarget)) {
        setHovered(false);
      }
    });

    // Arrastar com o dedo troca a foto no celular. O ouvinte fica no palco porque
    // o scrim e o conteúdo cobrem a faixa de fotos e receberiam o toque antes dela.
    const stage = hero.querySelector(".hero-stage");
    let swipeStartX = 0;
    let swipePointerId = null;
    stage?.addEventListener(
      "pointerdown",
      (event) => {
        // Só o primeiro dedo conta: com dois, o pinçar viraria troca de foto.
        if (event.pointerType === "mouse" || !event.isPrimary || swipePointerId !== null) {
          return;
        }

        const target = event.target instanceof Element ? event.target : null;
        if (target && target.closest("a, button")) {
          return;
        }

        swipePointerId = event.pointerId;
        swipeStartX = event.clientX;
      },
      { passive: true },
    );
    stage?.addEventListener(
      "pointerup",
      (event) => {
        if (swipePointerId === null || event.pointerId !== swipePointerId) {
          return;
        }

        swipePointerId = null;
        const delta = event.clientX - swipeStartX;
        if (Math.abs(delta) > 44) {
          goTo(current + (delta < 0 ? 1 : -1));
        }
      },
      { passive: true },
    );
    stage?.addEventListener(
      "pointercancel",
      (event) => {
        if (event.pointerId === swipePointerId) {
          swipePointerId = null;
        }
      },
      { passive: true },
    );

    document.addEventListener("visibilitychange", () => {
      pageVisible = !document.hidden;
      play();
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            onScreen = entry.isIntersecting;
            play();
          });
        },
        { threshold: 0.12 },
      );
      observer.observe(hero);
    }

    // O herói é sticky: continua "intersectando" mesmo depois de coberto pelas
    // seções seguintes, então a cobertura é medida pela própria rolagem.
    let coverFrame = 0;
    const refreshCoverage = () => {
      coverFrame = 0;
      const next = window.scrollY < hero.offsetHeight - 4;
      if (next === uncovered) {
        return;
      }

      uncovered = next;
      play();
    };

    const requestCoverage = () => {
      window.cancelAnimationFrame(coverFrame);
      coverFrame = window.requestAnimationFrame(refreshCoverage);
    };

    window.addEventListener("scroll", requestCoverage, { passive: true });
    window.addEventListener("resize", requestCoverage);
    refreshCoverage();

    slides.forEach((slide, index) => {
      if (index <= 1) {
        loadSlide(index);
      }
    });
    play();
  };

  const initHeroScrollAnimation = () => {
    const hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }

    const setProgress = (progress) => {
      hero.style.setProperty("--hero-scroll-progress", progress.toFixed(3));
    };

    if (prefersReducedMotion()) {
      setProgress(0);
      return;
    }

    let ticking = false;

    const update = () => {
      const animationEnd = Math.max(window.innerHeight * 0.75, 1);
      const progress = Math.min(Math.max(window.scrollY / animationEnd, 0), 1);
      setProgress(progress);
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  };

  const initHeroLoadReveal = () => {
    if (prefersReducedMotion()) {
      document.documentElement.classList.remove("is-hero-booting");
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.documentElement.classList.add("is-hero-ready");
      });
    });

    window.setTimeout(() => {
      document.documentElement.classList.remove("is-hero-booting", "is-hero-ready");
    }, 1900);
  };

  // Na home o cabeçalho fica escondido enquanto a página está no topo, para não
  // cobrir a foto, e desce assim que a pessoa começa a rolar.
  const initHeaderReveal = () => {
    const body = document.body;
    if (!body.classList.contains("home-page")) {
      return;
    }

    const showAt = 72;
    const hideAt = 24;
    let visible = false;
    let frame = 0;

    const apply = () => {
      frame = 0;
      // Com o menu aberto a rolagem fica travada e o botão de fechar vive no
      // cabeçalho: manter o estado atual evita esconder o próprio controle.
      if (body.classList.contains("no-scroll")) {
        return;
      }

      const offset = window.scrollY;
      const next = visible ? offset > hideAt : offset > showAt;
      if (next === visible) {
        return;
      }

      visible = next;
      body.classList.toggle("is-header-visible", visible);
    };

    // Cancelar e repedir evita ficar preso caso um quadro nunca chegue (aba em segundo plano).
    const requestApply = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(apply);
    };

    // Quem navega pelo teclado precisa ver o cabeçalho ao chegar nele pelo Tab.
    const header = document.querySelector(".site-header");
    header?.addEventListener("focusin", () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      visible = true;
      body.classList.add("is-header-visible");
    });
    header?.addEventListener("focusout", (event) => {
      if (!header.contains(event.relatedTarget)) {
        requestApply();
      }
    });

    // O menu congela o estado do cabeçalho; ao fechar é preciso reavaliar.
    if ("MutationObserver" in window) {
      let frozen = body.classList.contains("no-scroll");
      new MutationObserver(() => {
        const isFrozen = body.classList.contains("no-scroll");
        if (frozen && !isFrozen) {
          requestApply();
        }
        frozen = isFrozen;
      }).observe(body, { attributes: true, attributeFilter: ["class"] });
    }

    apply();
    window.requestAnimationFrame(() => body.classList.add("is-header-ready"));
    window.addEventListener("scroll", requestApply, { passive: true });
    window.addEventListener("resize", requestApply);
    window.addEventListener("load", requestApply, { once: true });
  };

  const initContactForm = () => {
    const form = document.getElementById("contactForm");
    const config = data && data.contactForm;
    if (!form || !config) {
      return;
    }

    const card = form.parentElement;
    const status = document.getElementById("formStatus");
    const errorLink = card.querySelector("[data-contact-error-link]");
    const submitButton = card.querySelector("[data-contact-submit]");
    const success = card.querySelector("[data-contact-success]");
    const resetButton = card.querySelector("[data-contact-reset]");

    if (!status || !submitButton || !success) {
      return;
    }

    const SUBMIT_TIMEOUT = 20000;
    let isSubmitting = false;

    const setStatus = (message, tone = "") => {
      status.textContent = message;
      status.classList.toggle("form-status--error", tone === "error");
      if (errorLink) {
        errorLink.hidden = tone !== "error";
      }
    };

    // O formulário não usa novalidate: o submit só dispara depois da validação nativa.
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      const originalLabel = submitButton.textContent;
      // aria-disabled em vez de disabled: o botão não perde o foco durante o envio.
      isSubmitting = true;
      form.setAttribute("aria-busy", "true");
      submitButton.setAttribute("aria-disabled", "true");
      submitButton.textContent = config.sendingLabel || "Enviando...";
      // Texto diferente do rótulo do botão: no envio por Enter o foco fica no campo,
      // e a live region é o único canal que anuncia o progresso.
      setStatus(config.sendingText || "Enviando sua mensagem, aguarde.");

      const controller = typeof AbortController === "function" ? new AbortController() : null;
      const timeoutId = controller ? window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT) : null;
      const payload = Object.fromEntries(new FormData(form).entries());

      try {
        const response = await fetch(config.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller ? controller.signal : undefined,
        });
        const result = await response.json().catch(() => null);

        // Só é sucesso quando a resposta pôde ser lida e não nega o envio.
        if (!response.ok || !result || result.success === false) {
          throw new Error("Envio recusado pelo serviço de e-mail.");
        }

        form.reset();
        form.hidden = true;
        success.hidden = false;
        success.focus();
      } catch (error) {
        // Abortar o fetch não desfaz um POST já entregue: a mensagem pode ter saído.
        const timedOut = error && error.name === "AbortError";
        setStatus(
          (timedOut ? config.timeoutText : config.errorText) ||
            "Não foi possível enviar sua mensagem agora.",
          "error",
        );
      } finally {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        isSubmitting = false;
        form.removeAttribute("aria-busy");
        submitButton.removeAttribute("aria-disabled");
        submitButton.textContent = originalLabel;
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        success.hidden = true;
        form.hidden = false;
        setStatus("");
        // Pula os campos ocultos (access_key, subject, from_name, botcheck).
        const firstField = form.querySelector(
          'input:not([type="hidden"]):not([type="checkbox"]), select, textarea',
        );
        if (firstField) {
          firstField.focus();
        }
      });
    }
  };

  const initEmolumentCalculator = () => {
    const panel = document.querySelector("[data-emolument-calculator]");
    const calc = data && data.emolumentCalculator;
    if (!panel || !calc) {
      return;
    }

    const form = panel.querySelector("[data-emolument-form]");
    const success = panel.querySelector("[data-emolument-success]");
    const status = panel.querySelector("[data-emolument-status]");
    const errorLink = panel.querySelector("[data-emolument-error-link]");
    const submitButton = panel.querySelector("[data-emolument-submit]");
    const resetButton = panel.querySelector("[data-emolument-reset]");
    const formTitle = panel.querySelector("[data-emolument-form-title]");
    const nameInput = panel.querySelector("#emolumentName");
    const phoneInput = panel.querySelector("#emolumentPhone");
    const valueInput = panel.querySelector("#emolumentValue");

    if (!form || !success || !status || !submitButton || !nameInput || !phoneInput || !valueInput) {
      return;
    }

    const SUBMIT_TIMEOUT = 20000;
    const currencyFormatter = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

    // Zeros à esquerda são descartados para que o campo possa ser esvaziado com backspace.
    const currencyDigits = (value) => onlyDigits(value).replace(/^0+/, "").slice(0, 13);

    const formatCurrency = (digits) => (digits ? currencyFormatter.format(Number(digits) / 100) : "");

    // Aceita colagem com DDI (55) e mantém no máximo DDD + 9 dígitos.
    const phoneDigitsOf = (value) => {
      const digits = onlyDigits(value);
      const local = digits.length > 11 && digits.startsWith("55") ? digits.slice(2) : digits;
      return local.slice(0, 11);
    };

    const formatPhone = (digits) => {
      if (!digits) {
        return "";
      }
      if (digits.length <= 2) {
        return `(${digits}`;
      }
      if (digits.length <= 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      }
      if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      }
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    };

    // Mantém o cursor depois da mesma quantidade de dígitos que havia antes da máscara.
    const restoreCaret = (input, digitsBeforeCaret) => {
      const masked = input.value;
      if (digitsBeforeCaret <= 0) {
        input.setSelectionRange(0, 0);
        return;
      }

      let seen = 0;
      for (let index = 0; index < masked.length; index += 1) {
        if (/\d/.test(masked[index])) {
          seen += 1;
          if (seen === digitsBeforeCaret) {
            input.setSelectionRange(index + 1, index + 1);
            return;
          }
        }
      }
      input.setSelectionRange(masked.length, masked.length);
    };

    const setStatus = (message, tone = "") => {
      status.textContent = message;
      status.classList.toggle("form-status--error", tone === "error");
      if (errorLink) {
        errorLink.hidden = tone !== "error-send";
      }
      if (tone === "error-send") {
        status.classList.add("form-status--error");
      }
    };

    valueInput.addEventListener("input", () => {
      // Moeda é preenchida da direita para a esquerda: o cursor permanece no fim.
      valueInput.value = formatCurrency(currencyDigits(valueInput.value));
    });

    phoneInput.addEventListener("input", () => {
      const caret = typeof phoneInput.selectionEnd === "number" ? phoneInput.selectionEnd : phoneInput.value.length;
      const digitsBeforeCaret = onlyDigits(phoneInput.value.slice(0, caret)).length;
      phoneInput.value = formatPhone(phoneDigitsOf(phoneInput.value));
      restoreCaret(phoneInput, digitsBeforeCaret);
    });

    let isSubmitting = false;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      const fullName = nameInput.value.trim().replace(/\s+/g, " ");
      const phoneDigits = phoneDigitsOf(phoneInput.value);
      const valueDigits = currencyDigits(valueInput.value);

      if (fullName.length < 3) {
        nameInput.focus();
        setStatus("Informe seu nome para que possamos entrar em contato.", "error");
        return;
      }

      if (phoneDigits.length < 10) {
        phoneInput.focus();
        setStatus("Informe um número de WhatsApp com DDD.", "error");
        return;
      }

      if (!valueDigits || Number(valueDigits) <= 0) {
        valueInput.focus();
        setStatus("Informe o valor do imóvel.", "error");
        return;
      }

      const originalLabel = submitButton.textContent;
      // aria-disabled em vez de disabled: o botão não perde o foco durante o envio.
      isSubmitting = true;
      submitButton.setAttribute("aria-disabled", "true");
      submitButton.textContent = calc.sendingLabel || "Enviando...";
      setStatus("");

      const controller = typeof AbortController === "function" ? new AbortController() : null;
      const timeoutId = controller ? window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT) : null;

      const payload = {
        access_key: calc.accessKey,
        subject: calc.subject,
        from_name: calc.fromName || "Site 1º Ofício Rio das Ostras",
        "Nome completo": fullName,
        WhatsApp: formatPhone(phoneDigits),
        "Valor do imóvel": `R$ ${formatCurrency(valueDigits)}`,
        Origem: `Calculadora de emolumentos - ${isHomePage ? "Página inicial" : "Serviços online"}`,
      };

      try {
        const response = await fetch(calc.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller ? controller.signal : undefined,
        });
        const result = await response.json().catch(() => null);

        // Só é sucesso quando a resposta pôde ser lida e não nega o envio.
        if (!response.ok || !result || result.success === false) {
          throw new Error("Envio recusado pelo serviço de e-mail.");
        }

        form.reset();
        form.hidden = true;
        if (formTitle) {
          formTitle.hidden = true;
        }
        success.hidden = false;
        success.focus();
      } catch (error) {
        setStatus(calc.errorText || "Não foi possível enviar agora. Tente novamente.", "error-send");
      } finally {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        isSubmitting = false;
        submitButton.removeAttribute("aria-disabled");
        submitButton.textContent = originalLabel;
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        success.hidden = true;
        form.hidden = false;
        if (formTitle) {
          formTitle.hidden = false;
        }
        setStatus("");
        nameInput.focus();
      });
    }
  };

  // O conteúdo é renderizado por JS, então a âncora da URL só existe depois do render.
  const scrollToInitialHash = () => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) {
      return;
    }

    let target = null;
    try {
      target = document.querySelector(hash);
    } catch (error) {
      return;
    }

    if (!target) {
      return;
    }

    let lastAppliedTop = -1;

    const jumpToTarget = () => {
      // O html tem scroll-behavior: smooth; aqui o salto precisa ser imediato.
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      target.scrollIntoView({ block: "start" });
      root.style.scrollBehavior = previousBehavior;
      lastAppliedTop = Math.round(window.scrollY);
    };

    // Imagens acima da âncora deslocam o layout depois do primeiro quadro,
    // então a posição é reaplicada até a página estabilizar.
    const reapply = () => {
      if (lastAppliedTop >= 0 && Math.abs(window.scrollY - lastAppliedTop) > 4) {
        return; // a pessoa já rolou a página por conta própria
      }
      jumpToTarget();
    };

    window.requestAnimationFrame(jumpToTarget);
    window.setTimeout(reapply, 250);
    window.setTimeout(reapply, 900);
    window.addEventListener("load", () => window.requestAnimationFrame(reapply), { once: true });
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
            if (entry.target.classList.contains("why-section")) {
              animateMetricValues(entry.target);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
  };

  renderHeader();
  renderSiteContent();
  renderFooter();
  promoteFloatingWhatsApp();
  void loadOwariRoboWidget();
  updateWhyMetrics();
  initStreamText();
  initHeroCarousel();
  initHeroScrollAnimation();
  initHeroLoadReveal();
  initHeaderReveal();
  initNavigation();
  initStatsSection();
  void hydrateSiteVisitMetrics();
  initFaq();
  initGuideGroups();
  initGallery();
  initHeroNews();
  initOwariRoboStarterForms();
  initRoboOpenTriggers();
  initContactForm();
  initEmolumentCalculator();
  initScrollReveal();
  scrollToInitialHash();
});
