/* Infinite vertical scroll — .infinite-content / .infinite-item (works with smooth scroll)
 *
 * Layout (inside smooth-wrapper > smooth-content):
 *   scene.infinite-content
 *     |_ background-layer.infinite-item
 *     |_ background-layer.infinite-item.duplicate (cloned)
 *
 * - Scene is a scroll container (100vh, overflow-y: auto)
 * - Scroll is captured when scene is in view so infinite loop works
 * - Duplicates .infinite-item for seamless loop
 * - Intro: .bg-item and .rect start centered, animate to final positions on load
 * - Parallax: mouse move shifts elements by depth (closer = more movement)
 */
(function () {
  function initInfiniteScroll() {
    const wrapper = document.querySelector('.infinite-content');
    if (!wrapper) {
      console.log('[studios] init: .infinite-content not found');
      return;
    }

    let items = wrapper.querySelectorAll('.infinite-item:not(.duplicate)');
    if (!items.length) {
      console.log('[studios] init: no .infinite-item found');
      return;
    }
    console.log('[studios] init: found', items.length, 'infinite-item(s)');

    /* Ensure scrollable container — required for wrapper.scrollTop to work */
    wrapper.style.overflowY = 'auto';
    wrapper.style.overflowX = 'hidden';
    wrapper.style.height = '100vh';
    wrapper.style.webkitOverflowScrolling = 'touch';

    let disableScroll = false;
    let clonesHeight = 0;
    let duplicate = [];

    function getScrollPos() {
      return wrapper.scrollTop;
    }
    function setScrollPos(val) {
      wrapper.scrollTop = val;
    }
    function getClonesHeight() {
      clonesHeight = 0;
      duplicate.forEach((el) => {
        clonesHeight += el.offsetHeight;
      });
      return clonesHeight;
    }
    function calc() {
      getClonesHeight();
      const pos = getScrollPos();
      if (pos <= 0) setScrollPos(1);
      console.log('[studios] calc: clonesHeight=', clonesHeight, 'scrollHeight=', wrapper.scrollHeight);
    }
    function scrollUpdate() {
      if (disableScroll) return;
      const scrollPos = getScrollPos();
      const scrollHeight = wrapper.scrollHeight;

      if (scrollPos <= 0) {
        console.log('[studios] scrollUpdate: jump to bottom (was at top)');
        setScrollPos(scrollHeight - clonesHeight);
        disableScroll = true;
      } else if (clonesHeight + scrollPos >= scrollHeight) {
        console.log('[studios] scrollUpdate: jump to top (was at bottom)');
        setScrollPos(1);
        disableScroll = true;
      }

      if (disableScroll) {
        setTimeout(() => { disableScroll = false; }, 40);
      }
    }

    /* Duplicate only if not already duplicated */
    if (!wrapper.querySelector('.infinite-item.duplicate')) {
      items.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('duplicate');
        wrapper.appendChild(clone);
      });
      console.log('[studios] duplicated', items.length, 'item(s)');
    } else {
      console.log('[studios] skip duplicate (already has .duplicate)');
    }

    duplicate = Array.from(wrapper.querySelectorAll('.infinite-item.duplicate'));
    calc();

    /* Intro: bg-items and rects start centered, animate to final positions */
    requestAnimationFrame(() => {
      runIntro(wrapper);
      /* Start parallax after intro (intro ~2.8s) */
      setTimeout(() => initParallax(wrapper), 3000);
    });

    wrapper.addEventListener('scroll', () => {
      requestAnimationFrame(scrollUpdate);
    }, { passive: true });

    /* Capture wheel when over scene — scroll scene instead of page (required for smooth scroll) */
    wrapper.addEventListener('wheel', (e) => {
      const { scrollTop, scrollHeight, clientHeight } = wrapper;
      const canScrollUp = scrollTop > 0;
      const canScrollDown = scrollTop + clientHeight < scrollHeight;

      if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
        e.preventDefault();
        e.stopPropagation();
        const newPos = scrollTop + e.deltaY;
        setScrollPos(newPos);
        if (!wrapper._wheelLogCount) wrapper._wheelLogCount = 0;
        if (++wrapper._wheelLogCount % 20 === 1) {
          console.log('[studios] wheel: scrollTop', scrollTop, '->', newPos);
        }
      }
    }, { passive: false });

    window.addEventListener('resize', () => {
      requestAnimationFrame(calc);
    });
  }

  function initParallax(wrapper) {
    const DEPTH = {
      close: 30,
      medium: 15,
      far: 8,
    };
    const bgDepth = {
      'is-one': DEPTH.close,
      'is-four': DEPTH.close,
      'is-three': DEPTH.medium,
      'is-five': DEPTH.medium,
      'is-two': DEPTH.far,
      'is-six': DEPTH.far,
      'is-seven': DEPTH.far,
    };
    const rectDepth = {
      'is-three': DEPTH.close,
      'is-first': DEPTH.medium,
      'is-two': DEPTH.far,
    };

    const items = wrapper.querySelectorAll('.infinite-item');
    const elements = [];
    const getDepthClass = (el) => Array.from(el.classList).find((c) => c.startsWith('is-'));
    items.forEach((item) => {
      item.querySelectorAll('.bg-item, .rect').forEach((el) => {
        const depthClass = getDepthClass(el);
        const depth = el.classList.contains('bg-item')
          ? (bgDepth[depthClass] ?? DEPTH.medium)
          : (rectDepth[depthClass] ?? DEPTH.medium);
        elements.push({ el, depth });
      });
    });

    let mouseX = 0.5;
    let mouseY = 0.5;
    let currentX = 0.5;
    let currentY = 0.5;
    const lerp = 0.08;

    function onMouseMove(e) {
      const rect = wrapper.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    }

    function tick() {
      currentX += (mouseX - currentX) * lerp;
      currentY += (mouseY - currentY) * lerp;
      const nX = (currentX - 0.5) * 2;
      const nY = (currentY - 0.5) * 2;

      elements.forEach(({ el, depth }) => {
        const x = nX * depth;
        const y = nY * depth;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      requestAnimationFrame(tick);
    }

    wrapper.addEventListener('mousemove', onMouseMove, { passive: true });
    tick();
  }

  function runIntro(wrapper) {
    if (typeof gsap === 'undefined') return;

    const firstItem = wrapper.querySelector('.infinite-item:not(.duplicate)');
    if (!firstItem) return;

    const elements = firstItem.querySelectorAll('.bg-item, .rect');
    if (!elements.length) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const centerX = wrapperRect.left + wrapperRect.width / 2;
    const centerY = wrapperRect.top + wrapperRect.height / 2;

    const tl = gsap.timeline();
    elements.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const elCenterX = rect.left + rect.width / 2;
      const elCenterY = rect.top + rect.height / 2;
      const fromX = centerX - elCenterX;
      const fromY = centerY - elCenterY;

      tl.fromTo(el, { x: fromX, y: fromY, scale: 0.6 }, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 2,
        ease: 'power3.out',
        overwrite: 'auto',
      }, i * 0.08);
    });
  }

  function tryInit() {
    const wrapper = document.querySelector('.infinite-content');
    const items = wrapper?.querySelectorAll('.infinite-item');
    console.log('[studios] tryInit: wrapper=', !!wrapper, 'items=', items?.length ?? 0);
    if (wrapper && items?.length) {
      initInfiniteScroll();
      return true;
    }
    return false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!tryInit()) window.addEventListener('load', tryInit);
    });
  } else {
    if (!tryInit()) window.addEventListener('load', tryInit);
  }
})();
