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
    // Cache original text so repeats start clean
    const original = el.dataset.scrambleOriginal || el.textContent;
    el.dataset.scrambleOriginal = original;

    const duration = parseFloat(el.dataset.scrambleDuration) || opts.duration;
    const pool     = el.dataset.scrambleChars || opts.chars;
    const chars    = original.split("");
    const total    = chars.length;

    // Each character gets a staggered lock-in time (roughly left-to-right)
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
        el.textContent = original; // guarantee exact final text
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
