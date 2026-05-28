(function () {
  function initDreamCards() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (!document.querySelector(".scroll-component")) return;

    gsap.registerPlugin(ScrollTrigger);
    const CARD_HEIGHT_REM = 34;
    const PIN_HEIGHT_FACTOR = 0.85;

    const scrollComponents = document.querySelectorAll(".scroll-component");
    scrollComponents.forEach((scrollEl, scrollIndex) => {
      const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
      const tabsEl = scrollEl.querySelector(".ai_tabs");
      if (!cardsWrapperEl) return;

      if (tabsEl) {
        gsap.set(tabsEl, {
          scale: 0.8,
          opacity: 0,
          transformOrigin: "center top",
        });
      }

      const rootFontSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const pinDistancePx = Math.round(
        CARD_HEIGHT_REM * rootFontSize * PIN_HEIGHT_FACTOR
      );

      const scrollConfig = {
        id:
          scrollComponents.length > 1
            ? `dream-cards-${scrollIndex}`
            : "dream-cards",
        trigger: scrollEl,
        start: "top top",
        end: `+=${pinDistancePx}`,
        scrub: 0.8,
        pin: scrollEl,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      };

      const tl = gsap.timeline({ scrollTrigger: scrollConfig });

      tl.to(cardsWrapperEl, {
          scale: 0.3,
          opacity: 0,
          ease: "power2.inOut",
          duration: 0.45,
          transformOrigin: "center top",
        });

      if (tabsEl) {
        tl.to(
          tabsEl,
          {
            scale: 1,
            opacity: 1,
            ease: "power2.inOut",
            duration: 0.5,
            transformOrigin: "center top",
          },
          0.3
        );
      }
    });
  }

  let dreamCardsInited = false;
  function bootDreamCards() {
    if (dreamCardsInited) return;
    dreamCardsInited = true;
    initDreamCards();
  }

  window.Webflow ||= [];
  window.Webflow.push(bootDreamCards);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootDreamCards);
  } else {
    bootDreamCards();
  }
})();
