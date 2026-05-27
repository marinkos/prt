(function () {
  const STYLE_ID = "dream-cards-compact-styles";

  function injectCompactStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .scroll-component .ai_cards-wrapper.compact {
        border-radius: 1rem;
        border: 1px solid var(--borders--primary);
      }

      .scroll-component .ai_item.compact {
        min-height: 0;
        flex: 1 1 0;
      }

      .scroll-component .ai_item-heading.compact {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }

      .scroll-component .ai_item-big-icon.compact {
        height: 3rem;
        width: auto;
      }

      .scroll-component .ai_item-title.compact {
        font-size: 1rem;
        font-family: var(--_fonts---paragrapfs);
        font-weight: 500;
      }

      .scroll-component .ai_item-p.compact {
        display: none;
      }

      .scroll-component .ai_item.compact:not(.is-active) {
        opacity: 0.55;
      }

      .scroll-component .ai_item.compact.is-active {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  function isActiveCard(el) {
    return (
      el.classList.contains("is-active") ||
      el.classList.contains("is-aacitve")
    );
  }

  function initDreamCards() {
    if (!window.gsap || !window.ScrollTrigger || !window.Flip) return;
    if (!document.querySelector(".scroll-component")) return;

    injectCompactStyles();
    gsap.registerPlugin(ScrollTrigger, Flip);

    const COMPACT_AT = 0.6;
    const ACTIVE_TAB_AT = 0.85;
    const SCROLL_DISTANCE = 1200;

    const scrollComponents = document.querySelectorAll(".scroll-component");
    scrollComponents.forEach((scrollEl, scrollIndex) => {
      const scope = scrollEl.closest("section") || scrollEl;

      const wrapperEl = scrollEl.querySelector(".ai_cards-wrapper");
      const cardEls = Array.from(scrollEl.querySelectorAll(".ai_item"));
      if (!wrapperEl || cardEls.length === 0) return;

      const initialActiveIndex = cardEls.findIndex(isActiveCard);
      const activeIndex = initialActiveIndex >= 0 ? initialActiveIndex : 0;

      const compactSelectors = [
        ".ai_cards-wrapper",
        ".ai_item",
        ".ai_item-heading",
        ".ai_item-big-icon",
        ".ai_item-title",
        ".ai_item-p",
        ".ai_tab-icon",
      ];

      const allCompactEls = Array.from(
        new Set(
          compactSelectors.flatMap((sel) =>
            Array.from(scrollEl.querySelectorAll(sel))
          )
        )
      );

      function setAllCompact(on) {
        allCompactEls.forEach((el) => el.classList.toggle("compact", on));
      }

      function setActiveTab(on) {
        cardEls.forEach((el, i) => {
          el.classList.toggle("is-active", on && i === activeIndex);
          el.classList.remove("is-aacitve");
        });
      }

      function syncClasses(progress) {
        const p = Math.max(0, Math.min(1, progress));
        setAllCompact(p >= COMPACT_AT);
        setActiveTab(p >= ACTIVE_TAB_AT);
      }

      scope.querySelectorAll(".compact").forEach((el) => {
        el.classList.remove("compact");
      });
      setAllCompact(false);
      setActiveTab(false);

      const flipEls = [wrapperEl, ...cardEls];
      scope
        .querySelectorAll(".ai_item .card-bg, .ai_item [class*='card-bg']")
        .forEach((el) => flipEls.push(el));

      const state = Flip.getState(flipEls, {
        props:
          "opacity,borderColor,borderRadius,padding,minHeight,gap,width,height",
      });

      setAllCompact(true);
      setAllCompact(false);

      const heroEls = scrollEl.querySelectorAll(
        ".ai_item-heading, .ai_item-p"
      );
      const tabEls = scrollEl.querySelectorAll(".ai_tab-icon");

      gsap.set(tabEls, { opacity: 0 });

      const scrollConfig = {
        id:
          scrollComponents.length > 1
            ? `dream-cards-${scrollIndex}`
            : "dream-cards",
        trigger: scrollEl,
        start: "top top",
        end: `+=${SCROLL_DISTANCE}`,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => syncClasses(self.progress),
        onLeaveBack: () => syncClasses(0),
      };

      Flip.from(state, {
        ease: "power2.inOut",
        nested: true,
        scrollTrigger: {
          ...scrollConfig,
          pin: scrollEl,
          pinSpacing: true,
        },
      });

      const contentTl = gsap.timeline({ scrollTrigger: scrollConfig });

      contentTl.to(
        cardEls,
        {
          scale: 0.92,
          opacity: 0.85,
          ease: "power2.in",
          duration: 0.55,
          transformOrigin: "center top",
        },
        0
      );

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
})();
