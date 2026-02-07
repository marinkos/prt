// video.js
// New Hero Video with Scroll Control
document.addEventListener("DOMContentLoaded", function () {
    gsap.registerPlugin(ScrollTrigger);
  
    const video = document.getElementById("heroVideo");
    const videoLinks = document.querySelectorAll(".video_link");
    const videoWrapper = video.closest('[class*="video-wrapper"]') || video.parentElement;
    const videoScrollContainer = videoWrapper.parentElement;
  
    const isMobile = window.innerWidth <= 479;
  
    let isVideoInView = false;
    let isClickAnimating = false;
    let scrollTimeout = null;
    let currentPartIndex = 0;
    let lastScrollY = 0;
    let scrollingToHeroAfterEnd = false;
  
    // Timestamp mappings
    const parts = [
      { part: 1, time: 0, endTime: 5.5 },
      { part: 2, time: 5.5, endTime: 8 },
      { part: 3, time: 8, endTime: 10 },
      { part: 4, time: 10, endTime: 15 },
      { part: 5, time: 15, endTime: 19 },
      { part: 6, time: 19, endTime: 30 },
    ];
  
    const videoDuration = 30;
    const speedUpMultiplier = 3;
    const normalPlaybackRate = 1;
    const scrollsPerPart = 2;
    const totalParts = 5;
  
    // Intersection Observer
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVideoInView = entry.isIntersecting;
  
          if (entry.isIntersecting) {
            if (scrollingToHeroAfterEnd) return; // don't auto-play when we're scrolling to hero after end
            if (video.currentTime === 0) {
              updateActiveLink(1);
            }
            video.playbackRate = normalPlaybackRate;
            video.play().catch((error) => console.log("Video play failed:", error));
          } else {
            scrollingToHeroAfterEnd = false; // clear flag once video is out of view
            video.currentTime = 0;
            video.pause();
          }
        });
      },
      { threshold: 0.3 }
    );
  
    videoObserver.observe(video);
  
    // Update active link
    function updateActiveLink(part) {
      videoLinks.forEach((link) => {
        const linkPart = parseInt(link.dataset.part);
        if (linkPart === part) {
          link.classList.add("is-active");
        } else {
          link.classList.remove("is-active");
        }
      });
    }
  
    // Update based on time
    function updateActiveLinkByTime() {
      const time = video.currentTime;
      let activePart = 1;
  
      for (let i = parts.length - 1; i >= 0; i--) {
        if (time >= parts[i].time) {
          activePart = parts[i].part;
          currentPartIndex = i;
          break;
        }
      }
  
      updateActiveLink(activePart);
    }
  
    // Fast rewind to target time (decrease currentTime until target)
    function rewindToTime(targetTime, onComplete) {
      const rewindSpeed = speedUpMultiplier / 60; // per frame
      
      function stepRewind() {
        if (video.currentTime <= targetTime) {
          video.currentTime = targetTime;
          if (onComplete) onComplete();
          return;
        }
        video.currentTime = Math.max(targetTime, video.currentTime - rewindSpeed);
        requestAnimationFrame(stepRewind);
      }
      
      stepRewind();
    }
  
    // Handle link clicks - play at 3x to target time (forward or rewind), then normal
    function handleLinkClick(e) {
      e.preventDefault();
      const part = parseInt(this.dataset.part);
      const targetPart = parts.find((p) => p.part === part);
  
      if (!targetPart) return;
  
      const targetTime = targetPart.time;
      const currentTime = video.currentTime;
  
      isClickAnimating = true;
      gsap.killTweensOf(video);
  
      if (currentTime < targetTime) {
        // Forward: play at 3x until we reach targetTime, then normal
        video.playbackRate = speedUpMultiplier;
        video.play();
        const onReachTarget = () => {
          if (video.currentTime >= targetTime) {
            video.currentTime = targetTime;
            video.playbackRate = normalPlaybackRate;
            currentPartIndex = parts.findIndex((p) => p.part === part);
            updateActiveLink(part);
            video.removeEventListener("timeupdate", onReachTarget);
            isClickAnimating = false;
          }
        };
        video.addEventListener("timeupdate", onReachTarget);
      } else if (currentTime > targetTime) {
        // Backward: rewind at 3x to targetTime, then play normal
        video.pause();
        rewindToTime(targetTime, () => {
          currentPartIndex = parts.findIndex((p) => p.part === part);
          updateActiveLink(part);
          video.playbackRate = normalPlaybackRate;
          video.play();
          setTimeout(() => { isClickAnimating = false; }, 100);
        });
      } else {
        // Already at target
        updateActiveLink(part);
        isClickAnimating = false;
      }
    }
  
    if (!isMobile) {
      let scrollTrigger;
      
      // Calculate total scroll height (2 scrolls per part × 5 parts = 10 viewport heights)
      const totalScrollHeight = window.innerHeight * scrollsPerPart * totalParts;
      
      // Create scroll trigger
      scrollTrigger = ScrollTrigger.create({
        trigger: videoScrollContainer,
        start: "top top",
        end: `+=${totalScrollHeight}`,
        pin: videoWrapper,
        pinSpacing: true,
        scrub: false,
        onUpdate: (self) => {
          if (isClickAnimating) return;
          
          const currentScrollY = window.scrollY;
          const isScrollingDown = currentScrollY > lastScrollY;
          const scrollSpeed = Math.abs(currentScrollY - lastScrollY);
          lastScrollY = currentScrollY;
          
          if (scrollSpeed > 0 && isScrollingDown) {
            clearTimeout(scrollTimeout);
            video.playbackRate = speedUpMultiplier;
            if (video.paused) {
              video.play();
            }
            scrollTimeout = setTimeout(() => {
              video.playbackRate = normalPlaybackRate;
              video.play();
            }, 150);
          }
        },
        onEnter: () => {
          video.currentTime = 0;
          video.playbackRate = normalPlaybackRate;
          video.play();
          updateActiveLink(1);
        },
        onLeave: () => {
          video.pause();
        },
        onEnterBack: () => {
          video.playbackRate = normalPlaybackRate;
          video.play();
        },
        onLeaveBack: () => {
          video.currentTime = 0;
          video.pause();
        },
      });
  
      video.addEventListener("timeupdate", () => {
        updateActiveLinkByTime();
      });

      video.addEventListener("ended", () => {
        scrollingToHeroAfterEnd = true;
        video.removeAttribute("loop");
        video.pause();
        video.currentTime = 0;
        const hero = document.getElementById("heroSection");
        if (hero) {
          hero.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }, true);
  
      videoLinks.forEach((link) => {
        link.addEventListener("click", handleLinkClick);
      });
  
      video.currentTime = 0;
      updateActiveLink(1);
      
    } else {
      // Mobile behavior
      video.addEventListener("ended", () => {
        scrollingToHeroAfterEnd = true;
        video.removeAttribute("loop");
        video.pause();
        video.currentTime = 0;
        const hero = document.getElementById("heroSection");
        if (hero) {
          hero.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }, true);

      videoLinks.forEach((link) => {
        link.addEventListener("click", handleLinkClick);
      });
    }
  });