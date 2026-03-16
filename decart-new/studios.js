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
