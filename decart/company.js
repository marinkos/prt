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

    // Update q-wrapper texts - remove all is-active, add to current
    qWrapperTexts.forEach((text, textIndex) => {
      text.classList.remove('is-active');
      if (textIndex === index) {
        text.classList.add('is-active');
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
});