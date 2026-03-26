/* 3D Carousel — requires jQuery and GSAP */
(function () {
  /** Match this in your CSS for mobile layout + dots visibility */
  var MOBILE_MEDIA_QUERY = '(max-width: 767px)';

  function isMobileView() {
    return typeof window.matchMedia === 'function' && window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  }

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

  function updatePaginationDots($component, activeIndex) {
    var $dots = $component.find('.carousel-pagination button.carousel-pagination_dot');
    if (!$dots.length) return;
    $dots.each(function (i) {
      var $btn = $(this);
      $btn.toggleClass('is-active', i === activeIndex);
      $btn.attr('aria-current', i === activeIndex ? 'true' : 'false');
    });
  }

  function buildPaginationDots($component, count) {
    var $container = $component.find('.carousel-pagination');
    if (!$container.length || count < 1) return;
    $container.empty();
    for (var i = 0; i < count; i++) {
      var $btn = $(
        '<button type="button" class="carousel-pagination_dot" aria-label="Go to slide ' +
          (i + 1) +
          '"></button>'
      );
      $btn.attr('data-carousel-index', String(i));
      $container.append($btn);
    }
  }

  function clearPaginationDots($component) {
    $component.find('.carousel-pagination').empty();
  }

  /**
   * Sets .is-active (front), .is-prev (left / negative eff), .is-next (right / positive eff).
   * On .carousel--mobile uses slideIndexHint instead of 3D angles.
   * @param {HTMLElement|JQuery} wrapEl - [carousel="wrap"]
   * @param {JQuery} componentEl - [carousel="component"]
   * @param {number} [slideIndexHint] - required for mobile (current slide index)
   */
  function updateActiveSlide(wrapEl, componentEl, slideIndexHint) {
    var wrap = wrapEl && wrapEl.nodeType ? wrapEl : wrapEl && wrapEl[0];
    if (!wrap) return;

    var items = wrap.querySelectorAll('.carousel_item');
    var n = items.length;
    if (!n) return;

    if (componentEl && componentEl.hasClass('carousel--mobile')) {
      var idx = slideIndexHint;
      if (idx === undefined || idx === null || idx < 0 || idx >= n) idx = 0;
      for (var jm = 0; jm < n; jm++) {
        items[jm].classList.remove('is-active', 'is-prev', 'is-next');
      }
      items[idx].classList.add('is-active');
      if (n > 1) {
        items[(idx - 1 + n) % n].classList.add('is-prev');
        items[(idx + 1) % n].classList.add('is-next');
      }
      syncDataSlidePanels(componentEl, items[idx]);
      updatePaginationDots(componentEl, idx);
      return;
    }

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

      var mobileTouchActive = false;
      var mobileTouchStartX = 0;
      var mobileBaseX = 0;
      var layoutIsMobile = false;

      function getSlideWidth() {
        var w = componentEl[0] ? componentEl[0].clientWidth : 0;
        if (w < 2 && wrapEl[0] && wrapEl[0].parentElement) {
          w = wrapEl[0].parentElement.clientWidth;
        }
        return w;
      }

      function applyDesktopLayout() {
        layoutIsMobile = false;
        componentEl.removeClass('carousel--mobile');
        clearPaginationDots(componentEl);
        gsap.killTweensOf(wrapEl);
        gsap.set(wrapEl, { clearProps: 'x' });

        wrapEl.css('--3d-carousel-z', negTranslate);
        wrapEl.css('perspective', posTranslate);
        wrapEl.css('cursor', 'grab');
        wrapEl.css('display', '');
        wrapEl.css('flex-direction', '');
        wrapEl.css('flex-wrap', '');
        wrapEl.css('transform-style', '');
        wrapEl.css('transform', '');

        itemEl.each(function (index) {
          $(this).css('transform', 'rotateY(' + rotateAmount * index + 'deg) translateZ(' + posTranslate + ')');
          $(this).css('flex', '');
          $(this).css('min-width', '');
          $(this).css('width', '');
          $(this).css('max-width', '');
        });

        currentRotation = -(rotateAmount * currentIndex);
        wrapEl.css('--3d-carousel-rotate', currentRotation + 'deg');
        updateActiveSlide(wrapEl, componentEl, currentIndex);
      }

      function applyMobileLayout() {
        layoutIsMobile = true;
        componentEl.addClass('carousel--mobile');
        buildPaginationDots(componentEl, numSlides);

        gsap.killTweensOf(wrapEl);
        currentRotation = 0;
        wrapEl.css('--3d-carousel-rotate', '0deg');
        wrapEl.css('--3d-carousel-z', '');
        wrapEl.css('perspective', 'none');
        wrapEl.css('cursor', 'default');
        wrapEl.css('transform-style', 'flat');
        wrapEl.css('display', 'flex');
        wrapEl.css('flex-direction', 'row');
        wrapEl.css('flex-wrap', 'nowrap');

        itemEl.each(function () {
          $(this).css('transform', 'none');
          $(this).css('flex', '0 0 100%');
          $(this).css('min-width', '0');
          $(this).css('width', '100%');
          $(this).css('max-width', '100%');
          $(this).css('box-sizing', 'border-box');
        });

        var sw = getSlideWidth();
        gsap.set(wrapEl, { x: -currentIndex * sw });
        updateActiveSlide(wrapEl, componentEl, currentIndex);
      }

      function setLayoutForViewport() {
        var wantMobile = isMobileView();
        if (wantMobile && !layoutIsMobile) {
          applyMobileLayout();
          return;
        }
        if (!wantMobile && layoutIsMobile) {
          applyDesktopLayout();
          return;
        }
        if (wantMobile && layoutIsMobile) {
          var sw = getSlideWidth();
          if (sw > 1) {
            gsap.set(wrapEl, { x: -currentIndex * sw });
          }
          updateActiveSlide(wrapEl, componentEl, currentIndex);
        }
      }

      function updateCarouselMobile() {
        var sw = getSlideWidth();
        if (sw < 2) sw = 300;
        var targetX = -currentIndex * sw;
        gsap.to(wrapEl, {
          x: targetX,
          duration: 0.95,
          ease: 'power3.inOut',
          onUpdate: function () {
            updateActiveSlide(wrapEl, componentEl, currentIndex);
          },
          onComplete: function () {
            gsap.set(wrapEl, { x: targetX });
            updateActiveSlide(wrapEl, componentEl, currentIndex);
          }
        });
      }

      function updateCarousel() {
        if (componentEl.hasClass('carousel--mobile')) {
          updateCarouselMobile();
          return;
        }

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
          duration: 0.95,
          ease: 'power3.inOut',
          onUpdate: function () {
            updateActiveSlide(wrapEl, componentEl, currentIndex);
          },
          onComplete: function () {
            wrapEl.css('--3d-carousel-rotate', targetRotation + 'deg');
            currentRotation = targetRotation;
            updateActiveSlide(wrapEl, componentEl, currentIndex);
          }
        });
      }

      if (isMobileView()) {
        applyMobileLayout();
      } else {
        wrapEl.css('--3d-carousel-z', negTranslate);
        wrapEl.css('perspective', posTranslate);
        wrapEl.css('cursor', 'grab');

        itemEl.each(function (index) {
          $(this).css('transform', 'rotateY(' + rotateAmount * index + 'deg) translateZ(' + posTranslate + ')');
        });

        updateActiveSlide(wrapEl, componentEl, currentIndex);
      }

      var resizeTimer;
      $(window).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          setLayoutForViewport();
        }, 150);
      });

      componentEl.on('click', '.carousel-pagination_dot', function (e) {
        e.preventDefault();
        if (!componentEl.hasClass('carousel--mobile')) return;
        var i = parseInt($(this).attr('data-carousel-index'), 10);
        if (isNaN(i)) return;
        currentIndex = Math.max(0, Math.min(numSlides - 1, i));
        updateCarousel();
      });

      setupNavigation();
      setupDragging();

      function setupNavigation() {
        nextEl.on('click', function (e) {
          e.preventDefault();
          if (!isDragging && !mobileTouchActive) {
            currentIndex = (currentIndex + 1) % itemEl.length;
            updateCarousel();
          }
        });

        prevEl.on('click', function (e) {
          e.preventDefault();
          if (!isDragging && !mobileTouchActive) {
            currentIndex = (currentIndex - 1 + itemEl.length) % itemEl.length;
            updateCarousel();
          }
        });

        $(document).on('keydown', function (e) {
          if (!isDragging && !mobileTouchActive) {
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
          if (componentEl.hasClass('carousel--mobile')) return;
          isDragging = true;
          startX = e.clientX;
          wrapEl.css('cursor', 'grabbing');
          e.preventDefault();
        });

        $(document).on('mousemove', function (e) {
          if (componentEl.hasClass('carousel--mobile')) return;
          if (isDragging) {
            var deltaX = e.clientX - startX;
            var tempRotation = currentRotation + deltaX * 0.5;
            wrapEl.css('--3d-carousel-rotate', tempRotation + 'deg');
            updateActiveSlide(wrapEl, componentEl, currentIndex);
          }
        });

        $(document).on('mouseup', function (e) {
          if (componentEl.hasClass('carousel--mobile')) return;
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
          if (componentEl.hasClass('carousel--mobile')) {
            mobileTouchActive = true;
            mobileTouchStartX = e.originalEvent.touches[0].clientX;
            mobileBaseX = gsap.getProperty(wrapEl[0], 'x') || 0;
            e.preventDefault();
            return;
          }
          isDragging = true;
          startX = e.originalEvent.touches[0].clientX;
          e.preventDefault();
        });

        $(document).on('touchmove', function (e) {
          if (componentEl.hasClass('carousel--mobile') && mobileTouchActive) {
            var slideWidth = getSlideWidth();
            if (slideWidth < 2) slideWidth = 300;
            var x = e.originalEvent.touches[0].clientX;
            var delta = x - mobileTouchStartX;
            var nextX = mobileBaseX + delta;
            var minX = -(numSlides - 1) * slideWidth;
            var maxX = 0;
            nextX = Math.max(minX, Math.min(maxX, nextX));
            gsap.set(wrapEl, { x: nextX });
            e.preventDefault();
            return;
          }
          if (isDragging) {
            var deltaX = e.originalEvent.touches[0].clientX - startX;
            var tempRotation = currentRotation + deltaX * 0.5;
            wrapEl.css('--3d-carousel-rotate', tempRotation + 'deg');
            updateActiveSlide(wrapEl, componentEl, currentIndex);
          }
        });

        wrapEl.on('touchcancel', function () {
          if (componentEl.hasClass('carousel--mobile') && mobileTouchActive) {
            mobileTouchActive = false;
            updateCarouselMobile();
          }
        });

        $(document).on('touchend', function (e) {
          if (componentEl.hasClass('carousel--mobile') && mobileTouchActive) {
            mobileTouchActive = false;
            var slideWidth = getSlideWidth();
            if (slideWidth < 2) slideWidth = 300;
            var currentX = gsap.getProperty(wrapEl[0], 'x') || 0;
            var snapIndex = Math.round(-currentX / slideWidth);
            snapIndex = Math.max(0, Math.min(numSlides - 1, snapIndex));
            currentIndex = snapIndex;
            updateCarouselMobile();
            return;
          }
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
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
