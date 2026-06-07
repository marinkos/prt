/* Hero point cloud (legacy triple-panel) — preserved, not active
(function () {
  const BASE = {
    density: 1,
    threshold: 0.01,
    pointSize: 2.5,
    depth: 1,
    hoverRadius: 0.92,
    hoverSoftness: 0.55,
    hoverStrength: 1.0,
    hoverEase: 0.12,
    zoom: 0.6885,
    moveX: 0,
    moveY: 0,
    rotateX: 0,
    rotateZ: 0,
    perspective: 1.45
  };

  const LAYOUT_SPREAD = 0.58;
  const LAYOUT_SCALE = 0.34;
  const MAX_MOUSE_TILT = 12;

  const IDLE = {
    tiltDeg: 2.2,
    drift: 0.014,
    speed: 0.65
  };

  const PANELS = [
    {
      key: "left",
      url: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a158cec24318a82f54f2136_left.avif",
      rotateY: 22,
      colorMode: 1
    },
    {
      key: "center",
      url: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a158ced40da4a2a0f8dc564_middle.avif",
      rotateY: 0,
      colorMode: 2
    },
    {
      key: "right",
      url: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a158ceda52a9811c888ef09_right.avif",
      rotateY: -22,
      colorMode: 3
    }
  ];

  const canvas = document.getElementById("hero");
  if (!canvas) return;
  if (canvas.__heroTripleInit) return;
  canvas.__heroTripleInit = true;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
  if (!gl) {
    console.error("WebGL not supported");
    return;
  }

  let W = 1;
  let H = 1;
  let lastFrameTime = performance.now();
  let heroGlobalTime = 0;

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
    uniform float u_colorMode;

    mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
    mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0,s, 0,1,0, -s,0,c); }
    mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0, s,c,0, 0,0,1); }

    vec3 blueColor(){ return vec3(0.0, 66.0 / 255.0, 225.0 / 255.0); }
    vec3 applyBlue(vec3 baseCol, float amt){
      return clamp(mix(baseCol, blueColor(), amt), 0.0, 1.0);
    }

    // Left: bottom-left diagonal (from reference color-left.png)
    float blueMaskLeft(vec2 uv){
      float edgeY = (uv.x < 0.05)
        ? 0.53
        : mix(0.53, 1.0, (uv.x - 0.05) / 0.85);
      float m = smoothstep(edgeY - 0.04, edgeY + 0.05, uv.y);
      return clamp(m * m * (3.0 - 2.0 * m), 0.0, 1.0);
    }

    // Center: top diagonal band (from reference color-middle.png)
    float blueMaskCenter(vec2 uv){
      float edgeY = mix(0.18, 0.50, uv.x);
      float m = 1.0 - smoothstep(edgeY - 0.05, edgeY + 0.05, uv.y);
      return clamp(m * m * (3.0 - 2.0 * m), 0.0, 1.0);
    }

    // Right: ")" curve on the left (from reference color-right.png)
    float blueMaskRight(vec2 uv){
      float spineX = 0.05 + 0.28 * sin(uv.y * 3.14159265);
      float m = smoothstep(spineX + 0.02, spineX - 0.16, uv.x);
      m *= smoothstep(0.02, 0.08, uv.y) * (1.0 - smoothstep(0.92, 0.98, uv.y));
      return clamp(m * m * (3.0 - 2.0 * m), 0.0, 1.0);
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

      vec3 col = a_col;
      if (u_colorMode > 2.5) {
        col = applyBlue(a_col, blueMaskRight(uv));
      } else if (u_colorMode > 1.5) {
        col = applyBlue(a_col, blueMaskCenter(uv));
      } else if (u_colorMode > 0.5) {
        col = applyBlue(a_col, blueMaskLeft(uv));
      }

      v_col = col;
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

  function buildParticles(panel, img) {
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

  async function setupPanel(panel) {
    const img = await loadImage(panel.url);
    buildParticles(panel, img);
  }

  const panels = PANELS.map((cfg, index) => ({
    ...BASE,
    ...cfg,
    index,
    layoutX: (index - 1) * LAYOUT_SPREAD,
    layoutScale: LAYOUT_SCALE,
    visible: true,
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
    mouseTiltX: 0,
    mouseTiltY: 0,
    targetMouseTiltX: 0,
    targetMouseTiltY: 0,
    idleRotateX: 0,
    idleRotateY: 0,
    idleMoveX: 0,
    idleMoveY: 0,
    phase: index * 2.17
  }));

  // Tablet: shrink the three panels so they don't overlap. Mobile: single centered panel.
  const TABLET_SPREAD = 0.42;
  const TABLET_SCALE = 0.24;
  const MOBILE_SCALE = 0.6;

  let lastLayoutWidth = -1;

  function applyResponsiveLayout() {
    const vw = window.innerWidth;
    if (vw === lastLayoutWidth) return;
    lastLayoutWidth = vw;

    if (vw <= 767) {
      // Mobile: only the center image, centered.
      for (const panel of panels) {
        panel.visible = panel.key === "center";
        panel.layoutX = 0;
        panel.layoutScale = MOBILE_SCALE;
      }
    } else if (vw <= 991) {
      // Tablet: all three, smaller and tighter so they don't overlap.
      for (const panel of panels) {
        panel.visible = true;
        panel.layoutX = (panel.index - 1) * TABLET_SPREAD;
        panel.layoutScale = TABLET_SCALE;
      }
    } else {
      // Desktop: default layout.
      for (const panel of panels) {
        panel.visible = true;
        panel.layoutX = (panel.index - 1) * LAYOUT_SPREAD;
        panel.layoutScale = LAYOUT_SCALE;
      }
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const newW = Math.max(1, Math.floor(rect.width * dpr));
    const newH = Math.max(1, Math.floor(rect.height * dpr));
    if (newW === W && newH === H) return;
    W = newW;
    H = newH;
    canvas.width = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
  }

  function drawPanel(panel) {
    if (!panel.visible) return;
    if (!panel.buffer || panel.particleCount === 0) return;
    const panelW = W * panel.layoutScale;
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
    gl.uniform1f(uni("u_moveX"), panel.moveX + panel.idleMoveX);
    gl.uniform1f(uni("u_moveY"), panel.moveY + panel.idleMoveY);
    gl.uniform1f(uni("u_rotateX"), panel.rotateX + panel.mouseTiltX + panel.idleRotateX);
    gl.uniform1f(uni("u_rotateY"), panel.rotateY + panel.mouseTiltY + panel.idleRotateY);
    gl.uniform1f(uni("u_rotateZ"), panel.rotateZ);
    gl.uniform1f(uni("u_perspective"), panel.perspective);

    gl.uniform1f(uni("u_layoutX"), panel.layoutX);
    gl.uniform1f(uni("u_layoutScale"), panel.layoutScale);
    gl.uniform1f(uni("u_colorMode"), panel.colorMode);

    gl.drawArrays(gl.POINTS, 0, panel.particleCount);
  }

  function render() {
    resize();
    applyResponsiveLayout();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    for (const panel of panels) drawPanel(panel);
  }

  function easeInOut01(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  function animate(now) {
    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    heroGlobalTime += dt;

    for (const panel of panels) {
      const ease = easeInOut01(panel.hoverEase);
      const follow = 1 - Math.pow(1 - ease, dt * 60);

      const idleMix = 1 - panel.hoverActive;
      const t = heroGlobalTime * IDLE.speed + panel.phase;

      panel.idleRotateX = Math.sin(t * 1.05) * IDLE.tiltDeg * idleMix;
      panel.idleRotateY = Math.cos(t * 0.82) * IDLE.tiltDeg * idleMix;
      panel.idleMoveX = Math.sin(t * 0.58) * IDLE.drift * idleMix;
      panel.idleMoveY = Math.cos(t * 0.71) * IDLE.drift * idleMix;

      panel.hoverX += (panel.targetHoverX - panel.hoverX) * follow;
      panel.hoverY += (panel.targetHoverY - panel.hoverY) * follow;
      panel.hoverActive += (panel.targetHoverActive - panel.hoverActive) * follow;
      panel.mouseTiltX += (panel.targetMouseTiltX - panel.mouseTiltX) * follow;
      panel.mouseTiltY += (panel.targetMouseTiltY - panel.mouseTiltY) * follow;
    }

    render();
    requestAnimationFrame(animate);
  }

  function panelIndexFromClipX(clipX) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < panels.length; i++) {
      if (!panels[i].visible) continue;
      const d = Math.abs(clipX - panels[i].layoutX);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  function updatePanelsFromPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const clipX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const clipY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    const idx = panelIndexFromClipX(clipX);
    const activePanel = panels[idx];
    const localX = (clipX - activePanel.layoutX) / activePanel.layoutScale;
    const localY = clipY;

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const active = i === idx;
      panel.targetHoverActive = active ? 1 : 0;
      if (active) {
        panel.targetHoverX = localX;
        panel.targetHoverY = localY;
        panel.targetHoverActive = 1;
        panel.targetMouseTiltY = localX * MAX_MOUSE_TILT;
        panel.targetMouseTiltX = -localY * MAX_MOUSE_TILT;
      } else {
        panel.targetMouseTiltX = 0;
        panel.targetMouseTiltY = 0;
      }
    }
  }

  function clearPanelTargets() {
    for (const panel of panels) {
      panel.targetHoverActive = 0;
      panel.targetMouseTiltX = 0;
      panel.targetMouseTiltY = 0;
    }
  }

  canvas.addEventListener("pointerdown", (e) => {
    updatePanelsFromPointer(e);
  });

  canvas.addEventListener("pointermove", (e) => {
    updatePanelsFromPointer(e);
  });

  canvas.addEventListener("pointerleave", () => {
    clearPanelTargets();
  });

  canvas.addEventListener("pointerup", () => {
    clearPanelTargets();
  });

  canvas.addEventListener("pointercancel", () => {
    clearPanelTargets();
  });

  Promise.all(panels.map(setupPanel))
    .then(() => {
      resize();
      render();
      requestAnimationFrame(animate);
    })
    .catch(console.error);

  new ResizeObserver(() => render()).observe(canvas);
})();
*/

