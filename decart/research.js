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

  /** Video play on hover **/
  if (window.innerWidth > 767) {
    const sliderComponent = document.querySelector(".slider_component");
    if (sliderComponent) {
      // Initialize all videos to paused state
      const initAllVideos = () => {
        document.querySelectorAll(".slider_card video").forEach(video => {
          video.pause();
        });
      };

      // Use mouseover/mouseout for event delegation (they bubble, unlike mouseenter/mouseleave)
      let currentCard = null;
      
      sliderComponent.addEventListener("mouseover", (e) => {
        const card = e.target.closest(".slider_card");
        if (card && card !== currentCard) {
          currentCard = card;
          const video = card.querySelector("video");
          if (video) {
            video.play().catch(() => {}); // Catch autoplay errors
          }
        }
      });

      sliderComponent.addEventListener("mouseout", (e) => {
        const card = e.target.closest(".slider_card");
        // Check if we're leaving the card (not just moving to a child element)
        if (card && !card.contains(e.relatedTarget)) {
          currentCard = null;
          const video = card.querySelector("video");
          if (video) {
            video.pause();
            video.currentTime = 0;
          }
        }
      });

      sliderComponent.addEventListener("click", (e) => {
        const card = e.target.closest(".slider_card");
        if (card && !e.target.closest('a')) {
          const video = card.querySelector("video");
          if (video) {
            if (video.paused) {
              video.play().catch(() => {});
            } else {
              video.pause();
              video.currentTime = 0;
            }
          }
        }
      });

      // Initialize videos after Slick is ready
      setTimeout(() => {
        initAllVideos();
      }, 300);

      // Re-initialize on Slick events
      $(document).on('init reInit afterChange', '.slider_component', function() {
        setTimeout(initAllVideos, 100);
      });
    }
  }
});

  