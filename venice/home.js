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
   INTRO SECTION (ScrollSmoother): .intro_left pinned, .intro_item stuck at 6rem
----------------------------- */
const smoothWrapper = document.querySelector("#smooth-wrapper");
const introLeft = document.querySelector(".intro_left");
const introRight = document.querySelector(".intro_right");
if (introLeft && introRight && smoothWrapper) {
  const introSection = introLeft.closest("section");
  const introItems = introRight.querySelectorAll(".intro_item");
  const scroller = smoothWrapper;
  const startStick = "top 6rem";

  // .intro_left: pinned 6rem from top for the section
  if (introSection) {
    ScrollTrigger.create({
      trigger: introSection,
      start: "top top",
      end: "bottom bottom",
      pin: introLeft,
      pinSpacing: false,
      scroller,
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

  // .intro_item: each sticks at 6rem (pin-based, works with ScrollSmoother)
  introItems.forEach((item, i) => {
    const nextItem = introItems[i + 1];
    ScrollTrigger.create({
      trigger: item,
      start: startStick,
      endTrigger: nextItem ? nextItem : introSection,
      end: nextItem ? "top 6rem" : "bottom top",
      pin: item,
      pinSpacing: false,
      scroller,
      onEnter: () => {
        item.style.top = "6rem";
      },
      onLeave: () => {
        item.style.top = "";
      },
      onLeaveBack: () => {
        item.style.top = "";
      },
    });
  });
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
