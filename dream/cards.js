(function () {
  const COMPACT_CLASS = "is-compact";
  const HERO_OUT_AT = 0.6;
  const SCRUB = 0.8;
  const TABS_HEIGHT_REM = 6;

  const FLIP_SELECTOR =
    ".ai_cards-wrapper, .ai_card, .ai_cards, .ai_card-inner, .ai_card-bg, .ai_card_bg";
  const FLIP_PROPS =
    "opacity,borderColor,borderRadius,padding,minHeight,gap,width,maxWidth";

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getCards(scrollEl) {
    return scrollEl.querySelectorAll(".ai_card, .ai_cards");
  }

  function getHeroTargets(scrollEl) {
    return scrollEl.querySelectorAll(
      ".ai_card-hero, .ai_item-p, .ai_card .ai_item-p"
    );
  }

  function getCompactTabTargets(scrollEl) {
    const inCard = scrollEl.querySelectorAll(
      ".ai_card-tab, .ai_card .ai_card-tab"
    );
    if (inCard.length) return inCard;
    return scrollEl.querySelector(".ai_tabs");
  }

  function measureWrapperHeight(el) {
    return Math.round(el.getBoundingClientRect().height);
  }

  function measureCompactHeight(scrollEl, wrapper, tabsRow) {
    const hadCompact = scrollEl.classList.contains(COMPACT_CLASS);
    scrollEl.classList.add(COMPACT_CLASS);
    let height = measureWrapperHeight(wrapper);
    if (tabsRow) {
      height = Math.max(height, measureWrapperHeight(tabsRow));
    }
    if (!hadCompact) scrollEl.classList.remove(COMPACT_CLASS);
    return height;
  }

  function setupPointerEvents(scrollEl, cardsWrapperEl) {
    scrollEl.style.pointerEvents = "none";
    cardsWrapperEl.style.pointerEvents = "auto";

    const videoWrap =
      scrollEl.querySelector(".ai_video-wrapper") ||
      scrollEl.parentElement?.querySelector(".ai_video-wrapper");
    if (videoWrap) videoWrap.style.pointerEvents = "auto";

    scrollEl.querySelectorAll(".ai_tab, .ai_card-tab, .ai_card").forEach((el) => {
      el.style.pointerEvents = "auto";
    });
  }

  function initFlipSection(scrollEl, scrollIndex, scrollCount) {
    const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
    if (!cardsWrapperEl || !getCards(scrollEl).length) return false;

    if (!window.Flip) {
      console.warn(
        "[dream/cards] GSAP Flip is required. Load Flip.min.js before cards.js."
      );
      return false;
    }

    const tabsRow = scrollEl.querySelector(".ai_tabs");
    if (tabsRow) {
      gsap.set(tabsRow, {
        opacity: 0,
        scale: 0.92,
        transformOrigin: "center top",
      });
    }
    setupPointerEvents(scrollEl, cardsWrapperEl);

    const rootFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    scrollEl.classList.remove(COMPACT_CLASS);

    const expandedHeightPx = measureWrapperHeight(cardsWrapperEl);
    let collapsedHeightPx = measureCompactHeight(
      scrollEl,
      cardsWrapperEl,
      tabsRow
    );

    if (!collapsedHeightPx || collapsedHeightPx >= expandedHeightPx) {
      collapsedHeightPx = tabsRow
        ? measureWrapperHeight(tabsRow)
        : Math.round(TABS_HEIGHT_REM * rootFontSize);
    }

    const pinDistancePx = Math.max(1, expandedHeightPx - collapsedHeightPx);

    const flipState = Flip.getState(
      scrollEl.querySelectorAll(FLIP_SELECTOR),
      { props: FLIP_PROPS }
    );

    scrollEl.classList.add(COMPACT_CLASS);

    const scrollConfig = {
      id:
        scrollCount > 1 ? `dream-cards-flip-${scrollIndex}` : "dream-cards-flip",
      trigger: scrollEl,
      start: "top top",
      end: `+=${pinDistancePx}`,
      scrub: SCRUB,
      pin: scrollEl,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    };

    Flip.from(flipState, {
      ease: "power2.inOut",
      nested: true,
      scrollTrigger: scrollConfig,
    });

    const heroes = getHeroTargets(scrollEl);
    const compactTabs = getCompactTabTargets(scrollEl);
    const useLegacyTabRow =
      tabsRow && !scrollEl.querySelector(".ai_card-tab");

    if (heroes.length || compactTabs) {
      const contentTl = gsap.timeline({ scrollTrigger: { ...scrollConfig } });

      if (heroes.length) {
        contentTl.fromTo(
          heroes,
          { opacity: 1, y: 0 },
          {
            opacity: 0,
            y: -12,
            ease: "power2.in",
            duration: HERO_OUT_AT,
          },
          0
        );
      }

      if (useLegacyTabRow) {
        contentTl.to(
          cardsWrapperEl,
          { opacity: 0, ease: "power2.in", duration: 0.25 },
          HERO_OUT_AT - 0.05
        );
      }

      if (compactTabs) {
        contentTl.to(
          compactTabs,
          {
            opacity: 1,
            scale: 1,
            ease: "power2.out",
            duration: 1 - HERO_OUT_AT,
            onStart: () => {
              if (tabsRow) tabsRow.style.pointerEvents = "auto";
            },
          },
          HERO_OUT_AT
        );
      }
    }

    return true;
  }

  function initLegacySection(scrollEl, scrollIndex, scrollCount) {
    const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
    const tabsEl = scrollEl.querySelector(".ai_tabs");
    if (!cardsWrapperEl) return;

    const COLLAPSE_START = 0.35;

    setupPointerEvents(scrollEl, cardsWrapperEl);
    if (tabsEl) tabsEl.style.pointerEvents = "auto";

    const rootFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    const expandedHeightPx = measureWrapperHeight(cardsWrapperEl);
    const collapsedHeightPx = tabsEl
      ? measureWrapperHeight(tabsEl)
      : Math.round(TABS_HEIGHT_REM * rootFontSize);

    const pinDistancePx = Math.max(1, expandedHeightPx - collapsedHeightPx);

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
      id: scrollCount > 1 ? `dream-cards-${scrollIndex}` : "dream-cards",
      trigger: scrollEl,
      start: "top top",
      end: `+=${pinDistancePx}`,
      scrub: SCRUB,
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

    tl.to(
      cardsWrapperEl,
      {
        height: collapsedHeightPx,
        ease: "none",
        duration: 1 - COLLAPSE_START,
      },
      COLLAPSE_START
    );
  }

  function initDreamCards() {
    if (!window.gsap || !window.ScrollTrigger) return;

    const scrollComponents = document.querySelectorAll(".scroll-component");
    if (!scrollComponents.length) return;

    gsap.registerPlugin(ScrollTrigger);
    if (window.Flip) gsap.registerPlugin(Flip);

    scrollComponents.forEach((scrollEl, scrollIndex) => {
      if (scrollEl.dataset.dreamCardsInit === "true") return;
      scrollEl.dataset.dreamCardsInit = "true";

      if (prefersReducedMotion()) {
        scrollEl.classList.add(COMPACT_CLASS);
        return;
      }

      if (!initFlipSection(scrollEl, scrollIndex, scrollComponents.length)) {
        initLegacySection(scrollEl, scrollIndex, scrollComponents.length);
      }
    });

    ScrollTrigger.refresh();
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

  window.addEventListener("load", () => {
    ScrollTrigger?.refresh();
  });
})();
