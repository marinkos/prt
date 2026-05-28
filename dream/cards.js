(function () {
  function initDreamCards() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (!document.querySelector(".scroll-component")) return;

    gsap.registerPlugin(ScrollTrigger);

    const scrollComponents = document.querySelectorAll(".scroll-component");
    scrollComponents.forEach((scrollEl, scrollIndex) => {
      const stageEl =
        scrollEl.querySelector(".ai_stage") ||
        scrollEl.querySelector(".ai_cards-stage") ||
        scrollEl.querySelector(".ai_cards-shell");
      const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
      const tabsEl = scrollEl.querySelector(".ai_tabs");
      if (!cardsWrapperEl) return;

      const expandedHeight =
        stageEl?.getBoundingClientRect().height ||
        cardsWrapperEl.getBoundingClientRect().height;
      const collapsedHeight = tabsEl
        ? Math.max(64, tabsEl.getBoundingClientRect().height)
        : Math.round(expandedHeight * 0.2);

      if (stageEl) {
        gsap.set(stageEl, {
          height: expandedHeight,
          overflow: "hidden",
        });
      }

      if (tabsEl) {
        gsap.set(tabsEl, {
          scale: 0.8,
          opacity: 0,
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
        end: "+=140vh",
        scrub: 0.8,
        pin: scrollEl,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      };

      const tl = gsap.timeline({ scrollTrigger: scrollConfig });

      if (stageEl) {
        tl.to(
          stageEl,
          {
            height: collapsedHeight,
            ease: "none",
            duration: 0.6,
          },
          0.4
        );
      }

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
