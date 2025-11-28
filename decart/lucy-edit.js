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

  // Detect mobile/touch device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window) || 
                   (navigator.maxTouchPoints > 0);

  // Set initial position and opacity
  gsap.set(".hover-reveal", { yPercent: -50, xPercent: -50, opacity: 0 });
  
  // Ensure inner container has relative positioning for absolute video positioning
  gsap.set(".hover-reveal_inner", { position: "relative" });

  let setX,
    setY,
    align = (e) => {
      setX(e.clientX);
      setY(e.clientY);
    },
    startFollow = () => {
      if (!isMobile) {
        document.addEventListener("mousemove", align);
      }
    },
    stopFollow = () => {
      if (!isMobile) {
        document.removeEventListener("mousemove", align);
      }
    },
    fade = gsap.to(image, {
      opacity: 1,
      ease: "none",
      paused: true,
      onReverseComplete: stopFollow
    });

  // Initialize all video elements (find any with id starting with "video-")
  // Position them absolutely so they all overlap in the same position
  const allVideos = document.querySelectorAll("[id^='video-']");
  console.log("🔍 Found video containers:", allVideos.length);
  allVideos.forEach((videoEl) => {
    const video = videoEl.querySelector('video');
    console.log(`📹 Initializing ${videoEl.id}:`, {
      container: videoEl,
      videoElement: video,
      containerRect: videoEl.getBoundingClientRect(),
      containerOpacity: window.getComputedStyle(videoEl).opacity
    });
    
    // Position all videos absolutely so they overlap
    gsap.set(videoEl, { 
      opacity: 0,
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%"
    });
    
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
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
    console.log("🖱️ HOVER ENTER:", {
      index,
      videoId,
      element: el,
      currentVideoId
    });

    if (!videoId) {
      console.warn("❌ No data-video attribute found on element");
      return;
    }

    if (currentVideoId !== videoId) {
      // Hide ALL videos first
      console.log("🔇 Hiding all videos...");
      document.querySelectorAll("[id^='video-']").forEach((videoEl) => {
        const video = videoEl.querySelector('video');
        const beforeOpacity = window.getComputedStyle(videoEl).opacity;
        const beforeRect = videoEl.getBoundingClientRect();
        if (video) {
          gsap.set(videoEl, { opacity: 0 });
          video.pause();
          video.currentTime = 0;
          const afterOpacity = window.getComputedStyle(videoEl).opacity;
          console.log(`  📹 Hiding ${videoEl.id}:`, {
            beforeOpacity,
            afterOpacity,
            rect: beforeRect,
            videoPaused: video.paused,
            videoCurrentTime: video.currentTime
          });
        }
      });

      // Show and play new video
      const videoEl = document.getElementById(videoId);
      console.log("🔍 Looking for video container:", videoId, "Found:", videoEl);
      
      if (videoEl) {
        const video = videoEl.querySelector('video');
        const beforeRect = videoEl.getBoundingClientRect();
        const beforeOpacity = window.getComputedStyle(videoEl).opacity;
        
        console.log("📹 Video container details:", {
          id: videoEl.id,
          videoElement: video,
          beforeRect,
          beforeOpacity,
          hasVideo: !!video
        });
        
        if (video) {
          console.log("▶️ Showing and playing video:", videoId);
          gsap.set(videoEl, { opacity: 1 });
          
          const afterOpacity = window.getComputedStyle(videoEl).opacity;
          const afterRect = videoEl.getBoundingClientRect();
          
          console.log("✅ Video state after show:", {
            opacity: afterOpacity,
            rect: afterRect,
            videoReadyState: video.readyState,
            videoPaused: video.paused
          });
          
          video.play().then(() => {
            console.log("✅ Video playing:", videoId, {
              paused: video.paused,
              currentTime: video.currentTime,
              readyState: video.readyState
            });
          }).catch(err => {
            console.error("❌ Error playing video:", err, {
              videoId,
              error: err.message
            });
          });
          currentVideoId = videoId;
        } else {
          console.warn("❌ Video element not found inside:", videoId, {
            container: videoEl,
            children: Array.from(videoEl.children).map(c => ({
              tag: c.tagName,
              id: c.id,
              class: c.className
            }))
          });
        }
      } else {
        console.warn("❌ Video container not found:", videoId, {
          allVideoIds: Array.from(document.querySelectorAll("[id^='video-']")).map(v => v.id)
        });
      }
    } else {
      console.log("⏭️ Same video, skipping switch");
    }

    fade.play();
    startFollow();

    // Position video: centered on mobile, follow mouse on desktop
    if (isMobile) {
      // Center video to the .events_item element
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      gsap.set(image, {
        x: centerX,
        y: centerY
      });
    } else {
      // Set up smooth mouse following for desktop
      setX = gsap.quickTo(image, "x", { duration: 0.6, ease: "power2.out" });
      setY = gsap.quickTo(image, "y", { duration: 0.6, ease: "power2.out" });
      align(e);
    }

    // Play the scaling timeline
    scaleTl.play();
  }

  function handleLeave() {
    console.log("🖱️ HOVER LEAVE:", {
      currentVideoId
    });
    fade.reverse();
    scaleTl.timeScale(2).reverse(); // Reverse the scaling effect on mouseleave
    
    // Pause and reset current video
    if (currentVideoId) {
      const videoEl = document.getElementById(currentVideoId);
      if (videoEl) {
        const video = videoEl.querySelector('video');
        if (video) {
          console.log("⏸️ Pausing and hiding video:", currentVideoId, {
            beforePause: {
              paused: video.paused,
              currentTime: video.currentTime
            }
          });
          video.pause();
          video.currentTime = 0;
          gsap.set(videoEl, { opacity: 0 });
          console.log("✅ Video paused and hidden:", {
            afterPause: {
              paused: video.paused,
              currentTime: video.currentTime,
              opacity: window.getComputedStyle(videoEl).opacity
            }
          });
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
});

