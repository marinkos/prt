// Webflow tabs video control for .product_tabs
// Videos play only when their tab is active

document.addEventListener("DOMContentLoaded", () => {
  const productTabs = document.querySelector(".product_tabs");
  if (!productTabs) return;

  // Find all tab panes and their videos
  const tabPanes = productTabs.querySelectorAll(".w-tab-pane");
  
  // Initialize: pause all videos
  const allVideos = productTabs.querySelectorAll("video");
  allVideos.forEach(video => {
    video.pause();
    video.currentTime = 0;
  });

  // Function to handle tab changes
  function handleTabChange() {
    tabPanes.forEach(pane => {
      const video = pane.querySelector("video");
      if (!video) return;

      // Check if this pane is active (Webflow uses w--current class)
      const isActive = pane.classList.contains("w--current");
      
      if (isActive) {
        // Play video in active tab
        video.play().catch(err => {
          console.warn("Video play failed:", err);
        });
      } else {
        // Pause video in inactive tabs
        video.pause();
        video.currentTime = 0;
      }
    });
  }

  // Listen for tab button clicks
  const tabButtons = productTabs.querySelectorAll(".w-tab-link");
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Small delay to allow Webflow to update classes
      setTimeout(handleTabChange, 50);
    });
  });

  // Also use MutationObserver to watch for class changes (more reliable)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
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
  handleTabChange();
});

