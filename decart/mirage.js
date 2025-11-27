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
  let currentIndex = -1; 
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

  // Get all video elements (video-0 to video-6)
  const videos = [];
  for (let i = 0; i <= 6; i++) {
    const videoEl = document.getElementById(`video-${i}`);
    if (videoEl) {
      videos.push(videoEl);
      // Ensure videos are hidden initially and get the video element inside
      const video = videoEl.querySelector('video') || videoEl;
      gsap.set(videoEl, { opacity: 0 });
      video.pause();
      video.currentTime = 0;
    }
  }

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
    console.log("enter", index);

    if (currentIndex !== index) {
      // Hide previous video if exists
      if (currentIndex >= 0 && videos[currentIndex]) {
        const prevVideo = videos[currentIndex].querySelector('video') || videos[currentIndex];
        gsap.set(videos[currentIndex], { opacity: 0 });
        prevVideo.pause();
        prevVideo.currentTime = 0;
      }

      // Show and play new video
      if (videos[index]) {
        console.log("switching to video", index);
        const video = videos[index].querySelector('video') || videos[index];
        gsap.set(videos[index], { opacity: 1 });
        video.play().catch(err => {
          console.error("Error playing video:", err);
        });
      }
    }
    currentIndex = index;

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
    if (currentIndex >= 0 && videos[currentIndex]) {
      const video = videos[currentIndex].querySelector('video') || videos[currentIndex];
      video.pause();
      video.currentTime = 0;
      gsap.set(videos[currentIndex], { opacity: 0 });
    }
    currentIndex = -1;
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