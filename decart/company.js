// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// Wait for Webflow to initialize
window.Webflow ||= [];
window.Webflow.push(() => {
  const slider = document.querySelector('.journey_slider');
  if (!slider) return;

  // Get the Webflow slider instance
  const sliderInstance = slider.parentElement;
  
  // Get all slides to determine total count
  const slides = slider.querySelectorAll('.journey_slide');
  const totalSlides = slides.length;
  let currentIndex = 0;

  // Get timeline elements
  const timelineProgress = document.querySelector('.timeline_progress');
  const timelineStops = document.querySelectorAll('.timeline_stop');
  const qWrapperTexts = document.querySelectorAll('.q-wrapper > div');
  const baseWidth = 14.285714285714286;

  // Function to update timeline based on current slide
  function updateTimeline(index) {
    // Update progress width
    if (timelineProgress) {
      const newWidth = baseWidth * (index + 1);
      timelineProgress.style.width = `${newWidth}%`;
    }

    // Update timeline stops - add is-active to all stops up to and including current
    timelineStops.forEach((stop, stopIndex) => {
      if (stopIndex <= index) {
        stop.classList.add('is-active');
      } else {
        stop.classList.remove('is-active');
      }
    });

    // Update q-wrapper texts - add is-active to all texts up to and including current
    qWrapperTexts.forEach((text, textIndex) => {
      if (textIndex <= index) {
        text.classList.add('is-active');
      } else {
        text.classList.remove('is-active');
      }
    });
  }

  // Function to navigate slides
  function navigateSlide(direction) {
    if (direction === 'next') {
      currentIndex = (currentIndex + 1) % totalSlides;
    } else {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    }
    
    // Trigger Webflow's native navigation
    const navDots = sliderInstance.querySelectorAll('.w-slider-dot');
    if (navDots[currentIndex]) {
      navDots[currentIndex].click();
    }
    
    // Update timeline
    updateTimeline(currentIndex);
  }

  // Add click handlers to all arrow buttons
  slides.forEach((slide, index) => {
    const leftArrow = slide.querySelector('.journey_arrow-left');
    const rightArrow = slide.querySelector('.journey_arrow-right');

    if (leftArrow) {
      leftArrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigateSlide('prev');
      });
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigateSlide('next');
      });
    }
  });

  // Track current slide when navigation happens
  const observer = new MutationObserver(() => {
    slides.forEach((slide, index) => {
      if (slide.classList.contains('w-slide') && 
          slide.getAttribute('aria-hidden') === 'false') {
        if (currentIndex !== index) {
          currentIndex = index;
          updateTimeline(currentIndex);
        }
      }
    });
  });

  observer.observe(slider, {
    attributes: true,
    subtree: true,
    attributeFilter: ['aria-hidden', 'class']
  });

  // Initialize timeline on page load
  updateTimeline(currentIndex);

  /** Text reveal animation **/
  const revealElements = document.querySelectorAll(".reveal-type");

  revealElements.forEach((char) => {
    const text = new SplitText(char, { type: "chars, words, lines" });

    // Create timeline for scroll-triggered reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: char,
        start: "top 80%",
        end: "top 20%",
        scrub: true,
        markers: false,
        onRefresh: (self) => {
          // Handle refresh state - check if element is already in view
          if (self.progress === 1) {
            gsap.set(text.chars, { color: "white" });
          } else if (self.progress === 0) {
            gsap.set(text.chars, { color: "#475462" });
          }
        },
      },
    });

    // Set initial color
    gsap.set(text.chars, {
      color: "#475462",
    });

    // Animate to white with stagger effect
    tl.to(text.chars, {
      color: "white",
      stagger: 0.2,
    });
  });

  /** Fade-in text reveal (alternative animation) **/
  const fadeRevealElements = document.querySelectorAll(".fade-reveal");

  fadeRevealElements.forEach((element) => {
    const text = new SplitText(element, { type: "lines" });

    // Set initial state
    gsap.set(text.lines, {
      opacity: 0,
      y: 50,
    });

    // Create scroll-triggered animation
    gsap.to(text.lines, {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "top 50%",
        toggleActions: "play none none reverse",
      },
    });
  });

  /** Word-by-word reveal **/
  const wordRevealElements = document.querySelectorAll(".word-reveal");

  wordRevealElements.forEach((element) => {
    const text = new SplitText(element, { type: "words" });

    // Set initial state
    gsap.set(text.words, {
      opacity: 0,
      y: 30,
    });

    // Create scroll-triggered animation
    gsap.to(text.words, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  });
});