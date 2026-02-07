// nav.js – sticky nav: 5rem margin at top, 1rem when scrolling from hero section
//
// Required CSS for .nav_component:
//   .nav_component { position: absolute; margin-top: 5rem; }
//   .nav_component.is-sticky { position: sticky; top: 1rem; margin-top: 1rem; }
//
document.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("nav.js: GSAP/ScrollTrigger required");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const nav = document.querySelector(".nav_component");
  const heroSection = document.getElementById("heroSection");
  if (!nav) return;

  // Trigger from hero section: when hero top hits viewport top, nav becomes sticky with 1rem
  const triggerEl = heroSection || document.querySelector(".main-wrapper") || document.body;

  ScrollTrigger.create({
    trigger: triggerEl,
    start: "top top",
    end: "bottom top",
    onEnter: () => nav.classList.add("is-sticky"),
    onLeaveBack: () => nav.classList.remove("is-sticky"),
  });
});
