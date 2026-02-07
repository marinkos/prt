// nav.js – sticky nav: 5rem margin at top, pins with 1rem from top when scrolling from hero section
// Uses ScrollTrigger pin (position: fixed) so it works even with overflow/transform on parents.
document.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("nav.js: GSAP/ScrollTrigger required");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const nav = document.querySelector(".nav_component");
  const heroSection = document.getElementById("heroSection");
  if (!nav) return;

  const triggerEl = heroSection || document.querySelector(".main-wrapper");
  if (!triggerEl) return;

  // Pin nav when hero/main top hits viewport top; keep pinned until scroll back up
  ScrollTrigger.create({
    trigger: triggerEl,
    start: "top top",
    end: "bottom bottom",
    pin: nav,
    pinSpacing: true,
    onEnter: () => {
      nav.classList.add("is-sticky");
      gsap.set(nav, { top: "1rem", marginTop: 0 });
    },
    onLeaveBack: () => {
      nav.classList.remove("is-sticky");
      gsap.set(nav, { clearProps: "top,marginTop" });
    },
  });
});
