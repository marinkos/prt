/* Scroll Marker Reveal — [data-reveal] (GSAP + SplitText only) */
(function () {
  if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
    console.warn('GSAP or SplitText not found. Marker reveal requires these libraries.');
    return;
  }

  const BAR_COLOR = '#2548F6';
  const BAR_SKEW_DEG = 8;
  const BAR_RADIUS = 10;
  /* Extra space so skewed bar isn't clipped (skewX extends ~height*tan(8deg) each side) */
  const BAR_SKEW_PADDING = 10;

  function createBarStyles() {
    const style = document.createElement('style');
    style.textContent = `
      [data-reveal] .reveal-line-wrapper {
        position: relative;
        overflow: visible;
        display: block;
        width: fit-content;
        max-width: 100%;
        margin-inline: auto;
        padding-inline: ${BAR_SKEW_PADDING}px;
        padding-block: 2px;
      }
      [data-reveal] .reveal-line-wrapper .reveal-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${BAR_COLOR};
        border-radius: ${BAR_RADIUS}px;
        transform: skewX(${BAR_SKEW_DEG}deg);
        transform-origin: right center;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  function initMarkerReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (elements.length === 0) return;

    createBarStyles();

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

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            gsap.to(bars, {
              scaleX: 0,
              duration: 1.15,
              ease: 'power2.out',
              stagger: 0.12,
            });
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
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
