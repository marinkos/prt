//Tabs on hover
$('.areas_tabs-link').hover(
    function() {
      $( this ).click();
    }
  );

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  /** Text reveal animation **/
  const revealElements = document.querySelectorAll(".reveal-type");

  revealElements.forEach((element) => {
    const text = new SplitText(element, { type: "chars, words, lines" });

    // Create timeline for scroll-triggered reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
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

  