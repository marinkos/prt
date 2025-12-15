// Webflow tabs video control for .product_tabs
// Videos play only when their tab is active
// Optimized for mobile performance

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

  // Detect mobile device for performance optimizations
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768);
  
  let prevIndex = -1;

  // Initialize: optimize all videos for performance
  videos.forEach((video, index) => {
    video.pause();
    video.currentTime = 0;
    // Remove autoplay to prevent conflicts
    video.removeAttribute("autoplay");
    
    // Set preload strategy: use metadata for better mobile performance
    // Don't force 'none' as it might prevent videos from showing
    if (!video.hasAttribute("preload")) {
      video.preload = isMobile ? "metadata" : "auto";
    }
    
    // Optimize for mobile: ensure playsinline for proper mobile playback
    if (isMobile && !video.hasAttribute("playsinline")) {
      video.setAttribute("playsinline", "");
    }
  });

  // Preload video metadata (lightweight, doesn't call load())
  function preloadVideoMetadata(video) {
    if (!video) return;
    // Just set preload to metadata, don't call load() to avoid conflicts
    if (video.preload === "none") {
      video.preload = "metadata";
    }
  }

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
        // Set preload to auto for active video to ensure it loads
        currentVideo.preload = "auto";
        
        // Function to play the video
        const playVideo = () => {
          currentVideo.play().catch((error) => {
            // Video play failed, silently handle
            console.warn("Video play failed:", error);
          });
        };
        
        // Check if video has enough data to play
        // readyState 2 = HAVE_CURRENT_DATA, 3 = HAVE_FUTURE_DATA, 4 = HAVE_ENOUGH_DATA
        if (currentVideo.readyState < 2) {
          // Wait for video to be ready
          const onCanPlay = () => {
            playVideo();
            currentVideo.removeEventListener("canplay", onCanPlay);
          };
          
          currentVideo.addEventListener("canplay", onCanPlay, { once: true });
          
          // Fallback timeout
          setTimeout(() => {
            if (currentVideo.paused && currentVideo.readyState >= 2) {
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

  // Set up click handlers and light preload on hover/touch for each tab link
  tabLinks.forEach((link, index) => {
    const video = videos[index];
    
    // Light preload on hover (desktop) or touchstart (mobile) - just set metadata, don't call load()
    if (video) {
      const preloadOnInteraction = () => {
        if (index !== prevIndex) {
          preloadVideoMetadata(video);
        }
      };
      
      // Desktop: preload on hover
      link.addEventListener("mouseenter", preloadOnInteraction, { once: true, passive: true });
      
      // Mobile: preload on touchstart (before click)
      link.addEventListener("touchstart", preloadOnInteraction, { once: true, passive: true });
    }
    
    // Click handler
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

