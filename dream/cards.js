(function () {
  const COMPACT_CLASS = "is-compact";
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

  function measureWrapperHeight(scrollEl) {
    const wrapper = scrollEl.querySelector(".ai_cards-wrapper");
    return wrapper ? Math.round(wrapper.getBoundingClientRect().height) : 0;
  }

  function measureHeights(scrollEl) {
    setCompact(scrollEl, false);
    const expanded = measureWrapperHeight(scrollEl);

    setCompact(scrollEl, true);
    const collapsed = measureWrapperHeight(scrollEl);

    setCompact(scrollEl, false);
    return { expanded, collapsed, pinDistance: Math.max(240, expanded - collapsed) };
  }

  function initScrollSection(scrollEl, index, total) {
    const wrapper = scrollEl.querySelector(".ai_cards-wrapper");
    const cards = getCards(scrollEl);
    const largeInners = scrollEl.querySelectorAll(".ai_inner-large");
    const smallInners = scrollEl.querySelectorAll(".ai_inner-small");
    if (!wrapper || !cards.length || !largeInners.length || !smallInners.length) return;

    const { expanded, collapsed, pinDistance } = measureHeights(scrollEl);

    gsap.set(wrapper, { height: expanded });
    gsap.set(largeInners, { opacity: 1 });
    gsap.set(smallInners, { opacity: 0, pointerEvents: "none" });

    ScrollTrigger.create({
      id: total > 1 ? `dream-cards-${index}` : "dream-cards",
      trigger: scrollEl,
      start: "top top",
      end: `+=${pinDistance}`,
      scrub: SCRUB,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(wrapper, { height: expanded + (collapsed - expanded) * p });
        gsap.set(largeInners, { opacity: 1 - p });
        gsap.set(smallInners, {
          opacity: p,
          pointerEvents: p > 0.5 ? "auto" : "none",
        });
      },
      onEnter: () => {
        setCompact(scrollEl, false);
        gsap.set(wrapper, { height: expanded, clearProps: "" });
      },
      onLeaveBack: () => {
        setCompact(scrollEl, false);
        gsap.set(wrapper, { height: expanded, clearProps: "" });
      },
      onLeave: () => {
        setCompact(scrollEl, true);
        gsap.set(wrapper, { clearProps: "height" });
        gsap.set(largeInners, { clearProps: "opacity" });
        gsap.set(smallInners, { clearProps: "opacity,pointerEvents" });
      },
      onEnterBack: () => {
        setCompact(scrollEl, false);
        gsap.set(wrapper, { height: expanded });
        gsap.set(largeInners, { opacity: 1, clearProps: "" });
        gsap.set(smallInners, { opacity: 0, pointerEvents: "none", clearProps: "" });
      },
    });
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
