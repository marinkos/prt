/* Silicone video: desktop = hover, mobile = play when in view */
(function () {
  const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

  function initSiliconeVideo() {
    const container = document.getElementById('siliconeVideo') || document.querySelector('.silicone_video');
    if (!container) return;

    const video = container.querySelector('video');
    if (!video) return;

    video.pause();

    if (isDesktop()) {
      container.addEventListener('mouseenter', () => video.play().catch(() => {}));
      container.addEventListener('mouseleave', () => video.pause());
    } else {
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

/* Video on hover — [data-video] (desktop only; mobile: play when in view) */
(function () {
  const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

  function initVideoHover() {
    document.querySelectorAll('[data-video]').forEach((trigger) => {
      const videoId = trigger.dataset.video;
      const map = { one: 'videoOne', two: 'videoTwo', three: 'videoThree' };
      const video = document.getElementById(map[videoId]);

      if (!video) return;

      if (isDesktop()) {
        trigger.addEventListener('mouseenter', () => {
          video.currentTime = 0;
          video.play();
        });

        trigger.addEventListener('mouseleave', () => {
          video.pause();
          video.currentTime = 0;
        });
      } else {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                video.currentTime = 0;
                video.play().catch(() => {});
              } else {
                video.pause();
                video.currentTime = 0;
              }
            });
          },
          { threshold: 0.25 }
        );
        observer.observe(trigger);
      }
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
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
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
    let userHasInteracted = false; /* Safari requires user gesture for unmuted video */
    let isInView = false;

    /* Muted videos can autoplay when in view; unmuted needs user gesture */
    function canPlayVideo() {
      return isInView && (isMuted || userHasInteracted);
    }

    function playActiveVideo(activeVideo) {
      if (!activeVideo) return;
      activeVideo.muted = isMuted;
      activeVideo.playsInline = true; /* required for iOS inline playback */
      const p = activeVideo.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }

    /* Use slide on mobile — fade effect causes crashes on iOS/Safari */
    const swiperConfig = {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: !isMobile(), /* loop can cause issues on mobile with few slides */
      effect: isMobile() ? 'slide' : 'fade',
      fadeEffect: { crossFade: true },
      keyboard: true,
      touchReleaseOnEdges: true,
      passiveListeners: true,
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
    };
    if (isMobile()) {
      swiperConfig.resistanceRatio = 0.85;
      swiperConfig.touchRatio = 1;
    }

    const newsSwiper = new Swiper('.video_collection', swiperConfig);

    function syncSlide(sw) {
      const activeSlide = sw.slides[sw.activeIndex];
      if (!activeSlide) return;

      const nameEl = document.querySelector('.video_controls-button.is-name [data-name]');
      if (nameEl) nameEl.textContent = activeSlide.dataset.name || '';

      const allVideos = document.querySelectorAll('.video_collection .swiper-slide video');
      allVideos.forEach((v) => {
        v.pause();
        v.currentTime = 0;
        v.muted = true;
        v.setAttribute('playsinline', '');
      });

      const activeVideo = activeSlide.querySelector('video');
      if (activeVideo && canPlayVideo()) {
        setTimeout(function () {
          playActiveVideo(activeVideo);
        }, 50);
      }
    }

    function markInteracted() {
      if (userHasInteracted) return;
      userHasInteracted = true;
      const activeVideo = newsSwiper.slides[newsSwiper.activeIndex]?.querySelector('video');
      if (activeVideo && isInView) {
        playActiveVideo(activeVideo);
      }
    }

    /* Advance when video ends */
    function setupVideoListeners() {
      document.querySelectorAll('.video_collection .swiper-slide video').forEach((video) => {
        video.addEventListener('ended', () => {
          newsSwiper.slideNext();
        });
      });
    }
    setupVideoListeners();

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

    /* Play when in view (muted autoplay allowed), pause when out of view */
    const viewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInView = entry.isIntersecting;
          const activeVideo = newsSwiper.slides[newsSwiper.activeIndex]?.querySelector('video');
          if (activeVideo) {
            activeVideo.muted = isInView ? isMuted : true;
            if (canPlayVideo()) {
              playActiveVideo(activeVideo);
            } else if (!isInView) {
              activeVideo.pause();
            }
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

