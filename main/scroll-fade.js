// Scroll-triggered fade-in animations
// Usage: Add class 'fade-in-on-scroll' to elements you want to animate

// Initialize scroll fade animations
function initScrollFade() {
    // Select all elements with the fade-in class
    const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
    
    if (fadeElements.length === 0) return;
    
    // Set initial state for all fade elements
    gsap.set(fadeElements, {
        autoAlpha: 0,
        y: 50 // Start 50px below their final position
    });
    
    // Create scroll trigger animations
    fadeElements.forEach(element => {
        gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: element,
                start: 'top 85%', // Start animation when element is 85% from top of viewport
                end: 'bottom 15%', // End when element is 15% from bottom of viewport
                toggleActions: 'play none none reverse', // Play on enter, reverse on exit
                // markers: true, // Uncomment for debugging
            }
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollFade);
} else {
    initScrollFade();
}

// Export for potential use in other modules
export { initScrollFade }; 