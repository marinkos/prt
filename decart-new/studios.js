/* Infinite vertical scroll — .scene / .background-layer (native scroll, no GSAP)
 *
 * Uses scrollable container approach from infinite-webflow pattern:
 *   .scene (viewport) > .background-layer (scroll wrapper) > .bg-item + .rect
 *
 * - .background-layer scrolls within .scene
 * - All direct children duplicated for seamless loop
 * - Scroll jumps at top/bottom create infinite effect
 */
(function () {
  function initInfiniteScroll() {
    const scene = document.querySelector('.scene');
    if (!scene) return;

    const wrapper = scene.querySelector('.background-layer');
    if (!wrapper) return;

    /* Duplicate all direct children (bg-item + rect) for seamless loop */
    const children = Array.from(wrapper.children);
    if (!children.length) return;

    /* Ensure scrollable container */
    scene.style.overflow = 'hidden';
    scene.style.height = scene.dataset.height || '100vh';
    wrapper.style.overflowY = 'auto';
    wrapper.style.overflowX = 'hidden';
    wrapper.style.height = '100%';

    let disableScroll = false;
    let clonesHeight = 0;
    const duplicate = [];

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
      if (getScrollPos() <= 0) setScrollPos(1);
    }
    function scrollUpdate() {
      if (disableScroll) return;
      const scrollPos = getScrollPos();
      const scrollHeight = wrapper.scrollHeight;

      if (scrollPos <= 0) {
        setScrollPos(scrollHeight - clonesHeight);
        disableScroll = true;
      } else if (clonesHeight + scrollPos >= scrollHeight) {
        setScrollPos(1);
        disableScroll = true;
      }

      if (disableScroll) {
        setTimeout(() => { disableScroll = false; }, 40);
      }
    }

    /* Duplicate all children */
    children.forEach((child) => {
      const clone = child.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.classList.add('duplicate');
      wrapper.appendChild(clone);
    });

    duplicate.push(...wrapper.querySelectorAll('.duplicate'));
    calc();

    wrapper.addEventListener('scroll', () => {
      requestAnimationFrame(scrollUpdate);
    }, { passive: true });

    window.addEventListener('resize', () => {
      requestAnimationFrame(calc);
    });
  }

  function tryInit() {
    const scene = document.querySelector('.scene');
    const wrapper = scene?.querySelector('.background-layer');
    if (scene && wrapper && wrapper.children.length) {
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
