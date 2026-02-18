gsap.registerPlugin(ScrollTrigger);

const footer = document.querySelector("#footer");
const pinSections = gsap.utils.toArray("[data-pin]");

pinSections.forEach((pinSection, index) => {
  const next = pinSection.nextElementSibling;
  if (!next) return;

  const isFirst = index === 0;

  ScrollTrigger.create({
    trigger: pinSection,
    start: "top top",
    endTrigger: next,
    end: "bottom top",
    pin: true,
    pinSpacing: false,
    onEnter: () => {
      pinSection.style.zIndex = isFirst ? 1 : 2;
    },
    onEnterBack: () => {
      pinSection.style.zIndex = isFirst ? 1 : 2;
    },
  });
});

// Footer z-index: reveal when entering the section with data-footer
const footerSection = document.querySelector("[data-footer]");
if (footerSection && footer) {
  ScrollTrigger.create({
    trigger: footerSection,
    start: "bottom bottom",
    end: "bottom top",
    onEnter: () => {
      footer.style.zIndex = "2";
    },
    onLeaveBack: () => {
      footer.style.zIndex = "0";
    },
  });
}

/* -----------------------------
   FOOTER REVEAL
----------------------------- */
const smoothContent = document.querySelector("#smooth-content");

function updateFooterSpacing() {
  if (!footer || !smoothContent) return;
  smoothContent.style.paddingBottom = `${footer.offsetHeight}px`;
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
