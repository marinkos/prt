/* Silicone video: play only when in view */
(function () {
  function initSiliconeVideo() {
    const container = document.getElementById('siliconeVideo') || document.querySelector('.silicone_video');
    if (!container) return;

    const video = container.querySelector('video');
    if (!video) return;

    /* Start paused; IntersectionObserver will play when in view */
    video.pause();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px' }
    );

    observer.observe(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiliconeVideo);
  } else {
    initSiliconeVideo();
  }
})();

/* Scroll Marker Reveal — [data-reveal] (GSAP + SplitText only) */
// COMMENTED OUT: bar reveal effect
// (function () {
//   if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
//     console.warn('GSAP or SplitText not found. Marker reveal requires these libraries.');
//     return;
//   }
//
//   function initMarkerReveal() {
//     const elements = document.querySelectorAll('[data-reveal]');
//     if (elements.length === 0) return;
//
//     elements.forEach((el) => {
//       const split = new SplitText(el, { type: 'lines', linesClass: 'reveal-line' });
//       const lines = split.lines;
//
//       if (!lines || lines.length === 0) return;
//
//       const bars = [];
//
//       lines.forEach((line) => {
//         const wrapper = document.createElement('div');
//         wrapper.className = 'reveal-line-wrapper';
//         line.parentNode.insertBefore(wrapper, line);
//         wrapper.appendChild(line);
//
//         const bar = document.createElement('div');
//         bar.className = 'reveal-bar';
//         wrapper.appendChild(bar);
//         bars.push(bar);
//       });
//
//       gsap.set(bars, { scaleX: 1 });
//
//       const revealDelay = 0.3;
//       const observer = new IntersectionObserver(
//         (entries) => {
//           entries.forEach((entry) => {
//             if (entry.isIntersecting) {
//               gsap.set(bars, { scaleX: 1 });
//               gsap.to(bars, {
//                 scaleX: 0,
//                 duration: 0.6,
//                 ease: 'power2.out',
//                 stagger: 0.06,
//                 delay: revealDelay,
//               });
//             } else {
//               gsap.set(bars, { scaleX: 1 });
//             }
//           });
//         },
//         { threshold: 0.1, rootMargin: '0px 0px 0px 0px' }
//       );
//
//       observer.observe(el);
//     });
//   }
//
//   function runAfterFonts() {
//     if (document.fonts && document.fonts.ready) {
//       document.fonts.ready.then(initMarkerReveal);
//     } else {
//       initMarkerReveal();
//     }
//   }
//
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', runAfterFonts);
//   } else {
//     runAfterFonts();
//   }
// })();

/* Palantir-style scroll reveal — [data-reveal] (GSAP + ScrollTrigger) */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not found. Scroll reveal requires these libraries.');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  function initScrollReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (elements.length === 0) return;

    elements.forEach((el) => {
      gsap.fromTo(
        el,
        {
          y: 40,
          opacity: 0.7,
          lineHeight: 1.4,
        },
        {
          y: 0,
          opacity: 1,
          lineHeight: 1.05,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'top 25%',
            scrub: true,
          },
        }
      );
    });
  }

  function runAfterFonts() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initScrollReveal);
    } else {
      initScrollReveal();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAfterFonts);
  } else {
    runAfterFonts();
  }
})();

