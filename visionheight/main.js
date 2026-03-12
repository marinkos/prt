/* text flip — desktop only */
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth < 992) return;

  document.querySelectorAll('[data-flip-text]').forEach(el => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      const text = el.textContent;
      const duration = parseFloat(el.dataset.flipDuration) || 2.2;
      const delay   = parseFloat(el.dataset.flipDelay)    || 0;
      const totalChars = text.length;
      let globalIndex = 0;

      const wrapper = document.createElement('span');
      wrapper.className = 'flip-text-wrapper';

      text.split(' ').forEach((word, wi, words) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'flip-word';

        word.split('').forEach(char => {
          const sine = Math.sin((globalIndex / totalChars) * (Math.PI / 2));
          const span = document.createElement('span');
          span.className = 'flip-char';
          span.dataset.char = char;
          span.textContent = char;
          span.style.setProperty('--flip-duration', `${duration}s`);
          span.style.setProperty('--flip-delay', `${sine * (duration * 0.25) + delay}s`);
          wordSpan.appendChild(span);
          globalIndex++;
        });

        wrapper.appendChild(wordSpan);
        if (wi < words.length - 1) {
          wrapper.appendChild(Object.assign(document.createElement('span'), { innerHTML: '&nbsp;' }));
          globalIndex++;
        }
      });

      el.textContent = '';
      el.appendChild(wrapper);
    }, { threshold: 0.2 });

    observer.observe(el);
  });
});

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

/* nav container open state */
document.addEventListener("DOMContentLoaded", function () {
  const navContainer = document.querySelector(".nav_container");
  const navButton = document.querySelector(".w-nav-button");

  if (!navContainer || !navButton) return;

  const observer = new MutationObserver(() => {
    if (navButton.classList.contains("w--open")) {
      navContainer.classList.add("is-open");
    } else {
      navContainer.classList.remove("is-open");
    }
  });

  observer.observe(navButton, {
    attributes: true,
    attributeFilter: ["class"]
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
