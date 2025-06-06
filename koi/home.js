//----------------//
//Video slider
//----------------//
class Custom3DCarousel {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.wrapper = this.container.querySelector(".swiper-wrapper");
    this.slides = this.container.querySelectorAll(".swiper-slide");
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.touchEnabled = true;
    this.isDragging = false;
    this.dragStartX = 0;

    // Video elements
    this.videoIds = ["#islandRed", "#islandGold", "#islandBlue"];

    this.positions = {
      left: 0,
      center: 1,
      right: 2,
    };

    this.init();
  }

  init() {
    this.setInitialPositions();
    this.addEventListeners();
    this.updateActiveVideo();

    console.log("Carousel initialized with", this.totalSlides, "slides");
  }

  setInitialPositions() {
    this.slides.forEach((slide) => {
      slide.className = slide.className.replace(/position-\w+/g, "");
      slide.classList.add("position-none");
    });

    this.slides[this.positions.left].classList.replace(
      "position-none",
      "position-left"
    );
    this.slides[this.positions.center].classList.replace(
      "position-none",
      "position-center"
    );
    this.slides[this.positions.right].classList.replace(
      "position-none",
      "position-right"
    );
  }

  slideLeft() {
    if (!this.touchEnabled) return;
    this.touchEnabled = false;

    this.updatePositions(-1);

    setTimeout(() => {
      this.touchEnabled = true;
    }, 600);
  }

  slideRight() {
    if (!this.touchEnabled) return;
    this.touchEnabled = false;

    this.updatePositions(1);

    setTimeout(() => {
      this.touchEnabled = true;
    }, 600);
  }

  updatePositions(direction) {
    this.slides.forEach((slide) => {
      slide.className = slide.className.replace(/position-\w+/g, "");
      slide.classList.add("position-none");
    });

    Object.keys(this.positions).forEach((key) => {
      this.positions[key] =
        (this.positions[key] + direction + this.totalSlides) % this.totalSlides;
    });

    this.slides[this.positions.left].classList.replace(
      "position-none",
      "position-left"
    );
    this.slides[this.positions.center].classList.replace(
      "position-none",
      "position-center"
    );
    this.slides[this.positions.right].classList.replace(
      "position-none",
      "position-right"
    );

    this.updateActiveVideo();
  }

  updateActiveVideo() {
    // Pause all videos
    this.slides.forEach((slide) => {
      const videos = slide.querySelectorAll("video");
      videos.forEach((video) => {
        if (video && typeof video.pause === "function") {
          video.pause();
        }
      });
    });

    // Play only the video on the active slide
    const activeSlide = this.slides[this.positions.center];
    const videos = activeSlide.querySelectorAll("video");
    videos.forEach((video) => {
      if (video && typeof video.play === "function") {
        video.currentTime = 0;
        video.play().catch((e) => console.log("Video play error:", e));
      }
    });
  }

  addEventListeners() {
    // Navigation arrows
    const nextBtn = document.querySelector("#arrowNext");
    const prevBtn = document.querySelector("#arrowPrev");

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.slideRight());
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.slideLeft());
    }

    let startX = 0;
    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = false;
    };

    const handleTouchMove = (e) => {
      if (!isScrolling) {
        const diffY = Math.abs(e.touches[0].clientY - startY);
        const diffX = Math.abs(e.touches[0].clientX - startX);

        if (diffY > diffX) {
          isScrolling = true;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (isScrolling) return;

      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        console.log("Swipe detected:", diff > 0 ? "left" : "right");
        if (diff > 0) {
          this.slideRight();
        } else {
          this.slideLeft();
        }
      }
    };

    const handleMouseDown = (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      document.body.style.userSelect = "none";
    };

    const handleMouseMove = (e) => {
      if (!this.isDragging) return;
    };

    const handleMouseUp = (e) => {
      if (!this.isDragging) return;

      const dragEndX = e.clientX;
      const diff = this.dragStartX - dragEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.slideRight();
        } else {
          this.slideLeft();
        }
      }

      this.isDragging = false;
      document.body.style.userSelect = "";
    };

    const handleMouseLeave = () => {
      if (this.isDragging) {
        this.isDragging = false;
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    this.container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCarousel);
} else {
  initCarousel();
}

function initCarousel() {
  const carousel = new Custom3DCarousel(".swiper");

  window.carousel = carousel;

  console.log(
    //"Custom 3D Carousel initialized and available as window.carousel"
  );
}

//------------------------//
//Clouds
//------------------------//

