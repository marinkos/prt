(function () {
  const COMPACT_CLASS = "is-compact";
  const FLIP_DURATION = 0.5;
  const SCRUB = 0.8;
  const TABS_HEIGHT_REM = 6;

  const FLIP_SELECTOR =
    ".ai_cards-wrapper, .ai_card, .ai_cards, .ai_item-title-wrapper, .ai_item-video-icon, .ai_item-small-icon, .ai_item-title, .ai_item-p, .ai_video-wrapper";
  const FLIP_PROPS =
    "opacity,borderColor,borderRadius,padding,minHeight,gap,width,maxWidth";

  const COMPACT_TOGGLE_SELECTOR = [
    ".scroll-component",
    ".ai_cards-wrapper",
    ".ai_card",
    ".ai_item-title-wrapper",
    ".ai_item-video-icon",
    ".ai_item-small-icon",
    ".ai_item-title",
    ".ai_item-p",
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

    const marked = root.querySelectorAll("[data-compact-toggle]");
    if (marked.length) {
      marked.forEach((el) => set.add(el));
      return [...set];
    }

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
        ".ai_item-title-wrapper, .ai_item-title-wrapper *, .ai_item-video-icon, .ai_item-small-icon, .ai_item-p",
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

  function setActiveCard(scrollEl, card) {
    getCards(scrollEl).forEach((c) => {
      c.classList.toggle("is-active", c === card);
    });
  }

  function initClickFlipSection(scrollEl) {
    const cardsWrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
    const cards = getCards(scrollEl);
    if (!cardsWrapperEl || !cards.length) return false;

    setCompact(scrollEl, false);

    if (!cards.some((c) => c.classList.contains("is-active"))) {
      setActiveCard(scrollEl, cards[0]);
    }

    let busy = false;

    function collapse() {
      if (busy || isCompact(scrollEl)) return;
      busy = true;

      runFlip(
        scrollEl,
        () => setCompact(scrollEl, true),
        () => {
          busy = false;
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
      if (!card) return;

      if (!isCompact(scrollEl)) {
        e.preventDefault();
        setActiveCard(scrollEl, card);
        collapse();
        return;
      }

      if (card.classList.contains("is-active")) {
        e.preventDefault();
        expand();
        return;
      }

      setActiveCard(scrollEl, card);
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
    if (!cardsWrapperEl) return;

    const COLLAPSE_START = 0.35;

    scrollEl.style.pointerEvents = "none";
    cardsWrapperEl.style.pointerEvents = "auto";

    const rootFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    setCompact(scrollEl, false);

    const expandedHeightPx = measureWrapperHeight(cardsWrapperEl);
    const collapsedHeightPx =
      measureCompactHeight(scrollEl, cardsWrapperEl) ||
      Math.round(TABS_HEIGHT_REM * rootFontSize);

    const pinDistancePx = Math.max(1, expandedHeightPx - collapsedHeightPx);

    gsap.set(cardsWrapperEl, {
      height: expandedHeightPx,
      overflow: "hidden",
    });

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
