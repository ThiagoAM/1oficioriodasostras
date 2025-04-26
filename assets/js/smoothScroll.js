document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    const navHeight = document.querySelector("#nav").offsetHeight;
    const extra = 10; // tweak this for a few extra pixels
    const y =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      navHeight -
      extra;

    window.scrollTo({ top: y, behavior: "smooth" });
  });
});
