//Tabs on hover
$('.areas_tabs-link').hover(
    function() {
      $( this ).click();
    }
  );

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  /** Text reveal **/
  const splitTypes = document.querySelectorAll(".reveal-type");

  splitTypes.forEach((char) => {
    const text = new SplitText(char, { type: "chars, words, lines" });

    // Create timeline for better control
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: char,
        start: "top 80%",
        end: "top 20%",
        scrub: true,
        markers: false,
        onRefresh: (self) => {
          // Check if element is already in view when ScrollTrigger refreshes
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

    // Animate to white
    tl.to(text.chars, {
      color: "white",
      stagger: 0.2,
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

  