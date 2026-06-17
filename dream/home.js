function dreamFitCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  const changed = canvas.width !== w || canvas.height !== h;
  if (changed) {
    canvas.width = w;
    canvas.height = h;
  }
  return { w, h, dpr, rect, changed };
}

function dreamWatchCanvas(canvas, onResize) {
  const tick = function () {
    onResize();
  };
  tick();
  const ro = new ResizeObserver(tick);
  ro.observe(canvas);
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  if (document.readyState === "complete") tick();
  else window.addEventListener("load", tick, { once: true });
  return ro;
}

/* Hero sky starfield — full canvas, looping forward travel */
(function () {
  const BASE = {
    density: 1,
    threshold: 0.01,
    pointSize: 2.5,
    depth: 1,
    zoom: 1.3,
    moveX: 0,
    moveY: 0,
    rotateX: 0,
    rotateZ: 0,
    perspective: 1.45
  };

  const SKY_URL =
    "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a258a0380eb9363715e4a36_Sky.avif";

  const STAR_TRAVEL = {
    speedStart: 0.105,
    speedEnd: 0.02625,
    rampSec: 10,
    range: 1.85
  };

  const IDLE = {
    tiltDeg: 2.2,
    drift: 0.014,
    speed: 0.65
  };

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load " + url));
      img.src = url;
    });
  }

  let skyImagePromise = null;

  function loadSkyImage() {
    if (!skyImagePromise) skyImagePromise = loadImage(SKY_URL);
    return skyImagePromise;
  }

  function initHeroSkyStarfield(canvas) {
  if (!canvas) return;
  if (canvas.__heroSkyInit) return;
  canvas.__heroSkyInit = true;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
  if (!gl) {
    console.error("WebGL not supported");
    return;
  }

  let W = 1;
  let H = 1;
  let lastFrameTime = performance.now();
  let globalTime = 0;
  let starTravel = 0;

  const panel = {
    ...BASE,
    url: SKY_URL,
    rotateY: 0,
    buffer: null,
    particleCount: 0,
    imgW: 1,
    imgH: 1,
    idleRotateX: 0,
    idleRotateY: 0,
    idleMoveX: 0,
    idleMoveY: 0,
    phase: 0
  };

  const VS = `
    precision highp float;

    attribute vec2 a_pos;
    attribute vec3 a_col;
    attribute float a_bri;
    varying vec3 v_col;

    uniform vec2 u_res;
    uniform vec2 u_img;
    uniform float u_pointSize;
    uniform float u_depth;
    uniform float u_zoom;
    uniform float u_moveX;
    uniform float u_moveY;
    uniform float u_rotateX;
    uniform float u_rotateY;
    uniform float u_rotateZ;
    uniform float u_perspective;
    uniform float u_travel;
    uniform float u_travelRange;

    mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
    mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0,s, 0,1,0, -s,0,c); }
    mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0, s,c,0, 0,0,1); }

    void main(){
      vec2 uv = a_pos / u_img;
      vec2 xy = vec2(uv.x - 0.5, 0.5 - uv.y) * vec2(u_img.x / u_img.y, 1.0);
      float aspect = u_res.x / u_res.y;

      float zDepth = (a_bri - 0.5) * u_depth;
      float z = mod(zDepth + u_travel, u_travelRange) - u_travelRange * 0.5;

      vec3 p = vec3(xy, z);
      p = rotZ(radians(u_rotateZ)) * rotY(radians(u_rotateY)) * rotX(radians(u_rotateX)) * p;
      p *= u_zoom;

      float persp = u_perspective / max(0.25, u_perspective - p.z);
      vec2 clip = (p.xy * persp) / vec2(aspect, 1.0) * 2.0 + vec2(u_moveX, u_moveY);

      gl_Position = vec4(clip, 0.0, 1.0);
      gl_PointSize = u_pointSize * persp;
      v_col = a_col;
    }
  `;

  const FS = `
    precision mediump float;
    varying vec3 v_col;
    void main(){
      vec2 p = gl_PointCoord - 0.5;
      if (dot(p, p) > 0.25) discard;
      gl_FragColor = vec4(v_col, 1.0);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "Shader compile failed");
    }
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VS));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }

  const uni = (name) => gl.getUniformLocation(program, name);

  function coverZoom(imgW, imgH, viewW, viewH) {
    const imgAspect = imgW / imgH;
    const viewAspect = viewW / viewH;
    if (viewAspect > imgAspect) {
      return panel.zoom * (viewAspect / imgAspect);
    }
    return panel.zoom;
  }

  function buildParticles(img) {
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    panel.imgW = imgW;
    panel.imgH = imgH;

    const c = document.createElement("canvas");
    c.width = imgW;
    c.height = imgH;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, imgW, imgH);
    const data = ctx.getImageData(0, 0, imgW, imgH).data;

    const arr = [];
    const step = Math.max(1, Math.floor(panel.density));

    for (let y = 0; y < imgH; y += step) {
      for (let x = 0; x < imgW; x += step) {
        const i = (y * imgW + x) * 4;
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        const a = data[i + 3] / 255;
        const bri = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
        if (a > 0.04 && bri >= panel.threshold) {
          arr.push(x, y, r, g, b, bri);
        }
      }
    }

    panel.particleCount = arr.length / 6;
    panel.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, panel.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
  }

  let drawZoom = panel.zoom;

  function resize() {
    const size = dreamFitCanvas(canvas);
    if (!size.changed && W === size.w && H === size.h) return;
    W = size.w;
    H = size.h;
    gl.viewport(0, 0, W, H);
    drawZoom = coverZoom(panel.imgW, panel.imgH, W, H);
  }

  function draw() {
    if (!panel.buffer || panel.particleCount === 0) return;
    const stride = 6 * 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, panel.buffer);

    const pos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, stride, 0);

    const col = gl.getAttribLocation(program, "a_col");
    gl.enableVertexAttribArray(col);
    gl.vertexAttribPointer(col, 3, gl.FLOAT, false, stride, 2 * 4);

    const bri = gl.getAttribLocation(program, "a_bri");
    gl.enableVertexAttribArray(bri);
    gl.vertexAttribPointer(bri, 1, gl.FLOAT, false, stride, 5 * 4);

    gl.uniform2f(uni("u_res"), W, H);
    gl.uniform2f(uni("u_img"), panel.imgW, panel.imgH);
    gl.uniform1f(uni("u_pointSize"), panel.pointSize);
    gl.uniform1f(uni("u_depth"), panel.depth);

    gl.uniform1f(uni("u_zoom"), drawZoom);
    gl.uniform1f(uni("u_moveX"), panel.moveX + panel.idleMoveX);
    gl.uniform1f(uni("u_moveY"), panel.moveY + panel.idleMoveY);
    gl.uniform1f(uni("u_rotateX"), panel.rotateX + panel.idleRotateX);
    gl.uniform1f(uni("u_rotateY"), panel.rotateY + panel.idleRotateY);
    gl.uniform1f(uni("u_rotateZ"), panel.rotateZ);
    gl.uniform1f(uni("u_perspective"), panel.perspective);

    gl.uniform1f(uni("u_travel"), starTravel);
    gl.uniform1f(uni("u_travelRange"), STAR_TRAVEL.range);

    gl.drawArrays(gl.POINTS, 0, panel.particleCount);
  }

  function render() {
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    draw();
  }

  function getTravelSpeed(t) {
    const ramp = Math.min(1, t / STAR_TRAVEL.rampSec);
    const ease = 1 - Math.pow(1 - ramp, 3);
    return STAR_TRAVEL.speedStart + (STAR_TRAVEL.speedEnd - STAR_TRAVEL.speedStart) * ease;
  }

  function animate(now) {
    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    globalTime += dt;
    starTravel = (starTravel + dt * getTravelSpeed(globalTime)) % STAR_TRAVEL.range;

    const t = globalTime * IDLE.speed + panel.phase;

    panel.idleRotateX = Math.sin(t * 1.05) * IDLE.tiltDeg;
    panel.idleRotateY = Math.cos(t * 0.82) * IDLE.tiltDeg;
    panel.idleMoveX = Math.sin(t * 0.58) * IDLE.drift;
    panel.idleMoveY = Math.cos(t * 0.71) * IDLE.drift;

    render();
    requestAnimationFrame(animate);
  }

  loadSkyImage()
    .then((img) => {
      buildParticles(img);
      resize();
      render();
      requestAnimationFrame(animate);
    })
    .catch(console.error);

  dreamWatchCanvas(canvas, render);
  }

  function bootHeroSkyStarfield() {
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const seen = new Set();
    const hero = document.getElementById("hero");
    if (hero) {
      initHeroSkyStarfield(hero);
      seen.add(hero);
    }
    document.querySelectorAll(".starfield-canvas").forEach(function (node) {
      if (!seen.has(node)) initHeroSkyStarfield(node);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootHeroSkyStarfield);
  } else {
    bootHeroSkyStarfield();
  }
})();

/* CTA point cloud */
(function () {
  if (!window.matchMedia("(min-width: 768px)").matches) return;

  const BASE = {
    density: 1,
    threshold: 0.05,
    pointSize: 1.5,
    depth: 0.74,
    hoverRadius: 0.96,
    hoverSoftness: 0.55,
    hoverStrength: 1.0,
    hoverEase: 0.12,
    zoom: 0.7,
    moveX: 0,
    moveY: 0,
    rotateX: 0,
    rotateZ: 0,
    perspective: 1.04,
    hoverTrailEnabled: true,
    hoverTrailHex: "#8A0015",
    hoverTrailOpacity: 0.7,
    hoverTrailRadius: 1.0,
    hoverTrailDecay: 0.6,
    hoverTrailBlendMode: "add"
  };

  const CTA = {
    url: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a257c80f5d99b0739a7c57d_092657a0a2abf371908c88bc0d50256d_cta-new.avif",
    spinYPeriodSec: 25
  };

  function hexToRgb01(hex) {
    const clean = String(hex || "#000000").replace("#", "");
    const num = parseInt(clean, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  function getHoverTrailBlendModeCode(mode) {
    switch (mode) {
      case "mix": return 1;
      case "screen": return 2;
      case "multiply": return 3;
      case "overlay": return 4;
      default: return 0;
    }
  }

  function initCtaPointCloud(canvas, cfg) {
  if (!canvas) return;
  if (canvas.__legacyPcInit) return;
  canvas.__legacyPcInit = true;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, preserveDrawingBuffer: true });
  if (!gl) {
    console.error("WebGL not supported");
    return;
  }

  let W = 1;
  let H = 1;
  let lastFrameTime = performance.now();
  let globalTime = 0;

  const panel = {
    ...BASE,
    layoutX: 0,
    layoutScale: 1,
    buffer: null,
    particleCount: 0,
    imgW: 1,
    imgH: 1,
    hoverX: 0,
    hoverY: 0,
    hoverActive: 0,
    targetHoverX: 0,
    targetHoverY: 0,
    targetHoverActive: 0,
    spinRotateY: 0
  };

  let paintTexture = null;
  let trailCanvas = null;
  let trailCtx = null;
  let trailTexture = null;
  let trailW = 1;
  let trailH = 1;
  let trailDirty = false;
  let hoverU = 0.5;
  let hoverV = 0.5;

  const VS = `
    precision highp float;

    attribute vec2 a_pos;
    attribute vec3 a_col;
    attribute float a_bri;
    attribute vec2 a_uv;
    varying vec3 v_col;

    uniform vec2 u_res;
    uniform vec2 u_img;
    uniform float u_pointSize;
    uniform float u_depth;

    uniform float u_hoverX;
    uniform float u_hoverY;
    uniform float u_hoverActive;
    uniform float u_hoverRadius;
    uniform float u_hoverSoftness;
    uniform float u_hoverStrength;

    uniform float u_zoom;
    uniform float u_moveX;
    uniform float u_moveY;
    uniform float u_rotateX;
    uniform float u_rotateY;
    uniform float u_rotateZ;
    uniform float u_perspective;

    uniform float u_layoutX;
    uniform float u_layoutScale;

    uniform sampler2D u_paintTex;
    uniform sampler2D u_trailTex;
    uniform float u_trailBlendMode;

    mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
    mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0,s, 0,1,0, -s,0,c); }
    mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0, s,c,0, 0,0,1); }
    vec3 blendScreen(vec3 base, vec3 blend){ return 1.0 - (1.0 - base) * (1.0 - blend); }
    vec3 blendOverlay(vec3 base, vec3 blend){
      return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
    }
    vec3 applyTrailBlend(vec3 baseCol, vec4 trail, float mode){
      vec3 tint = clamp(trail.rgb, 0.0, 1.0);
      float a = clamp(trail.a, 0.0, 1.0);
      if (mode < 0.5) return clamp(baseCol + tint * a, 0.0, 1.0);
      else if (mode < 1.5) return clamp(mix(baseCol, tint, a), 0.0, 1.0);
      else if (mode < 2.5) return clamp(mix(baseCol, blendScreen(baseCol, tint), a), 0.0, 1.0);
      else if (mode < 3.5) return clamp(mix(baseCol, baseCol * tint, a), 0.0, 1.0);
      else return clamp(mix(baseCol, blendOverlay(baseCol, tint), a), 0.0, 1.0);
    }

    void main(){
      vec2 uv = a_pos / u_img;
      vec2 xy = vec2(uv.x - 0.5, 0.5 - uv.y) * vec2(u_img.x / u_img.y, 1.0);
      float aspect = u_res.x / u_res.y;

      vec2 flatClip = (xy * u_zoom) / vec2(aspect, 1.0) * 2.0 + vec2(u_moveX, u_moveY);

      float distToMouse = distance(flatClip, vec2(u_hoverX, u_hoverY));
      float innerRadius = max(0.0, u_hoverRadius - u_hoverSoftness);
      float hoverMask = 1.0 - smoothstep(innerRadius, u_hoverRadius, distToMouse);
      hoverMask = hoverMask * hoverMask * (3.0 - 2.0 * hoverMask);
      hoverMask *= u_hoverActive;

      float depthAmount = 1.0 - hoverMask * u_hoverStrength;
      float z = (a_bri - 0.5) * u_depth * depthAmount;

      vec3 p = vec3(xy, z);
      p = rotZ(radians(u_rotateZ)) * rotY(radians(u_rotateY)) * rotX(radians(u_rotateX)) * p;
      p *= u_zoom;

      float persp = u_perspective / max(0.25, u_perspective - p.z);
      vec2 clipLocal = (p.xy * persp) / vec2(aspect, 1.0) * 2.0 + vec2(u_moveX, u_moveY);
      vec2 clip = vec2(clipLocal.x * u_layoutScale + u_layoutX, clipLocal.y);

      gl_Position = vec4(clip, 0.0, 1.0);
      gl_PointSize = u_pointSize * persp;
      vec4 paint = texture2D(u_paintTex, a_uv);
      vec3 baseCol = clamp(mix(a_col, paint.rgb, paint.a), 0.0, 1.0);
      vec4 trail = texture2D(u_trailTex, a_uv);
      v_col = applyTrailBlend(baseCol, trail, u_trailBlendMode);
    }
  `;

  const FS = `
    precision mediump float;
    varying vec3 v_col;
    void main(){
      vec2 p = gl_PointCoord - 0.5;
      if (dot(p, p) > 0.25) discard;
      gl_FragColor = vec4(v_col, 1.0);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "Shader compile failed");
    }
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VS));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }

  const uni = (name) => gl.getUniformLocation(program, name);

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load " + url));
      img.src = url;
    });
  }

  function buildParticles(img) {
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    panel.imgW = imgW;
    panel.imgH = imgH;

    const c = document.createElement("canvas");
    c.width = imgW;
    c.height = imgH;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, imgW, imgH);
    const data = ctx.getImageData(0, 0, imgW, imgH).data;

    const arr = [];
    const step = Math.max(1, Math.floor(panel.density));

    for (let y = 0; y < imgH; y += step) {
      for (let x = 0; x < imgW; x += step) {
        const i = (y * imgW + x) * 4;
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        const a = data[i + 3] / 255;
        const bri = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
        if (a > 0.04 && bri >= panel.threshold) {
          arr.push(x, y, r, g, b, bri, x / imgW, y / imgH);
        }
      }
    }

    panel.particleCount = arr.length / 8;
    panel.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, panel.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
    setupPaintTexture();
    setupTrailTexture();
  }

  function setupPaintTexture() {
    const paintBuffer = new Uint8Array(panel.imgW * panel.imgH * 4);
    paintTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, paintTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      panel.imgW,
      panel.imgH,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      paintBuffer
    );
  }

  function setupTrailTexture() {
    const maxDim = 1024;
    const scale = Math.min(1, maxDim / Math.max(1, Math.max(panel.imgW, panel.imgH)));
    trailW = Math.max(1, Math.round(panel.imgW * scale));
    trailH = Math.max(1, Math.round(panel.imgH * scale));
    trailCanvas = document.createElement("canvas");
    trailCanvas.width = trailW;
    trailCanvas.height = trailH;
    trailCtx = trailCanvas.getContext("2d");
    trailCtx.clearRect(0, 0, trailW, trailH);
    trailTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, trailTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    uploadTrailTexture(true);
  }

  function uploadTrailTexture(force) {
    if (!trailTexture || !trailCanvas) return;
    if (!trailDirty && !force) return;
    gl.bindTexture(gl.TEXTURE_2D, trailTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trailCanvas);
    trailDirty = false;
  }

  function fadeTrail(dt) {
    if (!trailCtx || !panel.hoverTrailEnabled) return;
    const decayPerFrame = Math.max(0, Math.min(0.99, panel.hoverTrailDecay));
    const k = 1 - Math.pow(1 - decayPerFrame, dt * 60);
    if (k <= 0) return;
    trailCtx.save();
    trailCtx.globalCompositeOperation = "destination-out";
    trailCtx.fillStyle = "rgba(0,0,0," + k + ")";
    trailCtx.fillRect(0, 0, trailW, trailH);
    trailCtx.restore();
    trailDirty = true;
  }

  function depositTrail() {
    if (!trailCtx || !panel.hoverTrailEnabled) return;
    if (panel.hoverActive <= 0.001) return;
    const rgb = hexToRgb01(panel.hoverTrailHex).map((v) => Math.round(v * 255));
    const alpha = Math.max(0, Math.min(1, panel.hoverTrailOpacity)) * panel.hoverActive;
    if (alpha <= 0.001) return;
    const aspect = W / H;
    const duPerClip = aspect / (2 * panel.zoom) / (panel.imgW / panel.imgH);
    const dvPerClip = 1 / (2 * panel.zoom);
    const pxPerClipX = Math.abs(duPerClip) * trailW;
    const pxPerClipY = Math.abs(dvPerClip) * trailH;
    const baseRadiusPx = panel.hoverRadius * Math.min(pxPerClipX, pxPerClipY);
    const radiusPx = Math.max(1, Math.round(baseRadiusPx * panel.hoverTrailRadius));
    const x = hoverU * trailW;
    const y = hoverV * trailH;
    trailCtx.save();
    trailCtx.globalCompositeOperation = "source-over";
    const grad = trailCtx.createRadialGradient(x, y, 0, x, y, radiusPx);
    grad.addColorStop(0, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha + ")");
    grad.addColorStop(0.35, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + (alpha * 0.6) + ")");
    grad.addColorStop(1, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0)");
    trailCtx.fillStyle = grad;
    trailCtx.beginPath();
    trailCtx.arc(x, y, radiusPx, 0, Math.PI * 2);
    trailCtx.fill();
    trailCtx.restore();
    trailDirty = true;
  }

  function updateHoverUV() {
    const aspect = W / H;
    const u = (((panel.targetHoverX - panel.moveX) / 2) * aspect / panel.zoom) / (panel.imgW / panel.imgH) + 0.5;
    const v = 0.5 - (((panel.targetHoverY - panel.moveY) / 2) / panel.zoom);
    hoverU = Math.max(0, Math.min(1, u));
    hoverV = Math.max(0, Math.min(1, v));
  }

  function resize() {
    const size = dreamFitCanvas(canvas);
    if (!size.changed && W === size.w && H === size.h) return;
    W = size.w;
    H = size.h;
    gl.viewport(0, 0, W, H);
  }

  function draw() {
    if (!panel.buffer || panel.particleCount === 0) return;
    const panelW = W * panel.layoutScale;
    const stride = 8 * 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, panel.buffer);

    const pos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, stride, 0);

    const col = gl.getAttribLocation(program, "a_col");
    gl.enableVertexAttribArray(col);
    gl.vertexAttribPointer(col, 3, gl.FLOAT, false, stride, 2 * 4);

    const bri = gl.getAttribLocation(program, "a_bri");
    gl.enableVertexAttribArray(bri);
    gl.vertexAttribPointer(bri, 1, gl.FLOAT, false, stride, 5 * 4);

    const uvAttr = gl.getAttribLocation(program, "a_uv");
    gl.enableVertexAttribArray(uvAttr);
    gl.vertexAttribPointer(uvAttr, 2, gl.FLOAT, false, stride, 6 * 4);

    gl.uniform2f(uni("u_res"), panelW, H);
    gl.uniform2f(uni("u_img"), panel.imgW, panel.imgH);
    gl.uniform1f(uni("u_pointSize"), panel.pointSize);
    gl.uniform1f(uni("u_depth"), panel.depth);

    gl.uniform1f(uni("u_hoverX"), panel.hoverX);
    gl.uniform1f(uni("u_hoverY"), panel.hoverY);
    gl.uniform1f(uni("u_hoverActive"), panel.hoverActive);
    gl.uniform1f(uni("u_hoverRadius"), panel.hoverRadius);
    gl.uniform1f(uni("u_hoverSoftness"), panel.hoverSoftness);
    gl.uniform1f(uni("u_hoverStrength"), panel.hoverStrength);

    gl.uniform1f(uni("u_zoom"), panel.zoom);
    gl.uniform1f(uni("u_moveX"), panel.moveX);
    gl.uniform1f(uni("u_moveY"), panel.moveY);
    gl.uniform1f(uni("u_rotateX"), panel.rotateX);
    gl.uniform1f(uni("u_rotateY"), panel.spinRotateY);
    gl.uniform1f(uni("u_rotateZ"), panel.rotateZ);
    gl.uniform1f(uni("u_perspective"), panel.perspective);

    gl.uniform1f(uni("u_layoutX"), panel.layoutX);
    gl.uniform1f(uni("u_layoutScale"), panel.layoutScale);

    gl.uniform1f(uni("u_trailBlendMode"), getHoverTrailBlendModeCode(panel.hoverTrailBlendMode));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, paintTexture);
    gl.uniform1i(uni("u_paintTex"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, trailTexture);
    gl.uniform1i(uni("u_trailTex"), 1);

    gl.drawArrays(gl.POINTS, 0, panel.particleCount);
  }

  function render() {
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    draw();
  }

  function easeInOut01(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  function animate(now) {
    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    globalTime += dt;

    const ease = easeInOut01(panel.hoverEase);
    const follow = 1 - Math.pow(1 - ease, dt * 60);

    panel.spinRotateY = (globalTime * 360 / cfg.spinYPeriodSec) % 360;
    panel.hoverX += (panel.targetHoverX - panel.hoverX) * follow;
    panel.hoverY += (panel.targetHoverY - panel.hoverY) * follow;
    panel.hoverActive += (panel.targetHoverActive - panel.hoverActive) * follow;

    fadeTrail(dt);
    depositTrail();
    uploadTrailTexture(false);

    render();
    requestAnimationFrame(animate);
  }

  function updateFromPointer(e) {
    const rect = canvas.getBoundingClientRect();
    panel.targetHoverX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    panel.targetHoverY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    panel.targetHoverActive = 1;
    updateHoverUV();
  }

  function clearTargets() {
    panel.targetHoverActive = 0;
  }

  canvas.addEventListener("pointerdown", updateFromPointer);
  canvas.addEventListener("pointermove", updateFromPointer);
  canvas.addEventListener("pointerleave", clearTargets);
  canvas.addEventListener("pointerup", clearTargets);
  canvas.addEventListener("pointercancel", clearTargets);

  loadImage(cfg.url)
    .then((img) => {
      buildParticles(img);
      resize();
      render();
      requestAnimationFrame(animate);
    })
    .catch(console.error);

  dreamWatchCanvas(canvas, render);
  }

  initCtaPointCloud(document.getElementById("cta"), CTA);
})();

