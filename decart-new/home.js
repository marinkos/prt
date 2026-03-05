/* Scroll Marker Reveal — [data-reveal] (GSAP + SplitText only) */
(function () {
  if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
    console.warn('GSAP or SplitText not found. Marker reveal requires these libraries.');
    return;
  }

  function initMarkerReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (elements.length === 0) return;

    elements.forEach((el) => {
      const split = new SplitText(el, { type: 'lines', linesClass: 'reveal-line' });
      const lines = split.lines;

      if (!lines || lines.length === 0) return;

      const bars = [];

      lines.forEach((line) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'reveal-line-wrapper';
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);

        const bar = document.createElement('div');
        bar.className = 'reveal-bar';
        wrapper.appendChild(bar);
        bars.push(bar);
      });

      gsap.set(bars, { scaleX: 1 });

      /* Reveal when block enters viewport (no ScrollTrigger, uses IntersectionObserver) */
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            gsap.to(bars, {
              scaleX: 0,
              duration: 0.6,
              ease: 'power2.out',
              stagger: 0.06,
            });
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px 0px 0px' }
      );

      observer.observe(el);
    });
  }

  function runAfterFonts() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initMarkerReveal);
    } else {
      initMarkerReveal();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAfterFonts);
  } else {
    runAfterFonts();
  }
})();
