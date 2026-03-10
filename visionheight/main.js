/* flip text (3D character flip, triggered by data-scramble) */
(function () {
  "use strict";

  const DEFAULTS = {
    duration : 0.6,
    stagger  : 0.03,
    repeat   : false,
  };

  const TRANSFORM_ORIGIN = "50% 50% -50";

  function injectFlipStyles() {
    if (document.getElementById("flip-text-styles")) return;
    const style = document.createElement("style");
    style.id = "flip-text-styles";
    style.textContent = `
      [data-scramble] .flip-text-container { position: relative; display: inline-block; }
      [data-scramble] .flip-text-wrapper {
        display: inline-block;
        perspective: 600px;
        white-space: nowrap;
      }
      [data-scramble] .flip-char {
        display: inline-block;
        transform-style: preserve-3d;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);
  }

  function buildFlipDOM(el) {
    if (el.classList.contains("flip-text-built")) return;
    const original = (el.dataset.scrambleOriginal || el.textContent).trim();
    el.dataset.scrambleOriginal = original;

    const container = document.createElement("span");
    container.className = "flip-text-container";

    function createWrapper() {
      const wrapper = document.createElement("span");
      wrapper.className = "flip-text-wrapper";
      original.split("").forEach((ch) => {
        if (ch === " ") {
          wrapper.appendChild(document.createTextNode("\u00A0"));
          return;
        }
        const span = document.createElement("span");
        span.className = "flip-char";
        span.textContent = ch;
        wrapper.appendChild(span);
      });
      return wrapper;
    }

    const originalWrapper = createWrapper();
    const cloneWrapper = createWrapper();
    container.appendChild(originalWrapper);
    container.appendChild(cloneWrapper);

    el.textContent = "";
    el.appendChild(container);
    el.classList.add("flip-text-built");
  }

  function runFlipAnimation(el, opts) {
    buildFlipDOM(el);
    const container = el.querySelector(".flip-text-container");
    const originalWrapper = container.querySelector(".flip-text-wrapper:first-child");
    const cloneWrapper = container.querySelector(".flip-text-wrapper:last-child");
    const originalChars = originalWrapper.querySelectorAll(".flip-char");
    const cloneChars = cloneWrapper.querySelectorAll(".flip-char");
    if (!originalChars.length) return;

    const duration = parseFloat(el.dataset.scrambleDuration) || opts.duration;
    const staggerVal = parseFloat(el.dataset.scrambleStagger) || opts.stagger;
    const stagger = { each: staggerVal, ease: "power2", from: "start" };

    gsap.set(cloneWrapper, { yPercent: -100 });
    gsap.set(cloneChars, {
      rotationX: -90,
      opacity: 0,
      transformOrigin: TRANSFORM_ORIGIN,
    });
    gsap.set(originalChars, {
      rotationX: 0,
      opacity: 1,
      transformOrigin: TRANSFORM_ORIGIN,
    });

    const tl = gsap.timeline();
    tl.to(originalChars, {
      duration,
      rotationX: 90,
      transformOrigin: TRANSFORM_ORIGIN,
      stagger,
    }, 0);
    tl.to(originalChars, {
      duration,
      opacity: 0,
      stagger,
      ease: "power4.in",
    }, 0);
    tl.to(cloneChars, { duration: 0.05, opacity: 1, stagger }, 0.001);
    tl.to(cloneChars, {
      duration,
      rotationX: 0,
      stagger,
    }, 0);
  }

  function init() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.error("[flip-text] GSAP and ScrollTrigger must be loaded before this script.");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    injectFlipStyles();

    // Any element with [data-scramble] gets the flip effect when it enters the viewport
    document.querySelectorAll("[data-scramble]").forEach((el) => {
      const repeat = el.dataset.scrambleRepeat === "true" || DEFAULTS.repeat;

      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: !repeat,
        onEnter: () => runFlipAnimation(el, DEFAULTS),
        onEnterBack: repeat ? () => runFlipAnimation(el, DEFAULTS) : undefined,
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* cookies */
(function () {
  function run() {
    const STORAGE_KEY = "cookie_consent";
    const banner = document.getElementById("cookieBanner");

    if (!banner || localStorage.getItem(STORAGE_KEY)) return;

    banner.style.display = "block";

    banner.addEventListener("click", function (e) {
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (!action) return;

      e.preventDefault();
      localStorage.setItem(STORAGE_KEY, action === "accept" ? "accepted" : "dismissed");
      banner.style.display = "none";
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

/* nav back buttons */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".nav_back-button").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = btn.closest(".w-dropdown");
      if (!dropdown) return;

      dropdown.classList.remove("w--nav-dropdown-open");

      const toggle = dropdown.querySelector(".w-dropdown-toggle");
      if (toggle) {
        toggle.classList.remove("w--open", "w--nav-dropdown-toggle-open");
        toggle.setAttribute("aria-expanded", "false");
      }

      const list = dropdown.querySelector(".w-dropdown-list");
      if (list) {
        list.classList.remove("w--open", "w--nav-dropdown-list-open");
      }
    });
  });
});

/* nav dropdown dot */
(function () {
  function run() {
    if (window.innerWidth < 992) return;

    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      width: 0.25rem;
      height: 0.25rem;
      background-color: #0D70FF;
      transition: left 0.15s cubic-bezier(0.4, 0, 0.2, 1), top 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease;
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(indicator);

    function moveTo(toggle) {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const rect = toggle.getBoundingClientRect();
      indicator.style.left = (rect.left + rect.width / 2 - (0.125 * rem)) + 'px';
      indicator.style.top  = (rect.bottom - (0.25 * rem)) + 'px';
      indicator.style.opacity = '1';
    }

    function checkActive() {
      const open = document.querySelector('.nav_dropdown-toggle.w--open');
      if (open) {
        moveTo(open);
      } else {
        indicator.style.opacity = '0';
      }
    }

    const observer = new MutationObserver(checkActive);
    document.querySelectorAll('.nav_dropdown-toggle').forEach(el => {
      observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

/* float up */
(function () {
  const BATCH_WINDOW_MS = 150;
  const STAGGER_MS      = 90;

  function run() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const els = document.querySelectorAll("[data-float]");
    if (!els.length) return;

    let batchTimer   = null;
    let currentBatch = [];

    gsap.set(els, { y: 16 });

    function flushBatch() {
      if (!currentBatch.length) return;
      currentBatch.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        if (Math.abs(ra.top - rb.top) > 10) return ra.top - rb.top;
        return ra.left - rb.left;
      });

      gsap.to(currentBatch, {
        y: 0,
        duration: 0.8,
        stagger: STAGGER_MS / 1000,
        ease: "power3.out",
        overwrite: true,
      });

      currentBatch = [];
      batchTimer   = null;
    }

    els.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          currentBatch.push(el);
          clearTimeout(batchTimer);
          batchTimer = setTimeout(flushBatch, BATCH_WINDOW_MS);
        },
      });
    });

    requestAnimationFrame(function () {
      ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
