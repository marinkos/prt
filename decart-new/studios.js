/* Infinite vertical background scroll — .background-layer (page scroll driven)
 *
 * Layout:
 *   main-wrapper
 *     |_ background-layer (relative, 100% x 100%, min-height 150vh)
 *     |_ scene
 *
 * - background-layer is fixed to viewport, content inside translates with page scroll
 * - Content is duplicated for seamless loop
 * - Uses page scroll position to drive y translation (loops infinitely)
 */
(function () {
  function initInfiniteBg() {
    const mainWrapper = document.querySelector('.main-wrapper');
    if (!mainWrapper) return;

    const bgLayer = mainWrapper.querySelector('.background-layer');
    if (!bgLayer) return;

    const children = Array.from(bgLayer.children);
    if (!children.length) return;

    /* Create track wrapper for content + clones */
    const track = document.createElement('div');
    track.className = 'bg-infinite-track';
    track.style.cssText = 'position:absolute;top:0;left:0;width:100%;will-change:transform;';

    /* Move existing children into track */
    children.forEach((child) => track.appendChild(child));

    /* Duplicate content for seamless loop */
    const trackChildren = Array.from(track.children);
    trackChildren.forEach((child) => {
      const clone = child.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.classList.add('bg-duplicate');
      track.appendChild(clone);
    });

    bgLayer.appendChild(track);

    /* Preserve layout: add spacer before making bg fixed (keeps main-wrapper height) */
    const spacer = document.createElement('div');
    spacer.className = 'bg-infinite-spacer';
    spacer.style.cssText = 'min-height:150vh;';
    const bgRect = bgLayer.getBoundingClientRect();
    if (bgRect.height > 0) spacer.style.minHeight = bgRect.height + 'px';
    bgLayer.parentNode.insertBefore(spacer, bgLayer);

    /* Style background-layer: fixed, full viewport, behind content */
    bgLayer.style.cssText +=
      'position:fixed !important;top:0;left:0;width:100%;height:100%;min-height:100vh;z-index:-1;overflow:hidden;pointer-events:none;';

    function getContentHeight() {
      const firstClone = track.querySelector('.bg-duplicate');
      const h = firstClone ? firstClone.offsetTop : track.scrollHeight / 2;
      return h > 0 ? h : window.innerHeight;
    }

    let contentHeight = getContentHeight();

    function updateY() {
      if (contentHeight <= 0) return;
      const y = -(window.scrollY % contentHeight);
      track.style.transform = `translate3d(0,${y}px,0)`;
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateY();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      contentHeight = getContentHeight();
      updateY();
    });

    updateY();
  }

  function tryInit() {
    const mainWrapper = document.querySelector('.main-wrapper');
    const bgLayer = mainWrapper?.querySelector('.background-layer');
    if (mainWrapper && bgLayer && bgLayer.children.length) {
      initInfiniteBg();
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
