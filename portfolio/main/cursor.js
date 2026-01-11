const cursor = document.getElementById("cursor");
const amount = 20;
const sineDots = Math.floor(amount * 0.3);
const width = 26;
const idleTimeout = 150;

let lastFrame = 0;
let mousePosition = { x: 0, y: 0 };
let dots = [];
let timeoutID;
let idle = false;

// Pre-calculate constants
const ANGLE_SPEED = 0.05;
const FOLLOW_FACTOR = 0.35;
const WIDTH_HALF = width / 2;
const SCALE_FACTOR = 0.05;
const LIMIT_FACTOR = 0.75;

class Dot {
    constructor(index = 0) {
        this.index = index;
        this.x = 0;
        this.y = 0;
        this.scale = 1 - SCALE_FACTOR * index;
        this.range = WIDTH_HALF - WIDTH_HALF * this.scale + 2;
        this.limit = width * LIMIT_FACTOR * this.scale;
        this.element = document.createElement("span");
        
        // Use gsap.set instead of TweenMax.set (modern GSAP)
        gsap.set(this.element, { scale: this.scale });
        cursor.appendChild(this.element);
        
        // Pre-initialize animation properties
        this.lockX = 0;
        this.lockY = 0;
        this.angleX = 0;
        this.angleY = 0;
    }

    lock() {
        this.lockX = this.x;
        this.lockY = this.y;
        this.angleX = Math.PI * 2 * Math.random();
        this.angleY = Math.PI * 2 * Math.random();
    }

    draw() {
        if (!idle || this.index <= sineDots) {
            gsap.set(this.element, { x: this.x, y: this.y });
        } else {
            this.angleX += ANGLE_SPEED;
            this.angleY += ANGLE_SPEED;
            this.y = this.lockY + Math.sin(this.angleY) * this.range;
            this.x = this.lockX + Math.sin(this.angleX) * this.range;
            gsap.set(this.element, { x: this.x, y: this.y });
        }
    }
}

// Optimized event handlers with passive listeners
const onMouseMove = (event) => {
    mousePosition.x = event.clientX - WIDTH_HALF;
    mousePosition.y = event.clientY - WIDTH_HALF;
    resetIdleTimer();
};

const onTouchMove = (event) => {
    if (event.touches.length > 0) {
        mousePosition.x = event.touches[0].clientX - WIDTH_HALF;
        mousePosition.y = event.touches[0].clientY - WIDTH_HALF;
        resetIdleTimer();
    }
};

function init() {
    // Use passive listeners for better performance
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    
    lastFrame = performance.now(); // More accurate than new Date()
    buildDots();
    render();
}

function startIdleTimer() {
    timeoutID = setTimeout(goInactive, idleTimeout);
    idle = false;
}

function resetIdleTimer() {
    clearTimeout(timeoutID);
    startIdleTimer();
}

function goInactive() {
    idle = true;
    // Use for loop for better performance
    for (let i = 0; i < dots.length; i++) {
        dots[i].lock();
    }
}

function buildDots() {
    // Pre-allocate array
    dots = new Array(amount);
    for (let i = 0; i < amount; i++) {
        dots[i] = new Dot(i);
    }
}

const render = (timestamp) => {
    positionCursor();
    lastFrame = timestamp;
    requestAnimationFrame(render);
};

const positionCursor = () => {
    let x = mousePosition.x;
    let y = mousePosition.y;
    
    // Cache frequently accessed values
    const isIdle = idle;
    const sineDotsLimit = sineDots;
    
    for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const nextDot = dots[i + 1] || dots[0];
        
        dot.x = x;
        dot.y = y;
        dot.draw();
        
        if (!isIdle || i <= sineDotsLimit) {
            // Inline calculations for better performance
            x += (nextDot.x - dot.x) * FOLLOW_FACTOR;
            y += (nextDot.y - dot.y) * FOLLOW_FACTOR;
        }
    }
};

init();