/* 3D Carousel — requires jQuery and GSAP */
(function () {
  function init() {
    if (typeof $ === 'undefined' || typeof gsap === 'undefined') return;

    $("[carousel='component']").each(function () {
      var componentEl = $(this);
      var wrapEl = componentEl.find("[carousel='wrap']");
      var itemEl = wrapEl.find('.carousel_item');
      var nextEl = componentEl.find("[carousel='next']");
      var prevEl = componentEl.find("[carousel='prev']");
      var numSlides = itemEl.length;
      var rotateAmount = 360 / numSlides;
      /* Radius: base closed circle + gap (read from --3d-carousel-gap on wrap so Webflow/inline CSS works) */
      var radiusDivisor = 2 * Math.sin((rotateAmount / 2) * (Math.PI / 180));
      var wrapDom = wrapEl[0];
      var gapValue = (wrapDom && getComputedStyle(wrapDom).getPropertyValue('--3d-carousel-gap').trim()) || '0px';
      var negTranslate = 'calc(var(--3d-carousel-item-width) / -' + radiusDivisor + ' - ' + gapValue + ')';
      var posTranslate = 'calc(var(--3d-carousel-item-width) / ' + radiusDivisor + ' + ' + gapValue + ')';

      var currentIndex = 0;
      var isDragging = false;
      var startX = 0;
      var currentRotation = 0;
      var dragThreshold = 50;

      wrapEl.css('--3d-carousel-z', negTranslate);
      wrapEl.css('perspective', posTranslate);
      wrapEl.css('cursor', 'grab');
      wrapEl.css('opacity', '0');

      itemEl.each(function (index) {
        $(this).css('transform', 'rotateY(' + rotateAmount * index + 'deg) translateZ(' + posTranslate + ')');
      });

      var introPlayed = false;
      var viewObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || introPlayed) return;
            introPlayed = true;
            viewObserver.disconnect();
            var introTl = gsap.timeline({
              onComplete: function () {
                setupNavigation();
                setupDragging();
                setupMouseFollow();
              }
            });
            introTl.to(wrapEl, { opacity: 1, duration: 0.3 });
            introTl.fromTo(wrapEl, { '--3d-carousel-rotate': 100, '--3d-carousel-rotate-x': -90 }, { '--3d-carousel-rotate': 0, '--3d-carousel-rotate-x': 0, duration: 4, ease: 'power2.inOut' }, '<');
          });
        },
        { threshold: 0.1, rootMargin: '0px' }
      );
      viewObserver.observe(componentEl[0]);

      function setupNavigation() {
        nextEl.on('click', function (e) {
          e.preventDefault();
          if (!isDragging) {
            currentIndex = (currentIndex + 1) % itemEl.length;
            updateCarousel();
          }
        });

        prevEl.on('click', function (e) {
          e.preventDefault();
          if (!isDragging) {
            currentIndex = (currentIndex - 1 + itemEl.length) % itemEl.length;
            updateCarousel();
          }
        });

        $(document).on('keydown', function (e) {
          if (!isDragging) {
            if (e.key === 'ArrowRight') {
              nextEl.click();
            } else if (e.key === 'ArrowLeft') {
              prevEl.click();
            }
          }
        });
      }

      var mouseOffset = 0;
      var targetMouseOffset = 0;
      var mouseOffsetX = 0;
      var targetMouseOffsetX = 0;
      var mouseSensitivity = 12;
      var mouseMaxDeg = 5;

      function setupMouseFollow() {
        $(document).on('mousemove.carouselMouse', function (e) {
          if (isDragging) return;
          var nX = (e.clientX / window.innerWidth - 0.5) * 2;
          var nY = (e.clientY / window.innerHeight - 0.5) * 2;
          targetMouseOffset = Math.max(-mouseMaxDeg, Math.min(mouseMaxDeg, nX * mouseSensitivity));
          targetMouseOffsetX = Math.max(-mouseMaxDeg, Math.min(mouseMaxDeg, -nY * mouseSensitivity));
        });
        function tick() {
          if (!isDragging) {
            mouseOffset += (targetMouseOffset - mouseOffset) * 0.08;
            mouseOffsetX += (targetMouseOffsetX - mouseOffsetX) * 0.08;
            wrapEl.css('--3d-carousel-mouse-offset', mouseOffset.toFixed(2) + 'deg');
            wrapEl.css('--3d-carousel-mouse-offset-x', mouseOffsetX.toFixed(2) + 'deg');
          }
          requestAnimationFrame(tick);
        }
        tick();
      }

      function setupDragging() {
        wrapEl.on('mousedown', function (e) {
          isDragging = true;
          startX = e.clientX;
          targetMouseOffset = 0;
          mouseOffset = 0;
          targetMouseOffsetX = 0;
          mouseOffsetX = 0;
          wrapEl.css('cursor', 'grabbing');
          wrapEl.css('--3d-carousel-mouse-offset', '0deg');
          wrapEl.css('--3d-carousel-mouse-offset-x', '0deg');
          e.preventDefault();
        });

        $(document).on('mousemove', function (e) {
          if (isDragging) {
            var deltaX = e.clientX - startX;
            var tempRotation = currentRotation + (deltaX * 0.5);
            wrapEl.css('--3d-carousel-rotate', tempRotation + 'deg');
          }
        });

        $(document).on('mouseup', function (e) {
          if (isDragging) {
            var deltaX = e.clientX - startX;
            wrapEl.css('cursor', 'grab');

            if (Math.abs(deltaX) > dragThreshold) {
              if (deltaX > 0) {
                currentIndex = (currentIndex - 1 + itemEl.length) % itemEl.length;
              } else {
                currentIndex = (currentIndex + 1) % itemEl.length;
              }
            }

            updateCarousel();
            isDragging = false;
          }
        });

        wrapEl.on('touchstart', function (e) {
          isDragging = true;
          startX = e.originalEvent.touches[0].clientX;
          e.preventDefault();
        });

        $(document).on('touchmove', function (e) {
          if (isDragging) {
            var deltaX = e.originalEvent.touches[0].clientX - startX;
            var tempRotation = currentRotation + (deltaX * 0.5);
            wrapEl.css('--3d-carousel-rotate', tempRotation + 'deg');
          }
        });

        $(document).on('touchend', function (e) {
          if (isDragging) {
            var deltaX = e.originalEvent.changedTouches[0].clientX - startX;

            if (Math.abs(deltaX) > dragThreshold) {
              if (deltaX > 0) {
                currentIndex = (currentIndex - 1 + itemEl.length) % itemEl.length;
              } else {
                currentIndex = (currentIndex + 1) % itemEl.length;
              }
            }

            updateCarousel();
            isDragging = false;
          }
        });
      }

      function updateCarousel() {
        var targetRotation = -(rotateAmount * currentIndex);
        var el = wrapEl[0];
        var currentValue = el ? getComputedStyle(el).getPropertyValue('--3d-carousel-rotate').trim() : '';
        var currentDeg = parseFloat(currentValue) || currentRotation;
        var delta = targetRotation - currentDeg;
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        var endDeg = currentDeg + delta;
        var endRotation = endDeg + 'deg';
        gsap.fromTo(wrapEl, { '--3d-carousel-rotate': currentValue || (currentDeg + 'deg') }, {
          '--3d-carousel-rotate': endRotation,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: function () {
            wrapEl.css('--3d-carousel-rotate', targetRotation + 'deg');
            currentRotation = targetRotation;
          }
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
