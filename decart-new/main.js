/* Lenis + ScrollTrigger sync — run before any ScrollTrigger animations */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  function initLenisScrollTrigger() {
    const lenis = window.lenis;
    if (!lenis) return;

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();
  }

  if (window.lenis) {
    initLenisScrollTrigger();
  } else {
    const check = setInterval(() => {
      if (window.lenis) {
        clearInterval(check);
        initLenisScrollTrigger();
      }
    }, 50);
    setTimeout(() => clearInterval(check), 5000);
  }
})();

/* Buttons */
(function () {
  if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
    console.warn('GSAP or SplitText not found. Button animations require these libraries.');
    return;
  }

  function animateChars(chars, yPosition) {
    gsap.to(chars, {
      y: yPosition,
      duration: 0.35,
      ease: "power1.inOut",
      stagger: 0.02,
    });
  }

  function initButtonAnimations() {
    const buttons = document.querySelectorAll('[data-rotate]');

    if (buttons.length === 0) return;

    buttons.forEach((button, index) => {
      const originalText = button.querySelector(".btn-text");

      if (!originalText) {
        console.warn(`Element with class "btn-text" not found inside button ${index + 1}`);
        return;
      }

      const originalSplit = new SplitText(originalText, { type: "chars" });

      const clonedText = originalText.cloneNode(true);
      button.appendChild(clonedText);

      const clonedSplit = new SplitText(clonedText, { type: "chars" });

      const originalChars = originalSplit.chars;
      const clonedChars = clonedSplit.chars;

      gsap.set(clonedText, { position: "absolute" });
      gsap.set(clonedChars, { y: "100%" });

      button.addEventListener("mouseenter", () => {
        animateChars(originalChars, "-100%");
        animateChars(clonedChars, "0%");
      });

      button.addEventListener("mouseleave", () => {
        animateChars(originalChars, "0%");
        animateChars(clonedChars, "100%");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initButtonAnimations);
  } else {
    initButtonAnimations();
  }
})();

/* Cursor coordinates — desktop only (≥992px), hide over iframe via Webflow interaction if needed */
(function () {
  const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;

  function initCursorCoords() {
    var el = document.getElementById('cursor-coords');
    if (!el) return;

    el.style.pointerEvents = 'none';

    function updateCoords(e) {
      el.textContent = '(X ' + (e.clientX / 10).toFixed(1) + ',Y ' + (e.clientY / 10).toFixed(1) + ')';
      el.style.left = (e.clientX + 12) + 'px';
      el.style.top = e.clientY + 'px';
      el.style.display = 'block';
    }

    if (isDesktop()) {
      window.addEventListener('mousemove', updateCoords);
    } else {
      el.style.display = 'none';
    }
  }

  initCursorCoords();
})();

/* Text reveal */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitText === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  function initTextReveal() {
    const splitTypes = document.querySelectorAll("[data-text-reveal]");
    splitTypes.forEach((char) => {
      const text = new SplitText(char, { type: "chars, words, lines" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: char,
          start: "top 80%",
          end: "top 20%",
          scrub: true,
          markers: false,
          onRefresh: (self) => {
            if (self.progress === 1) {
              gsap.set(text.chars, { color: "white" });
            } else if (self.progress === 0) {
              gsap.set(text.chars, { color: "#475462" });
            }
          },
        },
      });

      gsap.set(text.chars, {
        color: "#ADADAD",
      });

      tl.to(text.chars, {
        color: "#21222C",
        stagger: 0.2,
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTextReveal);
  } else {
    initTextReveal();
  }
})();

/* Pin sections — [data-pin] (GSAP ScrollTrigger) — commented out
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  function initPinSections() {
    const pinnedSections = document.querySelectorAll('[data-pin]');
    const mainWrapper = document.querySelector('.main-wrapper');
    if (!pinnedSections.length || !mainWrapper) return;

    pinnedSections.forEach((pinnedSection) => {
      const desktopOnly = pinnedSection.dataset.pin === 'desktop';
      if (desktopOnly && window.matchMedia('(max-width: 767px)').matches) return;

      pinnedSection.style.zIndex = 0;
      pinnedSection.style.position = 'relative';

      const allChildren = [...mainWrapper.children];
      const currentIndex = allChildren.indexOf(pinnedSection);
      const siblingsAfter = allChildren.slice(currentIndex + 1);

      siblingsAfter.forEach((section) => {
        section.style.position = 'relative';
        section.style.zIndex = 1;
      });

      const pinDuration = siblingsAfter.reduce((acc, el) => acc + el.offsetHeight, 0);

      ScrollTrigger.create({
        trigger: pinnedSection,
        start: 'top top',
        end: `+=${pinDuration}`,
        pin: true,
        pinType: 'transform',
        pinSpacing: false,
        anticipatePin: 1,
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPinSections);
  } else {
    initPinSections();
  }
})();
*/