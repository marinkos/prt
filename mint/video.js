// video.js – hero video: normal playback, click links to fast-forward/rewind to part
document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("heroVideo");
    if (!video) return;
    const videoLinks = document.querySelectorAll(".video_link");
    let isClickAnimating = false;
    let currentPartIndex = 0;
    let scrollingToHeroAfterEnd = false;
  
    const parts = [
      { part: 1, time: 0, endTime: 5.1 },
      { part: 2, time: 5.1, endTime: 7.6 },
      { part: 3, time: 7.6, endTime: 10.367 },
      { part: 4, time: 10.367, endTime: 15.067 },
      { part: 5, time: 15.067, endTime: 19.3 },
      { part: 6, time: 19.3, endTime: 29.56 },
    ];
  
    const speedUpMultiplier = 3;
    const normalPlaybackRate = 1;
  
    // Intersection Observer – play when in view, pause and reset when out of view
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
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

    // Block any play() while we're scrolling to hero after end (prevents restart flash)
    video.addEventListener("play", function onPlayBlock() {
      if (scrollingToHeroAfterEnd) {
        video.pause();
      }
    }, true);

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
  
    // Update based on time (skip while user is seeking via link click)
    function updateActiveLinkByTime() {
      if (isClickAnimating) return;
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
  
    // Rewind: short distance = single seek; longer = stepped, then one final seek
    function rewindToTime(targetTime, onComplete) {
      const distance = video.currentTime - targetTime;
      if (distance <= 0) {
        if (onComplete) onComplete();
        return;
      }
      if (distance < 1) {
        video.currentTime = targetTime;
        if (onComplete) onComplete();
        return;
      }
      const rewindSpeed = distance / 90;
      const doneThreshold = 0.05;
      function stepRewind() {
        if (video.currentTime <= targetTime + doneThreshold) {
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
      updateActiveLink(part);
      if (currentTime < targetTime) {
        // Forward: play at 3x; when we reach target, pause then seek (smoother), then play
        video.playbackRate = speedUpMultiplier;
        video.play();
        function checkReachTarget() {
          if (video.currentTime >= targetTime) {
            video.pause();
            if (Math.abs(video.currentTime - targetTime) > 0.04) {
              video.currentTime = targetTime;
            }
            video.playbackRate = normalPlaybackRate;
            currentPartIndex = parts.findIndex((p) => p.part === part);
            updateActiveLink(part);
            isClickAnimating = false;
            video.play();
            return;
          }
          requestAnimationFrame(checkReachTarget);
        }
        requestAnimationFrame(checkReachTarget);
      } else if (currentTime > targetTime) {
        // Backward: rewind to targetTime, then play normal
        video.pause();
        rewindToTime(targetTime, () => {
          currentPartIndex = parts.findIndex((p) => p.part === part);
          updateActiveLink(part);
          video.playbackRate = normalPlaybackRate;
          isClickAnimating = false;
          video.play();
        });
      } else {
        // Already at target
        updateActiveLink(part);
        isClickAnimating = false;
      }
    }
  
    video.addEventListener("timeupdate", () => updateActiveLinkByTime());

    video.addEventListener("ended", () => {
      scrollingToHeroAfterEnd = true;
      video.removeAttribute("loop");
      video.pause();
      const hero = document.getElementById("heroSection");
      if (hero) {
        hero.scrollIntoView({ behavior: "auto", block: "start" });
        document.dispatchEvent(new CustomEvent("mint:scroll-to-hero"));
      }
      requestAnimationFrame(() => {
        video.currentTime = 0;
      });
    }, true);

    videoLinks.forEach((link) => link.addEventListener("click", handleLinkClick));

    video.currentTime = 0;
    updateActiveLink(1);
  });