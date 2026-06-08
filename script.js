const word = document.getElementById("word");
const letters = document.querySelectorAll(".word span");


const scroll = new LocomotiveScroll({
  el: document.querySelector("[data-scroll-container]"),
  smooth: true,
  lerp: 0.08, // suavidad cinematográfica
});

/* =========================
   FRAGMENTACIÓN HERO
========================= */
letters.forEach(letter => {
  const x = (Math.random() - 0.5) * 2;
  const y = (Math.random() - 0.5) * 2;

  letter.style.setProperty("--x", x);
  letter.style.setProperty("--y", y);
});

/* hover → fragmentar */
word.addEventListener("mouseenter", () => {
  word.classList.add("active");
});

/* salir hover → reconstruir */
word.addEventListener("mouseleave", () => {
  word.classList.remove("active");
});

/* =========================
   REFRESH LOCOMOTIVE ON SCROLL UPDATE
========================= */
scroll.on("scroll", () => {
  // mantiene sincronización con animaciones
});