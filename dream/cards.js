document.addEventListener("DOMContentLoaded", function () {
  if (!document.querySelector(".scroll-component")) return;

  gsap.registerPlugin(ScrollTrigger);

  // Selectors that get .compact toggled on/off as scroll progresses
  const compactTargets = [
    ".ai_cards-wrapper",
    ".ai_item",
    ".ai_item-heading",
    ".ai_item-big-icon",
    ".ai_item h2",
    ".ai_item p"
  ];

  function setCompact(on) {
    compactTargets.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.classList.toggle("compact", on));
    });
  }

  // Ensure we start in HERO state (in case Webflow loaded with .compact on)
  setCompact(false);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-component",
      start: "top top",
      end: "+=1400",
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
    }
  });

  // PHASE 1 (0 → 50% of scroll): cards converge and shrink toward center
  tl.to(".ai_item:nth-child(1)", {
    scale: 0.08,
    x: "50%",
    opacity: 0,
    ease: "power2.in",
    duration: 0.5,
    transformOrigin: "center center",
  }, 0);

  tl.to(".ai_item:nth-child(2)", {
    scale: 0.08,
    x: "-50%",
    opacity: 0,
    ease: "power2.in",
    duration: 0.5,
    transformOrigin: "center center",
  }, 0);

  // PHASE 1 (parallel): wrapper morphs from wide cards container to tab-bar shape
  tl.fromTo(".ai_cards-wrapper",
    { width: "100%", padding: 0, borderColor: "transparent", gap: "1.25rem" },
    {
      width: "30rem",
      padding: "0.375rem",
      borderColor: "#e5e7eb",
      gap: "0.25rem",
      ease: "power2.inOut",
      duration: 0.7,
    }, 0);

  // PHASE 2 (55% onward): swap to compact, tabs fade in at full size
  tl.call(() => setCompact(true), [], 0.55);
  tl.call(() => setCompact(false), [], 0.549); // reverse-scroll safety

  tl.fromTo(".ai_item",
    { scale: 0.5, opacity: 0, x: 0 },
    { scale: 1, opacity: 1, x: 0, ease: "power2.out", duration: 0.45 },
    0.55);
});

