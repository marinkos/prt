// video.js – popup video autoplay + minimize/maximize controls
document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("heroVideo");
  if (!video) return;

  const videoWrapper = video.closest(".video-wrapper");
  const videoMinimize = document.getElementById("videoMinimize");
  const videoMaximize = document.getElementById("videoMaximize");
  const wrapperTransition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";

  if (videoWrapper) {
    // Keep one transition/easing setup so minimize/maximize feel identical.
    videoWrapper.style.transition = wrapperTransition;
    videoWrapper.style.transformOrigin = "bottom right";
  }

  function applyMinimizedState() {
    if (!videoWrapper) return;
    video.pause();
    video.currentTime = 0;
    videoWrapper.style.transform = "translate(38vw, 36vh) scale(0.28)";
    if (videoMaximize) videoMaximize.style.display = "block";
  }

  function applyMaximizedState() {
    if (!videoWrapper) return;
    videoWrapper.style.transform = "";
    if (videoMaximize) videoMaximize.style.display = "none";
    video.play().catch(() => {});
  }

  if (videoMaximize) {
    videoMaximize.style.display = "none";
    videoMaximize.addEventListener("click", function (e) {
      e.preventDefault();
      applyMaximizedState();
    });
  }

  if (videoMinimize) {
    videoMinimize.addEventListener("click", function (e) {
      e.preventDefault();
      applyMinimizedState();
    });
  }

  video.currentTime = 0;
  video.play().catch(() => {});
});