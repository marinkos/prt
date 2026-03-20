/* 3D Carousel — requires jQuery and GSAP */
(function () {
  function init() {
    if (typeof $ === 'undefined' || typeof gsap === 'undefined') return;

    $("[carousel='component']").each(function () {
      var componentEl = $(this);
      var wrapEl = componentEl.find("[carousel='wrap']");
      var itemEl = wrapEl.find('.carousel_item');
      if (itemEl.length === 0) return;
      var nextEl = componentEl.find("[carousel='next']");
      var prevEl = componentEl.find("[carousel='prev']");
      var numSlides = itemEl.length;
      var wrapDom = wrapEl[0];
      /* Optional: --3d-carousel-angle-step (e.g. 51.429deg). Use 360/7 for six slides but spacing like seven. Omit → 360/numSlides. */
      var stepRaw = wrapDom && getComputedStyle(wrapDom).getPropertyValue('--3d-carousel-angle-step').trim();
      var stepDeg = parseFloat(stepRaw);
      var rotateAmount = stepRaw && !isNaN(stepDeg) && stepDeg > 0 ? stepDeg : 360 / numSlides;
      /* Radius: base closed circle + gap (read from --3d-carousel-gap on wrap so Webflow/inline CSS works) */
      var radiusDivisor = 2 * Math.sin((rotateAmount / 2) * (Math.PI / 180));
      var gapValue = (wrapDom && getComputedStyle(wrapDom).getPropertyValue('--3d-carousel-gap').trim()) || '0px';
      var negTranslate = 'calc(var(--3d-carousel-item-width) / -' + radiusDivisor + ' - ' + gapValue + ')';
      var posTranslate = 'calc(var(--3d-carousel-item-width) / ' + radiusDivisor + ' + ' + gapValue + ')';

      var currentIndex = 0;
      var isDragging = false;
      var startX = 0;
      var dragThreshold = 50;

      function targetRotationFor(idx) {
        return -((idx - (numSlides - 1) / 2) * rotateAmount);
      }

      var currentRotation = targetRotationFor(currentIndex);

      wrapEl.css('--3d-carousel-z', negTranslate);
      wrapEl.css('perspective', posTranslate);
      wrapEl.css('cursor', 'grab');
      wrapEl.css('opacity', '0');

      itemEl.each(function (index) {
        var yDeg = (index - (numSlides - 1) / 2) * rotateAmount;
        $(this).css('transform', 'rotateY(' + yDeg + 'deg) translateZ(' + posTranslate + ')');
      });

      var introPlayed = false;
      var viewObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || introPlayed) return;
            introPlayed = true;
            viewObserver.disconnect();
            var settleRotate = targetRotationFor(currentIndex);
            var introTl = gsap.timeline({
              onComplete: function () {
                currentRotation = targetRotationFor(currentIndex);
                setupNavigation();
                setupDragging();
              }
            });
            introTl.to(wrapEl, { opacity: 1, duration: 0.3 });
            introTl.fromTo(
              wrapEl,
              { '--3d-carousel-rotate': 100, '--3d-carousel-rotate-x': -90 },
              { '--3d-carousel-rotate': settleRotate, '--3d-carousel-rotate-x': 0, duration: 4, ease: 'power2.inOut' },
              '<'
            );
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

      function setupDragging() {
        wrapEl.on('mousedown', function (e) {
          isDragging = true;
          startX = e.clientX;
          wrapEl.css('cursor', 'grabbing');
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
        var targetRotation = targetRotationFor(currentIndex);
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
