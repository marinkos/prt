function initDreamCards() {
  if (!window.gsap || !window.ScrollTrigger || !window.Flip) return;
  if (!document.querySelector(".scroll-component")) return;

  gsap.registerPlugin(ScrollTrigger, Flip);

  const scrollComponents = document.querySelectorAll(".scroll-component");
  scrollComponents.forEach((scrollEl) => {
    const scope = scrollEl.closest("section") || scrollEl;

    const wrapperEl = scope.querySelector(".ai_cards-wrapper");
    const cardEls = Array.from(scope.querySelectorAll(".ai_item"));
    if (!wrapperEl || cardEls.length === 0) return;

    const compactTargetsSelectors = [
      ".ai_cards-wrapper",
      ".ai_item",
      ".ai_item-heading",
      ".ai_item-big-icon",
      ".ai_tab-icon",
      ".ai_item h2",
      ".ai_item p",
    ];

    const initialActiveIndex = cardEls.findIndex((el) => el.classList.contains("is-active"));
    const activeIndex = initialActiveIndex >= 0 ? initialActiveIndex : 0;

    const compactTargets = Array.from(
      new Set(
        compactTargetsSelectors.flatMap((sel) => Array.from(scope.querySelectorAll(sel)))
      )
    );

    function applyCompact(on) {
      compactTargets.forEach((el) => el.classList.toggle("compact", on));
    }

    function setActiveTab(on) {
      cardEls.forEach((el, i) => {
        el.classList.toggle("is-active", on && i === activeIndex);
      });
    }

    // Ensure we capture the big-card layout for Flip.
    applyCompact(false);
    setActiveTab(false);

    const flipEls = [wrapperEl, ...cardEls];
    const bgEls = scope.querySelectorAll(".ai_item .card-bg, .ai_item [class*='card-bg']");
    bgEls.forEach((el) => flipEls.push(el));

    const state = Flip.getState(flipEls, {
      props: "opacity,borderColor,borderRadius,padding,minHeight,gap,width",
    });

    // DOM reflows to compact once; Flip animates back to the captured hero state at scroll 0.
    applyCompact(true);

    const heroEls = scope.querySelectorAll(
      ".ai_item-big-icon, .ai_item-heading h2, .ai_item > p"
    );
    const tabEls = scope.querySelectorAll(".ai_tab-icon");

    gsap.set(tabEls, { opacity: 0 });

    const scrollConfig = {
      trigger: scrollEl,
      start: "top 6rem",
      end: "+=1200",
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Active tab only when compact layout is mostly reached.
        setActiveTab(self.progress >= 0.85);
      },
    };

    // Outer morph: wrapper + cards (matches scroll-cards-to-tabs-flip.html).
    Flip.from(state, {
      ease: "power2.inOut",
      nested: true,
      scrollTrigger: {
        ...scrollConfig,
        pin: true,
      },
    });

    // Inner crossfade: hero scales out, then tab icons fade in.
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
      0.6
    );
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDreamCards);
} else {
  initDreamCards();
}
