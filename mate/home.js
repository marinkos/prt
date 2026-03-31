/* 3D Carousel — requires jQuery and GSAP */
(function () {
  /**
   * Shows matching [data-slide] panels (not .carousel_item) via .is-active; hides others.
   * @param {JQuery} $component - [carousel="component"] instance
   * @param {HTMLElement|null} activeSlideEl - front .carousel_item
   */
  function syncDataSlidePanels($component, activeSlideEl) {
    if (!$component || !$component.length) return;

    var $panels = $component.find('[data-slide]').not('.carousel_item');
    if (!$panels.length) return;

    var key =
      activeSlideEl && activeSlideEl.getAttribute
        ? activeSlideEl.getAttribute('data-slide')
        : null;
    if (key === null || key === '') {
      $panels.removeClass('is-active');
      return;
    }
    var keyStr = String(key);
    $panels.each(function () {
      var v = $(this).attr('data-slide');
      $(this).toggleClass('is-active', v !== undefined && String(v) === keyStr);
    });
  }

  /**
   * Sets .is-active (front), .is-prev (left / negative eff), .is-next (right / positive eff).
   * Syncs [data-slide] panels inside the component (see syncDataSlidePanels).
   * @param {HTMLElement|JQuery} wrapEl - [carousel="wrap"] for one carousel instance
   * @param {JQuery} componentEl - [carousel="component"] for this carousel (panel scope)
   */
  function updateActiveSlide(wrapEl, componentEl) {
    var wrap = wrapEl && wrapEl.nodeType ? wrapEl : wrapEl && wrapEl[0];
    if (!wrap) return;

    var items = wrap.querySelectorAll('.carousel_item');
    var n = items.length;
    if (!n) return;

    var raw = getComputedStyle(wrap).getPropertyValue('--3d-carousel-rotate').trim();
    var carouselAngle = parseFloat(raw) || 0;
    var total = 360;

    var withAngles = [];
    for (var i = 0; i < n; i++) {
      var item = items[i];
      var tf = item.style.transform || '';
      var match = tf.match(/rotateY\(\s*([-\d.]+)deg\)/);
      var itemAngle = match ? parseFloat(match[1]) : 0;

      var eff = ((itemAngle + carouselAngle) % total + total) % total;
      if (eff > 180) eff -= total;

      withAngles.push({ item: item, eff: eff });
    }

    var active = withAngles[0];
    for (var a = 1; a < withAngles.length; a++) {
      if (Math.abs(withAngles[a].eff) < Math.abs(active.eff)) {
        active = withAngles[a];
      }
    }

    var lefts = [];
    var rights = [];
    for (var k = 0; k < withAngles.length; k++) {
      var x = withAngles[k];
      if (x === active) continue;
      if (x.eff < 0) lefts.push(x);
      if (x.eff > 0) rights.push(x);
    }

    var prev = null;
    if (lefts.length) {
      prev = lefts[0];
      for (var p = 1; p < lefts.length; p++) {
        if (Math.abs(lefts[p].eff) < Math.abs(prev.eff)) prev = lefts[p];
      }
    }

    var next = null;
    if (rights.length) {
      next = rights[0];
      for (var q = 1; q < rights.length; q++) {
        if (Math.abs(rights[q].eff) < Math.abs(next.eff)) next = rights[q];
      }
    }

    for (var j = 0; j < n; j++) {
      items[j].classList.remove('is-active', 'is-prev', 'is-next');
    }
    active.item.classList.add('is-active');
    if (prev) prev.item.classList.add('is-prev');
    if (next) next.item.classList.add('is-next');

    syncDataSlidePanels(componentEl, active.item);
  }

  /** Default dot styles: visible only at max-width 767px; override in your CSS. */
  function injectCarouselDotStyles() {
    if (document.getElementById('carousel-dots-styles')) return;
    var style = document.createElement('style');
    style.id = 'carousel-dots-styles';
    style.textContent =
      '[carousel="component"] .carousel_arrow_wrap .carousel_dots{display:none;align-items:center;justify-content:center;gap:0.5rem;flex-wrap:wrap;margin:0;padding:0;border:0;list-style:none;box-sizing:border-box}' +
      '@media (max-width:767px){[carousel="component"] .carousel_arrow_wrap .carousel_dots{display:flex}}' +
      '[carousel="component"] .carousel_arrow_wrap .carousel_dot{width:0.5rem;height:0.5rem;padding:0;border:none;border-radius:50%;background:rgba(0,0,0,.25);cursor:pointer;-webkit-appearance:none;appearance:none;flex-shrink:0}' +
      '[carousel="component"] .carousel_arrow_wrap .carousel_dot.is-active{background:rgba(0,0,0,.85);transform:scale(1.15)}' +
      '[carousel="component"] .carousel_arrow_wrap .carousel_dot:focus-visible{outline:2px solid currentColor;outline-offset:2px}';
    document.head.appendChild(style);
  }

  function init() {
    if (typeof $ === 'undefined' || typeof gsap === 'undefined') return;

    injectCarouselDotStyles();

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
      var dragThreshold = 60;
      var dragRotationScale = 0.3;

      var arrowWrap = componentEl.find('.carousel_arrow_wrap');

      function syncDots() {
        if (!arrowWrap.length) return;
        arrowWrap.find('.carousel_dot').each(function (i) {
          var active = i === currentIndex;
          $(this).toggleClass('is-active', active);
          $(this).attr('aria-current', active ? 'true' : 'false');
        });
      }

      if (arrowWrap.length && numSlides > 0) {
        var dotsWrap = arrowWrap.find('.carousel_dots');
        if (!dotsWrap.length) {
          dotsWrap = $(
            '<div class="carousel_dots" role="tablist" aria-label="Carousel slides"></div>'
          );
          arrowWrap.append(dotsWrap);
        }
        dotsWrap.empty();
        for (var di = 0; di < numSlides; di++) {
          dotsWrap.append(
            $('<button type="button" class="carousel_dot"></button>')
              .attr('data-slide-index', di)
              .attr('aria-label', 'Go to slide ' + (di + 1))
          );
        }
        dotsWrap.off('click.carouselDots').on('click.carouselDots', '.carousel_dot', function (e) {
          e.preventDefault();
          var idx = parseInt($(this).attr('data-slide-index'), 10);
          if (!isNaN(idx) && idx !== currentIndex && !isDragging) {
            currentIndex = idx;
            updateCarousel();
          }
        });
      }

      wrapEl.css('--3d-carousel-z', negTranslate);
      wrapEl.css('perspective', posTranslate);
      wrapEl.css('cursor', 'grab');

      itemEl.each(function (index) {
        $(this).css('transform', 'rotateY(' + rotateAmount * index + 'deg) translateZ(' + posTranslate + ')');
      });

      syncDots();
      updateActiveSlide(wrapEl, componentEl);

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
            var tempRotation = currentRotation + deltaX * dragRotationScale;
            wrapEl.css('--3d-carousel-rotate', tempRotation + 'deg');
            updateActiveSlide(wrapEl, componentEl);
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
            var tempRotation = currentRotation + deltaX * dragRotationScale;
            wrapEl.css('--3d-carousel-rotate', tempRotation + 'deg');
            updateActiveSlide(wrapEl, componentEl);
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
        syncDots();
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
          duration: 1.1,
          ease: 'power3.inOut',
          onUpdate: function () {
            updateActiveSlide(wrapEl, componentEl);
          },
          onComplete: function () {
            wrapEl.css('--3d-carousel-rotate', targetRotation + 'deg');
            currentRotation = targetRotation;
            updateActiveSlide(wrapEl, componentEl);
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
