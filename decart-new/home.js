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

/* Pin sections — [data-pin] (GSAP ScrollTrigger) */
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

/* Video on hover — [data-video] */
(function () {
  function initVideoHover() {
    document.querySelectorAll('[data-video]').forEach((trigger) => {
      const videoId = trigger.dataset.video;
      const map = { one: 'videoOne', two: 'videoTwo', three: 'videoThree' };
      const video = document.getElementById(map[videoId]);

      if (!video) return;

      trigger.addEventListener('mouseenter', () => {
        video.currentTime = 0;
        video.play();
      });

      trigger.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoHover);
  } else {
    initVideoHover();
  }
})();

/* Video collection Swiper — .video_collection (requires Swiper) */
(function () {
  let loadRetried = false;

  function initVideoCollection() {
    const container = document.querySelector('.video_collection');
    if (!container) return;

    const Swiper = (typeof window !== 'undefined' && window.Swiper) || (typeof Swiper !== 'undefined' ? Swiper : undefined);
    if (!Swiper) {
      /* Swiper not loaded yet — retry after load or short delay (handles external script load order) */
      if (!loadRetried) {
        loadRetried = true;
        if (document.readyState === 'complete') {
          setTimeout(initVideoCollection, 150);
        } else {
          window.addEventListener('load', initVideoCollection);
        }
      }
      return;
    }

    const soundOn = document.querySelector('[data-sound="on"]');
    const soundOff = document.querySelector('[data-sound="off"]');
    if (soundOn) soundOn.style.display = 'none';
    if (soundOff) soundOff.style.display = 'block';

    let isMuted = true;
    let userHasInteracted = false; /* Safari requires user gesture before video.play() */

    function playActiveVideo(activeVideo) {
      if (!activeVideo) return;
      activeVideo.muted = isMuted;
      const p = activeVideo.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }

    const newsSwiper = new Swiper('.video_collection', {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: true,
      },
      effect: 'fade',
      fadeEffect: { crossFade: true },
      keyboard: true,
      navigation: {
        nextEl: '#videoNext',
        prevEl: '#videoPrev',
      },
      on: {
        init(sw) {
          syncSlide(sw);
        },
        slideChange(sw) {
          syncSlide(sw);
        },
      },
    });

    function syncSlide(sw) {
      const activeSlide = sw.slides[sw.activeIndex];
      if (!activeSlide) return;

      const nameEl = document.querySelector('.video_controls-button.is-name [data-name]');
      if (nameEl) nameEl.textContent = activeSlide.dataset.name || '';

      const allVideos = document.querySelectorAll('.video_collection .swiper-slide video');
      allVideos.forEach((v) => {
        v.pause();
        v.currentTime = 0;
        v.muted = true; /* mute all first to avoid two videos with sound */
      });

      const activeVideo = activeSlide.querySelector('video');
      if (activeVideo && userHasInteracted) {
        setTimeout(function () {
          playActiveVideo(activeVideo);
        }, 50);
      }
    }

    function markInteracted() {
      if (userHasInteracted) return;
      userHasInteracted = true;
      const activeVideo = newsSwiper.slides[newsSwiper.activeIndex]?.querySelector('video');
      playActiveVideo(activeVideo);
    }

    ['#videoSound', '#videoNext', '#videoPrev'].forEach(function (sel) {
      const el = document.querySelector(sel);
      if (el) el.addEventListener('click', markInteracted);
    });
    container.addEventListener('click', markInteracted);
    container.addEventListener('touchstart', markInteracted, { passive: true });

    const soundBtn = document.querySelector('#videoSound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        isMuted = !isMuted;

        document.querySelectorAll('.video_collection .swiper-slide video').forEach((v) => {
          v.muted = true;
        });
        const activeVideo = newsSwiper.slides[newsSwiper.activeIndex]?.querySelector('video');
        if (activeVideo) activeVideo.muted = isMuted;

        if (soundOn) soundOn.style.display = isMuted ? 'none' : 'block';
        if (soundOff) soundOff.style.display = isMuted ? 'block' : 'none';
      });
    }

    /* Mute when video collection is out of view */
    const viewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting;
          const activeVideo = newsSwiper.slides[newsSwiper.activeIndex]?.querySelector('video');
          if (activeVideo) {
            activeVideo.muted = inView ? isMuted : true;
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px' }
    );
    viewObserver.observe(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoCollection);
  } else {
    initVideoCollection();
  }
})();

/* Marquee — [data="marquee"] (GSAP, swipe/drag, pause then resume) */
(function () {
  if (typeof gsap === 'undefined') return;

  function initMarquee() {
    const marquee = document.querySelector('[data="marquee"]');
    if (!marquee) return;

    const durationVal = marquee.getAttribute('data-marquee-duration') || marquee.getAttribute('duration') || '5';
    const duration = parseInt(durationVal, 10) || 5;
    const resumeDelay = parseInt(marquee.getAttribute('data-marquee-resume') || '5', 10) * 1000;
    const marqueeContent = marquee.firstElementChild;
    if (!marqueeContent) {
      console.warn('[marquee] No firstElementChild in marquee');
      return;
    }

    const marqueeContentClone = marqueeContent.cloneNode(true);
    marquee.appendChild(marqueeContentClone);

    let tween;
    let resumeTimer;
    let dragStartX;
    let dragStartProgress;
    let didDrag;
    let distanceToTranslate;

    function getDistance() {
      const width = parseInt(getComputedStyle(marqueeContent).getPropertyValue('width') || '0', 10);
      const gap = parseInt(
        getComputedStyle(marquee).getPropertyValue('column-gap') ||
        getComputedStyle(marquee).getPropertyValue('gap') ||
        getComputedStyle(marqueeContent).getPropertyValue('column-gap') || '0',
        10
      );
      return width + gap;
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
      const newX = Math.max(-distanceToTranslate * 2, Math.min(0, baseX + delta));
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

      marquee.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        pointerId = e.pointerId;
        onDragStart(e.clientX);
        marquee.setPointerCapture && marquee.setPointerCapture(e.pointerId);
      });

      marquee.addEventListener('pointermove', function (e) {
        if (e.pointerId !== pointerId) return;
        onDragMove(e.clientX);
      });

      marquee.addEventListener('pointerup', function (e) {
        if (e.pointerId !== pointerId) return;
        marquee.releasePointerCapture && marquee.releasePointerCapture(e.pointerId);
        onDragEnd();
      });

      marquee.addEventListener('pointercancel', function (e) {
        if (e.pointerId === pointerId) onDragEnd();
      });
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
    if (marquee) {
      initMarquee();
      return true;
    }
    return false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (!tryInit()) {
        /* Webflow/dynamic content may load later — retry on load */
        window.addEventListener('load', function () {
          tryInit();
        });
      }
    });
  } else {
    if (!tryInit()) {
      window.addEventListener('load', tryInit);
    }
  }
})();