/* Tool-color point cloud (engine, ship) */
(function () {
  if (!window.matchMedia("(min-width: 768px)").matches) return;

  const PARAMS = {
    density: 1,
    threshold: 0.3,
    pointSize: 0.6,
    depth: 2,
    hoverRadius: 0.96,
    hoverSoftness: 0.55,
    hoverStrength: 1.0,
    hoverEase: 0.12,
    zoom: 0.5,
    moveX: 0,
    moveY: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    perspective: 1.04,
    hoverTrailEnabled: true,
    hoverTrailHex: "#8A0015",
    hoverTrailOpacity: 0.7,
    hoverTrailRadius: 1.0,
    hoverTrailDecay: 0.6,
    hoverTrailBlendMode: "add"
  };

  const IDLE = {
    depthPulse: 0.1,
    speed: 0.45
  };

  const PANELS = [
    {
      id: "engine",
      url: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a27293bbf44bbaadf348116_723edc1c9cc4c4795b2cb39718ada458_rocket.avif",
      rotateX: 0,
      rotateY: 15,
      threshold: 0.5,
      zoom: 0.6
    },
    {
      id: "ship",
      url: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a25716d6cf1e9b343dc94e3_cta.avif",
      rotateY: -10,
      threshold: 0.3,
      filterIsolatedSpecks: true
    }
  ];

  function hexToRgb01(hex) {
    const clean = String(hex || "#000000").replace("#", "");
    const num = parseInt(clean, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  function getHoverTrailBlendModeCode(mode) {
    switch (mode) {
      case "mix": return 1;
      case "screen": return 2;
      case "multiply": return 3;
      case "overlay": return 4;
      default: return 0;
    }
  }

  function initToolColorPanel(canvas, cfg) {
    if (!canvas || canvas.__toolColorPcInit) return;
    canvas.__toolColorPcInit = true;

    const panel = { ...PARAMS, ...cfg };
    const imageUrl = cfg.url;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: true
    });
    if (!gl) return;

    let W = 1;
    let H = 1;
    let imgW = 1;
    let imgH = 1;
    let particles = null;
    let particleCount = 0;
    let paintTexture = null;
    let trailCanvas = null;
    let trailCtx = null;
    let trailTexture = null;
    let trailW = 1;
    let trailH = 1;
    let trailDirty = false;
    let hoverX = 0;
    let hoverY = 0;
    let hoverActive = 0;
    let targetHoverX = 0;
    let targetHoverY = 0;
    let targetHoverActive = 0;
    let hoverU = 0.5;
    let hoverV = 0.5;
    let lastFrameTime = performance.now();
    let globalTime = 0;
    let idleDepth = panel.depth;
    const phase = Math.random() * Math.PI * 2;

    function shader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s) || "Shader compile failed");
      }
      return s;
    }

    function program(vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(p) || "Program link failed");
      }
      return p;
    }

    const pointProgram = program(
      `
precision highp float;
attribute vec2 a_pos;
attribute vec3 a_col;
attribute float a_bri;
attribute vec2 a_uv;
varying vec3 v_col;
uniform vec2 u_res;
uniform vec2 u_img;
uniform float u_pointSize;
uniform float u_depth;
uniform float u_hoverX;
uniform float u_hoverY;
uniform float u_hoverActive;
uniform float u_hoverRadius;
uniform float u_hoverSoftness;
uniform float u_hoverStrength;
uniform float u_zoom;
uniform float u_moveX;
uniform float u_moveY;
uniform float u_rotateX;
uniform float u_rotateY;
uniform float u_rotateZ;
uniform float u_perspective;
uniform sampler2D u_paintTex;
uniform sampler2D u_trailTex;
uniform float u_trailBlendMode;
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0,s, 0,1,0, -s,0,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0, s,c,0, 0,0,1); }
vec3 blendScreen(vec3 base, vec3 blend){ return 1.0 - (1.0 - base) * (1.0 - blend); }
vec3 blendOverlay(vec3 base, vec3 blend){
  return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
}
vec3 applyTrailBlend(vec3 baseCol, vec4 trail, float mode){
  vec3 tint = clamp(trail.rgb, 0.0, 1.0);
  float a = clamp(trail.a, 0.0, 1.0);
  if (mode < 0.5) return clamp(baseCol + tint * a, 0.0, 1.0);
  else if (mode < 1.5) return clamp(mix(baseCol, tint, a), 0.0, 1.0);
  else if (mode < 2.5) return clamp(mix(baseCol, blendScreen(baseCol, tint), a), 0.0, 1.0);
  else if (mode < 3.5) return clamp(mix(baseCol, baseCol * tint, a), 0.0, 1.0);
  else return clamp(mix(baseCol, blendOverlay(baseCol, tint), a), 0.0, 1.0);
}
void main(){
  vec2 uv = a_pos / u_img;
  vec2 xy = vec2(uv.x - 0.5, 0.5 - uv.y) * vec2(u_img.x / u_img.y, 1.0);
  float aspect = u_res.x / u_res.y;
  vec2 flatClip = (xy * u_zoom) / vec2(aspect, 1.0) * 2.0 + vec2(u_moveX, u_moveY);
  float distToMouse = distance(flatClip, vec2(u_hoverX, u_hoverY));
  float innerRadius = max(0.0, u_hoverRadius - u_hoverSoftness);
  float hoverMask = 1.0 - smoothstep(innerRadius, u_hoverRadius, distToMouse);
  hoverMask = hoverMask * hoverMask * (3.0 - 2.0 * hoverMask);
  hoverMask *= u_hoverActive;
  float depthAmount = 1.0 - hoverMask * u_hoverStrength;
  float z = (a_bri - 0.5) * u_depth * depthAmount;
  vec3 p = vec3(xy, z);
  p = rotZ(radians(u_rotateZ)) * rotY(radians(u_rotateY)) * rotX(radians(u_rotateX)) * p;
  p *= u_zoom;
  float persp = u_perspective / max(0.25, u_perspective - p.z);
  vec2 clip = (p.xy * persp) / vec2(aspect, 1.0) * 2.0 + vec2(u_moveX, u_moveY);
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = u_pointSize * persp;
  vec4 paint = texture2D(u_paintTex, a_uv);
  vec3 baseCol = clamp(mix(a_col, paint.rgb, paint.a), 0.0, 1.0);
  vec4 trail = texture2D(u_trailTex, a_uv);
  v_col = applyTrailBlend(baseCol, trail, u_trailBlendMode);
}
`,
      `
precision mediump float;
varying vec3 v_col;
void main(){
  vec2 p = gl_PointCoord - 0.5;
  if (dot(p, p) > 0.25) discard;
  gl_FragColor = vec4(v_col, 1.0);
}
`
    );

    function resize() {
      const size = dreamFitCanvas(canvas);
      W = size.w;
      H = size.h;
      if (size.changed) gl.viewport(0, 0, W, H);
    }

    function setupPaintTexture() {
      const paintBuffer = new Uint8Array(imgW * imgH * 4);
      paintTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        imgW,
        imgH,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        paintBuffer
      );
    }

    function setupTrailTexture() {
      const maxDim = 1024;
      const scale = Math.min(1, maxDim / Math.max(1, Math.max(imgW, imgH)));
      trailW = Math.max(1, Math.round(imgW * scale));
      trailH = Math.max(1, Math.round(imgH * scale));
      trailCanvas = document.createElement("canvas");
      trailCanvas.width = trailW;
      trailCanvas.height = trailH;
      trailCtx = trailCanvas.getContext("2d");
      trailCtx.clearRect(0, 0, trailW, trailH);
      trailTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      uploadTrailTexture(true);
    }

    function uploadTrailTexture(force) {
      if (!trailTexture || !trailCanvas) return;
      if (!trailDirty && !force) return;
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trailCanvas);
      trailDirty = false;
    }

    function fadeTrail(dt) {
      if (!trailCtx || !panel.hoverTrailEnabled) return;
      const decayPerFrame = Math.max(0, Math.min(0.99, panel.hoverTrailDecay));
      const k = 1 - Math.pow(1 - decayPerFrame, dt * 60);
      if (k <= 0) return;
      trailCtx.save();
      trailCtx.globalCompositeOperation = "destination-out";
      trailCtx.fillStyle = "rgba(0,0,0," + k + ")";
      trailCtx.fillRect(0, 0, trailW, trailH);
      trailCtx.restore();
      trailDirty = true;
    }

    function depositTrail() {
      if (!trailCtx || !panel.hoverTrailEnabled) return;
      if (hoverActive <= 0.001) return;
      const rgb = hexToRgb01(panel.hoverTrailHex).map(function (v) {
        return Math.round(v * 255);
      });
      const alpha = Math.max(0, Math.min(1, panel.hoverTrailOpacity)) * hoverActive;
      if (alpha <= 0.001) return;
      const aspect = W / H;
      const duPerClip = aspect / (2 * panel.zoom) / (imgW / imgH);
      const dvPerClip = 1 / (2 * panel.zoom);
      const pxPerClipX = Math.abs(duPerClip) * trailW;
      const pxPerClipY = Math.abs(dvPerClip) * trailH;
      const baseRadiusPx = panel.hoverRadius * Math.min(pxPerClipX, pxPerClipY);
      const radiusPx = Math.max(1, Math.round(baseRadiusPx * panel.hoverTrailRadius));
      const x = hoverU * trailW;
      const y = hoverV * trailH;
      trailCtx.save();
      trailCtx.globalCompositeOperation = "source-over";
      const grad = trailCtx.createRadialGradient(x, y, 0, x, y, radiusPx);
      grad.addColorStop(0, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha + ")");
      grad.addColorStop(0.35, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + (alpha * 0.6) + ")");
      grad.addColorStop(1, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0)");
      trailCtx.fillStyle = grad;
      trailCtx.beginPath();
      trailCtx.arc(x, y, radiusPx, 0, Math.PI * 2);
      trailCtx.fill();
      trailCtx.restore();
      trailDirty = true;
    }

    function buildParticles(source) {
      imgW = source.naturalWidth || source.width;
      imgH = source.naturalHeight || source.height;
      const c = document.createElement("canvas");
      c.width = imgW;
      c.height = imgH;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(source, 0, 0, imgW, imgH);
      const data = ctx.getImageData(0, 0, imgW, imgH).data;
      const arr = [];
      const step = Math.max(1, Math.floor(panel.density));
      const candidates = [];
      for (let y = 0; y < imgH; y += step) {
        for (let x = 0; x < imgW; x += step) {
          const i = (y * imgW + x) * 4;
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const a = data[i + 3] / 255;
          const bri = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
          if (a > 0.05 && bri >= panel.threshold) {
            candidates.push({ x, y, r, g, b, bri });
          }
        }
      }

      const passSet = new Set(candidates.map(function (c) {
        return c.y * imgW + c.x;
      }));
      const minNeighbors = panel.filterIsolatedSpecks ? 2 : 0;

      for (const c of candidates) {
        if (minNeighbors > 0) {
          let neighbors = 0;
          for (let dy = -step; dy <= step; dy += step) {
            for (let dx = -step; dx <= step; dx += step) {
              if (!dx && !dy) continue;
              if (passSet.has((c.y + dy) * imgW + (c.x + dx))) neighbors++;
            }
          }
          if (neighbors < minNeighbors) continue;
        }
        arr.push(c.x, c.y, c.r, c.g, c.b, c.bri, c.x / imgW, c.y / imgH);
      }
      particleCount = arr.length / 8;
      particles = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, particles);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
      setupPaintTexture();
      setupTrailTexture();
    }

    function drawPoints() {
      if (!particles || particleCount === 0) return;
      gl.useProgram(pointProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, particles);
      const stride = 8 * 4;
      const pos = gl.getAttribLocation(pointProgram, "a_pos");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, stride, 0);
      const col = gl.getAttribLocation(pointProgram, "a_col");
      gl.enableVertexAttribArray(col);
      gl.vertexAttribPointer(col, 3, gl.FLOAT, false, stride, 2 * 4);
      const bri = gl.getAttribLocation(pointProgram, "a_bri");
      gl.enableVertexAttribArray(bri);
      gl.vertexAttribPointer(bri, 1, gl.FLOAT, false, stride, 5 * 4);
      const uvAttr = gl.getAttribLocation(pointProgram, "a_uv");
      gl.enableVertexAttribArray(uvAttr);
      gl.vertexAttribPointer(uvAttr, 2, gl.FLOAT, false, stride, 6 * 4);
      const uni = function (n) {
        return gl.getUniformLocation(pointProgram, n);
      };
      gl.uniform2f(uni("u_res"), W, H);
      gl.uniform2f(uni("u_img"), imgW, imgH);
      gl.uniform1f(uni("u_pointSize"), panel.pointSize);
      gl.uniform1f(uni("u_depth"), idleDepth);
      gl.uniform1f(uni("u_hoverX"), hoverX);
      gl.uniform1f(uni("u_hoverY"), hoverY);
      gl.uniform1f(uni("u_hoverActive"), hoverActive);
      gl.uniform1f(uni("u_hoverRadius"), panel.hoverRadius);
      gl.uniform1f(uni("u_hoverSoftness"), panel.hoverSoftness);
      gl.uniform1f(uni("u_hoverStrength"), panel.hoverStrength);
      gl.uniform1f(uni("u_zoom"), panel.zoom);
      gl.uniform1f(uni("u_moveX"), panel.moveX);
      gl.uniform1f(uni("u_moveY"), panel.moveY);
      gl.uniform1f(uni("u_rotateX"), panel.rotateX);
      gl.uniform1f(uni("u_rotateY"), panel.rotateY);
      gl.uniform1f(uni("u_rotateZ"), panel.rotateZ);
      gl.uniform1f(uni("u_perspective"), panel.perspective);
      gl.uniform1f(uni("u_trailBlendMode"), getHoverTrailBlendModeCode(panel.hoverTrailBlendMode));
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);
      gl.uniform1i(uni("u_paintTex"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);
      gl.uniform1i(uni("u_trailTex"), 1);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.POINTS, 0, particleCount);
    }

    function render() {
      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      drawPoints();
    }

    function easeInOut01(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * (3 - 2 * t);
    }

    function updateHoverUV() {
      const aspect = W / H;
      const u = (((targetHoverX - panel.moveX) / 2) * aspect / panel.zoom) / (imgW / imgH) + 0.5;
      const v = 0.5 - (((targetHoverY - panel.moveY) / 2) / panel.zoom);
      hoverU = Math.max(0, Math.min(1, u));
      hoverV = Math.max(0, Math.min(1, v));
    }

    function loop(now) {
      const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;
      const ease = easeInOut01(panel.hoverEase);
      const follow = 1 - Math.pow(1 - ease, dt * 60);
      hoverX += (targetHoverX - hoverX) * follow;
      hoverY += (targetHoverY - hoverY) * follow;
      hoverActive += (targetHoverActive - hoverActive) * follow;
      globalTime += dt;
      const idleMix = 1 - hoverActive;
      const t = globalTime * IDLE.speed + phase;
      idleDepth = panel.depth * (1 + Math.sin(t) * IDLE.depthPulse * idleMix);
      fadeTrail(dt);
      depositTrail();
      uploadTrailTexture(false);
      render();
      requestAnimationFrame(loop);
    }

    canvas.addEventListener("pointermove", function (e) {
      const rect = canvas.getBoundingClientRect();
      targetHoverX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetHoverY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
      targetHoverActive = 1;
      updateHoverUV();
    });
    canvas.addEventListener("pointerdown", function (e) {
      const rect = canvas.getBoundingClientRect();
      targetHoverX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetHoverY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
      targetHoverActive = 1;
      updateHoverUV();
    });
    canvas.addEventListener("pointerleave", function () {
      targetHoverActive = 0;
    });
    canvas.addEventListener("pointerup", function () {
      targetHoverActive = 0;
    });

    dreamWatchCanvas(canvas, render);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      buildParticles(img);
      render();
      requestAnimationFrame(loop);
    };
    img.onerror = function () {
      console.error("ToolColorPointCloud: failed to load", imageUrl);
    };
    img.src = imageUrl;
  }

  for (const cfg of PANELS) {
    initToolColorPanel(document.getElementById(cfg.id), cfg);
  }
})();

