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

      document.querySelectorAll('.video_collection .swiper-slide video').forEach((v) => {
        v.pause();
        v.currentTime = 0;
      });

      const activeVideo = activeSlide.querySelector('video');
      if (activeVideo) {
        activeVideo.muted = isMuted;
        setTimeout(() => {
          activeVideo.play().catch(() => {});
        }, 50);
      }
    }

    const soundBtn = document.querySelector('#videoSound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        isMuted = !isMuted;

        const activeVideo = newsSwiper.slides[newsSwiper.activeIndex]?.querySelector('video');
        if (activeVideo) activeVideo.muted = isMuted;

        if (soundOn) soundOn.style.display = isMuted ? 'none' : 'block';
        if (soundOff) soundOff.style.display = isMuted ? 'block' : 'none';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoCollection);
  } else {
    initVideoCollection();
  }
})();
