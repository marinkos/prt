/* 3D Carousel — requires jQuery and GSAP */
(function () {
  /**
   * Sets .is-active (front), .is-prev (left / negative eff), .is-next (right / positive eff).
   * @param {HTMLElement|JQuery} wrapEl - [carousel="wrap"] for one carousel instance
   */
  function updateActiveSlide(wrapEl) {
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

      itemEl.each(function (index) {
        $(this).css('transform', 'rotateY(' + rotateAmount * index + 'deg) translateZ(' + posTranslate + ')');
      });

      updateActiveSlide(wrapEl);

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
            var tempRotation = currentRotation + (deltaX * 0.5);
            wrapEl.css('--3d-carousel-rotate', tempRotation + 'deg');
            updateActiveSlide(wrapEl);
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
            updateActiveSlide(wrapEl);
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
          onUpdate: function () {
            updateActiveSlide(wrapEl);
          },
          onComplete: function () {
            wrapEl.css('--3d-carousel-rotate', targetRotation + 'deg');
            currentRotation = targetRotation;
            updateActiveSlide(wrapEl);
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
