document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".carousel-images");
  const slides = Array.from(carousel.children);
  const slideCount = slides.length;

  // Clone first slide & append it
  const firstClone = slides[0].cloneNode(true);
  carousel.appendChild(firstClone);

  let idx = 0;
  const delay = 6000; // ms per slide
  const duration = 1000; // ms transition

  function goNext() {
    idx++;
    carousel.style.transition = `transform ${duration}ms ease-in-out`;
    carousel.style.transform = `translateX(-${idx * 100}%)`;
  }

  function startCycle() {
    setTimeout(() => {
      goNext();
      carousel.addEventListener("transitionend", onTransitionEnd, {
        once: true,
      });
    }, delay);
  }

  function onTransitionEnd(e) {
    if (e.propertyName !== "transform") return;

    if (idx === slideCount) {
      // Snap back to start
      carousel.style.transition = "none";
      idx = 0;
      carousel.style.transform = "translateX(0)";
    }

    startCycle();
  }

  // Kick it off
  startCycle();
});