/* Sky starfield — full canvas */
(function () {
  var CONFIG = {
    density: 20,
    spread: 2,
    grain: 2,
    trail: 1,
    speed: 1,
    count: 200,
    hue: 40,
    origin: 70,
    hoverAccel: 2
  };
 
  function initStarfield(canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, cx, cy, dpr;
    var stars = [];
    var accel = 1, targetAccel = 1;
    var pointerActive = false;
 
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth || canvas.offsetWidth;
      H = canvas.clientHeight || canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      cx = W / 2;
      cy = H / 2;
    }
 
    function spawn(reset) {
      var angle = Math.random() * Math.PI * 2;
      var rad = reset ? Math.random() * Math.hypot(cx, cy)
                      : CONFIG.origin + Math.random() * CONFIG.origin;
      return {
        angle: angle,
        r: rad,
        v: 0.4 + Math.random() * 1.6,
        bright: 0.5 + Math.random() * 0.5,
        hueShift: (Math.random() - 0.5) * 2
      };
    }
 
    function build() {
      stars = [];
      for (var i = 0; i < CONFIG.count; i++) stars.push(spawn(true));
    }
 
    function frame() {
      ctx.clearRect(0, 0, W, H);
      targetAccel = pointerActive ? CONFIG.hoverAccel : 1;
      accel += (targetAccel - accel) * 0.06;
 
      var maxR = Math.hypot(W, H) * 0.62;
 
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.r += s.v * CONFIG.speed * accel;
        var nx = cx + Math.cos(s.angle) * s.r;
        var ny = cy + Math.sin(s.angle) * s.r;
 
        if (s.r > maxR || nx < -20 || nx > W + 20 || ny < -20 || ny > H + 20) {
          stars[i] = spawn(false);
          continue;
        }
 
        var dirx = Math.cos(s.angle), diry = Math.sin(s.angle);
        var speedFactor = Math.min(1, s.r / maxR);
        var a = (0.35 + speedFactor * 0.65) * s.bright;
        var hch = 200 + s.hueShift * CONFIG.hue;
        var sat = Math.min(60, CONFIG.hue * 0.6);
        var light = 80 + speedFactor * 18;
 
        var trailLen = 6 + speedFactor * CONFIG.trail * 240;
        var grains = Math.max(2, Math.round(trailLen * (CONFIG.density / 40)));
 
        for (var g = 0; g < grains; g++) {
          var f = g / (grains - 1);
          var fade = (1 - f) * (1 - f);
          var d = f * trailLen;
          var gx = nx - dirx * d;
          var gy = ny - diry * d;
          var perp = (Math.random() - 0.5) * CONFIG.spread;
          gx += -diry * perp;
          gy += dirx * perp;
          ctx.fillStyle = 'hsla(' + hch + ',' + sat + '%,' + light + '%,' + (a * fade) + ')';
          ctx.fillRect(gx | 0, gy | 0, CONFIG.grain, CONFIG.grain);
        }
      }
      requestAnimationFrame(frame);
    }
 
    canvas.addEventListener('pointermove', function (e) {
      pointerActive = e.buttons > 0 || e.pointerType === 'mouse';
    });
    canvas.addEventListener('pointerdown', function () { pointerActive = true; });
    canvas.addEventListener('pointerup', function () { pointerActive = false; });
    canvas.addEventListener('pointerleave', function () { pointerActive = false; });
 
    if (window.ResizeObserver) {
      new ResizeObserver(function () { resize(); build(); }).observe(canvas);
    } else {
      window.addEventListener('resize', function () { resize(); build(); });
    }
 
    resize();
    build();
    frame();
  }
 
  function boot() {
    var nodes = document.querySelectorAll('.starfield-canvas');
    for (var i = 0; i < nodes.length; i++) initStarfield(nodes[i]);
  }
 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* Cta ship */
