function initLucy() {
    if (window.innerWidth <= 767) return;
  
    document.querySelectorAll(".stack_card").forEach(wrapper => {
      const video = wrapper.querySelector("video");
      if (!video) return;
  
      video.pause();
  
      wrapper.addEventListener("mouseenter", () => {
        video.play();
      });
  
      wrapper.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0; 
      });
  
      wrapper.addEventListener("click", () => {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
          video.currentTime = 0; 
        }
      });
    });
}