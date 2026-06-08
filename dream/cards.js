(function () {
  const COMPACT_CLASS = "is-compact";
  const ANIMATING_CLASS = "is-cards-animating";
  const SCRUB = 1.2;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getCards(scrollEl) {
    return scrollEl.querySelectorAll(".ai_card");
  }

  function setCompact(scrollEl, compact) {
    getCards(scrollEl).forEach((card) => {
      card.classList.toggle(COMPACT_CLASS, compact);
    });
  }

  function setAnimating(scrollEl, animating) {
    scrollEl.classList.toggle(ANIMATING_CLASS, animating);
    getCards(scrollEl).forEach((card) => {
      card.classList.toggle(ANIMATING_CLASS, animating);
    });
  }

  function measureWrapperHeight(scrollEl) {
    const wrapper = scrollEl.querySelector(".ai_cards-wrapper");
    return wrapper ? Math.round(wrapper.getBoundingClientRect().height) : 0;
  }

  function measureCollapsedHeight(scrollEl) {
    const largeInners = scrollEl.querySelectorAll(".ai_inner-large");
    const smallInners = scrollEl.querySelectorAll(".ai_inner-small");

    gsap.set(largeInners, { display: "none" });
    gsap.set(smallInners, { display: "flex", position: "relative", opacity: 1 });

    const collapsed = measureWrapperHeight(scrollEl);

    gsap.set(largeInners, { clearProps: "display,opacity" });
    gsap.set(smallInners, { clearProps: "all" });

    return collapsed;
  }

  function measureHeights(scrollEl) {
    setCompact(scrollEl, false);
    setAnimating(scrollEl, false);

    const expanded = measureWrapperHeight(scrollEl);
    const collapsed = measureCollapsedHeight(scrollEl);

    return { expanded, collapsed, pinDistance: Math.max(240, expanded - collapsed) };
  }

  function syncProgress(scrollEl, state, progress) {
    const p = Math.max(0, Math.min(1, progress));
    const { wrapper, cards, largeInners, smallInners, expanded, collapsed } = state;

    if (p <= 0) {
      setCompact(scrollEl, false);
      setAnimating(scrollEl, false);
      gsap.set(wrapper, { height: expanded, clearProps: "height" });
      gsap.set(largeInners, { opacity: 1, clearProps: "opacity" });
      gsap.set(smallInners, { opacity: 0, pointerEvents: "none", clearProps: "opacity,pointerEvents" });
      return;
    }

    if (p >= 1) {
      setAnimating(scrollEl, false);
      setCompact(scrollEl, true);
      gsap.set(wrapper, { clearProps: "height" });
      gsap.set(largeInners, { clearProps: "opacity" });
      gsap.set(smallInners, { clearProps: "opacity,pointerEvents" });
      return;
    }

    setCompact(scrollEl, false);
    setAnimating(scrollEl, true);
    gsap.set(wrapper, { height: expanded + (collapsed - expanded) * p });
    gsap.set(largeInners, { opacity: 1 - p });
    gsap.set(smallInners, {
      opacity: p,
      pointerEvents: p > 0.5 ? "auto" : "none",
    });
  }

  function initScrollSection(scrollEl, index, total) {
    const wrapper = scrollEl.querySelector(".ai_cards-wrapper");
    const cards = getCards(scrollEl);
    const largeInners = scrollEl.querySelectorAll(".ai_inner-large");
    const smallInners = scrollEl.querySelectorAll(".ai_inner-small");
    if (!wrapper || !cards.length || !largeInners.length || !smallInners.length) return;

    const heights = measureHeights(scrollEl);
    const state = { wrapper, cards, largeInners, smallInners, ...heights };

    syncProgress(scrollEl, state, 0);

    const trigger = ScrollTrigger.create({
      id: total > 1 ? `dream-cards-${index}` : "dream-cards",
      trigger: scrollEl,
      start: "top top",
      end: `+=${heights.pinDistance}`,
      scrub: SCRUB,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => syncProgress(scrollEl, state, self.progress),
      onRefresh: (self) => syncProgress(scrollEl, state, self.progress),
    });

    syncProgress(scrollEl, state, trigger.progress);
  }

  function initDreamCards() {
    if (!window.gsap || !window.ScrollTrigger) return;

    const sections = document.querySelectorAll(".scroll-component");
    if (!sections.length) return;

    gsap.registerPlugin(ScrollTrigger);

    sections.forEach((scrollEl, index) => {
      if (scrollEl.dataset.dreamCardsInit === "true") return;
      scrollEl.dataset.dreamCardsInit = "true";

      if (prefersReducedMotion()) {
        setCompact(scrollEl, true);
        setAnimating(scrollEl, false);
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
