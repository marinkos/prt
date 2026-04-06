// Logos marquee //
const track = document.querySelector('.marquee-track');
const slides = [...document.querySelectorAll('.marquee-slide')];

slides.forEach(slide => track.appendChild(slide.cloneNode(true)));

const setWidth = track.scrollWidth / 2;

let x = -setWidth;
const speed = 0.3;

gsap.ticker.add(() => {
  x += speed;
  if (x >= 0) x -= setWidth;

  gsap.set(track, { x });

  const viewCenter = window.innerWidth / 2;
  const influence = 250;

  document.querySelectorAll('.marquee-slide').forEach(slide => {
    const { left, width } = slide.getBoundingClientRect();
    const dist = Math.abs(left + width / 2 - viewCenter);

    const scale = dist < influence
      ? 0.487 + (1 - 0.487) * Math.pow(1 - dist / influence, 3)
      : 0.487;

    gsap.set(slide, { scale });
  });
});
