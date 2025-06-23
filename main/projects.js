// Magnetic Project Image Reveal (Canvas Version)
// Update the image URLs below to match your project order

let canvas = document.querySelector('canvas');
if (!canvas) {
  canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '10';
  document.body.appendChild(canvas);
}
const ctx = canvas.getContext('2d');
const links = [...document.querySelectorAll('.project_item')];

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

let imgIndex = 0;
const images = [
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/684445e6114beeb6006a3543_eon.avif',
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/684445e79a7da07ce4b79e9d_reflection.avif',
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/684445e6114beeb6006a3543_eon.avif',
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/684445e735b067eddebcf47e_snapscan.avif',
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/684445e7afe47c28b849fcfe_coastal.avif',
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/684445e78b85adce878637a1_flarion.avif',
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/684445e751a8b2f1e38d9588_vocai.avif'
];

let imgArr = [];
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
});

let loadedCount = 0;
images.forEach((image, idx) => {
    let elImage = new window.Image();
    elImage.src = image;
    elImage.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) {
            animate(); // Start animation only when all images are loaded
        }
    };
    imgArr.push(elImage);
});

let percent = 0.001;
let target = 0;

function drawImage(idx) {
    let width = imgArr[idx].naturalWidth;
    let height = imgArr[idx].naturalHeight;

    if (width === 0 || height === 0) return; // Don't draw if not loaded

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
    links[i].style.zIndex = 1;

    links[i].addEventListener('mouseover', () => {
        for (let j = 0; j < links.length; j++) {
            if (j !== i) {
                links[j].style.opacity = 0.2;
                links[j].style.zIndex = 1;
            } else {
                links[j].style.opacity = 1;
                links[j].style.zIndex = 20;
            }
        }
    });

    links[i].addEventListener('mouseleave', () => {
        for (let k = 0; k < links.length; k++) {
            links[k].style.opacity = 1;
            links[k].style.zIndex = 1;
        }
    });

    links[i].addEventListener('mouseenter', () => {
        imgIndex = i;
        target = 1;
    });

    links[i].addEventListener('mouseleave', () => {
        target = 0;
    });
}

function animate() {
    currentX = lerp(currentX, targetX, 0.075);
    currentY = lerp(currentY, targetY, 0.075);
    let { width, height } = imgArr[imgIndex].getBoundingClientRect();
    canvas.style.transform = `translate3d(${currentX - (width / 2)}px, ${currentY - (height / 2)}px, 0)`;
    drawImage(imgIndex);
    window.requestAnimationFrame(animate);
}
