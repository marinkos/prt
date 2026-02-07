// nav.js – sticky nav: 5rem margin at top, fixed at 1rem when scrolling from hero section
// Moves nav to body when sticky so position:fixed is always viewport-relative (works with transform/overflow on parents).
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

  let placeholder = null;
  let navParent = null;
  let navNext = null;

  ScrollTrigger.create({
    trigger: triggerEl,
    start: "top top",
    end: "bottom bottom",
    onEnter: () => {
      if (placeholder) return;
      navParent = nav.parentNode;
      navNext = nav.nextSibling;
      placeholder = document.createElement("div");
      placeholder.className = "nav_component-placeholder";
      placeholder.style.height = nav.offsetHeight + "px";
      placeholder.style.width = "100%";
      navParent.insertBefore(placeholder, navNext);
      document.body.appendChild(nav);
      gsap.set(nav, {
        position: "fixed",
        top: "1rem",
        left: 0,
        right: 0,
        width: "100%",
        marginTop: 0,
        zIndex: 9999,
      });
    },
    onLeaveBack: () => {
      if (!placeholder) return;
      gsap.set(nav, { clearProps: "position,top,left,right,width,marginTop,zIndex" });
      navParent.insertBefore(nav, placeholder);
      placeholder.remove();
      placeholder = null;
    },
  });
});
