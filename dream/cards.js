(function () {
  const COMPACT_CLASS = "is-compact";
  const SCRUB = 1;

  const COMPACT_SELECTOR = [
    ".ai_card",
    ".ai_item-video-icon",
    ".ai-card-heading",
    ".ai_card-sub",
  ].join(", ");

  const FLIP_SELECTOR = [
    ".ai_cards-wrapper",
    ".ai_card",
    ".ai_card-inner",
    ".ai_card-desc",
    ".ai_item-video-icon",
    ".ai-card-heading",
    ".ai_card-sub",
    ".ai_video-wrapper",
  ].join(", ");

  const FLIP_PROPS =
    "opacity,borderColor,borderRadius,padding,minHeight,gap,width,maxWidth,fontSize";

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getCompactElements(scrollEl) {
    return scrollEl.querySelectorAll(COMPACT_SELECTOR);
  }

  function setCompact(scrollEl, compact) {
    getCompactElements(scrollEl).forEach((el) => {
      el.classList.toggle(COMPACT_CLASS, compact);
    });
  }

  function measureWrapperHeight(scrollEl) {
    const wrapper = scrollEl.querySelector(".ai_cards-wrapper");
    return wrapper ? Math.round(wrapper.getBoundingClientRect().height) : 0;
  }

  function measureCompactDelta(scrollEl) {
    setCompact(scrollEl, false);
    const expanded = measureWrapperHeight(scrollEl);

    setCompact(scrollEl, true);
    const collapsed = measureWrapperHeight(scrollEl);

    setCompact(scrollEl, false);
    return Math.max(240, expanded - collapsed);
  }

  function initScrollSection(scrollEl, index, total) {
    const wrapper = scrollEl.querySelector(".ai_cards-wrapper");
    const cards = scrollEl.querySelectorAll(".ai_card");
    if (!wrapper || !cards.length) return;

    const pinDistance = measureCompactDelta(scrollEl);
    const targets = scrollEl.querySelectorAll(FLIP_SELECTOR);
    const flipState = Flip.getState(targets, { props: FLIP_PROPS });

    setCompact(scrollEl, true);

    Flip.from(flipState, {
      ease: "none",
      nested: true,
      scrollTrigger: {
        id: total > 1 ? `dream-cards-${index}` : "dream-cards",
        trigger: scrollEl,
        start: "top top",
        end: `+=${pinDistance}`,
        scrub: SCRUB,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  function initDreamCards() {
    if (!window.gsap || !window.ScrollTrigger || !window.Flip) return;

    const sections = document.querySelectorAll(".scroll-component");
    if (!sections.length) return;

    gsap.registerPlugin(ScrollTrigger, Flip);

    sections.forEach((scrollEl, index) => {
      if (scrollEl.dataset.dreamCardsInit === "true") return;
      scrollEl.dataset.dreamCardsInit = "true";

      if (prefersReducedMotion()) {
        setCompact(scrollEl, true);
        return;
      }

      initScrollSection(scrollEl, index, sections.length);
    });

    ScrollTrigger.refresh();
  }

  let booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    initDreamCards();
  }

  window.Webflow ||= [];
  window.Webflow.push(boot);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", () => ScrollTrigger?.refresh());
})();
