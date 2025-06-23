import { gsap } from "gsap";

let floatingImage = null;

document.querySelectorAll('.project_item').forEach(item => {
  const image = item.querySelector('.project_item-image');
  if (!image) return;

  item.addEventListener('mouseenter', (e) => {
    // Clone the image and append to body
    floatingImage = image.cloneNode(true);
    floatingImage.style.position = 'fixed';
    floatingImage.style.pointerEvents = 'none';
    floatingImage.style.zIndex = 20;
    floatingImage.style.display = 'block';
    floatingImage.style.opacity = 0;
    floatingImage.classList.add('is-active');
    document.body.appendChild(floatingImage);

    gsap.to(floatingImage, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
  });

  item.addEventListener('mousemove', (e) => {
    if (!floatingImage) return;
    gsap.to(floatingImage, {
      x: e.clientX - floatingImage.offsetWidth / 2,
      y: e.clientY - floatingImage.offsetHeight / 2,
      duration: 0.2,
      ease: "power2.out"
    });
  });

  item.addEventListener('mouseleave', () => {
    if (!floatingImage) return;
    gsap.to(floatingImage, {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        if (floatingImage && floatingImage.parentNode) {
          floatingImage.parentNode.removeChild(floatingImage);
          floatingImage = null;
        }
      }
    });
  });
});
