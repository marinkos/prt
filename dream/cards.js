(function () {
  function initDreamCards() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (!document.querySelector(".scroll-component")) return;

    gsap.registerPlugin(ScrollTrigger);

    const SCROLL_DISTANCE = 1200;

    const scrollComponents = document.querySelectorAll(".scroll-component");
    scrollComponents.forEach((scrollEl, scrollIndex) => {
      const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
      const tabsEl = scrollEl.querySelector(".ai_tabs");
      if (!cardsWrapperEl) return;

      if (tabsEl) {
        gsap.set(tabsEl, {
          scale: 0.8,
          opacity: 0.4,
          transformOrigin: "center top",
        });
      }

      const scrollConfig = {
        id:
          scrollComponents.length > 1
            ? `dream-cards-${scrollIndex}`
            : "dream-cards",
        trigger: scrollEl,
        start: "top top",
        end: `+=${SCROLL_DISTANCE}`,
        scrub: 0.8,
        pin: scrollEl,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      };

      const tl = gsap.timeline({ scrollTrigger: scrollConfig });

      tl.to(cardsWrapperEl, {
          scale: 0,
          opacity: 0.35,
          ease: "power2.inOut",
          duration: 1,
          transformOrigin: "center top",
        });

      if (tabsEl) {
        tl.to(
          tabsEl,
          {
            scale: 1,
            opacity: 1,
            ease: "power2.inOut",
            duration: 1,
            transformOrigin: "center top",
          },
          0
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
