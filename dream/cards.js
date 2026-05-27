function initDreamCards() {
  if (!window.gsap || !window.ScrollTrigger || !window.Flip) return;
  if (!document.querySelector(".scroll-component")) return;

  gsap.registerPlugin(ScrollTrigger, Flip);

  const PIN_FROM_TOP = "6rem";
  const COMPACT_AT = 0.6; // all Webflow compact combos turn on together (tab phase)
  const ACTIVE_TAB_AT = 0.85;

  const scrollComponents = document.querySelectorAll(".scroll-component");
  scrollComponents.forEach((scrollEl) => {
    const scope = scrollEl.closest("section") || scrollEl;

    const wrapperEl = scope.querySelector(".ai_cards-wrapper");
    const cardEls = Array.from(scope.querySelectorAll(".ai_item"));
    if (!wrapperEl || cardEls.length === 0) return;

    // Pin ONLY the cards block — not .scroll-component (that includes video and causes jumps).
    // Optional: add a Webflow div.ai_cards-pin wrapping the wrapper and we will use that.
    const pinEl =
      scrollEl.querySelector(".ai_cards-pin") || wrapperEl;

    const initialActiveIndex = cardEls.findIndex((el) =>
      el.classList.contains("is-active")
    );
    const activeIndex = initialActiveIndex >= 0 ? initialActiveIndex : 0;

    // Every node that carries the compact combo in Webflow (your compact-state HTML).
    const allCompactEls = Array.from(
      new Set(
        [
          ".ai_cards-wrapper",
          ".ai_item",
          ".ai_item-heading",
          ".ai_item-big-icon",
          ".ai_tab-icon",
          ".ai_item h2",
          ".ai_item p",
          ".ai_item .text-color-secondary",
        ].flatMap((sel) => Array.from(scope.querySelectorAll(sel)))
      )
    );

    function setAllCompact(on) {
      allCompactEls.forEach((el) => el.classList.toggle("compact", on));
    }

    function setActiveTab(on) {
      cardEls.forEach((el, i) => {
        el.classList.toggle("is-active", on && i === activeIndex);
      });
    }

    function syncClasses(progress) {
      const p = Math.max(0, Math.min(1, progress));
      setAllCompact(p >= COMPACT_AT);
      setActiveTab(p >= ACTIVE_TAB_AT);
    }

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

    setAllCompact(true);

    const heroEls = scope.querySelectorAll(
      ".ai_item-big-icon, .ai_item-heading h2, .ai_item > p"
    );
    const tabEls = scope.querySelectorAll(".ai_tab-icon");

    gsap.set(tabEls, { opacity: 0 });
    syncClasses(0);

    const scrollConfig = {
      id: "dream-cards",
      trigger: scrollEl,
      start: `top top+=${PIN_FROM_TOP}`,
      end: "+=1200",
      scrub: 0.8,
      anticipatePin: 0,
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
