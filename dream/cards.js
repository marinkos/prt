function initDreamCards() {
  if (!window.gsap || !window.ScrollTrigger || !window.Flip) return;
  if (!document.querySelector(".scroll-component")) return;

  gsap.registerPlugin(ScrollTrigger, Flip);

  // Class timeline (matches your two Webflow states):
  // - scroll 0:   NO compact anywhere (big / hero)
  // - scroll 60%: compact on inner content (tab icons, titles, text…)
  // - scroll 98%: compact on wrapper + cards too (full compact bar)
  // - scroll 85%: is-active on the default tab
  const PIN_FROM_TOP = "6rem";
  const CONTENT_COMPACT_AT = 0.6;
  const LAYOUT_COMPACT_AT = 0.98;
  const ACTIVE_TAB_AT = 0.85;

  const scrollComponents = document.querySelectorAll(".scroll-component");
  scrollComponents.forEach((scrollEl) => {
    const scope = scrollEl.closest("section") || scrollEl;

    const wrapperEl = scope.querySelector(".ai_cards-wrapper");
    const cardEls = Array.from(scope.querySelectorAll(".ai_item"));
    if (!wrapperEl || cardEls.length === 0) return;

    const initialActiveIndex = cardEls.findIndex((el) =>
      el.classList.contains("is-active")
    );
    const activeIndex = initialActiveIndex >= 0 ? initialActiveIndex : 0;

    const layoutCompactEls = [scrollEl, wrapperEl, ...cardEls];

    const contentCompactEls = Array.from(
      new Set(
        [
          ".ai_item-heading",
          ".ai_item-big-icon",
          ".ai_tab-icon",
          ".ai_item h2",
          ".ai_item p",
        ].flatMap((sel) => Array.from(scope.querySelectorAll(sel)))
      )
    );

    function setLayoutCompact(on) {
      layoutCompactEls.forEach((el) => el.classList.toggle("compact", on));
    }

    function setContentCompact(on) {
      contentCompactEls.forEach((el) => el.classList.toggle("compact", on));
    }

    function setActiveTab(on) {
      cardEls.forEach((el, i) => {
        el.classList.toggle("is-active", on && i === activeIndex);
      });
    }

    // One function = source of truth for Webflow combo classes.
    function syncClasses(progress) {
      const p = Math.max(0, Math.min(1, progress));
      setContentCompact(p >= CONTENT_COMPACT_AT);
      setLayoutCompact(p >= LAYOUT_COMPACT_AT);
      setActiveTab(p >= ACTIVE_TAB_AT);
    }

    // Remove every compact / is-active Webflow may have baked into the HTML.
    scope.querySelectorAll(".compact").forEach((el) => el.classList.remove("compact"));
    scope.querySelectorAll(".is-active").forEach((el) => el.classList.remove("is-active"));
    syncClasses(0);

    const flipEls = [wrapperEl, ...cardEls];
    scope
      .querySelectorAll(".ai_item .card-bg, .ai_item [class*='card-bg']")
      .forEach((el) => flipEls.push(el));

    const state = Flip.getState(flipEls, {
      props: "opacity,borderColor,borderRadius,padding,minHeight,gap,width",
    });

    // Flip needs to measure the compact end-state once (not left on at scroll 0).
    setLayoutCompact(true);
    setContentCompact(true);

    const heroEls = scope.querySelectorAll(
      ".ai_item-big-icon, .ai_item-heading h2, .ai_item > p"
    );
    const tabEls = scope.querySelectorAll(".ai_tab-icon");

    gsap.set(tabEls, { opacity: 0 });

    // Back to your real initial class state before scroll.
    syncClasses(0);

    function applyPinOffset(self) {
      // ScrollTrigger often pins at top: 0; keep the block 6rem below the viewport top.
      if (self.isActive) gsap.set(scrollEl, { top: PIN_FROM_TOP });
    }

    const scrollConfig = {
      id: "dream-cards",
      trigger: scrollEl,
      start: `top top+=${PIN_FROM_TOP}`,
      end: "+=1200",
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: applyPinOffset,
      onEnter: applyPinOffset,
      onEnterBack: applyPinOffset,
      onUpdate: (self) => {
        syncClasses(self.progress);
        applyPinOffset(self);
      },
    };

    Flip.from(state, {
      ease: "power2.inOut",
      nested: true,
      scrollTrigger: {
        ...scrollConfig,
        pin: true,
      },
    });

    const contentTl = gsap.timeline({ scrollTrigger: scrollConfig });

    contentTl.to(
      heroEls,
      {
        scale: 0.3,
        opacity: 0,
        ease: "power2.in",
        duration: 0.6,
        transformOrigin: "top center",
      },
      0
    );

    contentTl.to(
      tabEls,
      {
        opacity: 1,
        ease: "power2.out",
        duration: 0.4,
      },
      CONTENT_COMPACT_AT
    );

    syncClasses(contentTl.scrollTrigger?.progress ?? 0);
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
