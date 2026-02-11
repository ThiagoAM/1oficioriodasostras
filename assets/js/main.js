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
    const shuffled = [...displayImages];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    displayImages = shuffled;
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

  renderMasonry();
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