(function () {
  const BASE = {
    density: 1,
    threshold: 0.05,
    pointSize: 2.5,
    depth: 1,
    hoverRadius: 0.92,
    hoverSoftness: 0.55,
    hoverStrength: 1.0,
    hoverEase: 0.12,
    zoom: 0.8,
    moveX: 0,
    moveY: 0,
    rotateX: 0,
    rotateZ: 0,
    perspective: 1.45
  };

  const LEGACY_PANELS = [
    {
      id: "ship",
      url: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a1eb1dacce01dabaf4f772e_ship.avif"
    },
    {
      id: "cta",
      url: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a25716d6cf1e9b343dc94e3_cta.png",
      spinYPeriodSec: 120
    }
  ];

  const MAX_MOUSE_TILT = 12;

  const IDLE = {
    tiltDeg: 2.2,
    drift: 0.014,
    speed: 0.65
  };

  function initLegacyPointCloud(canvas, imageUrl, cfg) {
  cfg = cfg || {};
  if (!canvas) return;
  if (canvas.__legacyPcInit) return;
  canvas.__legacyPcInit = true;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
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
    rotateY: 0,
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
    mouseTiltX: 0,
    mouseTiltY: 0,
    targetMouseTiltX: 0,
    targetMouseTiltY: 0,
    idleRotateX: 0,
    idleRotateY: 0,
    idleMoveX: 0,
    idleMoveY: 0,
    spinRotateY: 0,
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

    mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
    mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0,s, 0,1,0, -s,0,c); }
    mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0, s,c,0, 0,0,1); }

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
          arr.push(x, y, r, g, b, bri);
        }
      }
    }

    panel.particleCount = arr.length / 6;
    panel.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, panel.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const newW = Math.max(1, Math.floor(rect.width * dpr));
    const newH = Math.max(1, Math.floor(rect.height * dpr));
    if (newW === W && newH === H) return;
    W = newW;
    H = newH;
    canvas.width = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
  }

  function draw() {
    if (!panel.buffer || panel.particleCount === 0) return;
    const panelW = W * panel.layoutScale;
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
    gl.uniform1f(uni("u_moveX"), panel.moveX + panel.idleMoveX);
    gl.uniform1f(uni("u_moveY"), panel.moveY + panel.idleMoveY);
    gl.uniform1f(uni("u_rotateX"), panel.rotateX + panel.mouseTiltX + panel.idleRotateX);
    gl.uniform1f(uni("u_rotateY"), panel.rotateY + panel.mouseTiltY + panel.idleRotateY + panel.spinRotateY);
    gl.uniform1f(uni("u_rotateZ"), panel.rotateZ);
    gl.uniform1f(uni("u_perspective"), panel.perspective);

    gl.uniform1f(uni("u_layoutX"), panel.layoutX);
    gl.uniform1f(uni("u_layoutScale"), panel.layoutScale);

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

    const idleMix = 1 - panel.hoverActive;
    const t = globalTime * IDLE.speed + panel.phase;

    if (cfg.spinYPeriodSec) {
      panel.spinRotateY = (globalTime * 360 / cfg.spinYPeriodSec) % 360;
      panel.idleRotateY = 0;
    } else {
      panel.idleRotateY = Math.cos(t * 0.82) * IDLE.tiltDeg * idleMix;
    }
    panel.idleRotateX = Math.sin(t * 1.05) * IDLE.tiltDeg * idleMix;
    panel.idleMoveX = Math.sin(t * 0.58) * IDLE.drift * idleMix;
    panel.idleMoveY = Math.cos(t * 0.71) * IDLE.drift * idleMix;

    panel.hoverX += (panel.targetHoverX - panel.hoverX) * follow;
    panel.hoverY += (panel.targetHoverY - panel.hoverY) * follow;
    panel.hoverActive += (panel.targetHoverActive - panel.hoverActive) * follow;
    panel.mouseTiltX += (panel.targetMouseTiltX - panel.mouseTiltX) * follow;
    panel.mouseTiltY += (panel.targetMouseTiltY - panel.mouseTiltY) * follow;

    render();
    requestAnimationFrame(animate);
  }

  function updateFromPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const clipX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const clipY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    panel.targetHoverX = clipX;
    panel.targetHoverY = clipY;
    panel.targetHoverActive = 1;
    panel.targetMouseTiltY = clipX * MAX_MOUSE_TILT;
    panel.targetMouseTiltX = -clipY * MAX_MOUSE_TILT;
  }

  function clearTargets() {
    panel.targetHoverActive = 0;
    panel.targetMouseTiltX = 0;
    panel.targetMouseTiltY = 0;
  }

  canvas.addEventListener("pointerdown", updateFromPointer);
  canvas.addEventListener("pointermove", updateFromPointer);
  canvas.addEventListener("pointerleave", clearTargets);
  canvas.addEventListener("pointerup", clearTargets);
  canvas.addEventListener("pointercancel", clearTargets);

  loadImage(imageUrl)
    .then((img) => {
      buildParticles(img);
      resize();
      render();
      requestAnimationFrame(animate);
    })
    .catch(console.error);

  new ResizeObserver(() => render()).observe(canvas);
  }

  for (const cfg of LEGACY_PANELS) {
    initLegacyPointCloud(document.getElementById(cfg.id), cfg.url, cfg);
  }
})();

