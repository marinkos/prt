/* Hero point cloud */
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

/* Playideo on active tab) */
$(".system_tabs-link").on("click", function () {
  var tn = $(this).attr("tn");
  $(".jazz_tabs-video video").each(function () {
    $(this).get(0).pause();
    $(this).get(0).currentTime = 0;
  });
  $("#bg-video-" + tn + " video").get(0).play();
});
