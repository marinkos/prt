gsap.registerPlugin(ScrollTrigger);

const pinSections = gsap.utils.toArray("[data-pin]");

pinSections.forEach((pinSection, index) => {
  const next = pinSection.nextElementSibling;
  if (!next) return;
  
  const isLast = index === pinSections.length - 1;
  
  ScrollTrigger.create({
    trigger: pinSection,
    start: "top top",
    endTrigger: next,
    end: "bottom top",
    pin: true,
    pinSpacing: false,
    onEnter: () => {
      pinSection.style.zIndex = 1;
      // If this is the last pinned section, bring footer up
      if (isLast) {
        footer.style.zIndex = 2;
      }
    },
    onEnterBack: () => {
      pinSection.style.zIndex = 2;
      // If scrolling back, push footer down again
      if (isLast) {
        footer.style.zIndex = 0;
      }
    }
  });
});

/* -----------------------------
   FOOTER REVEAL
----------------------------- */
const footer = document.querySelector("#footer");
const smoothContent = document.querySelector("#smooth-content");

function updateFooterSpacing() {
  const footerHeight = footer.offsetHeight;
  smoothContent.style.paddingBottom = `${footerHeight}px`;
}

window.addEventListener("load", () => {
  updateFooterSpacing();
  ScrollTrigger.refresh();
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    updateFooterSpacing();
    ScrollTrigger.refresh();
  }, 250);
});
