/** Text reveal **/
gsap.registerPlugin(ScrollTrigger, SplitText);
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
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth <= 767) return;

  document.querySelectorAll(".stack_card").forEach(wrapper => {
    const video = wrapper.querySelector("video");
    if (!video) return;

    video.pause();

    wrapper.addEventListener("mouseenter", () => {
      video.play();
    });

    wrapper.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0; 
    });

    wrapper.addEventListener("click", () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
        video.currentTime = 0; 
      }
    });
  });
});

