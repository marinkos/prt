/* Infinite vertical scroll — .scene / .background-layer (GSAP + ScrollTrigger)
 *
 * Uses existing Webflow structure:
 *   .scene > .background-layer > .bg-item (x6) + .rect
 *
 * - Section gets pinned; vertical scroll drives vertical movement (content moves up)
 * - .bg-item elements are duplicated for seamless loop
 * - data-scroll-distance on .scene: pixels to scroll for one full cycle (default 2000)
 */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not found. Infinite scroll requires these libraries.');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  function initInfiniteScroll() {
    const section = document.querySelector('.scene');
    if (!section) return;

    const track = section.querySelector('.background-layer');
    if (!track) return;

    const items = gsap.utils.toArray(track.querySelectorAll('.bg-item'));
    if (!items.length) return;

    /* Duplicate .bg-item elements for seamless loop */
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    /* Height of one full set — first clone's offsetTop */
    const firstClone = track.querySelectorAll('.bg-item')[items.length];
    const firstSetHeight = firstClone ? firstClone.offsetTop : track.scrollHeight / 2;

    const scrollDistance = parseInt(section.dataset.scrollDistance || '2000', 10);
    let wrapTicking = false;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (wrapTicking) return;
          const scroll = self.scroll();
          const dir = self.direction;

          if (dir > 0 && scroll >= self.end - 2) {
            wrapTicking = true;
            self.scroll(self.start + 2);
            requestAnimationFrame(() => {
              ScrollTrigger.update();
              wrapTicking = false;
            });
          } else if (dir < 0 && scroll <= self.start + 2) {
            wrapTicking = true;
            self.scroll(self.end - 2);
            requestAnimationFrame(() => {
              ScrollTrigger.update();
              wrapTicking = false;
            });
          }
        },
      },
    });

    tl.to(track, { y: -firstSetHeight, ease: 'none' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInfiniteScroll);
  } else {
    initInfiniteScroll();
  }
})();
