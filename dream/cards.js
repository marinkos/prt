(function () {
  const COMPACT_CLASS = "is-compact";
  const SCRUB = 1.2;
  const PIN_OFFSET = 200;
  const HOLD_RATIO = 0.5;

  const FLIP_SELECTOR = [
    ".ai_cards-wrapper",
    ".ai_card",
    ".ai_inner-large",
    ".ai_inner-small",
    ".ai_video-wrapper",
  ].join(", ");

  const FLIP_PROPS =
    "opacity,padding,gap,width,height,minHeight,borderRadius,fontSize";

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

  function measureScrollDistance(scrollEl) {
    setCompact(scrollEl, false);

    const expanded = measureWrapperHeight(scrollEl);
    const collapsed = measureCollapsedHeight(scrollEl);
    const collapseDistance = Math.max(280, expanded - collapsed);

    setCompact(scrollEl, false);
    return collapseDistance * 2;
  }

  function clearFlipTransforms(targets) {
    gsap.set(targets, { clearProps: "all" });
  }

  function buildFlip(scrollEl) {
    const targets = scrollEl.querySelectorAll(FLIP_SELECTOR);

    setCompact(scrollEl, false);
    const flipState = Flip.getState(targets, { props: FLIP_PROPS });
    setCompact(scrollEl, true);

    const tween = Flip.from(flipState, {
      ease: "power2.inOut",
      nested: true,
      absolute: true,
      paused: true,
      duration: 1,
      onLeave: (elements) =>
        gsap.to(elements, { opacity: 0, duration: 0.25, overwrite: "auto" }),
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, overwrite: "auto" }
        ),
    });

    setCompact(scrollEl, false);
    tween.progress(0).pause();

    return { targets, tween };
  }

  function syncProgress(scrollEl, state, progress) {
    const p = Math.max(0, Math.min(1, progress));
    const { targets, flipTween } = state;

    if (p <= 0) {
      setCompact(scrollEl, false);
      flipTween.progress(0).pause();
      clearFlipTransforms(targets);
      return;
    }

    if (p >= 1) {
      setCompact(scrollEl, true);
      flipTween.progress(1).pause();
      clearFlipTransforms(targets);
      return;
    }

    if (p < HOLD_RATIO) {
      setCompact(scrollEl, false);
      flipTween.progress(0).pause();
      clearFlipTransforms(targets);
      return;
    }

    setCompact(scrollEl, true);
    const morph = (p - HOLD_RATIO) / (1 - HOLD_RATIO);
    flipTween.progress(morph).pause();
  }

  function initScrollSection(scrollEl, index, total) {
    const wrapper = scrollEl.querySelector(".ai_cards-wrapper");
    const cards = getCards(scrollEl);
    if (!wrapper || !cards.length) return;
    if (!scrollEl.querySelector(".ai_inner-large, .ai_inner-small")) return;

    const scrollDistance = measureScrollDistance(scrollEl);
    const { targets, tween: flipTween } = buildFlip(scrollEl);
    const state = { targets, flipTween };

    setCompact(scrollEl, false);
    clearFlipTransforms(targets);

    const trigger = ScrollTrigger.create({
      id: total > 1 ? `dream-cards-${index}` : "dream-cards",
      trigger: scrollEl,
      start: `top ${PIN_OFFSET}px`,
      end: `+=${scrollDistance}`,
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
