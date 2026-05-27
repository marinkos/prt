(function () {
    const IMAGE_SRC = "https://cdn.prod.website-files.com/6a1324866930e66fe78a27d6/6a16e51f7db7a603d7a8db46_footer-img.avif";
  
    // Original footer params from Train_Footer.html
    const params = {
      density: 1,
      threshold: 0.02,
      pointSize: 1.65,
      depth: 0.5,
      hoverRadius: 0.56,
      hoverSoftness: 0.55,
      hoverStrength: 1,
      hoverEase: 0.12,
      zoom: 1.6,
      perspective: 2
    };
  
    const canvas = document.getElementById("footer");
    if (!canvas) return;
    if (canvas.__footerPcInit) return;
    canvas.__footerPcInit = true;
  
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;
  
    let W = 1;
    let H = 1;
    let imgW = 1;
    let imgH = 1;
    let particleCount = 0;
    let buffer = null;
    let hoverX = 0;
    let hoverY = 0;
    let hoverActive = 0;
    let targetHoverX = 0;
    let targetHoverY = 0;
    let targetHoverActive = 0;
    let lastFrameTime = performance.now();
  
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
      uniform float u_fitZoom;
      uniform float u_perspective;
  
      void main() {
        vec2 uv = a_pos / u_img;
        vec2 xy = vec2(uv.x - 0.5, 0.5 - uv.y) * vec2(u_img.x / u_img.y, 1.0);
        float aspect = u_res.x / u_res.y;
        float zoom = u_zoom * u_fitZoom;
        vec2 flatClip = (xy * zoom) / vec2(aspect, 1.0) * 2.0;
  
        float distToMouse = distance(flatClip, vec2(u_hoverX, u_hoverY));
        float innerRadius = max(0.0, u_hoverRadius - u_hoverSoftness);
        float hoverMask = 1.0 - smoothstep(innerRadius, u_hoverRadius, distToMouse);
        hoverMask = hoverMask * hoverMask * (3.0 - 2.0 * hoverMask);
        hoverMask *= u_hoverActive;
  
        float depthAmount = 1.0 - hoverMask * u_hoverStrength;
        float z = (a_bri - 0.5) * u_depth * depthAmount;
  
        vec3 p = vec3(xy, z);
        p *= zoom;
        float persp = u_perspective / max(0.25, u_perspective - p.z);
        vec2 clip = (p.xy * persp) / vec2(aspect, 1.0) * 2.0;
  
        gl_Position = vec4(clip, 0.0, 1.0);
        gl_PointSize = u_pointSize * persp;
        v_col = a_col;
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
          if (a > 0.04 && bri >= params.threshold) arr.push(x, y, r, g, b, bri);
        }
      }
  
      particleCount = arr.length / 6;
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
    }
  
    function draw() {
      if (!buffer || particleCount === 0) return;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  
      const stride = 6 * 4;
      const pos = gl.getAttribLocation(program, "a_pos");
      const col = gl.getAttribLocation(program, "a_col");
      const bri = gl.getAttribLocation(program, "a_bri");
  
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(col);
      gl.vertexAttribPointer(col, 3, gl.FLOAT, false, stride, 2 * 4);
      gl.enableVertexAttribArray(bri);
      gl.vertexAttribPointer(bri, 1, gl.FLOAT, false, stride, 5 * 4);
  
      const aspect = W / H;
      const imgAspect = imgW / imgH;
      const fitZoom = aspect / imgAspect; // fills wrapper width, wrapper crops height if needed
  
      gl.uniform2f(uni("u_res"), W, H);
      gl.uniform2f(uni("u_img"), imgW, imgH);
      gl.uniform1f(uni("u_pointSize"), params.pointSize);
      gl.uniform1f(uni("u_depth"), params.depth);
      gl.uniform1f(uni("u_hoverX"), hoverX);
      gl.uniform1f(uni("u_hoverY"), hoverY);
      gl.uniform1f(uni("u_hoverActive"), hoverActive);
      gl.uniform1f(uni("u_hoverRadius"), params.hoverRadius);
      gl.uniform1f(uni("u_hoverSoftness"), params.hoverSoftness);
      gl.uniform1f(uni("u_hoverStrength"), params.hoverStrength);
      gl.uniform1f(uni("u_zoom"), params.zoom);
      gl.uniform1f(uni("u_fitZoom"), fitZoom);
      gl.uniform1f(uni("u_perspective"), params.perspective);
  
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
      render();
      requestAnimationFrame(animate);
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
  
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      buildParticles(img);
      requestAnimationFrame(animate);
    };
    img.src = IMAGE_SRC;
  
    new ResizeObserver(() => render()).observe(canvas);
  })();
  