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

  // Find all tab panes and their videos
  const tabPanes = productTabs.querySelectorAll(".w-tab-pane");
  console.log("Found tab panes:", tabPanes.length);
  
  if (tabPanes.length === 0) {
    console.warn("No tab panes found");
    return;
  }

  // Initialize: pause all videos and ensure they're ready
  const allVideos = productTabs.querySelectorAll("video");
  console.log("Found videos:", allVideos.length);
  
  allVideos.forEach((video, index) => {
    video.pause();
    video.currentTime = 0;
    // Remove autoplay attribute to prevent conflicts
    video.removeAttribute("autoplay");
    // Ensure video is loaded
    if (video.readyState < 2) {
      video.load();
    }
    console.log(`Video ${index + 1} initialized:`, {
      paused: video.paused,
      readyState: video.readyState,
      src: video.querySelector("source")?.src || video.src
    });
  });

  // Function to handle tab changes
  function handleTabChange() {
    tabPanes.forEach((pane, index) => {
      const video = pane.querySelector("video");
      if (!video) {
        console.warn(`No video found in tab pane ${index + 1}`);
        return;
      }

      // Check if this pane is active (Webflow uses w--current class)
      const isActive = pane.classList.contains("w--current");
      
      if (isActive) {
        console.log(`Tab ${index + 1} is active, playing video`);
        // Ensure video is loaded before playing
        if (video.readyState < 2) {
          video.load();
          video.addEventListener("loadeddata", () => {
            video.play().catch(err => {
              console.warn("Video play failed:", err);
            });
          }, { once: true });
        } else {
          // Play video in active tab
          video.play().catch(err => {
            console.warn("Video play failed:", err);
          });
        }
      } else {
        // Pause video in inactive tabs
        if (!video.paused) {
          console.log(`Tab ${index + 1} is inactive, pausing video`);
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }

  // Listen for tab button clicks
  const tabButtons = productTabs.querySelectorAll(".w-tab-link");
  console.log("Found tab buttons:", tabButtons.length);
  
  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      console.log(`Tab button ${index + 1} clicked`);
      // Delay to allow Webflow to update classes
      setTimeout(handleTabChange, 100);
    });
  });

  // Also use MutationObserver to watch for class changes (more reliable)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        const target = mutation.target;
        if (target.classList.contains("w--current")) {
          console.log("Tab pane became active via class change");
        }
        handleTabChange();
      }
    });
  });

  // Observe all tab panes for class changes
  tabPanes.forEach(pane => {
    observer.observe(pane, {
      attributes: true,
      attributeFilter: ["class"]
    });
  });

  // Handle initial state (in case a tab is already active on load)
  // Delay to ensure Webflow has finished initializing
  setTimeout(() => {
    console.log("Checking initial tab state");
    handleTabChange();
  }, 200);
});