/* Figures point cloud (olama, ursula, eric, wong, modi) */
(function (global) {
  if (global.FiguresPointCloud) {
    global.FiguresPointCloud.initAll();
    return;
  }

  const PARAMS = {
    density: 1,
    threshold: 0.3,
    pointSize: 1.5,
    depth: 0.74,
    hoverRadius: 0.92,
    hoverSoftness: 0.55,
    hoverStrength: 1.0,
    hoverEase: 0.12,
    zoom: 0.7,
    moveX: 0,
    moveY: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    perspective: 1.04,
    focusU: 0.527,
    focusV: 0.28,
    centerFocusRadius: 0.6,
    centerFocusSoftness: 0.35,
    centerFocusStrength: 1.0,
    hoverTrailEnabled: true,
    hoverTrailHex: "#8A0015",
    hoverTrailOpacity: 0.7,
    hoverTrailRadius: 1.0,
    hoverTrailDecay: 0.6,
    hoverTrailBlendMode: "add"
  };

  const IDLE = {
    tiltDeg: 1.0,
    drift: 0.006,
    speed: 0.55
  };

  const FIGURES = [
    {
      id: "olama",
      image: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a2700b2408e60322e1a3df3_olama.avif"
    },
    {
      id: "ursula",
      image: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a2700b2e9046210ac27c7a1_ursula.avif"
    },
    {
      id: "eric",
      image: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a2700b204627659a64b1b32_eric.avif"
    },
    {
      id: "wong",
      image: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a1c777055af9680ca6b278b_wong.avif"
    },
    {
      id: "modi",
      image: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a1c776f0e4017306f06426b_modi.avif"
    }
  ];

  function hexToRgb01(hex) {
    const clean = String(hex || "#000000").replace("#", "");
    const num = parseInt(clean, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  function getHoverTrailBlendModeCode(mode) {
    switch (mode) {
      case "mix": return 1;
      case "screen": return 2;
      case "multiply": return 3;
      case "overlay": return 4;
      default: return 0;
    }
  }

  function initFigure(canvas, imageSrc, figureCfg) {
    if (!canvas || canvas.__figuresPcInit) return;
    canvas.__figuresPcInit = true;

    const cfg = figureCfg || {};
    const num = (v, fallback) => (v !== undefined && !Number.isNaN(v) ? v : fallback);
    const dsNum = (key, fallback) => {
      const v = parseFloat(canvas.dataset[key]);
      return num(Number.isNaN(v) ? undefined : v, fallback);
    };
    const focusU = num(parseFloat(canvas.dataset.focusU), num(cfg.focusU, PARAMS.focusU));
    const focusV = num(parseFloat(canvas.dataset.focusV), num(cfg.focusV, PARAMS.focusV));
    const centerFocusRadius = dsNum("centerFocusRadius", num(cfg.centerFocusRadius, PARAMS.centerFocusRadius));
    const centerFocusSoftness = dsNum("centerFocusSoftness", num(cfg.centerFocusSoftness, PARAMS.centerFocusSoftness));
    const centerFocusStrength = dsNum("centerFocusStrength", num(cfg.centerFocusStrength, PARAMS.centerFocusStrength));

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: true
    });
    if (!gl) return;

    let W = 1;
    let H = 1;
    let imgW = 1;
    let imgH = 1;
    let particles = null;
    let particleCount = 0;
    let paintTexture = null;
    let trailCanvas = null;
    let trailCtx = null;
    let trailTexture = null;
    let trailW = 1;
    let trailH = 1;
    let trailDirty = false;
    let hoverX = 0;
    let hoverY = 0;
    let hoverActive = 0;
    let targetHoverX = 0;
    let targetHoverY = 0;
    let targetHoverActive = 0;
    let hoverU = 0.5;
    let hoverV = 0.5;
    let lastFrameTime = performance.now();
    let rafId = 0;
    let focusX = 0;
    let focusY = 0;
    let globalTime = 0;
    const phase = Math.random() * Math.PI * 2;
    let idleRotateX = 0;
    let idleRotateY = 0;
    let idleMoveX = 0;
    let idleMoveY = 0;

    function updateFocusClip() {
      if (!imgW || !imgH || !W || !H) return;
      const xyX = (focusU - 0.5) * (imgW / imgH);
      const xyY = 0.5 - focusV;
      const aspect = W / H;
      focusX = (xyX * PARAMS.zoom) / aspect * 2 + PARAMS.moveX + idleMoveX;
      focusY = xyY * PARAMS.zoom * 2 + PARAMS.moveY + idleMoveY;
    }

    function shader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s) || "Shader compile failed");
      }
      return s;
    }

    function program(vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(p) || "Program link failed");
      }
      return p;
    }

    const pointProgram = program(
      `
precision highp float;
attribute vec2 a_pos;
attribute vec3 a_col;
attribute float a_bri;
attribute vec2 a_uv;
varying vec3 v_col;
uniform vec2 u_res;
uniform vec2 u_img;
uniform float u_pointSize;
uniform float u_depth;
uniform float u_hoverX;
uniform float u_hoverY;
uniform float u_hoverActive;
uniform float u_hoverRadius;
uniform float u_hoverSoftness;
uniform float u_hoverStrength;
uniform float u_focusX;
uniform float u_focusY;
uniform float u_centerFocusRadius;
uniform float u_centerFocusSoftness;
uniform float u_centerFocusStrength;
uniform float u_zoom;
uniform float u_moveX;
uniform float u_moveY;
uniform float u_rotateX;
uniform float u_rotateY;
uniform float u_rotateZ;
uniform float u_perspective;
uniform sampler2D u_paintTex;
uniform sampler2D u_trailTex;
uniform float u_trailBlendMode;
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0,s, 0,1,0, -s,0,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0, s,c,0, 0,0,1); }
vec3 blendScreen(vec3 base, vec3 blend){ return 1.0 - (1.0 - base) * (1.0 - blend); }
vec3 blendOverlay(vec3 base, vec3 blend){
  return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
}
vec3 applyTrailBlend(vec3 baseCol, vec4 trail, float mode){
  vec3 tint = clamp(trail.rgb, 0.0, 1.0);
  float a = clamp(trail.a, 0.0, 1.0);
  if (mode < 0.5) return clamp(baseCol + tint * a, 0.0, 1.0);
  else if (mode < 1.5) return clamp(mix(baseCol, tint, a), 0.0, 1.0);
  else if (mode < 2.5) return clamp(mix(baseCol, blendScreen(baseCol, tint), a), 0.0, 1.0);
  else if (mode < 3.5) return clamp(mix(baseCol, baseCol * tint, a), 0.0, 1.0);
  else return clamp(mix(baseCol, blendOverlay(baseCol, tint), a), 0.0, 1.0);
}
float focusMask(vec2 pt, vec2 center, float radius, float softness){
  float inner = max(0.0, radius - softness);
  float m = 1.0 - smoothstep(inner, radius, distance(pt, center));
  return m * m * (3.0 - 2.0 * m);
}
void main(){
  vec2 uv = a_pos / u_img;
  vec2 xy = vec2(uv.x - 0.5, 0.5 - uv.y) * vec2(u_img.x / u_img.y, 1.0);
  float aspect = u_res.x / u_res.y;
  vec2 flatClip = (xy * u_zoom) / vec2(aspect, 1.0) * 2.0 + vec2(u_moveX, u_moveY);
  float hoverFocus = focusMask(flatClip, vec2(u_hoverX, u_hoverY), u_hoverRadius, u_hoverSoftness) * u_hoverActive;
  float centerFocus = focusMask(flatClip, vec2(u_focusX, u_focusY), u_centerFocusRadius, u_centerFocusSoftness) * u_centerFocusStrength;
  float focus = max(hoverFocus, centerFocus);
  float depthAmount = 1.0 - focus * u_hoverStrength;
  float z = (a_bri - 0.5) * u_depth * depthAmount;
  vec3 p = vec3(xy, z);
  p = rotZ(radians(u_rotateZ)) * rotY(radians(u_rotateY)) * rotX(radians(u_rotateX)) * p;
  p *= u_zoom;
  float persp = u_perspective / max(0.25, u_perspective - p.z);
  vec2 clip = (p.xy * persp) / vec2(aspect, 1.0) * 2.0 + vec2(u_moveX, u_moveY);
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = u_pointSize * persp;
  vec4 paint = texture2D(u_paintTex, a_uv);
  vec3 baseCol = clamp(mix(a_col, paint.rgb, paint.a), 0.0, 1.0);
  vec4 trail = texture2D(u_trailTex, a_uv);
  v_col = applyTrailBlend(baseCol, trail, u_trailBlendMode);
}
`,
      `
precision mediump float;
varying vec3 v_col;
void main(){
  vec2 p = gl_PointCoord - 0.5;
  if (dot(p, p) > 0.25) discard;
  gl_FragColor = vec4(v_col, 1.0);
}
`
    );

    function resize() {
      const size = dreamFitCanvas(canvas);
      W = size.w;
      H = size.h;
      if (size.changed) gl.viewport(0, 0, W, H);
      updateFocusClip();
    }

    function setupPaintTexture() {
      const paintBuffer = new Uint8Array(imgW * imgH * 4);
      paintTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        imgW,
        imgH,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        paintBuffer
      );
    }

    function setupTrailTexture() {
      const maxDim = 1024;
      const scale = Math.min(1, maxDim / Math.max(1, Math.max(imgW, imgH)));
      trailW = Math.max(1, Math.round(imgW * scale));
      trailH = Math.max(1, Math.round(imgH * scale));
      trailCanvas = document.createElement("canvas");
      trailCanvas.width = trailW;
      trailCanvas.height = trailH;
      trailCtx = trailCanvas.getContext("2d");
      trailCtx.clearRect(0, 0, trailW, trailH);
      trailTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      uploadTrailTexture(true);
    }

    function uploadTrailTexture(force) {
      if (!trailTexture || !trailCanvas) return;
      if (!trailDirty && !force) return;
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trailCanvas);
      trailDirty = false;
    }

    function fadeTrail(dt) {
      if (!trailCtx || !PARAMS.hoverTrailEnabled) return;
      const decayPerFrame = Math.max(0, Math.min(0.99, PARAMS.hoverTrailDecay));
      const k = 1 - Math.pow(1 - decayPerFrame, dt * 60);
      if (k <= 0) return;
      trailCtx.save();
      trailCtx.globalCompositeOperation = "destination-out";
      trailCtx.fillStyle = "rgba(0,0,0," + k + ")";
      trailCtx.fillRect(0, 0, trailW, trailH);
      trailCtx.restore();
      trailDirty = true;
    }

    function depositTrail() {
      if (!trailCtx || !PARAMS.hoverTrailEnabled) return;
      if (hoverActive <= 0.001) return;
      const rgb = hexToRgb01(PARAMS.hoverTrailHex).map((v) => Math.round(v * 255));
      const alpha = Math.max(0, Math.min(1, PARAMS.hoverTrailOpacity)) * hoverActive;
      if (alpha <= 0.001) return;
      const aspect = W / H;
      const duPerClip = aspect / (2 * PARAMS.zoom) / (imgW / imgH);
      const dvPerClip = 1 / (2 * PARAMS.zoom);
      const pxPerClipX = Math.abs(duPerClip) * trailW;
      const pxPerClipY = Math.abs(dvPerClip) * trailH;
      const baseRadiusPx = PARAMS.hoverRadius * Math.min(pxPerClipX, pxPerClipY);
      const radiusPx = Math.max(1, Math.round(baseRadiusPx * PARAMS.hoverTrailRadius));
      const x = hoverU * trailW;
      const y = hoverV * trailH;
      trailCtx.save();
      trailCtx.globalCompositeOperation = "source-over";
      const grad = trailCtx.createRadialGradient(x, y, 0, x, y, radiusPx);
      grad.addColorStop(0, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha + ")");
      grad.addColorStop(0.35, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + (alpha * 0.6) + ")");
      grad.addColorStop(1, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0)");
      trailCtx.fillStyle = grad;
      trailCtx.beginPath();
      trailCtx.arc(x, y, radiusPx, 0, Math.PI * 2);
      trailCtx.fill();
      trailCtx.restore();
      trailDirty = true;
    }

    function updateHoverUV() {
      const aspect = W / H;
      const moveX = PARAMS.moveX + idleMoveX;
      const moveY = PARAMS.moveY + idleMoveY;
      const u = (((targetHoverX - moveX) / 2) * aspect / PARAMS.zoom) / (imgW / imgH) + 0.5;
      const v = 0.5 - (((targetHoverY - moveY) / 2) / PARAMS.zoom);
      hoverU = Math.max(0, Math.min(1, u));
      hoverV = Math.max(0, Math.min(1, v));
    }

    function buildParticles(source) {
      imgW = source.naturalWidth || source.width;
      imgH = source.naturalHeight || source.height;
      const c = document.createElement("canvas");
      c.width = imgW;
      c.height = imgH;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(source, 0, 0, imgW, imgH);
      const data = ctx.getImageData(0, 0, imgW, imgH).data;
      const arr = [];
      const step = Math.max(1, Math.floor(PARAMS.density));
      for (let y = 0; y < imgH; y += step) {
        for (let x = 0; x < imgW; x += step) {
          const i = (y * imgW + x) * 4;
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const a = data[i + 3] / 255;
          const bri = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
          if (a > 0.05 && bri >= PARAMS.threshold) {
            arr.push(x, y, r, g, b, bri, x / imgW, y / imgH);
          }
        }
      }
      particleCount = arr.length / 8;
      particles = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, particles);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
      setupPaintTexture();
      setupTrailTexture();
      updateFocusClip();
    }

    function drawPoints() {
      if (!particles || particleCount === 0) return;
      gl.useProgram(pointProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, particles);
      const stride = 8 * 4;
      const pos = gl.getAttribLocation(pointProgram, "a_pos");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, stride, 0);
      const col = gl.getAttribLocation(pointProgram, "a_col");
      gl.enableVertexAttribArray(col);
      gl.vertexAttribPointer(col, 3, gl.FLOAT, false, stride, 2 * 4);
      const bri = gl.getAttribLocation(pointProgram, "a_bri");
      gl.enableVertexAttribArray(bri);
      gl.vertexAttribPointer(bri, 1, gl.FLOAT, false, stride, 5 * 4);
      const uvAttr = gl.getAttribLocation(pointProgram, "a_uv");
      gl.enableVertexAttribArray(uvAttr);
      gl.vertexAttribPointer(uvAttr, 2, gl.FLOAT, false, stride, 6 * 4);
      const uni = (n) => gl.getUniformLocation(pointProgram, n);
      gl.uniform2f(uni("u_res"), W, H);
      gl.uniform2f(uni("u_img"), imgW, imgH);
      gl.uniform1f(uni("u_pointSize"), PARAMS.pointSize);
      gl.uniform1f(uni("u_depth"), PARAMS.depth);
      gl.uniform1f(uni("u_hoverX"), hoverX);
      gl.uniform1f(uni("u_hoverY"), hoverY);
      gl.uniform1f(uni("u_hoverActive"), hoverActive);
      gl.uniform1f(uni("u_hoverRadius"), PARAMS.hoverRadius);
      gl.uniform1f(uni("u_hoverSoftness"), PARAMS.hoverSoftness);
      gl.uniform1f(uni("u_hoverStrength"), PARAMS.hoverStrength);
      gl.uniform1f(uni("u_focusX"), focusX);
      gl.uniform1f(uni("u_focusY"), focusY);
      gl.uniform1f(uni("u_centerFocusRadius"), centerFocusRadius);
      gl.uniform1f(uni("u_centerFocusSoftness"), centerFocusSoftness);
      gl.uniform1f(uni("u_centerFocusStrength"), centerFocusStrength);
      gl.uniform1f(uni("u_zoom"), PARAMS.zoom);
      gl.uniform1f(uni("u_moveX"), PARAMS.moveX + idleMoveX);
      gl.uniform1f(uni("u_moveY"), PARAMS.moveY + idleMoveY);
      gl.uniform1f(uni("u_rotateX"), PARAMS.rotateX + idleRotateX);
      gl.uniform1f(uni("u_rotateY"), PARAMS.rotateY + idleRotateY);
      gl.uniform1f(uni("u_rotateZ"), PARAMS.rotateZ);
      gl.uniform1f(uni("u_perspective"), PARAMS.perspective);
      gl.uniform1f(uni("u_trailBlendMode"), getHoverTrailBlendModeCode(PARAMS.hoverTrailBlendMode));
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);
      gl.uniform1i(uni("u_paintTex"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);
      gl.uniform1i(uni("u_trailTex"), 1);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.POINTS, 0, particleCount);
    }

    function render() {
      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      drawPoints();
    }

    function easeInOut01(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * (3 - 2 * t);
    }

    function loop(now) {
      const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;
      globalTime += dt;

      const ease = easeInOut01(PARAMS.hoverEase);
      const follow = 1 - Math.pow(1 - ease, dt * 60);
      hoverX += (targetHoverX - hoverX) * follow;
      hoverY += (targetHoverY - hoverY) * follow;
      hoverActive += (targetHoverActive - hoverActive) * follow;

      const idleMix = 1 - hoverActive;
      const t = globalTime * IDLE.speed + phase;
      idleRotateX = Math.sin(t * 1.05) * IDLE.tiltDeg * idleMix;
      idleRotateY = Math.cos(t * 0.82) * IDLE.tiltDeg * idleMix;
      idleMoveX = Math.sin(t * 0.58) * IDLE.drift * idleMix;
      idleMoveY = Math.cos(t * 0.71) * IDLE.drift * idleMix;
      updateFocusClip();
      fadeTrail(dt);
      depositTrail();
      uploadTrailTexture(false);

      render();
      rafId = requestAnimationFrame(loop);
    }

    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      targetHoverX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetHoverY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
      targetHoverActive = 1;
      updateHoverUV();
    });
    canvas.addEventListener("pointerdown", (e) => {
      const rect = canvas.getBoundingClientRect();
      targetHoverX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetHoverY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
      targetHoverActive = 1;
      updateHoverUV();
    });
    canvas.addEventListener("pointerleave", () => {
      targetHoverActive = 0;
    });
    canvas.addEventListener("pointerup", () => {
      targetHoverActive = 0;
    });

    dreamWatchCanvas(canvas, render);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      buildParticles(img);
      render();
      cancelAnimationFrame(rafId);
      requestAnimationFrame(loop);
    };
    img.onerror = () => console.error("FiguresPointCloud: failed to load", imageSrc);
    img.src = imageSrc;
  }

  function initAll() {
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    for (const cfg of FIGURES) {
      const canvas = document.getElementById(cfg.id);
      if (canvas) initFigure(canvas, cfg.image, cfg);
    }
    document.querySelectorAll("canvas[data-figures-image]").forEach((canvas) => {
      const image = canvas.dataset.figuresImage;
      if (image) initFigure(canvas, image, {});
    });
  }

  global.FiguresPointCloud = {
    PARAMS,
    IDLE,
    FIGURES,
    init: initFigure,
    initAll
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})(window);