const movementTypes = [
  {
    animation: (element) => {
      gsap.to(element, {
        x: "+=30",
        duration: 8 + Math.random() * 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  },
  {
    animation: (element) => {
      gsap.to(element, {
        x: "+=25",
        y: "-=15",
        duration: 10 + Math.random() * 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  },
  {
    animation: (element) => {
      gsap.to(element, {
        x: "+=25",
        y: "+=15",
        duration: 10 + Math.random() * 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  },
  {
    animation: (element) => {
      gsap.to(element, {
        x: "-=25",
        y: "-=15",
        duration: 10 + Math.random() * 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  },
  {
    animation: (element) => {
      gsap.to(element, {
        x: "-=25",
        y: "+=15",
        duration: 10 + Math.random() * 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  },
];

const clouds = document.querySelectorAll(".cloud");

clouds.forEach((cloud) => {
  const randomType = Math.floor(Math.random() * movementTypes.length);

  gsap.delayedCall(Math.random() * 2, () => {
    movementTypes[randomType].animation(cloud);
  });
});

//------//
//Rain
//------//

var drops = [];
var maxDrops = 300; // Total number of raindrops
var canvasOpacity = 0.3; // Opacity multiplier for rain

function setup() {
  let parentElement =
    document.getElementById("rain-container") || document.body;
  let canvas = createCanvas(
    parentElement.offsetWidth,
    parentElement.offsetHeight
  );
  canvas.parent(parentElement);
  canvas.style("background-color", "transparent");
}

function windowResized() {
  let parentElement =
    document.getElementById("rain-container") || document.body;
  resizeCanvas(parentElement.offsetWidth, parentElement.offsetHeight);

  for (var i = 0; i < drops.length; i++) {
    drops[i].reset();
  }
}

function draw() {
  clear(); 

  if (drops.length < maxDrops) {
    let dropsToAddThisFrame = Math.min(5, maxDrops - drops.length);
    for (let k = 0; k < dropsToAddThisFrame; k++) {
      drops.push(new Drop()); 
    }
  }

  for (var i = 0; i < drops.length; i++) {
    drops[i].show();
    drops[i].update();
  }
}

function Drop() {
  this.reset = function () {
    this.x = random(0, width + 100); 
    this.y = random(-300, -50); 
    this.length = random(20, 50); 
    this.thickness = random(1, 3); 
    this.speed = random(5, 10); 
    this.gravity = 0.5;
  };

  this.reset(); 

  this.angle = -PI / 12; 

  this.show = function () {
    let endX = this.x + this.length * sin(this.angle); 
    let endY = this.y + this.length * cos(this.angle); 

    let segments = 5; 
    let xStep = (endX - this.x) / segments;
    let yStep = (endY - this.y) / segments;

    push(); 

    for (let i = 0; i < segments; i++) {
      let segStartX = this.x + i * xStep;
      let segStartY = this.y + i * yStep;
      let segEndX = this.x + (i + 1) * xStep;
      let segEndY = this.y + (i + 1) * yStep;

      let progress = segments > 1 ? i / (segments - 1) : 1;
      let opacity = map(progress, 0, 1, 20, 255) * canvasOpacity;

      let r = 217;
      let g = 217;
      let b = 217;

      stroke(r, g, b, opacity); 
      strokeWeight(this.thickness);
      line(segStartX, segStartY, segEndX, segEndY);
    }

    noStroke();
    fill(217, 217, 217, 255 * canvasOpacity); 
    ellipse(endX, endY, this.thickness * 1.5, this.thickness * 1.5);

    pop();
  };

  this.update = function () {
    this.x += this.speed * this.gravity * sin(this.angle);
    this.y += this.speed * this.gravity * cos(this.angle);

    if (
      this.y > height + this.length ||
      this.x < -this.length - 100 ||
      this.x > width + 100 + this.length
    ) {
      this.x = random(0, width + 100); 
      this.y = random(-200, -50); 

      this.length = random(20, 50);
      this.thickness = random(1, 3);
      this.speed = random(5, 10);
    }
  };
}

//--------------------//
//Swiper slider
//--------------------//

const initRichesSlider = () => {
  if (window.innerWidth < 991) {
    const richesSwiper = new Swiper(".riches_component", {
      slideClass: "riches_card",
      wrapperClass: "riches_wrapper",
      centeredSlides: false,
      loop: false,
      slidesPerView: 1.5,
      navigation: {
        nextEl: "#richesRight",
        prevEl: "#richesLeft"
      },
      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 28,
        },
        320: {
          slidesPerView: 1,
          spaceBetween: 28,
        },
      },
    });
    
    return richesSwiper;
  }
  return null;
};

let richesSwiper = initRichesSlider();

window.addEventListener('resize', () => {
  if (window.innerWidth < 991) {
    if (!richesSwiper) {
      richesSwiper = initRichesSlider();
    }
  } else {
    if (richesSwiper) {
      richesSwiper.destroy(true, true);
      richesSwiper = null;
    }
  }
});