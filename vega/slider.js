// Custom slider for problem cards
// Enabled on tablet and below, with touch swipe support and smooth easing

window.Webflow ||= [];
window.Webflow.push(() => {
  const container = document.querySelector('.problem_container');
  const wrapper = document.querySelector('.problem_cards-wrapper');
  const cards = document.querySelectorAll('.problem_card');
  const nextBtn = document.querySelector('#problemNext');
  const prevBtn = document.querySelector('#problemPrev');

  // Exit early if required elements don't exist
  if (!container || !wrapper || cards.length === 0) {
    return;
  }

  // Check if we're on tablet or below (typically 991px and below for Webflow)
  const isTabletOrBelow = () => {
    return window.innerWidth <= 991;
  };

  // Check if we're on tablet (typically 768px - 991px) or mobile (below 768px)
  const isTablet = () => {
    return window.innerWidth > 767 && window.innerWidth <= 991;
  };

  const isMobile = () => {
    return window.innerWidth <= 767;
  };

  // Get slides per view based on screen size
  const getSlidesPerView = () => {
    if (isTablet()) return 2; // 2 slides on tablet
    if (isMobile()) return 1; // 1 slide on mobile
    return 0; // Desktop - slider disabled
  };

  // Slider state
  let currentIndex = 0;
  let isTransitioning = false;
  let touchStartX = 0;
  let touchEndX = 0;
  let minSwipeDistance = 50; // Minimum distance for a swipe

  // Initialize slider
  function initSlider() {
    if (!isTabletOrBelow()) {
      // Desktop: disable slider, show all cards
      wrapper.style.transform = 'translateX(0)';
      wrapper.style.transition = 'none';
      return;
    }

    // Tablet/Mobile: enable slider
    setupSlider();
  }

  function setupSlider() {
    // Set wrapper to flex with no wrap
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'nowrap';
    wrapper.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // Swiper-like easing
    
    // Calculate card width based on slides per view
    const containerWidth = container.offsetWidth;
    const slidesPerView = getSlidesPerView();
    const cardWidth = containerWidth / slidesPerView;
    
    cards.forEach(card => {
      card.style.flexShrink = '0';
      card.style.width = `${cardWidth}px`;
    });

    // Reset to valid index if needed
    const maxIndex = Math.max(0, cards.length - slidesPerView);
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    // Set initial position
    updateSliderPosition();

    // Add touch event listeners (only add once)
    if (!wrapper.hasAttribute('data-slider-initialized')) {
      wrapper.setAttribute('data-slider-initialized', 'true');
      wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
      wrapper.addEventListener('touchmove', handleTouchMove, { passive: true });
      wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Add arrow button listeners (only add once)
    if (nextBtn && !nextBtn.hasAttribute('data-slider-initialized')) {
      nextBtn.setAttribute('data-slider-initialized', 'true');
      nextBtn.addEventListener('click', goToNext);
    }
    if (prevBtn && !prevBtn.hasAttribute('data-slider-initialized')) {
      prevBtn.setAttribute('data-slider-initialized', 'true');
      prevBtn.addEventListener('click', goToPrev);
    }
  }

  function updateSliderPosition() {
    if (!isTabletOrBelow()) return;
    
    const containerWidth = container.offsetWidth;
    const slidesPerView = getSlidesPerView();
    const cardWidth = containerWidth / slidesPerView;
    const translateX = -currentIndex * cardWidth;
    wrapper.style.transform = `translateX(${translateX}px)`;
  }

  function goToNext() {
    if (isTransitioning || !isTabletOrBelow()) return;
    
    const slidesPerView = getSlidesPerView();
    const maxIndex = Math.max(0, cards.length - slidesPerView);
    
    if (currentIndex < maxIndex) {
      currentIndex++;
      isTransitioning = true;
      updateSliderPosition();
      
      // Reset transition flag after animation
      setTimeout(() => {
        isTransitioning = false;
      }, 600);
    }
  }

  function goToPrev() {
    if (isTransitioning || !isTabletOrBelow()) return;
    
    if (currentIndex > 0) {
      currentIndex--;
      isTransitioning = true;
      updateSliderPosition();
      
      // Reset transition flag after animation
      setTimeout(() => {
        isTransitioning = false;
      }, 600);
    }
  }

  // Touch event handlers
  function handleTouchStart(e) {
    if (!isTabletOrBelow()) return;
    touchStartX = e.touches[0].clientX;
  }

  function handleTouchMove(e) {
    if (!isTabletOrBelow()) return;
    // Allow default scrolling if user is scrolling vertically
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    
    // Calculate if this is more of a horizontal or vertical swipe
    if (Math.abs(touchX - touchStartX) > Math.abs(touchY - (e.touches[0].clientY || touchY))) {
      // Horizontal swipe - prevent default to allow smooth swipe
      e.preventDefault();
    }
  }

  function handleTouchEnd(e) {
    if (!isTabletOrBelow() || isTransitioning) return;
    
    touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;

    // Check if swipe distance is significant enough
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - go to next
        goToNext();
      } else {
        // Swipe right - go to previous
        goToPrev();
      }
    }
  }

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initSlider();
    }, 250);
  });

  // Initialize on load
  initSlider();

  // Also initialize after a short delay to ensure Webflow has rendered
  setTimeout(initSlider, 100);
});

