// video-preloader.js – fixed video overlay: link seek, playback on scroll, skip / end = fade out
document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("heroVideo");
  if (!video) return;
  const videoWrapper = video.closest(".video-wrapper");
  if (!videoWrapper) return;
  const videoLinks = document.querySelectorAll(".video_link");
  const fadeDurationMs = 600;

  let isClickAnimating = false;
  let currentPartIndex = 0;
  let scrollTimeout = null;
  let lastScrollY = 0;
  let isHidden = false;

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

  function hidePreloader() {
    if (isHidden) return;
    isHidden = true;
    video.pause();
    videoWrapper.style.transition = "opacity " + fadeDurationMs / 1000 + "s ease";
    videoWrapper.style.opacity = "0";
    videoWrapper.style.pointerEvents = "none";
    function setDisplayNone() {
      videoWrapper.style.display = "none";
    }
    videoWrapper.addEventListener("transitionend", setDisplayNone, { once: true });
    setTimeout(setDisplayNone, fadeDurationMs);
  }

  function updateActiveLink(part) {
    videoLinks.forEach((link) => {
      const linkPart = parseInt(link.dataset.part);
      if (linkPart === part) link.classList.add("is-active");
      else link.classList.remove("is-active");
    });
  }

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

  function handleLinkClick(e) {
    e.preventDefault();
    if (isHidden) return;
    const part = parseInt(this.dataset.part);
    const targetPart = parts.find((p) => p.part === part);
    if (!targetPart) return;
    const targetTime = targetPart.time;
    const currentTime = video.currentTime;
    isClickAnimating = true;
    updateActiveLink(part);
    if (currentTime < targetTime) {
      video.playbackRate = speedUpMultiplier;
      video.play();
      function checkReachTarget() {
        if (video.currentTime >= targetTime) {
          video.pause();
          if (Math.abs(video.currentTime - targetTime) > 0.04) video.currentTime = targetTime;
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
      video.pause();
      rewindToTime(targetTime, () => {
        currentPartIndex = parts.findIndex((p) => p.part === part);
        updateActiveLink(part);
        video.playbackRate = normalPlaybackRate;
        isClickAnimating = false;
        video.play();
      });
    } else {
      updateActiveLink(part);
      isClickAnimating = false;
    }
  }

  video.addEventListener("timeupdate", () => updateActiveLinkByTime());

  video.addEventListener("ended", () => {
    video.removeAttribute("loop");
    hidePreloader();
  }, true);

  document.addEventListener("click", (e) => {
    if (e.target.closest("#skipBtn") || e.target.closest("[data-skip-video]")) {
      e.preventDefault();
      hidePreloader();
    }
  });
  videoLinks.forEach((link) => link.addEventListener("click", handleLinkClick));

  // Playback on scroll/wheel: scroll down = 3x play, scroll up = rewind, stop = 1x
  function handleScrollOrWheel(isScrollingDown) {
    if (isHidden || isClickAnimating) return;
    clearTimeout(scrollTimeout);
    if (isScrollingDown) {
      video.playbackRate = speedUpMultiplier;
      if (video.paused) video.play();
    } else {
      video.pause();
      const rewindSpeed = speedUpMultiplier / 60;
      function stepRewind() {
        if (video.currentTime <= 0) {
          video.currentTime = 0;
          scrollTimeout = setTimeout(() => {
            video.playbackRate = normalPlaybackRate;
            video.play();
          }, 150);
          return;
        }
        video.currentTime = Math.max(0, video.currentTime - rewindSpeed);
        requestAnimationFrame(stepRewind);
      }
      stepRewind();
      return;
    }
    scrollTimeout = setTimeout(() => {
      video.playbackRate = normalPlaybackRate;
      video.play();
    }, 150);
  }
  window.addEventListener("scroll", () => {
    if (isHidden) return;
    const currentScrollY = window.scrollY;
    const isScrollingDown = currentScrollY > lastScrollY;
    const scrollSpeed = Math.abs(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;
    if (scrollSpeed === 0) return;
    handleScrollOrWheel(isScrollingDown);
  });
  window.addEventListener("wheel", (e) => {
    if (!isHidden && e.deltaY !== 0) {
      e.preventDefault();
      handleScrollOrWheel(e.deltaY > 0);
    }
  }, { passive: false });

  videoWrapper.style.display = "block";
  video.currentTime = 0;
  updateActiveLink(1);
  video.play().catch(() => {});
});
