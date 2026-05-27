function initDreamCards() {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (!document.querySelector(".scroll-component")) return;

  gsap.registerPlugin(ScrollTrigger);

  const scrollComponents = document.querySelectorAll(".scroll-component");
  scrollComponents.forEach((scrollEl) => {
    // Scope everything to this section to avoid collisions if multiple exist.
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

    // Capture which card is "active" in compact mode (based on initial markup).
    const initialActiveIndex = cardEls.findIndex((el) => el.classList.contains("is-active"));
    const activeIndex = initialActiveIndex >= 0 ? initialActiveIndex : 0;

    // Collect unique elements that should get/remove the `compact` class.
    const compactTargets = Array.from(
      new Set(
        compactTargetsSelectors.flatMap((sel) => Array.from(scope.querySelectorAll(sel)))
      )
    );

    let compactOn = null;
    function applyCompactState(on) {
      if (compactOn === on) return;
      compactOn = on;

      compactTargets.forEach((el) => el.classList.toggle("compact", on));

      // `is-active` must exist only in compact mode.
      cardEls.forEach((el) => el.classList.remove("is-active"));
      if (on) cardEls[activeIndex]?.classList.add("is-active");
    }

    // Initial state: no compact + no active tab.
    applyCompactState(false);

    // We switch layout only while cards are hidden to avoid visible "teleport".
    const switchTime = 0.5; // timeline time where we flip big -> compact (while hidden)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollEl,
        // Pin so the pinned element sits ~6rem from the top of the viewport.
        start: "top 6rem",
        end: "+=1400",
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const currentTime = self.progress * Math.max(0.001, tl.duration());
          applyCompactState(currentTime >= switchTime);
        },
      },
    });

    // Compute exact deltas so cards converge to wrapper center (no guessing with % transforms).
    function getCenter(rect) {
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    function computeConvergeTweens() {
      const wrapperRect = wrapperEl.getBoundingClientRect();
      const wrapperCenter = getCenter(wrapperRect);

      return cardEls.map((cardEl) => {
        const cardRect = cardEl.getBoundingClientRect();
        const cardCenter = getCenter(cardRect);
        return {
          el: cardEl,
          dx: wrapperCenter.x - cardCenter.x,
          dy: wrapperCenter.y - cardCenter.y,
        };
      });
    }

    const converge = computeConvergeTweens();

    // Phase 1: cards converge toward wrapper center and fade out.
    converge.forEach((c) => {
      tl.to(
        c.el,
        {
          x: c.dx,
          y: c.dy,
          scale: 0.08,
          opacity: 0,
          ease: "power2.in",
          duration: switchTime,
          transformOrigin: "center center",
        },
        0
      );
    });

    // Phase 1 (parallel): wrapper morphs to tab-bar shape.
    tl.to(wrapperEl, {
      width: "30rem",
      padding: "0.375rem",
      borderColor: "#e5e7eb",
      gap: "0.25rem",
      ease: "power2.inOut",
      duration: 0.7,
    }, 0);

    // Phase 2: cards fade back in in compact layout.
    tl.to(
      cardEls,
      {
        // Clear the converge transforms so compact CSS can place them.
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        ease: "power2.out",
        duration: 0.45,
      },
      switchTime
    );
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDreamCards);
} else {
  initDreamCards();
}
