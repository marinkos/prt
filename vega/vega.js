// Webflow tabs video control for .product_tabs
// Videos play only when their tab is active

// Wait for Webflow to initialize
window.Webflow ||= [];
window.Webflow.push(() => {
  const productTabs = document.querySelector(".product_tabs");
  if (!productTabs) {
    console.warn("Product tabs container not found");
    return;
  }

  // Find tab links and videos (similar to the working example)
  const tabLinks = productTabs.querySelectorAll(".w-tab-link");
  const tabPanes = productTabs.querySelectorAll(".w-tab-pane");
  const videos = productTabs.querySelectorAll("video");
  
  console.log("Found tabs:", tabLinks.length);
  console.log("Found tab panes:", tabPanes.length);
  console.log("Found videos:", videos.length);
  
  if (tabLinks.length === 0 || videos.length === 0) {
    console.warn("Missing tabs or videos");
    return;
  }

  let prevIndex = -1;

  // Initialize: pause all videos
  videos.forEach((video, index) => {
    video.pause();
    video.currentTime = 0;
    // Remove autoplay to prevent conflicts
    video.removeAttribute("autoplay");
    console.log(`Video ${index + 1} initialized:`, {
      paused: video.paused,
      readyState: video.readyState
    });
  });

  // Function to handle video playback for a specific tab
  function triggerVideo(tabIndex) {
    console.log("triggerVideo called with tabIndex:", tabIndex, "prevIndex:", prevIndex);
    
    // Pause previous video
    if (prevIndex >= 0 && prevIndex < videos.length) {
      const prevVideo = videos[prevIndex];
      if (prevVideo && !prevVideo.paused) {
        console.log("Pausing previous video at index:", prevIndex);
        prevVideo.pause();
        prevVideo.currentTime = 0;
      }
    }
    
    // Play current video
    if (tabIndex >= 0 && tabIndex < videos.length) {
      const currentVideo = videos[tabIndex];
      if (currentVideo) {
        console.log("Playing video at index:", tabIndex, {
          readyState: currentVideo.readyState,
          paused: currentVideo.paused
        });
        
        // Function to play the video
        const playVideo = () => {
          currentVideo.play().then(() => {
            console.log(`Video ${tabIndex + 1} playing successfully`);
          }).catch(err => {
            console.warn("Video play failed:", err);
          });
        };
        
        // If video isn't ready, load it first
        if (currentVideo.readyState < 2) {
          console.log(`Video ${tabIndex + 1} not ready, loading...`);
          currentVideo.load();
          
          // Wait for video to be ready
          const onCanPlay = () => {
            console.log(`Video ${tabIndex + 1} can play now`);
            playVideo();
            currentVideo.removeEventListener("canplay", onCanPlay);
          };
          
          currentVideo.addEventListener("canplay", onCanPlay, { once: true });
          
          // Fallback timeout
          setTimeout(() => {
            if (currentVideo.paused) {
              console.log(`Video ${tabIndex + 1} attempting play after timeout`);
              playVideo();
            }
          }, 1000);
        } else {
          // Video is ready, play immediately
          playVideo();
        }
      }
    }
    
    prevIndex = tabIndex;
  }

  // Set up click handlers for each tab link
  tabLinks.forEach((link, index) => {
    link.addEventListener("click", () => {
      console.log("Tab clicked:", index, "Previous:", prevIndex);
      if (index !== prevIndex) {
        // Small delay to ensure Webflow has switched the tab
        setTimeout(() => {
          triggerVideo(index);
        }, 50);
      }
    });
  });

  // Also watch for tab pane class changes (backup method)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        const pane = mutation.target;
        if (pane.classList.contains("w--current")) {
          const paneIndex = Array.from(tabPanes).indexOf(pane);
          if (paneIndex !== prevIndex) {
            console.log("Tab pane became active via class change:", paneIndex);
            triggerVideo(paneIndex);
          }
        }
      }
    });
  });

  // Observe all tab panes
  tabPanes.forEach(pane => {
    observer.observe(pane, {
      attributes: true,
      attributeFilter: ["class"]
    });
  });

  // Handle initial state - find which tab is active on load
  setTimeout(() => {
    const activePane = productTabs.querySelector(".w-tab-pane.w--current");
    if (activePane) {
      const initialIndex = Array.from(tabPanes).indexOf(activePane);
      console.log("Initial active tab:", initialIndex);
      triggerVideo(initialIndex);
    }
  }, 300);
});

