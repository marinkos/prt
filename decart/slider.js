// Register GSAP if needed
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin();
}

document.addEventListener("DOMContentLoaded", () => {
  const sliderWrapper = document.querySelector(".slider_wrapper");
  const nextBtn = document.querySelector("#nextBtn");
  const slides = document.querySelectorAll(".slider_slide");
  
  // Exit early if required elements don't exist
  if (!sliderWrapper || !nextBtn || slides.length < 3) {
    console.warn("Slider: Missing required elements");
    return;
  }

  // Color configuration
  const ACTIVE_COLOR = "#bb8bff";
  const INACTIVE_COLOR = "#dac1ff";

  // Position and scale configuration
  const positions = {
    active: { top: "0%", scale: 1, zIndex: 3, opacity: 1 },
    next: { top: "9%", scale: 0.95, zIndex: 2, opacity: 1 },
    back: { top: "20%", scale: 0.85, zIndex: 1, opacity: 1 }
  };

  // Initialize slides array (order: active, next, back)
  let slideOrder = Array.from(slides).map((slide, index) => ({
    element: slide,
    index: index
  }));

  // Set initial states
  function initializeSlides() {
    slideOrder.forEach((slide, position) => {
      const config = position === 0 
        ? positions.active 
        : position === 1 
        ? positions.next 
        : positions.back;
      
      gsap.set(slide.element, {
        top: config.top,
        scale: config.scale,
        zIndex: config.zIndex,
        opacity: config.opacity,
        backgroundColor: position === 0 ? ACTIVE_COLOR : INACTIVE_COLOR
      });
    });
  }

  // Animate slide transition
  function animateTransition() {
    const timeline = gsap.timeline();

    // Get current slides
    const activeSlide = slideOrder[0].element;
    const nextSlide = slideOrder[1].element;
    const backSlide = slideOrder[2].element;

    // 1. Active slide fades out and moves to back position
    timeline.to(activeSlide, {
      opacity: 0,
      top: positions.back.top,
      scale: positions.back.scale,
      zIndex: positions.back.zIndex,
      backgroundColor: INACTIVE_COLOR,
      duration: 0.6,
      ease: "power2.inOut"
    }, 0);

    // 2. Next slide becomes active
    timeline.to(nextSlide, {
      top: positions.active.top,
      scale: positions.active.scale,
      zIndex: positions.active.zIndex,
      backgroundColor: ACTIVE_COLOR,
      duration: 0.6,
      ease: "power2.inOut"
    }, 0);

    // 3. Back slide moves to next position
    timeline.to(backSlide, {
      top: positions.next.top,
      scale: positions.next.scale,
      zIndex: positions.next.zIndex,
      duration: 0.6,
      ease: "power2.inOut"
    }, 0);

    // After animation, fade in the new back slide (old active)
    timeline.set(activeSlide, {
      opacity: positions.back.opacity
    });

    // Rotate the array: [active, next, back] -> [next, back, active]
    slideOrder = [slideOrder[1], slideOrder[2], slideOrder[0]];
  }

  // Initialize on load
  initializeSlides();

  // Handle next button click
  nextBtn.addEventListener("click", () => {
    animateTransition();
  });
});

