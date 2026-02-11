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

  const initScrollReveal = () => {
    const revealTargets = Array.from(
      document.querySelectorAll(
        [
          ".section-header",
          ".info-card",
          ".service-card",
          ".pill-card",
          ".hours-panel",
          ".location-map-wrapper",
          ".about-image",
          ".about-text",
          ".gallery-toolbar",
          ".gallery-masonry",
          ".contact-form-card",
          ".contact-text",
        ].join(","),
      ),
    );

    if (revealTargets.length === 0) {
      return;
    }

    revealTargets.forEach((target, index) => {
      target.classList.add("reveal-on-scroll");
      target.style.setProperty("--reveal-delay", `${(index % 6) * 70}ms`);
    });

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("is-revealed"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    revealTargets.forEach((target) => {
      revealObserver.observe(target);
    });
  };

  initScrollReveal();

  const galleryMasonry = document.getElementById("galleryMasonry");
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

  const galleryImages = Array.isArray(window.GALLERY_IMAGES)
    ? window.GALLERY_IMAGES.filter((path) => !path.endsWith("/cartorio-icon.png"))
    : [];

  if (!galleryMasonry || galleryImages.length === 0) {
    return;
  }

  let displayImages = galleryImages.map((fullPath, idx) => {
    const fileName = fullPath.split("/").pop() || `imagem-${idx + 1}`;
    return {
      full: fullPath,
      thumb: fullPath.replace("/gallery/", "/gallery/thumbs/"),
      fileName,
    };
  });

  let activeIndex = 0;
  let imageLoadToken = 0;
  let revealObserver = null;

  const total = () => displayImages.length;

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
            style="--span:${span};--col-span:${colSpan};"
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

    updatePagerState();
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

  galleryShuffle?.addEventListener("click", () => {
    const shuffled = [...displayImages];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    displayImages = shuffled;
    renderMasonry();
    galleryMasonry.scrollLeft = 0;
    updatePagerState();
  });

  galleryPagePrev?.addEventListener("click", () => {
    scrollByPage(-1);
  });

  galleryPageNext?.addEventListener("click", () => {
    scrollByPage(1);
  });

  galleryMasonry.addEventListener("scroll", updatePagerState, { passive: true });
  window.addEventListener("resize", updatePagerState);

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

  renderMasonry();
});
