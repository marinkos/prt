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

(function () {
  const IMAGE_SRC = "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a2555fb6c87c45a3ac55f66_5f646b5ba339f85d2b8ad07c3250e8bf_train.png";

  const params = {
    density: 1,
    threshold: 0.07,
    pointSize: 1.5,
    depth: 0.9,
    hoverRadius: 1,
    hoverSoftness: 1.5,
    hoverStrength: 1,
    hoverEase: 0.2,
    zoom: 1.1,
    perspective: 2,
    hoverTrailEnabled: true,
    hoverTrailHex: "#864523",
    hoverTrailOpacity: 0.7,
    hoverTrailRadius: 1.0,
    hoverTrailDecay: 0.6,
    hoverTrailBlendMode: "add"
  };

  const MOBILE_MAX_WIDTH = 479;
  const mobileMq = window.matchMedia("(max-width: " + MOBILE_MAX_WIDTH + "px)");

  function isMobileViewport() {
    return mobileMq.matches;
  }

  function getThreshold() {
    return isMobileViewport() ? 0.12 : params.threshold;
  }

  function getDepth() {
    return isMobileViewport() ? 0.55 : params.depth;
  }

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

  const canvas = document.getElementById("footer");
  if (!canvas) return;
  if (canvas.__footerPcInit) return;
  canvas.__footerPcInit = true;

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
  let particleCount = 0;
  let buffer = null;
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
    uniform float u_fitZoom;
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

    void main() {
      vec2 uv = a_pos / u_img;
      vec2 xy = vec2(uv.x - 0.5, 0.5 - uv.y) * vec2(u_img.x / u_img.y, 1.0);
      float aspect = u_res.x / u_res.y;
      float zoom = u_zoom * u_fitZoom;
      vec2 flatClip = (xy * zoom) / vec2(aspect, 1.0) * 2.0 + vec2(u_moveX, u_moveY);

      float distToMouse = distance(flatClip, vec2(u_hoverX, u_hoverY));
      float innerRadius = max(0.0, u_hoverRadius - u_hoverSoftness);
      float hoverMask = 1.0 - smoothstep(innerRadius, u_hoverRadius, distToMouse);
      hoverMask = hoverMask * hoverMask * (3.0 - 2.0 * hoverMask);
      hoverMask *= u_hoverActive;

      float depthAmount = 1.0 - hoverMask * u_hoverStrength;
      float z = (a_bri - 0.5) * u_depth * depthAmount;

      vec3 p = vec3(xy, z);
      p = rotZ(radians(u_rotateZ)) * rotY(radians(u_rotateY)) * rotX(radians(u_rotateX)) * p;
      p *= zoom;
      float persp = u_perspective / max(0.25, u_perspective - p.z);
      vec2 clip = (p.xy * persp) / vec2(aspect, 1.0) * 2.0 + vec2(u_moveX, u_moveY);

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
    void main() {
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
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  const uni = (name) => gl.getUniformLocation(program, name);

  function getFitZoom() {
    const aspect = W / H;
    const imgAspect = imgW / imgH;
    return aspect / imgAspect;
  }

  function getEffectiveZoom() {
    return params.zoom * getFitZoom();
  }

  function resize() {
    const size = dreamFitCanvas(canvas);
    if (!size.changed && W === size.w && H === size.h) return;
    W = size.w;
    H = size.h;
    gl.viewport(0, 0, W, H);
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
    if (!trailCtx || !params.hoverTrailEnabled) return;
    const decayPerFrame = Math.max(0, Math.min(0.99, params.hoverTrailDecay));
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
    if (!trailCtx || !params.hoverTrailEnabled) return;
    if (hoverActive <= 0.001) return;
    const rgb = hexToRgb01(params.hoverTrailHex).map(function (v) {
      return Math.round(v * 255);
    });
    const alpha = Math.max(0, Math.min(1, params.hoverTrailOpacity)) * hoverActive;
    if (alpha <= 0.001) return;
    const aspect = W / H;
    const zoom = getEffectiveZoom();
    const duPerClip = aspect / (2 * zoom) / (imgW / imgH);
    const dvPerClip = 1 / (2 * zoom);
    const pxPerClipX = Math.abs(duPerClip) * trailW;
    const pxPerClipY = Math.abs(dvPerClip) * trailH;
    const baseRadiusPx = params.hoverRadius * Math.min(pxPerClipX, pxPerClipY);
    const radiusPx = Math.max(1, Math.round(baseRadiusPx * params.hoverTrailRadius));
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
    const zoom = getEffectiveZoom();
    const u = ((targetHoverX / 2) * aspect / zoom) / (imgW / imgH) + 0.5;
    const v = 0.5 - ((targetHoverY / 2) / zoom);
    hoverU = Math.max(0, Math.min(1, u));
    hoverV = Math.max(0, Math.min(1, v));
  }

  function buildParticles(img) {
    imgW = img.naturalWidth || img.width;
    imgH = img.naturalHeight || img.height;

    const c = document.createElement("canvas");
    c.width = imgW;
    c.height = imgH;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, imgW, imgH);
    const data = ctx.getImageData(0, 0, imgW, imgH).data;

    const arr = [];
    const step = Math.max(1, Math.floor(params.density));
    for (let y = 0; y < imgH; y += step) {
      for (let x = 0; x < imgW; x += step) {
        const i = (y * imgW + x) * 4;
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        const a = data[i + 3] / 255;
        const bri = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
        if (a > 0.04 && bri >= getThreshold()) {
          arr.push(x, y, r, g, b, bri, x / imgW, y / imgH);
        }
      }
    }

    particleCount = arr.length / 8;
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
    setupPaintTexture();
    setupTrailTexture();
  }

  function draw() {
    if (!buffer || particleCount === 0) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const stride = 8 * 4;
    const pos = gl.getAttribLocation(program, "a_pos");
    const col = gl.getAttribLocation(program, "a_col");
    const bri = gl.getAttribLocation(program, "a_bri");
    const uvAttr = gl.getAttribLocation(program, "a_uv");

    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(col);
    gl.vertexAttribPointer(col, 3, gl.FLOAT, false, stride, 2 * 4);
    gl.enableVertexAttribArray(bri);
    gl.vertexAttribPointer(bri, 1, gl.FLOAT, false, stride, 5 * 4);
    gl.enableVertexAttribArray(uvAttr);
    gl.vertexAttribPointer(uvAttr, 2, gl.FLOAT, false, stride, 6 * 4);

    const fitZoom = getFitZoom();

    gl.uniform2f(uni("u_res"), W, H);
    gl.uniform2f(uni("u_img"), imgW, imgH);
    gl.uniform1f(uni("u_pointSize"), params.pointSize);
    gl.uniform1f(uni("u_depth"), getDepth());
    gl.uniform1f(uni("u_hoverX"), hoverX);
    gl.uniform1f(uni("u_hoverY"), hoverY);
    gl.uniform1f(uni("u_hoverActive"), hoverActive);
    gl.uniform1f(uni("u_hoverRadius"), params.hoverRadius);
    gl.uniform1f(uni("u_hoverSoftness"), params.hoverSoftness);
    gl.uniform1f(uni("u_hoverStrength"), params.hoverStrength);
    gl.uniform1f(uni("u_zoom"), params.zoom);
    gl.uniform1f(uni("u_fitZoom"), fitZoom);
    gl.uniform1f(uni("u_moveX"), 0);
    gl.uniform1f(uni("u_moveY"), 0);
    gl.uniform1f(uni("u_rotateX"), 0);
    gl.uniform1f(uni("u_rotateY"), 0);
    gl.uniform1f(uni("u_rotateZ"), 0);
    gl.uniform1f(uni("u_perspective"), params.perspective);
    gl.uniform1f(uni("u_trailBlendMode"), getHoverTrailBlendModeCode(params.hoverTrailBlendMode));
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
    gl.clear(gl.COLOR_BUFFER_BIT);
    draw();
  }

  function easeInOut01(t) {
    const x = Math.max(0, Math.min(1, t));
    return x * x * (3.0 - 2.0 * x);
  }

  function animate(now) {
    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    const ease = easeInOut01(params.hoverEase);
    const follow = 1.0 - Math.pow(1.0 - ease, dt * 60.0);
    hoverX += (targetHoverX - hoverX) * follow;
    hoverY += (targetHoverY - hoverY) * follow;
    hoverActive += (targetHoverActive - hoverActive) * follow;

    fadeTrail(dt);
    depositTrail();
    uploadTrailTexture(false);

    render();
    requestAnimationFrame(animate);
  }

  function setHoverFromPointer(e) {
    const rect = canvas.getBoundingClientRect();
    targetHoverX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    targetHoverY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    updateHoverUV();
  }

  canvas.addEventListener("pointerdown", (e) => {
    setHoverFromPointer(e);
    targetHoverActive = 1;
  });

  canvas.addEventListener("pointermove", (e) => {
    setHoverFromPointer(e);
    targetHoverActive = 1;
  });

  canvas.addEventListener("pointerleave", () => {
    targetHoverActive = 0;
  });

  canvas.addEventListener("pointerup", () => {
    targetHoverActive = 0;
  });

  canvas.addEventListener("pointercancel", () => {
    targetHoverActive = 0;
  });

  let sourceImg = null;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    sourceImg = img;
    buildParticles(img);
    requestAnimationFrame(animate);
  };
  img.src = IMAGE_SRC;

  mobileMq.addEventListener("change", () => {
    if (sourceImg) buildParticles(sourceImg);
  });

  dreamWatchCanvas(canvas, render);
})();