/* Figures point cloud (wong, alswaha, modi, babis) */
(function (global) {
  if (global.FiguresPointCloud) {
    global.FiguresPointCloud.initAll();
    return;
  }

  const PARAMS = {
    density: 1,
    threshold: 0.3,
    pointSize: 1.4,
    depth: 2,
    hoverRadius: 0.78,
    hoverSoftness: 0.55,
    hoverStrength: 1.0,
    hoverEase: 0.12,
    zoom: 0.7,
    moveX: 0,
    moveY: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    perspective: 1.22,
    focusU: 0.527,
    focusV: 0.28,
    centerFocusRadius: 0.6,
    centerFocusSoftness: 0.35,
    centerFocusStrength: 1.0
  };

  const IDLE = {
    tiltDeg: 1.0,
    drift: 0.006,
    speed: 0.55
  };

  const FIGURES = [
    {
      id: "wong",
      image: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a1c777055af9680ca6b278b_wong.avif"
    },
    {
      id: "alswaha",
      image: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a1c776f9c83315aa82adef5_alswaha.avif"
    },
    {
      id: "modi",
      image: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a1c776f0e4017306f06426b_modi.avif"
    },
    {
      id: "babis",
      image: "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a1c776fe8d9bae930cdab06_babis.avif"
    }
  ];

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
    let hoverX = 0;
    let hoverY = 0;
    let hoverActive = 0;
    let targetHoverX = 0;
    let targetHoverY = 0;
    let targetHoverActive = 0;
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
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0,s, 0,1,0, -s,0,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0, s,c,0, 0,0,1); }
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
  v_col = clamp(mix(a_col, paint.rgb, paint.a), 0.0, 1.0);
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      H = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
        gl.viewport(0, 0, W, H);
      }
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
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, paintTexture);
      gl.uniform1i(uni("u_paintTex"), 0);
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

      render();
      rafId = requestAnimationFrame(loop);
    }

    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      targetHoverX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetHoverY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
      targetHoverActive = 1;
    });
    canvas.addEventListener("pointerleave", () => {
      targetHoverActive = 0;
    });

    const ro = new ResizeObserver(() => render());
    ro.observe(canvas);

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