/* Playideo on active tab) */
$(".system_tabs-link").on("click", function () {
  var tn = $(this).attr("tn");
  $(".system_tabs-video video").each(function () {
    $(this).get(0).pause();
    $(this).get(0).currentTime = 0;
  });
  $("#bg-video-" + tn + " video").get(0).play();
});

/* Marquee slider — disabled for now
document.addEventListener('DOMContentLoaded', () => {
  const SLIDE_DURATION  = 12;
  const TWEEN_DUR       = 0.7;
  const RESUME_DELAY    = 2000;

  function initSlider(container) {
    const track = container.querySelector('.swiper-wrapper');
    if (!track) return;

    track.querySelectorAll('.swiper-slide-duplicate').forEach(el => el.remove());
    track.removeAttribute('style');
    container.style.overflow = 'visible';
    gsap.set(track, { display: 'flex' });

    const slides = Array.from(track.children);
    if (!slides.length) return;
    const slideW = slides[0].offsetWidth;
    const totalW = slideW * slides.length;
    slides.forEach(s => track.appendChild(s.cloneNode(true)));

    const pagination = container.querySelector('.swiper-pagination');
    if (pagination) {
      slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('swiper-pagination-bullet');
        if (i === 0) dot.classList.add('swiper-pagination-bullet-active');
        dot.addEventListener('click', () => goToIndex(i));
        pagination.appendChild(dot);
      });
    }

    function updateDots() {
      if (!pagination) return;
      const index = Math.round((-x % totalW + totalW) % totalW / slideW) % slides.length;
      pagination.querySelectorAll('.swiper-pagination-bullet').forEach((dot, i) => {
        dot.classList.toggle('swiper-pagination-bullet-active', i === index);
      });
    }

    let x           = 0;
    let paused      = false;
    let resumeTimer = null;

    gsap.ticker.add((time, deltaTime) => {
      if (paused) return;
      const speed = slideW / SLIDE_DURATION;
      x -= (speed * deltaTime) / 1000;
      if (x <= -totalW) x += totalW;
      gsap.set(track, { x });
      updateDots();
    });

    function tweenTo(targetX, onDone) {
      const proxy = { val: x };
      gsap.killTweensOf(proxy);
      gsap.to(proxy, {
        val: targetX,
        duration: TWEEN_DUR,
        ease: 'power2.out',
        onUpdate() {
          x = proxy.val;
          gsap.set(track, { x });
          updateDots();
        },
        onComplete() {
          while (x <= -totalW) x += totalW;
          while (x > 0)        x -= totalW;
          gsap.set(track, { x });
          if (onDone) onDone();
        }
      });
    }

    function afterMove() {
      resumeTimer = setTimeout(() => { paused = false; }, RESUME_DELAY);
    }

    function goToIndex(index) {
      paused = true;
      clearTimeout(resumeTimer);
      const targetNegX  = index * slideW;
      const currentNegX = -x;
      let delta = targetNegX - currentNegX;
      if (delta >  totalW / 2) delta -= totalW;
      if (delta < -totalW / 2) delta += totalW;
      tweenTo(-(currentNegX + delta), afterMove);
    }

    initSlideVideoHover(container);
  }

  function initSlideVideoHover(container) {
    const slides = container.querySelectorAll('.swiper-slide');
    slides.forEach(function (slide) {
      const video = slide.querySelector('video');
      if (!video || slide.__videoHoverInit) return;
      slide.__videoHoverInit = true;

      video.loop = false;
      video.pause();
      video.currentTime = 0;

      video.addEventListener('ended', function () {
        video.pause();
        video.currentTime = 0;
      });

      slide.addEventListener('mouseenter', function () {
        container.querySelectorAll('.swiper-slide video').forEach(function (v) {
          if (v !== video) {
            v.pause();
            v.currentTime = 0;
          }
        });
        video.currentTime = 0;
        video.play().catch(function () {});
      });
    });
  }

  document.querySelectorAll('.swiper').forEach(initSlider);
});
*/

