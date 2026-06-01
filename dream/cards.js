(function () {
  const COMPACT_CLASS = "is-compact";
  const FLIP_DURATION = 0.5;
  const SCRUB = 0.8;
  const TABS_HEIGHT_REM = 6;

  const FLIP_SELECTOR =
    ".ai_cards-wrapper, .ai_card, .ai_cards, .ai_card-inner, .ai_card-bg, .ai_card_bg, .ai_item-video-icon, .ai_item-title, .ai_item-p, .ai_card-hero, .ai_card-tab, .ai_video-wrapper";
  const FLIP_PROPS =
    "opacity,borderColor,borderRadius,padding,minHeight,gap,width,maxWidth";

  const COMPACT_TOGGLE_SELECTOR = [
    ".scroll-component",
    ".ai_cards-wrapper",
    ".ai_card",
    ".ai_card-inner",
    ".ai_card-bg",
    ".ai_card_bg",
    ".ai_item-video-icon",
    ".ai_item-title",
    ".ai_item-p",
    ".ai_card-hero",
    ".ai_card-tab",
    ".ai_video-wrapper",
  ].join(",");

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getTriggerMode(scrollEl) {
    return scrollEl.dataset.cardsTrigger === "scroll" ? "scroll" : "click";
  }

  function getCards(scrollEl) {
    return gsap.utils.toArray(".ai_card, .ai_cards", scrollEl);
  }

  function getCompactElements(scrollEl) {
    const root = scrollEl.closest(".scroll-component") || scrollEl;
    const set = new Set([root]);
    root.querySelectorAll(COMPACT_TOGGLE_SELECTOR).forEach((el) => set.add(el));
    return [...set];
  }

  function setCompact(scrollEl, compact) {
    getCompactElements(scrollEl).forEach((el) => {
      el.classList.toggle(COMPACT_CLASS, compact);
    });
  }

  function isCompact(scrollEl) {
    return scrollEl.classList.contains(COMPACT_CLASS);
  }

  function getFlipTargets(scrollEl, extra) {
    const base = gsap.utils.toArray(FLIP_SELECTOR, scrollEl);
    return extra && extra.length ? base.concat(extra) : base;
  }

  function measureWrapperHeight(el) {
    return Math.round(el.getBoundingClientRect().height);
  }

  function measureCompactHeight(scrollEl, wrapper) {
    const wasCompact = isCompact(scrollEl);
    setCompact(scrollEl, true);
    const height = measureWrapperHeight(wrapper);
    setCompact(scrollEl, wasCompact);
    return height;
  }

  function runFlip(scrollEl, applyLayout, onComplete) {
    const cards = getCards(scrollEl);
    const innerTargets = cards.flatMap((card) =>
      gsap.utils.toArray(
        ".ai_card-inner, .ai_card-inner *, .ai_card-hero, .ai_card-hero *, .ai_card-tab, .ai_card-tab *",
        card
      )
    );
    const targets = getFlipTargets(scrollEl, innerTargets);
    const state = Flip.getState(targets, { props: FLIP_PROPS });

    applyLayout();

    return Flip.from(state, {
      duration: FLIP_DURATION,
      ease: "power1.inOut",
      absolute: true,
      nested: true,
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: 0 },
          { opacity: 1, duration: FLIP_DURATION / 2, delay: FLIP_DURATION / 2 }
        ),
      onLeave: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: (i, el) => state.getProperty(el, "opacity") },
          { opacity: 0, duration: FLIP_DURATION / 2 }
        ),
      onComplete,
    });
  }

  function getCardFromEvent(scrollEl, e) {
    const card = e.target.closest(".ai_card, .ai_cards");
    return card && scrollEl.contains(card) ? card : null;
  }

  function getTabFromEvent(scrollEl, e) {
    const tab = e.target.closest(".ai_tab");
    return tab && scrollEl.contains(tab) ? tab : null;
  }

  function cardIsActive(card) {
    if (!card) return false;
    if (card.classList.contains("is-active")) return true;
    const tab = card.matches(".ai_tab")
      ? card
      : card.querySelector(".ai_tab");
    return Boolean(tab && tab.classList.contains("is-active"));
  }

  function setActiveCard(scrollEl, card) {
    getCards(scrollEl).forEach((c) => {
      c.classList.toggle("is-active", c === card);
      c.querySelectorAll(".ai_tab").forEach((tab) => {
        tab.classList.toggle("is-active", c === card);
      });
    });
  }

  function initClickFlipSection(scrollEl) {
    const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
    const cards = getCards(scrollEl);
    if (!cardsWrapperEl || !cards.length) return false;

    setCompact(scrollEl, false);
    scrollEl.style.pointerEvents = "";

    if (!cards.some(cardIsActive)) {
      setActiveCard(scrollEl, cards[0]);
    }

    let busy = false;

    function collapse(after) {
      if (busy || isCompact(scrollEl)) return;
      busy = true;

      runFlip(
        scrollEl,
        () => setCompact(scrollEl, true),
        () => {
          busy = false;
          after?.();
        }
      );
    }

    function expand() {
      if (busy || !isCompact(scrollEl)) return;
      busy = true;

      runFlip(
        scrollEl,
        () => setCompact(scrollEl, false),
        () => {
          busy = false;
        }
      );
    }

    scrollEl.addEventListener("click", (e) => {
      const card = getCardFromEvent(scrollEl, e);
      const tab = getTabFromEvent(scrollEl, e);

      if (!card && !tab) return;

      if (!isCompact(scrollEl)) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (card) setActiveCard(scrollEl, card);

        const tabToActivate = tab || card?.querySelector(".ai_tab") || null;
        collapse(() => {
          if (tabToActivate) tabToActivate.click();
        });
        return;
      }

      if (card && cardIsActive(card)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        expand();
        return;
      }

      if (card) {
        const tabEl = tab || card.querySelector(".ai_tab");
        if (tabEl) {
          e.preventDefault();
          tabEl.click();
          return;
        }
        setActiveCard(scrollEl, card);
      }
    });

    return true;
  }

  function initScrollFlipSection(scrollEl, scrollIndex, scrollCount) {
    const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
    if (!cardsWrapperEl || !getCards(scrollEl).length) return false;

    const videoWrap = scrollEl.querySelector(".ai_video-wrapper");
    scrollEl.style.pointerEvents = "none";
    cardsWrapperEl.style.pointerEvents = "auto";
    if (videoWrap) videoWrap.style.pointerEvents = "auto";
    getCards(scrollEl).forEach((card) => {
      card.style.pointerEvents = "auto";
    });
    scrollEl.querySelectorAll(".ai_tab").forEach((tab) => {
      tab.style.pointerEvents = "auto";
    });

    const rootFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    setCompact(scrollEl, false);

    const expandedHeightPx = measureWrapperHeight(cardsWrapperEl);
    let collapsedHeightPx = measureCompactHeight(scrollEl, cardsWrapperEl);

    if (!collapsedHeightPx || collapsedHeightPx >= expandedHeightPx) {
      collapsedHeightPx = Math.round(TABS_HEIGHT_REM * rootFontSize);
    }

    const pinDistancePx = Math.max(1, expandedHeightPx - collapsedHeightPx);
    const flipState = Flip.getState(
      scrollEl.querySelectorAll(FLIP_SELECTOR),
      { props: FLIP_PROPS }
    );

    setCompact(scrollEl, true);

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

    return true;
  }

  function initLegacyScrollSection(scrollEl, scrollIndex, scrollCount) {
    const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
    const tabsEl = scrollEl.querySelector(".ai_tabs");
    if (!cardsWrapperEl) return;

    const COLLAPSE_START = 0.35;

    scrollEl.style.pointerEvents = "none";
    cardsWrapperEl.style.pointerEvents = "auto";
    if (tabsEl) tabsEl.style.pointerEvents = "auto";

    const rootFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    setCompact(scrollEl, false);

    const expandedHeightPx = measureWrapperHeight(cardsWrapperEl);
    const collapsedHeightPx = tabsEl
      ? measureWrapperHeight(tabsEl)
      : measureCompactHeight(scrollEl, cardsWrapperEl) ||
        Math.round(TABS_HEIGHT_REM * rootFontSize);

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
        setCompact(scrollEl, true);
        return;
      }

      if (!window.Flip) {
        if (getTriggerMode(scrollEl) === "scroll") {
          initLegacyScrollSection(
            scrollEl,
            scrollIndex,
            scrollComponents.length
          );
        }
        return;
      }

      if (getTriggerMode(scrollEl) === "click") {
        initClickFlipSection(scrollEl);
        return;
      }

      if (
        !initScrollFlipSection(scrollEl, scrollIndex, scrollComponents.length)
      ) {
        initLegacyScrollSection(scrollEl, scrollIndex, scrollComponents.length);
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