/* Model video tabs */
document.addEventListener('DOMContentLoaded', () => {
    const tabs  = document.querySelectorAll('.ai_tab'); 
    const wraps = document.querySelectorAll('[data-video]'); 
    const ACTIVE = 'is-active';
  
    const transitions = {
      'sovereign->cyber': 'sovereign to cyber',
      'cyber->sovereign': 'cyber to sovereign',
    };
  
    let current = 'sovereign';
    let busy    = false;
  
    const getWrap  = name => document.querySelector(`[data-video="${name}"]`);
    const getVideo = el   => el && el.querySelector('video');
  
    function show(name, { loop = false, then = null } = {}) {
      wraps.forEach(w => {
        w.classList.remove(ACTIVE);
        const v = getVideo(w);
        if (v) { v.pause(); v.onended = null; }
      });
  
      const wrap = getWrap(name);
      const v = getVideo(wrap);
      if (!wrap || !v) return;
  
      wrap.classList.add(ACTIVE);
      v.loop = loop;
      v.currentTime = 0;
      v.play().catch(() => {});
      if (then) v.onended = () => { v.onended = null; then(); };
    }
  
    function goTo(target) {
      if (busy || target === current) return; 
      busy = true;
  
      tabs.forEach(t => t.classList.toggle(ACTIVE, t.getAttribute('data-tab') === target));
  
      show(transitions[`${current}->${target}`], {
        loop: false,
        then: () => {
          show(target, { loop: true });
          current = target;
          busy = false;
        },
      });
    }
  
    tabs.forEach(tab => tab.addEventListener('click', e => {
      e.preventDefault();
      goTo(tab.getAttribute('data-tab'));
    }));

    document.addEventListener('dream-cards-tab', (e) => {
      const tab = e.detail?.tab;
      if (tab) goTo(tab);
    });
  
    show('sovereign', { loop: true });
  });

/* Marquee slider */
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
  }

  document.querySelectorAll('.swiper').forEach(initSlider);
});
