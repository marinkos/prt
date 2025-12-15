window.Webflow ||= [];
window.Webflow.push(() => {
  const productTabs = document.querySelector(".product_tabs");
  if (!productTabs) {
    return;
  }

  const tabLinks = productTabs.querySelectorAll(".w-tab-link");
  const tabPanes = productTabs.querySelectorAll(".w-tab-pane");
  const videos = productTabs.querySelectorAll("video");
  
  if (tabLinks.length === 0 || videos.length === 0) {
    return;
  }

  let prevIndex = -1;

  videos.forEach(video => {
    video.pause();
    video.currentTime = 0;
    video.removeAttribute("autoplay");
  });

  function triggerVideo(tabIndex, skipPause = false) {
    if (!skipPause && prevIndex >= 0 && prevIndex !== tabIndex) {
      const prevVideo = videos[prevIndex];
      prevVideo?.pause();
      prevVideo && (prevVideo.currentTime = 0);
    }

    const currentVideo = videos[tabIndex];
    if (currentVideo) {
      const playVideo = () => currentVideo.play().catch(console.warn);
      currentVideo.readyState >= 2 ? playVideo() : currentVideo.addEventListener("canplay", playVideo, { once: true });
    }

    prevIndex = tabIndex;
  }

  tabLinks.forEach((link, index) => {
    link.addEventListener("click", () => {
      if (index !== prevIndex) {
        setTimeout(() => triggerVideo(index), 50);
      }
    });
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        const pane = mutation.target;
        if (pane.classList.contains("w--current")) {
          const paneIndex = Array.from(tabPanes).indexOf(pane);
          if (paneIndex !== prevIndex) triggerVideo(paneIndex);
        }
      }
    });
  });

  tabPanes.forEach(pane => observer.observe(pane, { attributes: true, attributeFilter: ["class"] }));

  function initializeActiveVideo() {
    const activePane = productTabs.querySelector(".w-tab-pane.w--current");
    const activeLink = productTabs.querySelector(".w-tab-link.w--current");
    const initialIndex = activePane ? Array.from(tabPanes).indexOf(activePane) : 
                         activeLink ? Array.from(tabLinks).indexOf(activeLink) : 0;
    
    if (initialIndex >= 0) {
      triggerVideo(initialIndex, true);
      prevIndex = initialIndex;
    }
  }
  
  initializeActiveVideo();
  setTimeout(initializeActiveVideo, 300);
});

