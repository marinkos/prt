(function () {
  function initDreamCards() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (!document.querySelector(".scroll-component")) return;

    gsap.registerPlugin(ScrollTrigger);

    const TABS_HEIGHT_REM = 6;
    const PIN_HEIGHT_FACTOR = 0.85;
    const LAYOUT_COLLAPSE_START = 0.4;

    const scrollComponents = document.querySelectorAll(".scroll-component");
    scrollComponents.forEach((scrollEl, scrollIndex) => {
      const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
      const tabsEl = scrollEl.querySelector(".ai_tabs");
      const componentEl = scrollEl.closest(".ai_component");
      const videoEl = componentEl?.querySelector(".ai_video-wrapper");
      if (!cardsWrapperEl) return;

      const rootFontSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const remToPx = (rem) => Math.round(rem * rootFontSize);

      const expandedHeightPx = Math.round(
        cardsWrapperEl.getBoundingClientRect().height
      );
      const collapsedHeightPx = tabsEl
        ? Math.round(tabsEl.getBoundingClientRect().height)
        : remToPx(TABS_HEIGHT_REM);
      const layoutShiftPx = Math.max(0, expandedHeightPx - collapsedHeightPx);
      const pinDistancePx = Math.round(expandedHeightPx * PIN_HEIGHT_FACTOR);

      const videoStartMargin = videoEl
        ? parseFloat(gsap.getProperty(videoEl, "marginTop", "px")) || 0
        : 0;

      gsap.set(cardsWrapperEl, {
        height: expandedHeightPx,
        overflow: "hidden",
      });

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
        end: `+=${pinDistancePx}`,
        scrub: 0.8,
        pin: scrollEl,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      };

      const tl = gsap.timeline({ scrollTrigger: scrollConfig });

      tl.to(
        cardsWrapperEl,
        {
          scale: 0.3,
          opacity: 0,
          ease: "power2.inOut",
          duration: 0.45,
          transformOrigin: "center top",
        },
        0
      );

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

      // Cards area shrinks inside pinned block (tabs are absolute, so height drives layout).
      tl.to(
        cardsWrapperEl,
        {
          height: collapsedHeightPx,
          ease: "none",
          duration: 0.55,
        },
        LAYOUT_COLLAPSE_START
      );

      // Video sits outside scroll-component (sibling of pin-spacer) — pull it up in flow.
      if (videoEl && layoutShiftPx > 0) {
        tl.to(
          videoEl,
          {
            marginTop: videoStartMargin - layoutShiftPx,
            ease: "none",
            duration: 0.55,
          },
          LAYOUT_COLLAPSE_START
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
