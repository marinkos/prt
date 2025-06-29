// Magnetic Project Image Reveal (Canvas Version)
// Update the image URLs below to match your project order

let canvas = document.querySelector('canvas');
if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1000';
    // Set initial canvas width in em, height will be auto
    canvas.style.width = '18.75em';
    canvas.style.height = 'auto';
    canvas.style.display = 'none'; // Hide by default
    document.body.appendChild(canvas);
}
const ctx = canvas.getContext('2d');
const links = [...document.querySelectorAll('.project_item')];

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

let imgIndex = 0;
let isHovering = false; // Track hover state
let currentScale = 0.8; // Start scale
let targetScale = 0.8; // Target scale
const images = [
    'https://cdn.prod.website-files.com/60f007b4ffba6aa104bcca7c/684445e754aff0f5394a252a_koi.avif',
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

// Load all images and start animation only when they're all ready
let loadedImages = 0;
images.forEach((imageUrl, idx) => {
    let elImage = new Image();
    elImage.onload = () => {
        loadedImages++;
        if (loadedImages === images.length) {
            // All images loaded, start animation
            animate();
        }
    };
    // Set explicit width in em, height auto
    elImage.style.width = '18.75em';
    elImage.style.height = 'auto';
    elImage.style.objectFit = 'cover';
    elImage.classList.add('project-image');
    elImage.style.display = 'none';
    elImage.src = imageUrl; // Set src after adding onload handler
    document.body.append(elImage);
    imgArr.push(elImage);
});

let target = 0;

function drawImage(idx) {
    // Only draw if hovering
    if (!isHovering) return;
    
    // Convert em to pixels for canvas drawing
    const emToPx = parseFloat(getComputedStyle(document.body).fontSize);
    const width = 18.75 * emToPx;  // Convert em to pixels
    // Calculate height based on image's aspect ratio
    const aspectRatio = imgArr[idx].naturalHeight / imgArr[idx].naturalWidth;
    const height = width * aspectRatio;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = '18.75em';
    canvas.style.height = 'auto';

    // Enable all image smoothing for crisp images
    ctx.webkitImageSmoothingEnabled = true;
    ctx.mozImageSmoothingEnabled = true;
    ctx.msImageSmoothingEnabled = true;
    ctx.imageSmoothingEnabled = true;

    // Apply scale effect
    ctx.save();
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.translate(width / 2, height / 2);
    ctx.scale(currentScale, currentScale);
    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(imgArr[idx], 0, 0, width, height);
    ctx.restore();
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
        canvas.style.display = 'block'; // Show canvas on hover
    });

    links[i].addEventListener('mouseleave', () => {
        for (let i = 0; i < links.length; i++) {
            links[i].style.opacity = 1;
        }
        canvas.style.display = 'none'; // Hide canvas when not hovering
    });

    links[i].addEventListener('mouseenter', () => {
        imgIndex = i;
        target = 1;
        isHovering = true; // Set hover state
        targetScale = 1.0; // Scale to full size
        canvas.style.display = 'block'; // Show canvas on hover
    });

    links[i].addEventListener('mouseleave', () => {
        target = 0;
        isHovering = false; // Clear hover state
        targetScale = 0.8; // Scale back down
        canvas.style.display = 'none'; // Hide canvas when not hovering
    });
}

function animate() {
    currentX = lerp(currentX, targetX, 0.075);
    currentY = lerp(currentY, targetY, 0.075);
    currentScale = lerp(currentScale, targetScale, 0.1); // Smooth scale animation
    
    // Convert em to pixels for positioning
    const emToPx = parseFloat(getComputedStyle(document.body).fontSize);
    const width = 18.75 * emToPx;  // Convert em to pixels
    const aspectRatio = imgArr[imgIndex].naturalHeight / imgArr[imgIndex].naturalWidth;
    const height = width * aspectRatio;
    canvas.style.transform = `translate3d(${currentX - (width / 2)}px, ${currentY - (height / 2)}px, 0)`;
    drawImage(imgIndex);
    window.requestAnimationFrame(animate);
}

// Animation starts only after all images are loaded
// The animate() call is now in the onload handler above
