//hero
const textEl = document.querySelector('[wb-data="text"]');
const splitText = new SplitType(textEl, { types: "lines" });
gsap.set(textEl, { autoAlpha: 1 });
gsap.from(splitText.lines, {
    autoAlpha: 0,
    lineHeight: "3em",
    duration: 1.5
});

//images
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const links = [...document.querySelectorAll('.project_item')];

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

let imgIndex = 0;
const images = [
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/66ec4eac5f629c4d9039b98a_vocai.avif',
    'https://uploads-ssl.webflow.com/60f007b4ffba6aa104bcca7c/653927b984b0ce3e4fb60d0e_ss.webp',
    'https://uploads-ssl.webflow.com/60f007b4ffba6aa104bcca7c/65392a1b7e50ad39963dc626_rs.webp',
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/66dac944c9fd3bbdefaf0feb_coastal.avif',
    'https://uploads-ssl.webflow.com/60f007b4ffba6aa104bcca7c/64c3f384562524d89fe25ed6_bn.webp',
    'https://uploads-ssl.webflow.com/60f007b4ffba6aa104bcca7c/64c3f384fcdee9a3a646734c_fq.webp',
    'https://uploads-ssl.webflow.com/60f007b4ffba6aa104bcca7c/64c3f384562524d89fe25e89_ct.webp',
    'https://uploads-ssl.webflow.com/60f007b4ffba6aa104bcca7c/64c3f384562524d89fe25e94_rc.webp',
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/66ec5059a9c617332c05a46b_amiti.avif',
]

let imgArr = [];
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;

})
images.forEach((image, idx) => {
    let elImage = new Image(300);
    elImage.src = image;
    elImage.classList.add('project-image');
    document.body.append(elImage);
    imgArr.push(elImage)
})
let percent = 0.001;
let target = 0;

function drawImage(idx) {
    let { width, height } = imgArr[idx].getBoundingClientRect();

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    if (target === 1) {
        if (percent < 0.2) {
            percent += .01;
        } else if (percent < 1) {
            percent += .1;
        }
    } else if (target === 0) {
        if (percent > 0.2) {
            percent -= .3
        } else if (percent > 0) {
            percent -= .01;
        }
    }

    let scaledWidth = width * percent;
    let scaledHeight = height * percent;

    if (percent >= 1) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.drawImage(imgArr[idx], 0, 0, width, height);
    } else {
        ctx.drawImage(imgArr[idx], 0, 0, scaledWidth, scaledHeight);
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        if (canvas.width !== 0 && canvas.height !== 0) {
            ctx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height)
        }
    }
}

for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('mouseover', () => {
        for (let j = 0; j < links.length; j++) {
            if (j !== i) {
                links[j].style.opacity = 0.2;
                links[j].style.zIndex = 0;
            } else {
                links[j].style.opacity = 1;
                links[j].style.zIndex = 3;
            }
        }
    })

    links[i].addEventListener('mouseleave', () => {
        for (let i = 0; i < links.length; i++) {
            links[i].style.opacity = 1;
        }
    })

    links[i].addEventListener('mouseenter', () => {
        imgIndex = i;
        target = 1
    });

    links[i].addEventListener('mouseleave', () => {
        target = 0;
    })
}

function animate() {
    currentX = lerp(currentX, targetX, 0.075);
    currentY = lerp(currentY, targetY, 0.075);
    let { width, height } = imgArr[imgIndex].getBoundingClientRect();
    canvas.style.transform = `translate3d(${currentX - (width / 2)}px, ${currentY - (height / 2)}px, 0)`;
    drawImage(imgIndex);
    window.requestAnimationFrame(animate);
}

animate()

//Cursor
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
let hoverButton;
let hoverTL;

class Dot {
    constructor(index = 0) {
        this.index = index;
        this.anglespeed = 0.05;
        this.x = 0;
        this.y = 0;
        this.scale = 1 - 0.05 * index;
        this.range = width / 2 - (width / 2) * this.scale + 2;
        this.limit = width * 0.75 * this.scale;
        this.element = document.createElement("span");
        TweenMax.set(this.element, { scale: this.scale });
        cursor.appendChild(this.element);
    }
    lock() {
        this.lockX = this.x;
        this.lockY = this.y;
        this.angleX = Math.PI * 2 * Math.random();
        this.angleY = Math.PI * 2 * Math.random();
    }

    draw(delta) {
        if (!idle || this.index <= sineDots) {
            TweenMax.set(this.element, { x: this.x, y: this.y });
        } else {
            this.angleX += this.anglespeed;
            this.angleY += this.anglespeed;
            this.y = this.lockY + Math.sin(this.angleY) * this.range;
            this.x = this.lockX + Math.sin(this.angleX) * this.range;
            TweenMax.set(this.element, { x: this.x, y: this.y });
        }
    }
}

function init() {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    lastFrame += new Date();
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
    for (let dot of dots) {
        dot.lock();
    }
}

function buildDots() {
    for (let i = 0; i < amount; i++) {
        let dot = new Dot(i);
        dots.push(dot);
    }
}

const onMouseMove = (event) => {
    mousePosition.x = event.clientX - width / 2;
    mousePosition.y = event.clientY - width / 2;
    resetIdleTimer();
};

const onTouchMove = () => {
    mousePosition.x = event.touches[0].clientX - width / 2;
    mousePosition.y = event.touches[0].clientY - width / 2;
    resetIdleTimer();
};

const render = (timestamp) => {
    const delta = timestamp - lastFrame;
    positionCursor(delta);
    lastFrame = timestamp;
    requestAnimationFrame(render);
};

const positionCursor = (delta) => {
    let x = mousePosition.x;
    let y = mousePosition.y;
    dots.forEach((dot, index, dots) => {
        let nextDot = dots[index + 1] || dots[0];
        dot.x = x;
        dot.y = y;
        dot.draw(delta);
        if (!idle || index <= sineDots) {
            const dx = (nextDot.x - dot.x) * 0.35;
            const dy = (nextDot.y - dot.y) * 0.35;
            x += dx;
            y += dy;
        }
    });
};

init();

//loco
const locoScroll = new LocomotiveScroll({
    el: document.querySelector(".main-wrapper"),
    smooth: true,
    multiplier: 0.7,
});
setTimeout(() => {
    locoScroll.update();
}, 1000);