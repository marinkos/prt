(function () {
  function initDreamCards() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (!document.querySelector(".scroll-component")) return;

    gsap.registerPlugin(ScrollTrigger);

    const SCROLL_DISTANCE = 1200;

    const scrollComponents = document.querySelectorAll(".scroll-component");
    scrollComponents.forEach((scrollEl, scrollIndex) => {
      const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
      if (!cardsWrapperEl) return;

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

      gsap
        .timeline({ scrollTrigger: scrollConfig })
        .to(cardsWrapperEl, {
          scale: 0,
          opacity: 0.35,
          ease: "power2.inOut",
          duration: 1,
          transformOrigin: "center top",
        });
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
