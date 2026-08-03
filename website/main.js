/* =========================================================================
 * MiroFish marketing site — original scroll + WebGL transition engine.
 *
 * Native scrolling (with CSS scroll-snap) drives a smoothed progress value.
 * Each section owns a procedural fragment-shader scene; adjacent scenes are
 * rendered to offscreen targets and composited through a noise-cut wipe with
 * spectral chromatic aberration, mild barrel distortion, and film grain.
 * No external libraries. All shader code authored for this project.
 * ========================================================================= */

(() => {
  "use strict";

  const canvas = document.getElementById("gl");
  const panels = Array.from(document.querySelectorAll(".panel"));
  const N = panels.length;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- section dots ---------- */

  const dotsWrap = document.getElementById("dots");
  const dots = panels.map((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Go to section ${i + 1}`);
    b.addEventListener("click", () =>
      panels[i].scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" })
    );
    dotsWrap.appendChild(b);
    return b;
  });

  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      panels[+el.dataset.goto].scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });
  });

  /* ---------- scroll model ---------- */

  // Raw progress in [0, N-1]: how far down the page we are, in sections.
  function rawProgress() {
    const y = window.scrollY;
    // Panels are uniform full-viewport blocks; derive progress from offsets
    // so mobile URL-bar resizing can't desync us.
    for (let i = 0; i < N - 1; i++) {
      const a = panels[i].offsetTop;
      const b = panels[i + 1].offsetTop;
      if (y < b) return i + Math.min(1, Math.max(0, (y - a) / (b - a)));
    }
    return N - 1;
  }

  let smooth = rawProgress(); // eased progress driving shaders + parallax
  let vel = 0;

  /* ---------- DOM parallax + nav state ---------- */

  const inners = panels.map((p) => p.querySelector(".panel__inner"));
  const nav = document.getElementById("nav");

  function updateDOM() {
    const active = Math.round(smooth);
    dots.forEach((d, i) => d.classList.toggle("active", i === active));
    nav.classList.toggle("nav--solid", smooth > 0.35);
    if (reducedMotion) return;
    for (let i = 0; i < N; i++) {
      const d = i - smooth; // 0 when centered, ±1 one screen away
      if (Math.abs(d) > 1.25) continue;
      inners[i].style.transform = `translateY(${d * -7}vh)`;
      inners[i].style.opacity = String(Math.max(0, 1 - Math.abs(d) * 1.25));
    }
  }

  /* ---------- WebGL setup ---------- */

  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });

  if (!gl) {
    document.body.classList.add("no-webgl");
    const tick = () => {
      smooth = rawProgress();
      updateDOM();
      requestAnimationFrame(tick);
    };
    tick();
    return;
  }

  const VERT = `#version 300 es
  layout(location=0) in vec2 aPos;
  out vec2 vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }`;

  /* Shared GLSL helpers (hash / value noise / fbm), written for this site. */
  const HELPERS = `
  float hash11(float n) { return fract(sin(n * 127.1) * 43758.5453); }
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  vec2 hash22(vec2 p) {
    float h = hash21(p);
    return vec2(h, hash21(p + h + 17.17));
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1, 0)), u.x),
      mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x),
      u.y);
  }
  float fbm(vec2 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 4; i++) {
      s += a * vnoise(p);
      p = p * 2.03 + 11.7;
      a *= 0.5;
    }
    return s;
  }
  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  `;

  /* ---------- scene shader: six procedural backgrounds ---------- */

  const SCENE_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 fragColor;
  uniform vec2 uRes;
  uniform float uTime;
  uniform int uId;
  uniform vec2 uMouse;
  ${HELPERS}

  const vec3 DEEP  = vec3(0.014, 0.027, 0.058);
  const vec3 NAVY  = vec3(0.045, 0.093, 0.165);
  const vec3 ICE   = vec3(0.66, 0.85, 0.96);
  const vec3 STEEL = vec3(0.29, 0.47, 0.68);
  const vec3 GOLD  = vec3(0.90, 0.71, 0.35);

  // Elongated glow "fish" oriented along its heading.
  float fishDash(vec2 d, vec2 dir, float stretch) {
    d = mat2(dir.x, dir.y, -dir.y, dir.x) * d;
    d.x *= stretch;
    return exp(-dot(d, d) * 2400.0);
  }

  /* 0 — Abyss: light rays from above, a shoal crossing the frame. */
  vec3 scene0(vec2 p, float t) {
    vec3 col = mix(NAVY * 1.25, DEEP * 0.55, smoothstep(-0.85, 0.9, p.y * -1.0 + 0.2));
    col = mix(col, NAVY * 1.6, smoothstep(0.15, 1.0, p.y)); // brighter surface
    vec2 q = rot(0.28) * p;
    float rays = fbm(vec2(q.x * 3.2 - t * 0.06, q.y * 0.35));
    rays *= smoothstep(-1.1, 0.9, p.y);
    col += ICE * rays * 0.12;
    float glow = 0.0;
    for (int i = 0; i < 26; i++) {
      float fi = float(i);
      float h = hash11(fi * 7.31);
      float h2 = hash11(fi * 3.77 + 5.0);
      float sp = 0.09 + 0.12 * h;
      float ph = t * sp + h * 37.0;
      vec2 c = vec2(
        -1.45 + mod(ph, 2.9),
        (h2 - 0.5) * 1.15 + 0.16 * sin(ph * 2.2 + fi));
      vec2 dir = normalize(vec2(1.0, 0.35 * cos(ph * 2.2 + fi)));
      glow += fishDash(p - c, dir, 0.42) * (0.35 + 0.65 * h2);
    }
    col += mix(STEEL, ICE, 0.55) * glow * 0.85;
    float dust = smoothstep(0.985, 1.0, vnoise(p * 42.0 + t * 0.12));
    col += ICE * dust * 0.25;
    return col;
  }

  /* 1 — Seed graph: a constellation crystallizing out of the dark. */
  vec3 scene1(vec2 p, float t) {
    vec3 col = mix(DEEP, NAVY * 0.9, fbm(p * 1.4 + 3.0) * 0.8);
    vec2 drift = vec2(t * 0.02, t * -0.013);
    vec2 g = (p + uMouse * 0.04) * 3.1 + drift;
    vec2 cell = floor(g);
    float pts = 0.0, lines = 0.0;
    vec2 sites[9];
    int k = 0;
    for (int y = -1; y <= 1; y++)
    for (int x = -1; x <= 1; x++) {
      vec2 c = cell + vec2(float(x), float(y));
      vec2 j = hash22(c);
      sites[k++] = c + 0.5 + 0.38 * sin(t * 0.35 + j * 6.283);
    }
    for (int i = 0; i < 9; i++) {
      float d = length(g - sites[i]);
      pts += exp(-d * d * 60.0);
      for (int j2 = i + 1; j2 < 9; j2++) {
        vec2 a = sites[i], b = sites[j2];
        float seg = length(b - a);
        if (seg > 1.35) continue;
        vec2 pa = g - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        float dl = length(pa - ba * h);
        lines += exp(-dl * dl * 900.0) * (1.0 - seg / 1.35) * 0.5;
      }
    }
    col += STEEL * lines * 0.55;
    col += ICE * pts * 0.5;
    // the "seed": one bright pulsing core off-center
    float core = exp(-dot(p - vec2(-0.35, 0.1), p - vec2(-0.35, 0.1)) * 6.0);
    col += ICE * core * (0.10 + 0.05 * sin(t * 1.7));
    return col;
  }

  /* 2 — Murmuration: a flowing field of thousands of tiny agents. */
  vec3 scene2(vec2 p, float t) {
    vec3 col = mix(DEEP * 0.8, NAVY, smoothstep(-1.0, 1.0, p.x * 0.4 - p.y * 0.3));
    vec2 w = p + uMouse * 0.05;
    float n1 = fbm(w * 1.7 + vec2(0.0, t * 0.09));
    w += 0.45 * vec2(n1 - 0.5, fbm(w * 1.7 + 4.7) - 0.5);
    float streak = smoothstep(0.55, 0.95, fbm(w * vec2(1.4, 5.5) + vec2(t * 0.22, 0.0)));
    col += STEEL * streak * 0.4;
    // dense agent sparkles advected by the same field
    vec2 sg = w * 34.0;
    vec2 sc = floor(sg);
    vec2 sj = hash22(sc);
    float tw = 0.5 + 0.5 * sin(t * (1.0 + sj.x * 3.0) + sj.y * 6.283);
    float sd = length(fract(sg) - 0.5 - 0.3 * (sj - 0.5));
    float spark = exp(-sd * sd * 120.0) * step(0.55, sj.x) * tw;
    col += ICE * spark * streak * 1.6;
    // soft swarm mass drifting through
    vec2 m1 = vec2(0.5 * sin(t * 0.21), 0.3 * cos(t * 0.17));
    vec2 m2 = vec2(0.45 * sin(t * 0.16 + 2.0), 0.35 * cos(t * 0.23 + 1.0));
    float mass = exp(-dot(p - m1, p - m1) * 3.5) + exp(-dot(p - m2, p - m2) * 4.5);
    col += STEEL * mass * 0.14;
    return col;
  }

  /* 3 — Trajectories: futures diverging from a single present. */
  vec3 scene3(vec2 p, float t) {
    vec3 col = mix(DEEP, vec3(0.03, 0.06, 0.11), smoothstep(-1.0, 1.0, p.y));
    vec2 origin = vec2(-0.85, 0.0);
    float x = p.x - origin.x;
    float reach = smoothstep(0.0, 0.25, x);
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      float slope = (fi - 3.0) * 0.16;
      float wob = (vnoise(vec2(x * 2.5 + fi * 9.0, t * 0.15 + fi)) - 0.5) * 0.28 * x;
      float y = origin.y + slope * x * x * 0.9 + slope * x * 0.35 + wob;
      float d = abs(p.y - y);
      bool hot = (i == 4);
      float w = hot ? 3800.0 : 9000.0;
      float g = exp(-d * d * w) * reach * step(0.0, x) * step(x, 2.2);
      col += (hot ? GOLD : STEEL) * g * (hot ? 0.75 : 0.35);
      // comet running along the line
      float cx = mod(t * (0.16 + 0.03 * fi) + fi * 0.37, 1.9);
      vec2 cp = vec2(origin.x + cx, origin.y + slope * cx * cx * 0.9 + slope * cx * 0.35
                     + (vnoise(vec2(cx * 2.5 + fi * 9.0, t * 0.15 + fi)) - 0.5) * 0.28 * cx);
      float cd = length(p - cp);
      col += (hot ? GOLD : ICE) * exp(-cd * cd * 2600.0) * 0.8;
    }
    float core = exp(-dot(p - origin, p - origin) * 30.0);
    col += ICE * core * (0.5 + 0.15 * sin(t * 2.2));
    return col;
  }

  /* 4 — Two rooms: rectilinear macro-lab vs. warm playful bokeh. */
  vec3 scene4(vec2 p, float t) {
    float cut = p.x * 0.75 + p.y * 0.55 + (fbm(p * 2.6 + t * 0.05) - 0.5) * 0.3;
    float side = smoothstep(-0.05, 0.05, cut);
    // macro: cool blueprint grid
    vec3 lab = mix(DEEP, NAVY * 0.95, 0.6);
    vec2 gg = p * 5.0 + vec2(0.0, t * 0.04);
    vec2 gf = abs(fract(gg) - 0.5);
    float grid = exp(-min(gf.x, gf.y) * min(gf.x, gf.y) * 900.0);
    lab += STEEL * grid * 0.22;
    float blip = exp(-length(fract(gg * 0.5) - 0.5) * 14.0)
               * step(0.93, hash21(floor(gg * 0.5) + floor(t * 0.5)));
    lab += ICE * blip * 0.9;
    // micro: warm drifting bokeh
    vec3 play = mix(DEEP, vec3(0.10, 0.07, 0.03), 0.8);
    for (int i = 0; i < 10; i++) {
      float fi = float(i);
      float h = hash11(fi * 3.1);
      vec2 c = vec2(
        sin(t * (0.1 + h * 0.1) + fi * 2.4) * 0.8,
        cos(t * (0.08 + h * 0.12) + fi * 1.7) * 0.6);
      float d = length(p - c);
      float r = 0.05 + h * 0.16;
      play += GOLD * smoothstep(r, r * 0.5, d) * 0.10 * (0.4 + 0.6 * h);
    }
    return mix(lab, play, side);
  }

  /* 5 — The mirror: a calm horizon reflecting a moving shoal. */
  vec3 scene5(vec2 p, float t) {
    float below = smoothstep(0.015, -0.015, p.y);
    vec2 q = vec2(p.x, abs(p.y));
    if (p.y < 0.0) q.x += (vnoise(vec2(p.x * 6.0, t * 0.5)) - 0.5) * 0.05 * min(1.0, -p.y * 4.0);
    vec3 col = mix(DEEP, NAVY * 1.5, exp(-q.y * 2.2));
    // stars / plankton
    vec2 sg = q * 26.0 + vec2(t * 0.01, 0.0);
    vec2 sj = hash22(floor(sg));
    float sd = length(fract(sg) - 0.5 - 0.3 * (sj - 0.5));
    float star = exp(-sd * sd * 160.0) * step(0.8, sj.y)
               * (0.5 + 0.5 * sin(t * (1.0 + sj.x * 2.0) + sj.y * 9.0));
    col += ICE * star * 0.7;
    // small shoal drifting above the mirror line
    float glow = 0.0;
    for (int i = 0; i < 12; i++) {
      float fi = float(i);
      float h = hash11(fi * 5.9);
      float ph = t * (0.07 + 0.08 * h) + h * 29.0;
      vec2 c = vec2(-1.45 + mod(ph, 2.9), 0.18 + h * 0.55 + 0.08 * sin(ph * 2.0 + fi));
      vec2 dir = normalize(vec2(1.0, 0.3 * cos(ph * 2.0 + fi)));
      glow += fishDash(q - c, dir, 0.45) * (0.4 + 0.6 * h);
    }
    col += mix(STEEL, ICE, 0.5) * glow * 0.8;
    // mirror line
    col += ICE * exp(-p.y * p.y * 900.0) * 0.35;
    col = mix(col, col * 0.55 + DEEP * 0.2, below);
    return col;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.0;
    p += uMouse * 0.03;
    float t = uTime;
    vec3 col =
      uId == 0 ? scene0(p, t) :
      uId == 1 ? scene1(p, t) :
      uId == 2 ? scene2(p, t) :
      uId == 3 ? scene3(p, t) :
      uId == 4 ? scene4(p, t) :
                 scene5(p, t);
    fragColor = vec4(col, 1.0);
  }`;

  /* ---------- composite shader: the flip/wipe transition ---------- */

  const COMP_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 fragColor;
  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform float uProg;   // 0..1 between the two scenes
  uniform float uVel;    // smoothed scroll velocity
  uniform float uTime;
  uniform vec2 uRes;
  ${HELPERS}

  // Spectral 5-tap sample: red taps lead, blue taps trail, so the fringe
  // splits into a rainbow instead of a flat RGB shift.
  vec3 spectral(sampler2D tex, vec2 uv, vec2 dir, float amt) {
    vec3 acc = vec3(0.0), wsum = vec3(0.0);
    for (int i = 0; i < 5; i++) {
      float f = float(i) / 4.0;
      vec3 w = vec3(
        smoothstep(1.0, 0.0, f * 2.0),
        1.0 - abs(f * 2.0 - 1.0),
        smoothstep(0.0, 1.0, f * 2.0 - 1.0));
      acc += w * texture(tex, uv + dir * amt * (f - 0.5)).rgb;
      wsum += w;
    }
    return acc / max(wsum, vec3(1e-4));
  }

  void main() {
    vec2 uv = vUv;
    float t = uProg;
    float v = clamp(abs(uVel), 0.0, 1.0);

    // Diagonal cut, edge broken up by fbm so it reads as a shard of ice.
    float noise = fbm(uv * vec2(3.0, 2.2) + 7.0) - 0.5;
    float coord = uv.x * 0.32 + (1.0 - uv.y) * 0.68 + noise * 0.22;
    float thr = t * 1.5 - 0.25;            // sweeps [-0.25, 1.25]
    float m = smoothstep(thr + 0.055, thr - 0.055, coord); // 1 = show B
    float band = exp(-pow((coord - thr) * 5.0, 2.0));      // near-edge weight

    // Barrel distortion, strongest mid-transition and with velocity.
    vec2 c = uv - 0.5;
    float bulge = (band * 0.10 + v * 0.06) * dot(c, c);
    vec2 buv = uv - c * bulge;

    // Slight parallax: outgoing scene drifts up, incoming settles down.
    vec2 uvA = buv + vec2(0.0, t * 0.05) + vec2(0.0, -1.0) * band * 0.02;
    vec2 uvB = buv - vec2(0.0, (1.0 - t) * 0.05) + vec2(0.0, 1.0) * band * 0.02;

    vec2 dir = normalize(c + 1e-5);
    float ca = band * 0.012 + v * 0.010;
    vec3 colA = spectral(tA, clamp(uvA, 0.001, 0.999), dir, ca);
    vec3 colB = spectral(tB, clamp(uvB, 0.001, 0.999), dir, ca);
    vec3 col = mix(colA, colB, m);

    // Edge glint along the cut.
    col += vec3(0.66, 0.85, 0.96) * band * 0.10 * (0.5 + v);

    // Vignette + animated grain (hides banding in the gradients).
    col *= 1.0 - 0.32 * dot(c, c) * 1.6;
    float g = hash21(uv * uRes + fract(uTime) * 373.7) - 0.5;
    col += g * 0.028;

    fragColor = vec4(col, 1.0);
  }`;

  /* ---------- GL plumbing ---------- */

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "shader compile failed");
    }
    return s;
  }

  function program(fragSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || "program link failed");
    }
    return p;
  }

  let sceneProg, compProg;
  try {
    sceneProg = program(SCENE_FRAG);
    compProg = program(COMP_FRAG);
  } catch (err) {
    console.error("MiroFish site: shader failure, falling back.", err);
    document.body.classList.add("no-webgl");
    return;
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]), // fullscreen triangle
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const U = (prog, name) => gl.getUniformLocation(prog, name);
  const su = {
    res: U(sceneProg, "uRes"), time: U(sceneProg, "uTime"),
    id: U(sceneProg, "uId"), mouse: U(sceneProg, "uMouse"),
  };
  const cu = {
    a: U(compProg, "tA"), b: U(compProg, "tB"), prog: U(compProg, "uProg"),
    vel: U(compProg, "uVel"), time: U(compProg, "uTime"), res: U(compProg, "uRes"),
  };

  function makeTarget() {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer();
    return { tex, fbo, w: 0, h: 0 };
  }
  const targetA = makeTarget();
  const targetB = makeTarget();

  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
    W = Math.max(2, Math.floor(innerWidth * dpr));
    H = Math.max(2, Math.floor(innerHeight * dpr));
    canvas.width = W;
    canvas.height = H;
    for (const t of [targetA, targetB]) {
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
      t.w = W; t.h = H;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  resize();
  addEventListener("resize", resize);

  /* ---------- pointer parallax ---------- */

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * -2 + 1;
  }, { passive: true });

  /* ---------- render loop ---------- */

  function renderScene(target, id, time) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, W, H);
    gl.useProgram(sceneProg);
    gl.uniform2f(su.res, W, H);
    gl.uniform1f(su.time, time);
    gl.uniform1i(su.id, id);
    gl.uniform2f(su.mouse, mouse.sx, mouse.sy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  let last = performance.now();
  let frozenTime = 40.0; // pleasant static frame for reduced-motion users

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Frame-rate-independent damping toward the raw scroll position.
    const target = rawProgress();
    const k = 1 - Math.exp(-dt * 7.5);
    const prev = smooth;
    smooth = reducedMotion ? target : smooth + (target - smooth) * k;
    const instVel = (smooth - prev) / Math.max(dt, 1e-4);
    vel += (instVel - vel) * (1 - Math.exp(-dt * 9));

    mouse.sx += (mouse.x - mouse.sx) * (1 - Math.exp(-dt * 4));
    mouse.sy += (mouse.y - mouse.sy) * (1 - Math.exp(-dt * 4));

    updateDOM();

    const a = Math.min(N - 2, Math.max(0, Math.floor(smooth)));
    let t = smooth - a;
    if (reducedMotion) t = Math.round(t); // hard cut, no swirl
    const time = reducedMotion ? frozenTime : now / 1000;

    renderScene(targetA, a, time);
    if (t > 0.0005) renderScene(targetB, a + 1, time);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.useProgram(compProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, targetA.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, targetB.tex);
    gl.uniform1i(cu.a, 0);
    gl.uniform1i(cu.b, 1);
    gl.uniform1f(cu.prog, t);
    gl.uniform1f(cu.vel, reducedMotion ? 0 : vel * 0.5);
    gl.uniform1f(cu.time, time);
    gl.uniform2f(cu.res, W, H);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
