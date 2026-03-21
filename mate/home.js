/* 3D Carousel — requires jQuery and GSAP */
(function () {
  var SHADE = '#FEFCF4';
  var BACK_GRAY = '#D3D3D3';
  var STYLE_ID = 'mate-carousel-enhance-styles';

  function injectStylesOnce() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      "[carousel='component'] .carousel_item { position: relative; transform-style: preserve-3d; }\n" +
      "[carousel='component'] .carousel_item__front {\n" +
      '  width: 100%;\n' +
      '  height: 100%;\n' +
      '  transform: translateZ(0.5px);\n' +
      '  backface-visibility: hidden;\n' +
      '  -webkit-backface-visibility: hidden;\n' +
      '}\n' +
      "[carousel='component'] .carousel_item__back {\n" +
      '  position: absolute;\n' +
      '  left: 0; top: 0; right: 0; bottom: 0;\n' +
      '  transform: rotateY(180deg);\n' +
      '  backface-visibility: hidden;\n' +
      '  -webkit-backface-visibility: hidden;\n' +
      '  background: ' +
      BACK_GRAY +
      ';\n' +
      '  border-radius: inherit;\n' +
      '}\n' +
      "[carousel='component'] .carousel_item__shade {\n" +
      '  position: absolute;\n' +
      '  left: 0; top: 0; right: 0; bottom: 0;\n' +
      '  pointer-events: none;\n' +
      '  background: ' +
      SHADE +
      ';\n' +
      '  opacity: 0;\n' +
      '  transition: opacity 0.35s ease;\n' +
      '  border-radius: inherit;\n' +
      '  z-index: 3;\n' +
      '}\n' +
      "[carousel='component'] .carousel_item.is-carousel-adjacent .carousel_item__shade {\n" +
      '  opacity: 1;\n' +
      '}\n';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function circularDistance(a, b, n) {
    var d = Math.abs(a - b) % n;
    return Math.min(d, n - d);
  }

  function indexFromRotation(rotationDeg, numSlides, rotateAmount) {
    var idx = Math.round(-rotationDeg / rotateAmount) % numSlides;
    if (idx < 0) idx += numSlides;
    return idx;
  }

  function readWrapRotationDeg(wrapEl) {
    var el = wrapEl[0];
    if (!el) return 0;
    var v = getComputedStyle(el).getPropertyValue('--3d-carousel-rotate').trim();
    return parseFloat(v) || 0;
  }

  function updateSlideAppearances(itemEl, numSlides, rotateAmount, wrapEl) {
    var rot = readWrapRotationDeg(wrapEl);
    var active = indexFromRotation(rot, numSlides, rotateAmount);
    itemEl.each(function (i) {
      var dist = circularDistance(i, active, numSlides);
      var $item = $(this);
      $item.toggleClass('is-carousel-active', i === active);
      $item.toggleClass('is-carousel-adjacent', dist === 1);
    });
  }

  function enhanceCarouselItems(wrapEl, itemEl) {
    injectStylesOnce();
    itemEl.each(function () {
      var $el = $(this);
      if ($el.find('.carousel_item__back').length) return;
      var $kids = $el.children().not('.carousel_item__shade');
      if ($kids.length && !$el.find('.carousel_item__front').length) {
        $kids.wrapAll('<div class="carousel_item__front"></div>');
      }
      $el.append(
        '<div class="carousel_item__back" aria-hidden="true"></div>' +
          '<div class="carousel_item__shade" aria-hidden="true"></div>'
      );
    });
  }

  function init() {
    if (typeof $ === 'undefined' || typeof gsap === 'undefined') return;

    $("[carousel='component']").each(function () {
      var componentEl = $(this);
      var wrapEl = componentEl.find("[carousel='wrap']");
      var itemEl = wrapEl.find('.carousel_item');
      var nextEl = componentEl.find("[carousel='next']");
      var prevEl = componentEl.find("[carousel='prev']");
      var numSlides = itemEl.length;
      if (!numSlides) return;

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

      enhanceCarouselItems(wrapEl, itemEl);

      wrapEl.css('--3d-carousel-z', negTranslate);
      wrapEl.css('perspective', posTranslate);
      wrapEl.css('cursor', 'grab');
      wrapEl.css('transform-style', 'preserve-3d');

      itemEl.each(function (index) {
        $(this).css('transform', 'rotateY(' + rotateAmount * index + 'deg) translateZ(' + posTranslate + ')');
      });

      function refreshAppearances() {
        updateSlideAppearances(itemEl, numSlides, rotateAmount, wrapEl);
      }

      refreshAppearances();

      setupNavigation();
      setupDragging();

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
            var tempRotation = currentRotation + deltaX * 0.5;
            wrapEl.css('--3d-carousel-rotate', tempRotation + 'deg');
            refreshAppearances();
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
            var tempRotation = currentRotation + deltaX * 0.5;
            wrapEl.css('--3d-carousel-rotate', tempRotation + 'deg');
            refreshAppearances();
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
        gsap.fromTo(wrapEl, { '--3d-carousel-rotate': currentValue || currentDeg + 'deg' }, {
          '--3d-carousel-rotate': endRotation,
          duration: 0.5,
          ease: 'power2.inOut',
          onUpdate: refreshAppearances,
          onComplete: function () {
            wrapEl.css('--3d-carousel-rotate', targetRotation + 'deg');
            currentRotation = targetRotation;
            refreshAppearances();
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
