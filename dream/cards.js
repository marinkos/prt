function initDreamCards() {
  if (!window.gsap || !window.ScrollTrigger || !window.Flip) return;
  if (!document.querySelector(".scroll-component")) return;

  gsap.registerPlugin(ScrollTrigger, Flip);

  const COMPACT_AT = 0.6;
  const ACTIVE_TAB_AT = 0.85;

  const scrollComponents = document.querySelectorAll(".scroll-component");
  scrollComponents.forEach((scrollEl, scrollIndex) => {
    const scope = scrollEl.closest("section") || scrollEl;

    const wrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
    const cardEls = Array.from(scrollEl.querySelectorAll(".ai_item"));
    if (!wrapperEl || cardEls.length === 0) return;

    // Pin only the cards block (like .pin-target in scroll-cards-to-tabs-flip.html).
    // Pinning all of .scroll-component includes video and creates a huge pin-spacer.
    const pinEl = scrollEl.querySelector(".ai_cards-pin") || wrapperEl;

    const initialActiveIndex = cardEls.findIndex((el) =>
      el.classList.contains("is-active")
    );
    const activeIndex = initialActiveIndex >= 0 ? initialActiveIndex : 0;

    // Layout: always compact after Flip setup (like body.compact → .cards-container / .card).
    const layoutCompactSelectors = [".ai_cards-wrapper", ".ai_item"];

    // Content combos: turn on with scroll (hero → tab), same timing as reference demo.
    const contentCompactSelectors = [
      ".ai_item-heading",
      ".ai_item-big-icon",
      ".ai_item-title",
      ".ai_item-p",
      ".ai_tab-icon",
    ];

    const layoutCompactEls = layoutCompactSelectors.flatMap((sel) =>
      Array.from(scrollEl.querySelectorAll(sel))
    );

    const contentCompactEls = Array.from(
      new Set(
        contentCompactSelectors.flatMap((sel) =>
          Array.from(scrollEl.querySelectorAll(sel))
        )
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

    function syncClasses(progress) {
      const p = Math.max(0, Math.min(1, progress));
      setLayoutCompact(true);
      setContentCompact(p >= COMPACT_AT);
      setActiveTab(p >= ACTIVE_TAB_AT);
    }

    scope.querySelectorAll(".compact").forEach((el) => el.classList.remove("compact"));
    scope.querySelectorAll(".is-active").forEach((el) => el.classList.remove("is-active"));
    setLayoutCompact(false);
    setContentCompact(false);

    const flipEls = [wrapperEl, ...cardEls];
    scope
      .querySelectorAll(".ai_item .card-bg, .ai_item [class*='card-bg']")
      .forEach((el) => flipEls.push(el));

    const state = Flip.getState(flipEls, {
      props: "opacity,borderColor,borderRadius,padding,minHeight,gap",
    });

    setLayoutCompact(true);
    setContentCompact(true);

    // Hero layer = one block each (like .card-hero in the reference), not individual transforms on card height.
    const heroEls = scrollEl.querySelectorAll(".ai_item-heading, .ai_item-p");
    const tabEls = scrollEl.querySelectorAll(".ai_tab-icon");

    gsap.set(tabEls, { opacity: 0 });
    setLayoutCompact(true);
    setContentCompact(false);
    setActiveTab(false);

    const scrollConfig = {
      id:
        scrollComponents.length > 1
          ? `dream-cards-${scrollIndex}`
          : "dream-cards",
      trigger: scrollEl,
      start: "top top",
      end: "+=1200",
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => syncClasses(self.progress),
    };

    Flip.from(state, {
      ease: "power2.inOut",
      nested: true,
      scrollTrigger: {
        ...scrollConfig,
        pin: pinEl,
        pinSpacing: true,
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
      COMPACT_AT
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
