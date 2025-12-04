// Webflow tabs video control for .product_tabs
// Videos play only when their tab is active

// Wait for Webflow to initialize
window.Webflow ||= [];
window.Webflow.push(() => {
  const productTabs = document.querySelector(".product_tabs");
  if (!productTabs) {
    return;
  }

  // Find tab links and videos (similar to the working example)
  const tabLinks = productTabs.querySelectorAll(".w-tab-link");
  const tabPanes = productTabs.querySelectorAll(".w-tab-pane");
  const videos = productTabs.querySelectorAll("video");
  
  if (tabLinks.length === 0 || videos.length === 0) {
    return;
  }

  let prevIndex = -1;

  // Initialize: pause all videos
  videos.forEach((video, index) => {
    video.pause();
    video.currentTime = 0;
    // Remove autoplay to prevent conflicts
    video.removeAttribute("autoplay");
  });

  // Function to handle video playback for a specific tab
  function triggerVideo(tabIndex, skipPause = false) {
    // Pause previous video (unless we're initializing)
    if (!skipPause && prevIndex >= 0 && prevIndex < videos.length && prevIndex !== tabIndex) {
      const prevVideo = videos[prevIndex];
      if (prevVideo && !prevVideo.paused) {
        prevVideo.pause();
        prevVideo.currentTime = 0;
      }
    }
    
    // Play current video
    if (tabIndex >= 0 && tabIndex < videos.length) {
      const currentVideo = videos[tabIndex];
      if (currentVideo) {
        // Function to play the video
        const playVideo = () => {
          currentVideo.play().catch(() => {
            // Video play failed, silently handle
          });
        };
        
        // If video isn't ready, load it first
        if (currentVideo.readyState < 2) {
          currentVideo.load();
          
          // Wait for video to be ready
          const onCanPlay = () => {
            playVideo();
            currentVideo.removeEventListener("canplay", onCanPlay);
          };
          
          currentVideo.addEventListener("canplay", onCanPlay, { once: true });
          
          // Fallback timeout
          setTimeout(() => {
            if (currentVideo.paused) {
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

  // Handle initial state - find which tab is active on load and play its video
  function initializeActiveVideo() {
    // Try to find active tab pane
    const activePane = productTabs.querySelector(".w-tab-pane.w--current");
    let initialIndex = -1;
    
    if (activePane) {
      initialIndex = Array.from(tabPanes).indexOf(activePane);
    } else {
      // If no active pane found, check active tab link
      const activeLink = productTabs.querySelector(".w-tab-link.w--current");
      if (activeLink) {
        initialIndex = Array.from(tabLinks).indexOf(activeLink);
      } else {
        // Default to first tab if nothing is marked as active
        initialIndex = 0;
      }
    }
    
    if (initialIndex >= 0) {
      triggerVideo(initialIndex, true); // Skip pausing on initial load
      prevIndex = initialIndex;
    }
  }
  
  // Try to initialize immediately and also after a delay
  initializeActiveVideo();
  setTimeout(initializeActiveVideo, 300);
});