document.addEventListener('DOMContentLoaded', function () {

  const NAV_SELECTOR = '.navbar';

  const COLOR_TEXT_INITIAL   = '#0d142b';
  const COLOR_TEXT_DARK      = '#ffffff';
  const COLOR_BUTTON_INITIAL = '#0d142b';
  const COLOR_BUTTON_DARK    = 'rgba(244, 247, 255, 0.08)'; // 8% of #F4F7FF

  const scope = document.querySelector(NAV_SELECTOR) || document;
  const brandEls  = scope.querySelectorAll('.nav_brand');
  const linkEls   = scope.querySelectorAll('.nav_menu_link');
  const buttonEls = scope.querySelectorAll('.button');
  const darkSections = document.querySelectorAll('[data-color="dark"]');

  // Desktop only = above Webflow's 991px tablet breakpoint
  const isDesktop = window.matchMedia('(min-width: 992px)');

  function getNavLine() {
    const ref = brandEls[0] || linkEls[0] || buttonEls[0] ||
                (scope.getBoundingClientRect ? scope : null);
    if (!ref) return 0;
    const rect = ref.getBoundingClientRect();
    return rect.top + rect.height / 2; // center of the nav element
  }

  function isOverDark() {
    const line = getNavLine();
    for (let i = 0; i < darkSections.length; i++) {
      const rect = darkSections[i].getBoundingClientRect();
      if (rect.top <= line && rect.bottom >= line) return true;
    }
    return false;
  }

  function update() {
    const onDark  = isOverDark();
    const desktop = isDesktop.matches;

    brandEls.forEach(function (el) {
      el.style.color = (onDark && desktop) ? COLOR_TEXT_DARK : COLOR_TEXT_INITIAL;
    });
    linkEls.forEach(function (el) {
      el.style.color = (onDark && desktop) ? COLOR_TEXT_DARK : COLOR_TEXT_INITIAL;
    });
    buttonEls.forEach(function (el) {
      el.style.backgroundColor = (onDark && desktop) ? COLOR_BUTTON_DARK : COLOR_BUTTON_INITIAL;
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
  if (isDesktop.addEventListener) {
    isDesktop.addEventListener('change', update);
  } else {
    isDesktop.addListener(update);
  }

  update();
});

/* Nav background + border on scroll — .nav_component (desktop) */
var Webflow = Webflow || [];
Webflow.push(function () {
  if (window.innerWidth < 992) return;

  var navSelector = '.nav_component';
  var startPct = 0.04;
  var endPct = 0.10;
  var maxBgAlpha = 0.01;
  var maxBorderAlpha = 0.10;

  var nav = document.querySelector(navSelector);
  if (!nav) return;

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function onScroll() {
    var doc = document.documentElement;
    var scrollable = (doc.scrollHeight - window.innerHeight) || 1;
    var progress = window.scrollY / scrollable;
    var t = clamp((progress - startPct) / (endPct - startPct), 0, 1);

    nav.style.backgroundColor = 'rgba(20, 26, 41, ' + (t * maxBgAlpha) + ')';
    nav.style.borderBottom = '1px solid rgba(20, 26, 41, ' + (t * maxBorderAlpha) + ')';
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', onScroll);
  onScroll();
});
