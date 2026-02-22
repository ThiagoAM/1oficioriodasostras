document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      siteNav.classList.toggle("is-open");
    });

    siteNav.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
      });
    });
  }

  const initStatsSection = () => {
    const statsGrid = document.getElementById("statsGrid");
    const statsYearControls = document.getElementById("statsYearControls");
    const statsTypeControls = document.getElementById("statsTypeControls");
    const statsPeriodLabel = document.getElementById("statsPeriodLabel");

    if (!statsGrid || !statsYearControls || !statsTypeControls || !statsPeriodLabel) {
      return;
    }

    const statsByYear = {
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
        period: "Período: 01/01/2026 a 19/01/2026.",
        items: [
          { id: "nascimentos", label: "Nascimentos", value: 74, category: "civil" },
          { id: "obitos", label: "Óbitos", value: 58, category: "civil" },
          { id: "habilitacoes-casamento", label: "Habilitações de casamento", value: 26, category: "civil" },
          { id: "registros-casamento", label: "Registros de casamento", value: 33, category: "civil" },
          { id: "certidoes-outras-cidades", label: "Certidões externas", value: 55, category: "civil" },
          { id: "apostilamentos-haia", label: "Apostilamentos de Haia", value: 66, category: "autenticacao" },
          { id: "total-escrituras", label: "Total de escrituras", value: 80, category: "notas" },
          { id: "atas-notariais", label: "Atas notariais", value: 2, category: "notas" },
          { id: "compra-venda", label: "Escrituras compra e venda", value: 46, category: "notas" },
          { id: "inventario", label: "Escrituras de inventário", value: 2, category: "notas" },
          { id: "uniao-estavel", label: "Declaração de união estável", value: 17, category: "notas" },
          { id: "dissolucao-uniao-estavel", label: "Dissolução de união estável", value: 3, category: "notas" },
          { id: "pacto-antenupcial", label: "Pacto antenupcial", value: 3, category: "notas" },
          { id: "divorcio", label: "Escrituras de divórcio", value: 4, category: "notas" },
          { id: "doacao", label: "Escrituras de doação", value: 2, category: "notas" },
          { id: "emancipacao", label: "Emancipações", value: 1, category: "notas" },
          { id: "procuracoes", label: "Procurações", value: 26, category: "notas" },
          { id: "autenticacoes", label: "Autenticações", value: 378, category: "autenticacao" },
          { id: "reconhecimentos-firma", label: "Reconhecimentos de firma", value: 3003, category: "autenticacao" },
          { id: "protestados", label: "Títulos protestados", value: 2521, category: "protesto" },
          { id: "cancelados", label: "Títulos cancelados", value: 184, category: "protesto" },
          { id: "pagos", label: "Títulos pagos", value: 231, category: "protesto" },
          { id: "total-protestos", label: "Total de títulos em protesto", value: 2936, category: "protesto" },
        ],
      },
    };

    const categoryMeta = {
      civil: { label: "Registro Civil", icon: "mdi:account-child-outline" },
      notas: { label: "Notas e Escrituras", icon: "mdi:file-document-edit-outline" },
      protesto: { label: "Protesto", icon: "mdi:alert-decagram-outline" },
      autenticacao: { label: "Firmas e Cópias", icon: "mdi:signature-freehand" },
    };

    const layoutByKey = {
      md: "stats-card--md",
      sm: "stats-card--sm",
    };

    const rowTemplates = [
      ["md", "md", "md"],
      ["md", "md", "sm", "sm"],
      ["md", "sm", "sm", "sm", "sm"],
      ["sm", "sm", "sm", "sm", "sm", "sm"],
    ];

    const yearButtons = Array.from(statsYearControls.querySelectorAll("[data-stats-year]"));
    const typeButtons = Array.from(statsTypeControls.querySelectorAll("[data-stats-type]"));
    const availableYears = Object.keys(statsByYear);
    if (yearButtons.length === 0 || typeButtons.length === 0 || availableYears.length === 0) {
      return;
    }

    const numberFormatter = new Intl.NumberFormat("pt-BR");

    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const createSeededRng = (seedValue) => {
      let seed = 0;
      const normalized = String(seedValue ?? "stats");
      for (let i = 0; i < normalized.length; i += 1) {
        seed = (seed * 31 + normalized.charCodeAt(i)) >>> 0;
      }
      return () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
    };

    const shuffle = (items, rng) => {
      const shuffled = [...items];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
      }
      return shuffled;
    };

    const refreshIcons = () => {
      if (window.Iconify && typeof window.Iconify.scan === "function") {
        window.Iconify.scan(statsGrid);
      }
    };

    const buildCardContent = (item) => {
      const meta = categoryMeta[item.category] || categoryMeta.notas;
      return `
        <div class="stats-card-content">
          <div class="stats-card-top">
            <span class="stats-tag">${escapeHtml(meta.label)}</span>
            <span class="iconify stats-card-icon" data-icon="${escapeHtml(meta.icon)}" aria-hidden="true"></span>
          </div>
          <p class="stats-card-value">${escapeHtml(numberFormatter.format(item.value))}</p>
          <h3 class="stats-card-label">${escapeHtml(item.label)}</h3>
        </div>
      `;
    };

    const buildCardMarkup = (slot, index) => `
      <article
        class="stats-card ${slot.sizeClass}"
        data-slot-index="${index}"
        data-item-id="${escapeHtml(slot.item.id)}"
        data-stat-category="${escapeHtml(slot.item.category)}"
        style="--stats-order:${index};"
      >
        <div class="stats-card-face">${buildCardContent(slot.item)}</div>
      </article>
    `;

    const setActiveButton = (year) => {
      yearButtons.forEach((button) => {
        const buttonYear = button.getAttribute("data-stats-year");
        const isActive = buttonYear === year;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    const setActiveTypeButton = (type) => {
      typeButtons.forEach((button) => {
        const buttonType = button.getAttribute("data-stats-type");
        const isActive = buttonType === type;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    const buildSlots = (items, year) => {
      const rng = createSeededRng(`layout-${year}`);
      const randomized = shuffle(items, rng);
      const sizeKeys = [];

      while (sizeKeys.length < randomized.length) {
        const template = rowTemplates[Math.floor(rng() * rowTemplates.length)] || rowTemplates[0];
        sizeKeys.push(...template);
      }

      return randomized.map((item, index) => {
        const sizeKey = sizeKeys[index] || "sm";
        return {
          item,
          sizeClass: layoutByKey[sizeKey] || layoutByKey.sm,
        };
      });
    };

    const preferredDefaultYear = "2026";
    let activeYear =
      (statsByYear[preferredDefaultYear] ? preferredDefaultYear : null) ||
      yearButtons.find((button) => button.classList.contains("is-active"))?.getAttribute("data-stats-year") ||
      availableYears[0];
    if (!activeYear || !statsByYear[activeYear]) {
      activeYear = availableYears[0];
    }
    let activeType =
      typeButtons.find((button) => button.classList.contains("is-active"))?.getAttribute("data-stats-type") || "all";
    if (!activeType) {
      activeType = "all";
    }
    let transitionToken = 0;
    let transitionOutTimeoutId = 0;
    let transitionInTimeoutId = 0;

    const clearTransitionTimers = () => {
      if (transitionOutTimeoutId) {
        window.clearTimeout(transitionOutTimeoutId);
        transitionOutTimeoutId = 0;
      }
      if (transitionInTimeoutId) {
        window.clearTimeout(transitionInTimeoutId);
        transitionInTimeoutId = 0;
      }
    };

    const getFilteredItems = (items) => {
      if (activeType === "all") {
        return items;
      }
      return items.filter((item) => item.category === activeType);
    };

    const renderState = ({ year, animate }) => {
      const yearData = statsByYear[year];
      if (!yearData) {
        return;
      }

      const applyRender = () => {
        activeYear = year;
        setActiveButton(year);
        setActiveTypeButton(activeType);
        statsPeriodLabel.textContent = yearData.period;
        const filteredItems = getFilteredItems(yearData.items);
        const slots = buildSlots(filteredItems, `${year}-${activeType}`);
        statsGrid.innerHTML = slots.map((slot, index) => buildCardMarkup(slot, index)).join("");
        refreshIcons();
      };

      if (!animate) {
        clearTransitionTimers();
        statsGrid.classList.remove("is-transitioning", "is-entering");
        applyRender();
        return;
      }

      clearTransitionTimers();
      transitionToken += 1;
      const currentToken = transitionToken;
      statsGrid.classList.remove("is-entering");
      statsGrid.classList.add("is-transitioning");

      transitionOutTimeoutId = window.setTimeout(() => {
        if (currentToken !== transitionToken) {
          return;
        }
        applyRender();
        statsGrid.classList.remove("is-transitioning");
        statsGrid.classList.add("is-entering");

        transitionInTimeoutId = window.setTimeout(() => {
          if (currentToken !== transitionToken) {
            return;
          }
          statsGrid.classList.remove("is-entering");
          transitionInTimeoutId = 0;
        }, 520);

        transitionOutTimeoutId = 0;
      }, 190);
    };

    yearButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const year = button.getAttribute("data-stats-year");
        if (!year || year === activeYear || !statsByYear[year]) {
          return;
        }
        renderState({ year, animate: true });
      });
    });

    typeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.getAttribute("data-stats-type");
        if (!type || type === activeType) {
          return;
        }
        activeType = type;
        renderState({ year: activeYear, animate: true });
      });
    });

    renderState({ year: activeYear, animate: false });
  };

  initStatsSection();

  const initScrollReveal = () => {
    const revealTargets = Array.from(
      document.querySelectorAll(
        [
          ".section-header",
          ".info-card",
          ".service-card",
          ".pill-card",
          ".paper-form-card",
          ".useful-link-card",
          ".hours-panel",
          ".location-map-wrapper",
          ".about-image",
          ".about-text",
          ".gallery-toolbar",
          ".gallery-masonry",
          ".contact-form-card",
          ".contact-text",
          ".stats-controls",
          ".stats-grid",
          ".stats-card",
          ".faq-controls",
          ".faq-meta",
          ".faq-list",
        ].join(","),
      ),
    );

    if (revealTargets.length === 0) {
      return;
    }

    let lastScrollY = window.scrollY;
    let scrollDirection = "down";

    revealTargets.forEach((target, index) => {
      target.classList.add("reveal-on-scroll");
      target.style.setProperty("--reveal-delay", `${(index % 6) * 70}ms`);
    });

    window.addEventListener(
      "scroll",
      () => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;
        if (Math.abs(delta) < 2) {
          return;
        }
        scrollDirection = delta > 0 ? "down" : "up";
        lastScrollY = currentScrollY;
      },
      { passive: true },
    );

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("is-revealed"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const shouldReveal = entry.isIntersecting && entry.intersectionRatio >= 0.14;
          if (!shouldReveal) {
            entry.target.classList.remove("is-revealed", "reveal-no-anim");
            return;
          }

          if (scrollDirection === "down") {
            entry.target.classList.remove("reveal-no-anim");
          } else {
            entry.target.classList.add("reveal-no-anim");
          }

          entry.target.classList.add("is-revealed");
        });
      },
      {
        threshold: [0, 0.14, 0.3],
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealTargets.forEach((target) => {
      revealObserver.observe(target);
    });
  };

  initScrollReveal();

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
    const MAX_VISIBLE_FAQ = 12;
    if (faqItems.length === 0) {
      faqResultCount.textContent = "FAQ em atualização.";
      faqList.innerHTML = '<p class="faq-empty">As perguntas frequentes estão sendo atualizadas no momento.</p>';
      faqShowMoreBtn.hidden = true;
      return;
    }

    const normalize = (value) =>
      String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

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

    let activeCategory = "Todas";
    let searchTerm = "";
    let showAllFaq = false;
    const discoveredCategories = [...new Set(faqItems.map((item) => item.category).filter(Boolean))];
    const prioritizedCategories = ["Pagamento", "Escrituras e Notas"];
    const categories = [
      "Todas",
      ...prioritizedCategories.filter((category) => discoveredCategories.includes(category)),
      ...discoveredCategories.filter((category) => !prioritizedCategories.includes(category)),
    ];
    const synonymGroups = [
      ["preco", "precos", "valor", "valores", "custo", "custos", "taxa", "taxas", "emolumento", "emolumentos"],
      ["documento", "documentos", "comprovante", "comprovantes", "papel", "papeis"],
      ["casamento", "matrimonio", "nupcias"],
      ["uniao", "convivencia"],
      ["obito", "falecimento"],
      ["nascimento", "nascido"],
      ["whatsapp", "telefone", "contato"],
      ["agendamento", "agendar", "marcar"],
      ["prazo", "tempo"],
    ];

    const synonymMap = new Map();
    synonymGroups.forEach((group) => {
      const normalizedGroup = group.map((term) => normalize(term));
      normalizedGroup.forEach((term) => {
        synonymMap.set(term, normalizedGroup);
      });
    });

    const tokenize = (value) =>
      normalize(value)
        .split(/[\s,.;:!?()[\]{}"'/\\-]+/)
        .filter(Boolean);

    const getFilteredItems = () =>
      faqItems.filter((item) => {
        const categoryMatch = activeCategory === "Todas" || item.category === activeCategory;
        if (!categoryMatch) {
          return false;
        }

        const queryTokens = tokenize(searchTerm);
        if (queryTokens.length === 0) {
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

        return queryTokens.every((token) => {
          const variants = synonymMap.get(token) || [token];
          return variants.some((variant) => haystack.includes(variant));
        });
      });

    const renderCategoryChips = () => {
      faqCategoryChips.innerHTML = categories
        .map(
          (category) => `
            <button
              type="button"
              class="faq-chip${category === activeCategory ? " is-active" : ""}"
              data-faq-category="${escapeHtml(category)}"
            >
              ${escapeHtml(category)}
            </button>
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
          showAllFaq = false;
          renderCategoryChips();
          renderFaqItems();
        });
      });
    };

    const renderFaqItems = () => {
      const filteredItems = getFilteredItems();
      const count = filteredItems.length;
      const shouldLimit = !showAllFaq && count > MAX_VISIBLE_FAQ;
      const visibleItems = shouldLimit ? filteredItems.slice(0, MAX_VISIBLE_FAQ) : filteredItems;
      faqResultCount.textContent =
        shouldLimit && count > 0
          ? `${count} perguntas encontradas. Exibindo ${MAX_VISIBLE_FAQ}.`
          : `${count} ${count === 1 ? "pergunta encontrada" : "perguntas encontradas"}.`;
      faqShowMoreBtn.hidden = !shouldLimit;

      if (count === 0) {
        faqList.innerHTML =
          '<p class="faq-empty">Nenhum resultado encontrado. Tente outro termo ou escolha outra categoria.</p>';
        faqShowMoreBtn.hidden = true;
        return;
      }

      faqList.innerHTML = visibleItems
        .map(
          (item, index) => `
            <details class="faq-item"${index < 2 ? " open" : ""}>
              <summary class="faq-question">
                <span class="faq-question-text">${escapeHtml(item.question)}</span>
                <span class="iconify faq-question-icon" data-icon="mdi:chevron-down" aria-hidden="true"></span>
              </summary>
              <div class="faq-answer">
                ${buildAnswerHtml(item.answer)}
              </div>
            </details>
          `,
        )
        .join("");
    };

    faqSearchInput.addEventListener("input", () => {
      searchTerm = faqSearchInput.value;
      showAllFaq = false;
      renderFaqItems();
    });

    faqResetBtn.addEventListener("click", () => {
      searchTerm = "";
      activeCategory = "Todas";
      showAllFaq = false;
      faqSearchInput.value = "";
      renderCategoryChips();
      renderFaqItems();
      faqSearchInput.focus();
    });

    faqShowMoreBtn.addEventListener("click", () => {
      showAllFaq = true;
      renderFaqItems();
    });

    renderCategoryChips();
    renderFaqItems();
  };

  initFaq();

  const galleryMasonry = document.getElementById("galleryMasonry");
  const galleryCategoryControls = document.getElementById("galleryCategoryControls");
  const galleryShuffle = document.getElementById("galleryShuffle");
  const galleryPagePrev = document.getElementById("galleryPagePrev");
  const galleryPageNext = document.getElementById("galleryPageNext");

  const lightbox = document.getElementById("galleryLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxLoading = document.getElementById("lightboxLoading");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  const galleryFilterButtons = galleryCategoryControls
    ? Array.from(galleryCategoryControls.querySelectorAll("[data-gallery-filter]"))
    : [];

  const normalizeGalleryCategory = (value, pathValue) => {
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

  const galleryImages = Array.isArray(window.GALLERY_IMAGES)
    ? window.GALLERY_IMAGES
        .map((entry) => {
          if (typeof entry === "string") {
            const full = entry;
            const category = normalizeGalleryCategory("", full);
            if (!full || !category) {
              return null;
            }
            const fileName = full.split("/").pop() || "imagem";
            const hasLegacyThumb = full.includes("/gallery/") && !full.includes("/gallery/cartorio/") && !full.includes("/gallery/rio-das-ostras/");
            return {
              full,
              thumb: hasLegacyThumb ? full.replace("/gallery/", "/gallery/thumbs/") : full,
              fileName,
              category,
            };
          }

          if (!entry || typeof entry !== "object") {
            return null;
          }

          const full = String(entry.full || entry.src || entry.path || "").trim();
          const category = normalizeGalleryCategory(entry.category, full);
          if (!full || !category) {
            return null;
          }

          const fileName = full.split("/").pop() || "imagem";
          const thumbFromEntry = String(entry.thumb || "").trim();
          const hasLegacyThumb = full.includes("/gallery/") && !full.includes("/gallery/cartorio/") && !full.includes("/gallery/rio-das-ostras/");
          const thumb = thumbFromEntry || (hasLegacyThumb ? full.replace("/gallery/", "/gallery/thumbs/") : full);
          return {
            full,
            thumb,
            fileName,
            category,
          };
        })
        .filter(Boolean)
    : [];

  if (!galleryMasonry || galleryImages.length === 0) {
    return;
  }

  const shuffleItems = (items) => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getGalleryItemsForFilter = (filter) => {
    if (filter === "cartorio" || filter === "rio-das-ostras") {
      return galleryImages.filter((item) => item.category === filter);
    }
    return shuffleItems(galleryImages);
  };

  let activeGalleryFilter = "all";
  let displayImages = getGalleryItemsForFilter(activeGalleryFilter);

  let activeIndex = 0;
  let imageLoadToken = 0;
  let revealObserver = null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUTO_SCROLL_ONLY_MODE = true;
  const ignoreReducedMotionForAutoplay = AUTO_SCROLL_ONLY_MODE;
  const autoplayAllowed = ignoreReducedMotionForAutoplay || !prefersReducedMotion;
  const AUTO_SCROLL_SPEED = AUTO_SCROLL_ONLY_MODE ? 26 : 18;
  const AUTO_RESUME_DELAY_MS = 4200;

  let autoScrollRaf = 0;
  let autoScrollLastTs = 0;
  let autoScrollPosition = 0;
  let autoResumeTimer = 0;
  let autoStartRetryTimer = 0;
  let userInteractedWithGallery = false;
  let isAutoShuffling = false;
  let programmaticScrollLockUntil = 0;

  const total = () => displayImages.length;
  const isLightboxOpen = () => Boolean(lightbox?.classList.contains("is-open"));
  const maxGalleryScroll = () => Math.max(0, galleryMasonry.scrollWidth - galleryMasonry.clientWidth);
  const lockProgrammaticScroll = (durationMs = 72) => {
    programmaticScrollLockUntil = window.performance.now() + durationMs;
  };
  const isProgrammaticScrollEvent = () => window.performance.now() < programmaticScrollLockUntil;

  const shuffleDisplayImages = () => {
    displayImages = shuffleItems(displayImages);
  };

  const setActiveGalleryFilterButton = (filter) => {
    galleryFilterButtons.forEach((button) => {
      const buttonFilter = button.getAttribute("data-gallery-filter");
      const isActive = buttonFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  };

  const stopAutoScroll = () => {
    if (autoScrollRaf) {
      window.cancelAnimationFrame(autoScrollRaf);
      autoScrollRaf = 0;
    }
    galleryMasonry.classList.remove("is-auto-scrolling");
    autoScrollLastTs = 0;
  };

  const queueAutoStartRetry = (delayMs = 700) => {
    if (autoStartRetryTimer || (userInteractedWithGallery && !AUTO_SCROLL_ONLY_MODE)) {
      return;
    }
    autoStartRetryTimer = window.setTimeout(() => {
      autoStartRetryTimer = 0;
      maybeStartAutoScroll();
    }, delayMs);
  };

  const markGalleryInteraction = () => {
    if (AUTO_SCROLL_ONLY_MODE) {
      return;
    }

    userInteractedWithGallery = true;
    stopAutoScroll();

    if (autoResumeTimer) {
      window.clearTimeout(autoResumeTimer);
    }

    autoResumeTimer = window.setTimeout(() => {
      userInteractedWithGallery = false;
      maybeStartAutoScroll();
    }, AUTO_RESUME_DELAY_MS);
  };

  const getLayoutProps = (fileName, index) => {
    let hash = index * 31;
    for (let i = 0; i < fileName.length; i += 1) {
      hash = (hash + fileName.charCodeAt(i) * (i + 7)) % 10007;
    }
    const spanPattern = [1, 1, 2, 2, 2, 3, 2, 1];
    const span = spanPattern[hash % spanPattern.length];
    const colSpan = hash % 9 === 0 ? 2 : 1;
    return { span, colSpan };
  };

  const updatePagerState = () => {
    if (!galleryPagePrev || !galleryPageNext) {
      return;
    }
    const maxScroll = Math.max(0, galleryMasonry.scrollWidth - galleryMasonry.clientWidth);
    const atStart = galleryMasonry.scrollLeft <= 2;
    const atEnd = galleryMasonry.scrollLeft >= maxScroll - 2;
    galleryPagePrev.disabled = atStart;
    galleryPageNext.disabled = atEnd;
  };

  const scrollByPage = (direction) => {
    const distance = Math.max(galleryMasonry.clientWidth * 0.88, 320);
    galleryMasonry.scrollBy({
      left: direction * distance,
      behavior: "smooth",
    });
  };

  const maybeStartAutoScroll = () => {
    if (
      !autoplayAllowed ||
      (userInteractedWithGallery && !AUTO_SCROLL_ONLY_MODE) ||
      isAutoShuffling ||
      isLightboxOpen() ||
      autoScrollRaf
    ) {
      return;
    }
    if (maxGalleryScroll() <= 2) {
      queueAutoStartRetry();
      return;
    }
    galleryMasonry.classList.add("is-auto-scrolling");
    autoScrollPosition = galleryMasonry.scrollLeft;
    autoScrollLastTs = window.performance.now();
    autoScrollRaf = window.requestAnimationFrame(runAutoScroll);
  };

  const animateShuffle = ({ resumeAutoLoop }) => {
    if (isAutoShuffling) {
      return;
    }

    isAutoShuffling = true;
    stopAutoScroll();

    const tiles = Array.from(galleryMasonry.querySelectorAll(".gallery-tile"));
    tiles.forEach((tile, index) => {
      tile.style.setProperty("--tile-order", `${index}`);
    });

    galleryMasonry.classList.remove("is-shuffle-in");
    galleryMasonry.classList.add("is-shuffling");

    window.setTimeout(() => {
      shuffleDisplayImages();
      renderMasonry();

      lockProgrammaticScroll();
      galleryMasonry.scrollLeft = 0;
      autoScrollPosition = 0;
      updatePagerState();

      window.requestAnimationFrame(() => {
        galleryMasonry.classList.remove("is-shuffling");
        galleryMasonry.classList.add("is-shuffle-in");

        const newTiles = Array.from(galleryMasonry.querySelectorAll(".gallery-tile"));
        newTiles.forEach((tile, index) => {
          tile.style.setProperty("--tile-order", `${index}`);
        });

        window.setTimeout(() => {
          galleryMasonry.classList.remove("is-shuffle-in");
          isAutoShuffling = false;

          if (resumeAutoLoop && !userInteractedWithGallery && !isLightboxOpen()) {
            maybeStartAutoScroll();
          }
        }, 560);
      });
    }, 280);
  };

  const runAutoScroll = (timestamp) => {
    if (
      !autoplayAllowed ||
      (userInteractedWithGallery && !AUTO_SCROLL_ONLY_MODE) ||
      isAutoShuffling ||
      isLightboxOpen()
    ) {
      stopAutoScroll();
      return;
    }

    if (!autoScrollLastTs) {
      autoScrollLastTs = timestamp;
    }

    const deltaSeconds = (timestamp - autoScrollLastTs) / 1000;
    autoScrollLastTs = timestamp;

    const maxScroll = maxGalleryScroll();
    if (maxScroll <= 2) {
      stopAutoScroll();
      return;
    }

    autoScrollPosition = Math.min(maxScroll, autoScrollPosition + AUTO_SCROLL_SPEED * deltaSeconds);
    const nextLeft = Math.round(autoScrollPosition);
    if (nextLeft !== galleryMasonry.scrollLeft) {
      lockProgrammaticScroll();
      galleryMasonry.scrollLeft = nextLeft;
    }
    updatePagerState();

    if (autoScrollPosition >= maxScroll - 0.5) {
      stopAutoScroll();
      animateShuffle({ resumeAutoLoop: true });
      return;
    }

    autoScrollRaf = window.requestAnimationFrame(runAutoScroll);
  };

  const renderMasonry = () => {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    galleryMasonry.innerHTML = displayImages
      .map((item, index) => {
        const { span, colSpan } = getLayoutProps(item.fileName, index);
        const eager = index < 8 ? "eager" : "lazy";
        const priority = index < 8 ? "high" : "low";
        return `
          <button
            class="gallery-tile"
            type="button"
            data-index="${index}"
            style="--span:${span};--col-span:${colSpan};--tile-order:${index};"
            aria-label="Abrir foto ${index + 1}"
          >
            <img
              src="${item.thumb}"
              data-full="${item.full}"
              alt="Foto da galeria do cartório e de Rio das Ostras"
              loading="${eager}"
              decoding="async"
              fetchpriority="${priority}"
            />
          </button>
        `;
      })
      .join("");

    if ("IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "100px",
          threshold: 0.08,
        },
      );

      galleryMasonry.querySelectorAll(".gallery-tile").forEach((tile) => {
        revealObserver.observe(tile);
      });
    } else {
      galleryMasonry.querySelectorAll(".gallery-tile").forEach((tile) => {
        tile.classList.add("is-visible");
      });
    }

    galleryMasonry.querySelectorAll(".gallery-tile img").forEach((img) => {
      img.addEventListener(
        "load",
        () => {
          if (!userInteractedWithGallery) {
            maybeStartAutoScroll();
          }
        },
        { once: true },
      );
    });

    updatePagerState();
    autoScrollPosition = galleryMasonry.scrollLeft;
  };

  const applyGalleryFilter = (filter, options = {}) => {
    const resetScroll = options.resetScroll !== false;
    const normalizedFilter = filter === "cartorio" || filter === "rio-das-ostras" ? filter : "all";

    activeGalleryFilter = normalizedFilter;
    setActiveGalleryFilterButton(normalizedFilter);

    stopAutoScroll();
    displayImages = getGalleryItemsForFilter(normalizedFilter);
    activeIndex = 0;
    imageLoadToken += 1;

    renderMasonry();

    if (resetScroll) {
      lockProgrammaticScroll();
      galleryMasonry.scrollLeft = 0;
      autoScrollPosition = 0;
      updatePagerState();
    }

    if (!userInteractedWithGallery) {
      window.setTimeout(maybeStartAutoScroll, 120);
    }
  };

  const preloadAdjacent = (index) => {
    const offsets = [-1, 1];
    offsets.forEach((offset) => {
      const nextIndex = (index + offset + total()) % total();
      const img = new Image();
      img.decoding = "async";
      img.src = displayImages[nextIndex].full;
    });
  };

  const loadLightboxImage = (index) => {
    if (!lightboxImage || !lightboxLoading) {
      return;
    }

    activeIndex = (index + total()) % total();
    const item = displayImages[activeIndex];
    const token = ++imageLoadToken;

    lightboxImage.classList.add("is-ready");
    lightboxImage.src = item.thumb;
    lightboxLoading.classList.remove("is-hidden");
    if (lightboxCaption) {
      lightboxCaption.textContent = "";
    }

    const loader = new Image();
    loader.decoding = "async";
    loader.src = item.full;

    loader.onload = () => {
      if (token !== imageLoadToken) {
        return;
      }
      lightboxImage.src = item.full;
      lightboxLoading.classList.add("is-hidden");
      preloadAdjacent(activeIndex);
    };

    loader.onerror = () => {
      if (token !== imageLoadToken) {
        return;
      }
      lightboxLoading.classList.add("is-hidden");
    };
  };

  const openLightbox = (index) => {
    if (!lightbox) {
      return;
    }
    stopAutoScroll();
    markGalleryInteraction();
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
    lightboxLoading?.classList.add("is-hidden");
    lightboxImage.src = "";
    document.body.classList.remove("no-scroll");
    markGalleryInteraction();
    if (!userInteractedWithGallery) {
      maybeStartAutoScroll();
    }
  };

  const showNext = () => {
    loadLightboxImage(activeIndex + 1);
  };

  const showPrev = () => {
    loadLightboxImage(activeIndex - 1);
  };

  galleryMasonry.addEventListener("click", (event) => {
    const tile = event.target instanceof Element ? event.target.closest(".gallery-tile") : null;
    if (!tile) {
      return;
    }
    markGalleryInteraction();
    const index = Number(tile.dataset.index);
    if (!Number.isNaN(index)) {
      openLightbox(index);
    }
  });

  galleryMasonry.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) {
        return;
      }
      const full = target.dataset.full;
      if (full && target.src !== full) {
        target.src = full;
      }
    },
    true,
  );

  if (!AUTO_SCROLL_ONLY_MODE) {
    const galleryInteractionEvents = [
      { name: "wheel", options: { passive: true } },
      { name: "touchstart", options: { passive: true } },
      { name: "keydown" },
    ];
    galleryInteractionEvents.forEach(({ name, options }) => {
      galleryMasonry.addEventListener(name, markGalleryInteraction, options);
    });
  } else {
    galleryMasonry.classList.add("is-auto-only");
    if (galleryShuffle) {
      galleryShuffle.classList.add("is-disabled");
      galleryShuffle.setAttribute("aria-disabled", "true");
    }
    if (galleryPagePrev) {
      galleryPagePrev.disabled = true;
    }
    if (galleryPageNext) {
      galleryPageNext.disabled = true;
    }

    galleryMasonry.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) {
          event.preventDefault();
        }
      },
      { passive: false },
    );
  }

  galleryShuffle?.addEventListener("click", () => {
    if (AUTO_SCROLL_ONLY_MODE) {
      return;
    }
    markGalleryInteraction();
    animateShuffle({ resumeAutoLoop: false });
  });

  galleryPagePrev?.addEventListener("click", () => {
    if (AUTO_SCROLL_ONLY_MODE) {
      return;
    }
    markGalleryInteraction();
    scrollByPage(-1);
  });

  galleryPageNext?.addEventListener("click", () => {
    if (AUTO_SCROLL_ONLY_MODE) {
      return;
    }
    markGalleryInteraction();
    scrollByPage(1);
  });

  galleryFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-gallery-filter") || "all";
      const shouldReshuffleAll = filter === "all" && activeGalleryFilter === "all";
      if (!shouldReshuffleAll && filter === activeGalleryFilter) {
        return;
      }

      markGalleryInteraction();
      applyGalleryFilter(filter);
    });
  });

  galleryMasonry.addEventListener(
    "scroll",
    () => {
      autoScrollPosition = galleryMasonry.scrollLeft;
      updatePagerState();
      if (
        !isProgrammaticScrollEvent() &&
        !isAutoShuffling &&
        autoplayAllowed &&
        autoScrollRaf === 0
      ) {
        const nearEnd = galleryMasonry.scrollLeft >= maxGalleryScroll() - 1;
        if (nearEnd && !userInteractedWithGallery) {
          animateShuffle({ resumeAutoLoop: true });
        }
      }
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    updatePagerState();
    stopAutoScroll();
    autoScrollPosition = galleryMasonry.scrollLeft;
    window.setTimeout(() => {
      if (!userInteractedWithGallery) {
        maybeStartAutoScroll();
      }
    }, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoScroll();
      return;
    }
    if (!userInteractedWithGallery) {
      maybeStartAutoScroll();
    }
  });

  window.setInterval(() => {
    if (
      !autoplayAllowed ||
      (userInteractedWithGallery && !AUTO_SCROLL_ONLY_MODE) ||
      isAutoShuffling ||
      isLightboxOpen() ||
      autoScrollRaf
    ) {
      return;
    }
    maybeStartAutoScroll();
  }, 2200);

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxPrev?.addEventListener("click", showPrev);
  lightboxNext?.addEventListener("click", showNext);

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("is-open")) {
      return;
    }
    if (event.key === "ArrowRight") {
      showNext();
    } else if (event.key === "ArrowLeft") {
      showPrev();
    } else if (event.key === "Escape") {
      closeLightbox();
    }
  });

  setActiveGalleryFilterButton(activeGalleryFilter);
  applyGalleryFilter(activeGalleryFilter, { resetScroll: true });
  window.setTimeout(maybeStartAutoScroll, 900);
  window.addEventListener(
    "load",
    () => {
      if (!userInteractedWithGallery) {
        maybeStartAutoScroll();
      }
    },
    { once: true },
  );
});
