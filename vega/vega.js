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
  const loadedVideos = new Set(); // Track which videos have been loaded

  // Initialize: optimize all videos for performance
  videos.forEach((video, index) => {
    video.pause();
    video.currentTime = 0;
    // Remove autoplay to prevent conflicts
    video.removeAttribute("autoplay");
    
    // Set preload strategy: 'none' for inactive videos to save bandwidth
    // We'll change this to 'metadata' or 'auto' when needed
    if (!video.hasAttribute("preload")) {
      video.preload = "none";
    }
    
    // Optimize for mobile: disable playsinline if not needed
    if (isMobile && !video.hasAttribute("playsinline")) {
      video.setAttribute("playsinline", "");
    }
  });

  // Preload video metadata and prepare for playback
  function preloadVideo(video, priority = "metadata") {
    if (!video || loadedVideos.has(video)) {
      return;
    }
    
    // Set preload level based on priority
    if (priority === "auto") {
      video.preload = "auto";
    } else {
      video.preload = "metadata";
    }
    
    // Load the video
    video.load();
    loadedVideos.add(video);
  }
  
  // Preload adjacent videos for smoother transitions
  function preloadAdjacentVideos(activeIndex) {
    // Preload next video (if exists)
    if (activeIndex + 1 < videos.length) {
      const nextVideo = videos[activeIndex + 1];
      if (!loadedVideos.has(nextVideo)) {
        preloadVideo(nextVideo, "metadata");
      }
    }
    
    // Preload previous video (if exists)
    if (activeIndex - 1 >= 0) {
      const prevVideo = videos[activeIndex - 1];
      if (!loadedVideos.has(prevVideo)) {
        preloadVideo(prevVideo, "metadata");
      }
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
        // Ensure video is preloaded for faster playback
        if (!loadedVideos.has(currentVideo)) {
          // For active video, use auto preload for faster start
          currentVideo.preload = isMobile ? "metadata" : "auto";
          currentVideo.load();
          loadedVideos.add(currentVideo);
        } else {
          // If already loaded, ensure preload is set to auto for smooth playback
          currentVideo.preload = "auto";
        }
        
        // Function to play the video
        const playVideo = () => {
          currentVideo.play().catch(() => {
            // Video play failed, silently handle
          });
        };
        
        // Check if video has enough data to play
        // readyState 2 = HAVE_CURRENT_DATA, 3 = HAVE_FUTURE_DATA, 4 = HAVE_ENOUGH_DATA
        if (currentVideo.readyState < 2) {
          // Wait for video to have current data (faster than waiting for canplay)
          const onLoadedData = () => {
            playVideo();
            currentVideo.removeEventListener("loadeddata", onLoadedData);
          };
          
          // Also listen for canplay as backup
          const onCanPlay = () => {
            playVideo();
            currentVideo.removeEventListener("canplay", onCanPlay);
          };
          
          currentVideo.addEventListener("loadeddata", onLoadedData, { once: true });
          currentVideo.addEventListener("canplay", onCanPlay, { once: true });
          
          // Reduced timeout for mobile (faster fallback)
          const timeout = isMobile ? 500 : 1000;
          setTimeout(() => {
            if (currentVideo.paused && currentVideo.readyState >= 2) {
              playVideo();
            }
          }, timeout);
        } else {
          // Video is ready, play immediately
          playVideo();
        }
        
        // Preload adjacent videos for smoother navigation
        preloadAdjacentVideos(tabIndex);
      }
    }
    
    prevIndex = tabIndex;
  }

  // Set up click handlers and preload on hover/touch for each tab link
  tabLinks.forEach((link, index) => {
    const video = videos[index];
    
    // Preload video on hover (desktop) or touchstart (mobile) for faster loading
    if (video) {
      const preloadOnInteraction = () => {
        if (!loadedVideos.has(video) && index !== prevIndex) {
          preloadVideo(video, "metadata");
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
      const initialVideo = videos[initialIndex];
      if (initialVideo) {
        // Preload initial video with metadata first for faster initial load
        if (!loadedVideos.has(initialVideo)) {
          initialVideo.preload = isMobile ? "metadata" : "auto";
          initialVideo.load();
          loadedVideos.add(initialVideo);
        }
      }
      
      triggerVideo(initialIndex, true); // Skip pausing on initial load
      prevIndex = initialIndex;
    }
  }
  
  // Try to initialize immediately and also after a delay
  initializeActiveVideo();
  setTimeout(initializeActiveVideo, 300);
});

