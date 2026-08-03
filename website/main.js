/* =========================================================================
 * MiroFish marketing site — original scroll + WebGL transition engine.
 *
 * Native scrolling (with CSS scroll-snap) drives a smoothed progress value.
 * Each section owns a raymarched, frost-white 3D scene; adjacent scenes are
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
    for (let i = 0; i < N - 1; i++) {
      const a = panels[i].offsetTop;
      const b = panels[i + 1].offsetTop;
      if (y < b) return i + Math.min(1, Math.max(0, (y - a) / (b - a)));
    }
    return N - 1;
  }

  let smooth = rawProgress();
  let vel = 0;

  /* ---------- DOM parallax + nav state ---------- */

  const inners = panels.map((p) => p.querySelector(".panel__inner"));
  const nav = document.getElementById("nav");
  const hudCounter = document.getElementById("hudCounter");

  function updateDOM() {
    const active = Math.round(smooth);
    dots.forEach((d, i) => d.classList.toggle("active", i === active));
    if (hudCounter) {
      hudCounter.textContent =
        String(active + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");
    }
    nav.classList.toggle("nav--solid", smooth > 0.35);
    if (reducedMotion) return;
    for (let i = 0; i < N; i++) {
      const d = i - smooth;
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
  `;

  /* ---------- scene shader: six raymarched frost-white scenes ---------- */

  const SCENE_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 fragColor;
  uniform vec2 uRes;
  uniform float uTime;
  uniform int uId;
  uniform vec2 uMouse;
  ${HELPERS}

  const vec3 PAPER   = vec3(0.930, 0.948, 0.962);
  const vec3 PAPER_LO= vec3(0.845, 0.885, 0.918);
  const vec3 INK     = vec3(0.055, 0.105, 0.170);
  const vec3 STEEL   = vec3(0.290, 0.470, 0.680);
  const vec3 GOLD    = vec3(0.760, 0.560, 0.240);

  mat3 rotY(float a) {
    float c = cos(a), s = sin(a);
    return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  }
  mat3 rotX(float a) {
    float c = cos(a), s = sin(a);
    return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
  }

  /* Faceted gem: intersection of slab planes (a generalized distance fn). */
  float sdCrystal(vec3 p, float r) {
    float d = abs(p.x);
    d = max(d, abs(p.y));
    d = max(d, abs(p.z));
    float k = 0.57735;
    d = max(d, abs(dot(p, vec3( k,  k,  k))));
    d = max(d, abs(dot(p, vec3(-k,  k,  k))));
    d = max(d, abs(dot(p, vec3( k, -k,  k))));
    d = max(d, abs(dot(p, vec3( k,  k, -k))));
    float a = 0.850, b = 0.526;
    d = max(d, abs(dot(p, vec3(0.0,  a,  b))));
    d = max(d, abs(dot(p, vec3( b, 0.0,  a))));
    d = max(d, abs(dot(p, vec3( a,  b, 0.0))));
    return d - r;
  }
  float sdOcta(vec3 p, float s) {
    p = abs(p);
    return (p.x + p.y + p.z - s) * 0.57735;
  }
  float sdSphere(vec3 p, float r) { return length(p) - r; }
  float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
  }
  float sdRBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
  }

  /* Distance + material id for the active scene. */
  vec2 map(vec3 pos, float t) {
    mat3 R = rotY(t * 0.22 + uMouse.x * 0.45) * rotX(sin(t * 0.14) * 0.18 - uMouse.y * 0.3);
    vec3 q = R * pos;
    float d = 1e5, m = 0.0;

    if (uId == 0) {
      d = sdCrystal(q, 0.82);

    } else if (uId == 1) {
      d = sdOcta(q, 1.02);
      vec3 c = vec3(cos(t * 0.7), 0.35 * sin(t * 0.9), sin(t * 0.7)) * 1.05;
      float d2 = sdSphere(q - c, 0.11);
      if (d2 < d) { d = d2; m = 1.0; }

    } else if (uId == 2) {
      for (int i = 0; i < 9; i++) {
        float fi = float(i);
        float ang = fi * 0.6981 + t * 0.35;
        vec3 c = vec3(cos(ang) * 0.85, 0.16 * sin(t * 1.1 + fi * 2.0), sin(ang) * 0.85);
        float d2 = sdOcta(q - c, 0.17 + 0.04 * hash11(fi));
        d = min(d, d2);
      }
      float dc = sdSphere(q, 0.20);
      if (dc < d) { d = dc; m = 1.0; }

    } else if (uId == 3) {
      float d1 = sdTorus(q, vec2(0.82, 0.018));
      float d2 = sdTorus(rotX(1.05) * q, vec2(0.82, 0.018));
      float d3 = sdTorus(rotX(-1.05) * rotY(0.5) * q, vec2(0.82, 0.018));
      d = min(d1, min(d2, d3));
      float ang = t * 0.9;
      vec3 c = vec3(cos(ang), 0.0, sin(ang)) * 0.82;
      float dm = sdSphere(q - c, 0.09);
      if (dm < d) { d = dm; m = 2.0; }
      float dc = sdOcta(q, 0.34);
      if (dc < d) { d = dc; m = 0.0; }

    } else if (uId == 4) {
      float d1 = sdRBox(q - vec3(-0.55, 0.0, 0.0), vec3(0.30), 0.03);
      float pulse = 1.0 + 0.05 * sin(t * 1.6);
      float d2 = sdSphere(q - vec3(0.58, 0.0, 0.0), 0.34 * pulse);
      d = d1; m = 0.0;
      if (d2 < d) { d = d2; m = 2.0; }

    } else {
      vec3 a = pos - vec3(0.0, 0.42, 0.0);
      float d1 = sdCrystal(R * a, 0.55);
      vec3 mp = vec3(pos.x, -0.84 - pos.y, pos.z);
      mp.x += sin(pos.y * 14.0 + t * 1.2) * 0.012;
      vec3 b = mp - vec3(0.0, 0.42, 0.0);
      float d2 = sdCrystal(R * b, 0.55);
      d = d1; m = 0.0;
      if (d2 < d) { d = d2; m = 3.0; }
    }
    return vec2(d, m);
  }

  vec3 calcNormal(vec3 p, float t) {
    const vec2 e = vec2(0.0018, -0.0018);
    return normalize(
      e.xyy * map(p + e.xyy, t).x + e.yyx * map(p + e.yyx, t).x +
      e.yxy * map(p + e.yxy, t).x + e.xxx * map(p + e.xxx, t).x);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 2.0;
    float t = uTime;

    /* Object placement: right of the copy on wide screens, above it on tall. */
    vec2 off = aspect > 1.05 ? vec2(0.58, -0.02) : vec2(0.0, 0.45);
    if (uId == 5) off = vec2(0.0, 0.05);
    vec2 sp = p - off;

    /* --- background: paper gradient, dot grid, drifting motes --- */
    vec3 col = mix(PAPER, PAPER_LO, clamp(uv.y * 0.9 + fbm(p * 1.3) * 0.25 - 0.1, 0.0, 1.0));
    vec2 gg = p * 9.0;
    vec2 gf = fract(gg) - 0.5;
    float dotg = exp(-dot(gf, gf) * 90.0);
    col = mix(col, STEEL, dotg * 0.045);
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      float h = hash11(fi * 9.7);
      vec2 c = vec2(
        mod(h * 7.0 + t * (0.01 + 0.02 * h), 2.4 * max(aspect, 1.0)) - 1.2 * max(aspect, 1.0),
        fract(h * 3.7 + t * (0.008 + 0.012 * h)) * 2.4 - 1.2);
      float dd = length(p - c);
      col = mix(col, STEEL, exp(-dd * dd * 3000.0) * 0.35);
    }

    /* --- raymarch the centerpiece --- */
    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = normalize(vec3(sp, -2.05));
    float bR = uId == 5 ? 2.3 : 1.7;
    float bb = dot(rd, -ro);
    float cc = dot(ro, ro) - bb * bb;
    float hit = 0.0;
    vec3 pos = vec3(0.0);
    float mat = 0.0;

    if (cc < bR * bR) {
      float tt = max(0.0, bb - bR);
      float tmax = bb + bR;
      for (int i = 0; i < 80; i++) {
        pos = ro + rd * tt;
        vec2 dm = map(pos, t);
        if (dm.x < 0.0022) { hit = 1.0; mat = dm.y; break; }
        tt += dm.x;
        if (tt > tmax) break;
      }
    }

    if (hit > 0.5) {
      vec3 n = calcNormal(pos, t);
      vec3 L = normalize(vec3(0.55, 0.85, 0.55));
      float key = clamp(dot(n, L), 0.0, 1.0);
      float back = clamp(dot(n, normalize(vec3(-0.6, -0.2, 0.4))), 0.0, 1.0);
      vec3 base = mix(vec3(0.665, 0.745, 0.825), vec3(0.985, 0.995, 1.0), key);
      base += vec3(0.06, 0.09, 0.12) * back;
      float fr = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);
      base = mix(base, STEEL * 0.85, fr * 0.45);
      float spec = pow(clamp(dot(reflect(-L, n), -rd), 0.0, 1.0), 42.0);
      base += vec3(1.0) * spec * 0.55;
      if (mat > 0.5 && mat < 1.5) base = mix(base, STEEL, 0.65) + spec * 0.3;
      if (mat > 1.5 && mat < 2.5) base = mix(base, GOLD, 0.60) + spec * 0.3;
      if (mat > 2.5) base = mix(base, PAPER_LO, 0.55); /* reflection copy, washed out */
      col = base;
    } else {
      /* soft contact shadow under the object */
      float sh = exp(-(sp.x * sp.x * 2.6 + (sp.y + 0.72) * (sp.y + 0.72) * 26.0));
      col *= 1.0 - sh * 0.16;
      if (uId == 5) {
        /* mirror line */
        col = mix(col, STEEL, exp(-(p.y + 0.42) * (p.y + 0.42) * 2200.0) * 0.25);
        col = mix(col, PAPER_LO, smoothstep(-0.42, -1.2, p.y) * 0.5);
      }
    }

    fragColor = vec4(col, 1.0);
  }`;

  /* ---------- composite shader: the flip/wipe transition ---------- */

  const COMP_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 fragColor;
  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform float uProg;
  uniform float uVel;
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
    float thr = t * 1.5 - 0.25;
    float m = smoothstep(thr + 0.055, thr - 0.055, coord);
    float band = exp(-pow((coord - thr) * 5.0, 2.0));

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

    // Frost shadow along the cut (a dark seam reads better on white).
    col *= 1.0 - band * 0.13 * (0.6 + v);
    col = mix(col, vec3(0.29, 0.47, 0.68), band * 0.05);

    // Cool corners + animated grain (hides banding in the gradients).
    col = mix(col, col * vec3(0.955, 0.975, 1.0), dot(c, c) * 1.9);
    float g = hash21(uv * uRes + fract(uTime) * 373.7) - 0.5;
    col += g * 0.017;

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
    new Float32Array([-1, -1, 3, -1, -1, 3]),
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
  const frozenTime = 40.0; // pleasant static frame for reduced-motion users

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

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
    if (reducedMotion) t = Math.round(t);
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
