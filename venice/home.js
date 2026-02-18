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

/* -----------------------------
   INTRO SECTION: .intro_left pinned, .intro_item sticky at 6rem
----------------------------- */
const introLeft = document.querySelector(".intro_left");
const introRight = document.querySelector(".intro_right");
if (introLeft && introRight) {
  const introSection = introLeft.closest("section");
  const introItems = introRight.querySelectorAll(".intro_item");

  introItems.forEach((item) => {
    item.style.position = "sticky";
    item.style.top = "6rem";
  });

  if (introSection) {
    ScrollTrigger.create({
      trigger: introSection,
      start: "top top",
      end: "bottom bottom",
      pin: introLeft,
      pinSpacing: false,
      onEnter: () => {
        introLeft.style.top = "6rem";
      },
      onLeave: () => {
        introLeft.style.top = "";
      },
      onLeaveBack: () => {
        introLeft.style.top = "";
      },
    });
  }
}

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
