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

/* Text reveal — after document complete + web fonts so SplitText matches final line breaks */
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
              gsap.set(text.chars, { color: "#21222C" });
            } else if (self.progress === 0) {
              gsap.set(text.chars, { color: "#8A8A8E" });
            }
          },
        },
      });

      gsap.set(text.chars, {
        color: "#8A8A8E",
      });

      tl.to(text.chars, {
        color: "#21222C",
        stagger: 0.2,
      });
    });
  }

  function notifyFontFaceApplied() {
    if (typeof jQuery !== 'undefined') {
      jQuery(document).trigger('fontfaceapplied');
    }
  }

  function runTextRevealWhenReady() {
    function afterFonts() {
      notifyFontFaceApplied();
      initTextReveal();
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(afterFonts);
    } else {
      afterFonts();
    }
  }

  if (document.readyState === 'complete') {
    runTextRevealWhenReady();
  } else {
    document.addEventListener('readystatechange', function onReadyState() {
      if (document.readyState === 'complete') {
        document.removeEventListener('readystatechange', onReadyState);
        runTextRevealWhenReady();
      }
    });
  }
})();

/* Marquee — [data="marquee"] (GSAP, swipe/drag, pause then resume). Runs only if marquee exists. — commented out
(function () {
  if (typeof gsap === 'undefined') return;

  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function initMarquee() {
    const marquee = document.querySelector('[data="marquee"]');
    if (!marquee) return;

    const marqueeContent = marquee.firstElementChild;
    if (!marqueeContent) return;

    // Capture horizontal drag on mobile; pan-y can block touchmove on some devices
    marquee.style.touchAction = isTouchDevice() ? 'none' : 'pan-y';

    const durationVal = marquee.getAttribute('data-marquee-duration') || marquee.getAttribute('duration') || '5';
    const duration = parseInt(durationVal, 10) || 5;
    const resumeDelay = parseInt(marquee.getAttribute('data-marquee-resume') || '5', 10) * 1000;

    // Duplicate all direct children for seamless loop (handles multi-item marquees)
    const originalChildren = Array.from(marquee.children);
    originalChildren.forEach((child) => marquee.appendChild(child.cloneNode(true)));

    let tween;
    let resumeTimer;
    let dragStartX;
    let dragStartProgress;
    let didDrag;
    let distanceToTranslate;

    function getDistance() {
      const childCount = marquee.children.length / 2;
      let total = 0;
      const gap = parseInt(
        getComputedStyle(marquee).getPropertyValue('column-gap') ||
        getComputedStyle(marquee).getPropertyValue('gap') || '0',
        10
      );
      for (let i = 0; i < childCount; i++) {
        total += marquee.children[i].offsetWidth + (i < childCount - 1 ? gap : 0);
      }
      return total || marqueeContent.offsetWidth + gap;
    }

    function playMarquee(fromX) {
      if (tween) tween.kill();
      distanceToTranslate = getDistance();
      const startX = typeof fromX === 'number' ? fromX : 0;

      tween = gsap.fromTo(
        marquee.children,
        { x: startX },
        { x: startX - distanceToTranslate, duration, ease: 'none', repeat: -1 }
      );
    }

    function pauseAndResumeLater() {
      if (tween) tween.pause();
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () {
        resumeTimer = null;
        const currentX = parseFloat(gsap.getProperty(marquee.children[0], 'x')) || 0;
        playMarquee(currentX);
      }, resumeDelay);
    }

    function onDragStart(clientX) {
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
      dragStartX = clientX;
      dragStartProgress = tween ? tween.progress() : 0;
      didDrag = false;
      distanceToTranslate = distanceToTranslate || getDistance();
    }

    function onDragMove(clientX) {
      if (dragStartX == null) return;
      if (!didDrag) {
        didDrag = true;
        if (tween) tween.pause();
      }
      const delta = clientX - dragStartX;
      const baseX = -dragStartProgress * distanceToTranslate;
      const maxScroll = -distanceToTranslate * 2;
      const newX = Math.max(maxScroll, Math.min(0, baseX + delta));
      gsap.set(marquee.children, { x: newX });
    }

    function onDragEnd() {
      if (dragStartX == null) return;
      const wasDragging = didDrag;
      dragStartX = null;
      if (!wasDragging) return;
      const currentX = parseFloat(gsap.getProperty(marquee.children[0], 'x')) || 0;
      playMarquee(currentX);
      pauseAndResumeLater();
    }

    function setupDrag() {
      let pointerId;
      let pointerDownX;
      let pointerDownY;
      let touchId = null;
      let captured = false;
      const dragThreshold = 5;

      function handlePointerEnd(e) {
        if (e.pointerId !== pointerId) return;
        if (captured) {
          marquee.releasePointerCapture && marquee.releasePointerCapture(e.pointerId);
          onDragEnd();
        }
        pointerId = null;
        captured = false;
      }

      function handleTouchEnd(e) {
        if (touchId == null) return;
        if (e.changedTouches) {
          for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId) {
              touchId = null;
              if (captured) onDragEnd();
              captured = false;
              return;
            }
          }
        }
      }

      if (isTouchDevice()) {
        // Touch events for mobile — more reliable than pointer events on iOS/Android
        marquee.addEventListener('touchstart', function (e) {
          if (touchId != null) return;
          touchId = e.changedTouches[0].identifier;
          pointerDownX = e.changedTouches[0].clientX;
          pointerDownY = e.changedTouches[0].clientY;
          captured = false;
        }, { passive: true });

        marquee.addEventListener('touchmove', function (e) {
          if (touchId == null) return;
          const t = Array.from(e.touches).find((x) => x.identifier === touchId);
          if (!t) return;
          if (!captured) {
            const dx = Math.abs(t.clientX - pointerDownX);
            const dy = Math.abs(t.clientY - pointerDownY);
            if (dx > dragThreshold || dy > dragThreshold) {
              captured = true;
              onDragStart(pointerDownX);
              didDrag = true;
              if (tween) tween.pause();
            } else {
              return;
            }
          }
          e.preventDefault();
          onDragMove(t.clientX);
        }, { passive: false });

        marquee.addEventListener('touchend', handleTouchEnd, { passive: true });
        marquee.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, true);
        document.addEventListener('touchcancel', handleTouchEnd, true);
      } else {
        // Pointer events for desktop
        marquee.addEventListener('pointerdown', function (e) {
          pointerId = e.pointerId;
          pointerDownX = e.clientX;
          pointerDownY = e.clientY;
          captured = false;
        });

        marquee.addEventListener('pointermove', function (e) {
          if (e.pointerId !== pointerId) return;
          if (!captured) {
            const dx = Math.abs(e.clientX - pointerDownX);
            const dy = Math.abs(e.clientY - pointerDownY);
            if (dx > dragThreshold || dy > dragThreshold) {
              captured = true;
              e.preventDefault();
              marquee.setPointerCapture && marquee.setPointerCapture(e.pointerId);
              onDragStart(pointerDownX);
              didDrag = true;
              if (tween) tween.pause();
            } else {
              return;
            }
          }
          e.preventDefault();
          onDragMove(e.clientX);
        }, { passive: false });

        document.addEventListener('pointerup', handlePointerEnd, true);
        document.addEventListener('pointercancel', handlePointerEnd, true);
      }
    }

    playMarquee();
    setupDrag();

    function debounce(fn) {
      var t;
      return function () {
        if (t) clearTimeout(t);
        t = setTimeout(fn, 500);
      };
    }

    window.addEventListener('resize', debounce(function () {
      if (resumeTimer) return;
      const p = tween ? tween.progress() : 0;
      distanceToTranslate = getDistance();
      playMarquee(p);
    }));
  }

  function tryInit() {
    const marquee = document.querySelector('[data="marquee"]');
    if (!marquee) return;
    initMarquee();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
*/

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