document.addEventListener('DOMContentLoaded', function () {
  const COLOR_HERO_INITIAL = '#0d142b';
  const COLOR_HERO_DARK    = '#ffffff';

  const heroEls = document.querySelectorAll('.hero_banner-heading');
  const darkSections = document.querySelectorAll('[data-color="dark"]');

  function isOverDark(el) {
    const r = el.getBoundingClientRect();
    const line = r.top + r.height / 2;
    for (let i = 0; i < darkSections.length; i++) {
      const rect = darkSections[i].getBoundingClientRect();
      if (rect.top <= line && rect.bottom >= line) return true;
    }
    return false;
  }

  function update() {
    heroEls.forEach(function (el) {
      el.style.color = isOverDark(el) ? COLOR_HERO_DARK : COLOR_HERO_INITIAL;
    });
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () { update(); ticking = false; });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);

  update();
});

/* Play videos on hover — card inner wrappers */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.ai_inner-large, .ai_inner-small').forEach(function (inner) {
    const videos = inner.querySelectorAll('video');
    if (!videos.length || inner.__videoHoverInit) return;
    inner.__videoHoverInit = true;

    videos.forEach(function (video) {
      video.loop = false;
      video.autoplay = false;
      video.pause();
    });

    inner.addEventListener('mouseenter', function () {
      document.querySelectorAll('.ai_inner-large video, .ai_inner-small video').forEach(function (v) {
        if (!inner.contains(v)) {
          v.pause();
          v.loop = false;
        }
      });
      videos.forEach(function (video) {
        video.loop = true;
        video.play().catch(function () {});
      });
    });

    inner.addEventListener('mouseleave', function () {
      videos.forEach(function (video) {
        video.loop = false;
      });
    });
  });
});
