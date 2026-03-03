/* text scramble */
(function () {
  "use strict";

  const DEFAULTS = {
    duration : 1.2,
    chars    : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
    repeat   : false,
  };

  const rand     = (min, max) => Math.random() * (max - min) + min;
  const randChar = (pool)     => pool[Math.floor(Math.random() * pool.length)];

  function scrambleText(el, opts) {
    const original = el.dataset.scrambleOriginal || el.textContent;
    el.dataset.scrambleOriginal = original;

    const duration = parseFloat(el.dataset.scrambleDuration) || opts.duration;
    const pool     = el.dataset.scrambleChars || opts.chars;
    const chars    = original.split("");
    const total    = chars.length;

    const lockTimes = chars
      .map((_, i) => rand(duration * (i / total) * 0.4, duration * 0.9))
      .sort((a, b) => a - b);

    const resolved = new Array(total).fill(false);
    let startTime  = null;

    function render(ts) {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;

      let output = "";
      for (let i = 0; i < total; i++) {
        const ch = chars[i];
        if (ch === " ") { output += " "; continue; }
        if (resolved[i] || elapsed >= lockTimes[i]) {
          resolved[i] = true;
          output += ch;
        } else {
          output += randChar(pool);
        }
      }

      el.textContent = output;

      if (!resolved.every(Boolean)) {
        el._scrambleRaf = requestAnimationFrame(render);
      } else {
        el.textContent = original;
      }
    }

    if (el._scrambleRaf) cancelAnimationFrame(el._scrambleRaf);
    resolved.fill(false);
    startTime = null;
    el._scrambleRaf = requestAnimationFrame(render);
  }

  function init() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.error("[scramble] GSAP and ScrollTrigger must be loaded before this script.");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll("[data-scramble]").forEach((el) => {
      const repeat = el.dataset.scrambleRepeat === "true" || DEFAULTS.repeat;

      ScrollTrigger.create({
        trigger     : el,
        start       : "top 90%",
        once        : !repeat,
        onEnter     : ()  => scrambleText(el, DEFAULTS),
        onEnterBack : repeat ? () => scrambleText(el, DEFAULTS) : undefined,
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
