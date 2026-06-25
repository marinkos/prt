/* Careers point cloud */
(function () {
  if (!window.matchMedia("(min-width: 768px)").matches) return;

  const PARAMS = {
    density: 1,
    threshold: 0.45,
    pointSize: 0.2,
    depth: 1,
    hoverRadius: 0.96,
    hoverSoftness: 0.55,
    hoverStrength: 1.0,
    hoverEase: 0.12,
    zoom: 0.9,
    moveX: 0,
    moveY: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    perspective: 1.04,
    hoverTrailEnabled: true,
    hoverTrailHex: "#612200",
    hoverTrailOpacity: 0.9,
    hoverTrailRadius: 1.0,
    hoverTrailDecay: 0.5,
    hoverTrailBlendMode: "multiply"
  };

  const CFG = {
    id: "careers",
    url: "https://pub-a386b1b1254143e98d23d7534fc68b25.r2.dev/images/careers.avif"
  };

  const IDLE = {
    depthPulse: 0.22,
    speed: 0.45
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

  function initCareerPointCloud(canvas, cfg) {
    if (!canvas || canvas.__careerPcInit) return;
    canvas.__careerPcInit = true;

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
      for (let y = 0; y < imgH; y += step) {
        for (let x = 0; x < imgW; x += step) {
          const i = (y * imgW + x) * 4;
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const a = data[i + 3] / 255;
          const bri = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
          if (a > 0.05 && bri >= panel.threshold) {
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
      console.error("CareerPointCloud: failed to load", imageUrl);
    };
    img.src = imageUrl;
  }

  initCareerPointCloud(document.getElementById(CFG.id), CFG);
})();

/* Filters */
(function () {
  const ITEM_SELECTOR = ".job_collection-item";
  const EMPTY_SELECTOR = ".empty-state";
  const LOAD_MORE_SELECTOR = '[data-button="load-more"]';
  const ALL_LOCATION = "All Location";
  const ALL_TEAM = "All Teams";
  const PAGE_SIZE = 10;

  const LOCATION_CANONICAL = {
    "tel aviv": "tel aviv",
    tlv: "tel aviv",
    "tlv - isr": "tel aviv"
  };

  const LOCATION_LABELS = {
    "tel aviv": "Tel Aviv"
  };

  function normalize(value) {
    return (value || "").trim().toLowerCase();
  }

  function canonicalLocation(value) {
    const key = normalize(value);
    return LOCATION_CANONICAL[key] || key;
  }

  function locationLabel(canonical) {
    return LOCATION_LABELS[canonical] || canonical;
  }

  function populateSelect(select, values, allLabel) {
    if (!select) return;

    const fragment = document.createDocumentFragment();
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = allLabel;
    fragment.appendChild(allOption);

    Array.from(values)
      .sort(function (a, b) {
        return a.localeCompare(b);
      })
      .forEach(function (value) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        fragment.appendChild(option);
      });

    select.innerHTML = "";
    select.appendChild(fragment);
  }

  function collectFieldValues(items, filterKey) {
    const values = new Set();
    items.forEach(function (item) {
      const el = item.querySelector('[data-filter="' + filterKey + '"]');
      const text = el?.textContent.trim();
      if (text) values.add(text);
    });
    return values;
  }

  function collectLocationOptions(items) {
    const options = new Map();
    items.forEach(function (item) {
      const raw = item.querySelector('[data-filter="location"]')?.textContent.trim();
      if (!raw) return;
      const canonical = canonicalLocation(raw);
      if (!options.has(canonical)) {
        options.set(canonical, locationLabel(canonical));
      }
    });
    return options;
  }

  function populateLocationSelect(select, items, allLabel) {
    if (!select) return;

    const fragment = document.createDocumentFragment();
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = allLabel;
    fragment.appendChild(allOption);

    Array.from(collectLocationOptions(items).entries())
      .sort(function (a, b) {
        return a[1].localeCompare(b[1]);
      })
      .forEach(function (entry) {
        const option = document.createElement("option");
        option.value = entry[0];
        option.textContent = entry[1];
        fragment.appendChild(option);
      });

    select.innerHTML = "";
    select.appendChild(fragment);
  }

  function getItemData(item) {
    const rawLocation = item.querySelector('[data-filter="location"]')?.textContent;
    return {
      team: normalize(item.querySelector('[data-filter="team"]')?.textContent),
      location: canonicalLocation(rawLocation),
      name: normalize(item.querySelector('[data-filter="name"]')?.textContent)
    };
  }

  function itemMatchesFilters(item, query, location, team) {
    const data = getItemData(item);
    const matchesSearch = !query || data.name.includes(query);
    const matchesLocation = !location || data.location === location;
    const matchesTeam = !team || data.team === team;
    return matchesSearch && matchesLocation && matchesTeam;
  }

  function setItemVisible(item, visible) {
    item.hidden = !visible;
    item.style.display = visible ? "" : "none";
  }

  function initCareerFilters() {
    const root = document.querySelector(".job_filters-wrapper");
    if (!root || root.dataset.careerFiltersInit === "true") return;

    const items = Array.from(document.querySelectorAll(ITEM_SELECTOR));
    if (!items.length) return;

    root.dataset.careerFiltersInit = "true";

    const locationSelect = document.getElementById("filterLocation");
    const teamSelect = document.getElementById("filterDepartmen");
    const searchInput = document.getElementById("filtersSearch");
    const emptyState = document.querySelector(EMPTY_SELECTOR);
    const loadMoreBtn = document.querySelector(LOAD_MORE_SELECTOR);
    const loadMoreWrapper = loadMoreBtn?.closest(".load-button-wrapper");
    const searchIcon = document.querySelector('[data-icon="search"]');
    const resetIcon = document.querySelector('[data-icon="reset"]');
    let visibleLimit = PAGE_SIZE;

    populateLocationSelect(locationSelect, items, ALL_LOCATION);
    populateSelect(teamSelect, collectFieldValues(items, "team"), ALL_TEAM);

    function setSearchIcons(hasQuery) {
      if (searchIcon) searchIcon.style.display = hasQuery ? "none" : "flex";
      if (resetIcon) {
        resetIcon.style.display = hasQuery ? "flex" : "none";
        resetIcon.style.cursor = hasQuery ? "pointer" : "";
      }
    }

    function applyFilters(resetPagination) {
      if (resetPagination) visibleLimit = PAGE_SIZE;

      const query = normalize(searchInput?.value);
      const location = normalize(locationSelect?.value);
      const team = normalize(teamSelect?.value);
      let matchingCount = 0;

      items.forEach(function (item) {
        const matches = itemMatchesFilters(item, query, location, team);
        if (!matches) {
          setItemVisible(item, false);
          return;
        }

        matchingCount += 1;
        setItemVisible(item, matchingCount <= visibleLimit);
      });

      if (emptyState) {
        emptyState.style.display = matchingCount === 0 ? "flex" : "none";
      }

      if (loadMoreWrapper) {
        loadMoreWrapper.style.display =
          matchingCount > visibleLimit ? "" : "none";
      }

      setSearchIcons(Boolean(query));
    }

    function resetSearch() {
      if (!searchInput) return;
      searchInput.value = "";
      searchInput.focus();
      applyFilters(true);
    }

    locationSelect?.addEventListener("change", function () {
      applyFilters(true);
    });
    teamSelect?.addEventListener("change", function () {
      applyFilters(true);
    });
    searchInput?.addEventListener("input", function () {
      applyFilters(true);
    });

    loadMoreBtn?.addEventListener("click", function (event) {
      event.preventDefault();
      visibleLimit += PAGE_SIZE;
      applyFilters(false);
    });

    resetIcon?.addEventListener("click", function (event) {
      event.preventDefault();
      resetSearch();
    });

    setSearchIcons(false);
    applyFilters(true);
  }

  function boot() {
    initCareerFilters();
  }

  window.Webflow ||= [];
  window.Webflow.push(boot);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();