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

  const isMobilePhone = /android.*mobile|iphone|ipod|blackberry|iemobile|opera mini|webos/i.test(navigator.userAgent) && 
                        !/ipad|android(?!.*mobile)/i.test(navigator.userAgent) ||
                        (window.innerWidth <= 480 && window.innerHeight <= 900);
  
  if (isMobilePhone) {
    return;
  }

  let prevIndex = -1;

  videos.forEach((video, index) => {
    video.pause();
    video.currentTime = 0;
    video.removeAttribute("autoplay");
  });

  function preloadVideoMetadata(video) {
    if (!video) return;
    if (video.preload === "none") {
      video.preload = "metadata";
    }
  }

  function triggerVideo(tabIndex, skipPause = false) {
    if (!skipPause && prevIndex >= 0 && prevIndex < videos.length && prevIndex !== tabIndex) {
      const prevVideo = videos[prevIndex];
      if (prevVideo && !prevVideo.paused) {
        prevVideo.pause();
        prevVideo.currentTime = 0;
      }
    }
    
    if (tabIndex >= 0 && tabIndex < videos.length) {
      const currentVideo = videos[tabIndex];
      if (currentVideo) {
        const playVideo = () => {
          currentVideo.play().catch((error) => {
            console.warn("Video play failed:", error);
          });
        };
        
        if (currentVideo.readyState < 2) {
          const onCanPlay = () => {
            playVideo();
            currentVideo.removeEventListener("canplay", onCanPlay);
          };
          
          currentVideo.addEventListener("canplay", onCanPlay, { once: true });
          
          setTimeout(() => {
            if (currentVideo.paused && currentVideo.readyState >= 2) {
              playVideo();
            }
          }, 1000);
        } else {
          playVideo();
        }
      }
    }
    
    prevIndex = tabIndex;
  }

  tabLinks.forEach((link, index) => {
    const video = videos[index];
    
    if (video) {
      const preloadOnInteraction = () => {
        if (index !== prevIndex) {
          preloadVideoMetadata(video);
        }
      };
      
      link.addEventListener("mouseenter", preloadOnInteraction, { once: true, passive: true });
    }
    
    link.addEventListener("click", () => {
      if (index !== prevIndex) {
        setTimeout(() => {
          triggerVideo(index);
        }, 50);
      }
    });
  });

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

  tabPanes.forEach(pane => {
    observer.observe(pane, {
      attributes: true,
      attributeFilter: ["class"]
    });
  });

  function initializeActiveVideo() {
    const activePane = productTabs.querySelector(".w-tab-pane.w--current");
    let initialIndex = -1;
    
    if (activePane) {
      initialIndex = Array.from(tabPanes).indexOf(activePane);
    } else {
      const activeLink = productTabs.querySelector(".w-tab-link.w--current");
      if (activeLink) {
        initialIndex = Array.from(tabLinks).indexOf(activeLink);
      } else {
        initialIndex = 0;
      }
    }
    
    if (initialIndex >= 0) {
      triggerVideo(initialIndex, true);
      prevIndex = initialIndex;
    }
  }
  
  initializeActiveVideo();
  setTimeout(initializeActiveVideo, 300);
});

