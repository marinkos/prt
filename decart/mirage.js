// Register GSAP plugins once
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


  /** Hover reveal **/
  let currentVideoId = null; 
  const image = document.querySelector(".hover-reveal");

  // Exit early if hover-reveal element doesn't exist
  if (!image) return;

  // Set initial position and opacity
  gsap.set(".hover-reveal", { yPercent: -50, xPercent: -50, opacity: 0 });

  let setX,
    setY,
    align = (e) => {
      setX(e.clientX);
      setY(e.clientY);
    },
    startFollow = () => document.addEventListener("mousemove", align),
    stopFollow = () => document.removeEventListener("mousemove", align),
    fade = gsap.to(image, {
      opacity: 1,
      ease: "none",
      paused: true,
      onReverseComplete: stopFollow
    });

  // Initialize all video elements (find any with id starting with "video-")
  // This ensures they're hidden and paused initially
  document.querySelectorAll("[id^='video-']").forEach((videoEl) => {
    const video = videoEl.querySelector('video') || videoEl;
    gsap.set(videoEl, { opacity: 0 });
    video.pause();
    video.currentTime = 0;
  });

  // Create a new timeline for the scaling effect
  const scaleTl = gsap.timeline({ paused: true });

  scaleTl.fromTo(
    ".hover-reveal_inner",
    { scale: 0.3 },
    {
      ease: "expo.out",
      duration: 1,
      scale: 1
    }
  );

  // Scale animation for videos
  scaleTl.fromTo(
    "[id^='video-']",
    { scale: 2.5 },
    {
      ease: "expo.out",
      duration: 1,
      scale: 1
    },
    0
  );

  function handleEnter(e, el, index) {
    // Get video ID from data-video attribute (e.g., "video-0", "video-1", etc.)
    const videoId = el.dataset.video;
    console.log("enter", index, "-> video", videoId);

    if (!videoId) {
      console.warn("No data-video attribute found on element");
      return;
    }

    if (currentVideoId !== videoId) {
      // Hide ALL videos first
      document.querySelectorAll("[id^='video-']").forEach((videoEl) => {
        const video = videoEl.querySelector('video');
        if (video) {
          gsap.set(videoEl, { opacity: 0 });
          video.pause();
          video.currentTime = 0;
        }
      });

      // Show and play new video
      const videoEl = document.getElementById(videoId);
      if (videoEl) {
        console.log("switching to video", videoId);
        const video = videoEl.querySelector('video');
        if (video) {
          gsap.set(videoEl, { opacity: 1 });
          video.play().catch(err => {
            console.error("Error playing video:", err);
          });
          currentVideoId = videoId;
        } else {
          console.warn("Video element not found inside:", videoId);
        }
      } else {
        console.warn("Video container not found:", videoId);
      }
    }

    fade.play();
    startFollow();

    // Set up smooth mouse following
    setX = gsap.quickTo(image, "x", { duration: 0.6, ease: "power2.out" });
    setY = gsap.quickTo(image, "y", { duration: 0.6, ease: "power2.out" });
    align(e);

    // Play the scaling timeline
    scaleTl.play();
  }

  function handleLeave() {
    console.log("leave - reversing animations");
    fade.reverse();
    scaleTl.timeScale(2).reverse(); // Reverse the scaling effect on mouseleave
    
    // Pause and reset current video
    if (currentVideoId) {
      const videoEl = document.getElementById(currentVideoId);
      if (videoEl) {
        const video = videoEl.querySelector('video');
        if (video) {
          video.pause();
          video.currentTime = 0;
          gsap.set(videoEl, { opacity: 0 });
        }
      }
      currentVideoId = null;
    }
  }

  // Apply to all elements with class "events_item"
  gsap.utils.toArray(".events_item").forEach((el, index) => {
    el.addEventListener("mouseenter", (e) => handleEnter(e, el, index));
    el.addEventListener("mouseleave", handleLeave);
  });


  /** Copy to clipboard **/
  document.querySelectorAll(".copy_icon-wrap").forEach((wrap) => {
    wrap.addEventListener("click", async () => {
      // Find .copy_text - could be within wrap or as a sibling
      const copyTextEl = wrap.querySelector(".copy_text") || wrap.parentElement?.querySelector(".copy_text");
      const copyIcon = wrap.querySelector(".copy_icon");
      const checkIcon = wrap.querySelector(".check_icon");

      if (!copyTextEl) return;

      const textToCopy = copyTextEl.textContent || copyTextEl.innerText;

      try {
        await navigator.clipboard.writeText(textToCopy);
        
        // Show check icon
        if (copyIcon) copyIcon.style.display = "none";
        if (checkIcon) checkIcon.style.display = "block";

        // Revert back to copy icon after 2 seconds
        setTimeout(() => {
          if (copyIcon) copyIcon.style.display = "block";
          if (checkIcon) checkIcon.style.display = "none";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    });
  });
});