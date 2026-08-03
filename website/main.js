/* =========================================================================
 * MiroFish site — "frost" engine.
 *
 * A light, monochrome, igloo-in-a-blizzard aesthetic built from scratch:
 *  - per-section terrain backdrops (layered ridge noise, snowfall, fog)
 *  - one persistent 3D centerpiece: a shoal-fish sculpted from ~110 glowing
 *    ice blocks (instanced rounded cubes) that morphs into a new formation
 *    for every section
 *  - sections composite through a noise-cut wipe with spectral chromatic
 *    aberration, barrel distortion and grain, driven by damped native scroll
 *
 * No libraries; raw WebGL2. All shader code and geometry authored here.
 * ========================================================================= */

(() => {
  "use strict";

  const canvas = document.getElementById("gl");
  const panels = Array.from(document.querySelectorAll(".panel"));
  const N = panels.length;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- section dots + counter ---------- */

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
  const hudCounter = document.getElementById("hudCounter");

  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      panels[+el.dataset.goto].scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });
  });

  /* ---------- scroll model ---------- */

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

  /* ---------- DOM parallax ---------- */

  const inners = panels.map((p) => p.querySelector(".panel__inner"));

  function updateDOM() {
    const active = Math.round(smooth);
    dots.forEach((d, i) => d.classList.toggle("active", i === active));
    if (hudCounter) {
      hudCounter.textContent =
        String(active + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");
    }
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

  const QUAD_VERT = `#version 300 es
  layout(location=0) in vec2 aPos;
  out vec2 vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }`;

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

  /* ---------- terrain backdrop: bright frost mountains ---------- */

  const TERRAIN_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 fragColor;
  uniform vec2 uRes;
  uniform float uTime;
  uniform int uId;
  uniform vec2 uMouse;
  ${HELPERS}

  // Layered ridge silhouettes with distance fog — reads as snowy ranges.
  vec3 ranges(vec2 p, float t, float seed, out float groundMask) {
    vec3 sky = mix(vec3(0.775, 0.805, 0.845), vec3(0.93, 0.945, 0.955),
                   smoothstep(-0.25, 0.95, p.y));
    // high haze band
    sky += vec3(0.05) * fbm(vec2(p.x * 1.5 + seed, p.y * 3.0)) * smoothstep(0.0, 0.6, p.y);
    vec3 col = sky;
    groundMask = 0.0;
    for (int k = 4; k >= 0; k--) {
      float fk = float(k);
      float base = 0.30 - fk * 0.105;                       // nearer layers lower
      float freq = 1.1 + (4.0 - fk) * 0.5;
      float amp = 0.16 + (4.0 - fk) * 0.035;
      float n = fbm(vec2(p.x * freq + fk * 13.7 + seed * 3.1, fk * 7.7 + seed));
      float ridge = 1.0 - abs(n - 0.5) * 2.0;               // sharp crests
      float h = base + (mix(n, ridge, 0.55) - 0.5) * amp;
      float m = smoothstep(h + 0.003, h - 0.003, p.y);
      float depth = fk / 4.0;                               // 1 = farthest
      float tone = mix(0.62, 0.85, depth);
      // faceted rock shading
      float facet = fbm(p * vec2(7.0, 9.0) + fk * 31.0 + seed);
      vec3 rock = vec3(tone) * (0.86 + 0.26 * facet);
      rock = mix(rock, sky, depth * 0.55);                  // aerial fog
      // sun-kissed crest line
      rock += vec3(0.10) * exp(-(h - p.y) * 60.0) * (1.0 - depth * 0.6);
      col = mix(col, rock, m);
      if (k == 0) groundMask = m;
    }
    return col;
  }

  // Screen-space snowfall, three parallax layers.
  float snowfall(vec2 uv, float t) {
    float acc = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float scale = 18.0 + fi * 14.0;
      vec2 q = uv * scale + vec2(t * (0.15 + fi * 0.1) * 0.3, t * (0.55 + fi * 0.35));
      vec2 cell = floor(q);
      vec2 j = hash22(cell);
      vec2 f = fract(q) - 0.5 - (j - 0.5) * 0.55;
      float d = dot(f, f);
      acc += exp(-d * 260.0) * (0.25 + 0.55 * j.y) / (1.0 + fi);
    }
    return acc;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.0;
    p += uMouse * 0.025;
    float t = uTime;
    float seed = float(uId) * 4.7;

    vec3 col;
    float ground;
    if (uId == 5) {
      // Outro: frozen mirror — the ranges reflect around the horizon line.
      float horizon = -0.12;
      vec2 q = vec2(p.x, horizon + abs(p.y - horizon));
      q.x += (p.y < horizon)
        ? (vnoise(vec2(p.x * 7.0, t * 0.4)) - 0.5) * 0.05 * min(1.0, (horizon - p.y) * 3.0)
        : 0.0;
      col = ranges(q, t, seed, ground);
      if (p.y < horizon) {
        col = mix(col, vec3(0.70, 0.735, 0.775), 0.45);      // dimmer, milkier ice
        col *= 0.94;
      }
      col += vec3(0.9) * exp(-(p.y - horizon) * (p.y - horizon) * 1400.0) * 0.22;
    } else {
      col = ranges(p, t, seed, ground);
    }

    // Section flavor tweaks, kept monochrome.
    if (uId == 1) {
      // seed: faint survey grid over the ground
      vec2 gg = abs(fract(p * 4.0 + vec2(0.0, t * 0.01)) - 0.5);
      col -= vec3(0.05) * exp(-min(gg.x, gg.y) * min(gg.x, gg.y) * 2200.0) * ground;
    }
    if (uId == 3) {
      // rehearse: low sweeping light shafts
      float shaft = fbm(vec2(p.x * 2.0 - t * 0.06, p.y * 6.0));
      col += vec3(0.07) * shaft * smoothstep(0.4, -0.4, p.y);
    }

    // soft contact shadow under the centerpiece
    vec2 sc = (p - vec2(0.0, -0.42)) * vec2(1.0, 2.6);
    col *= 1.0 - exp(-dot(sc, sc) * 3.0) * 0.16;

    // snowfall + sparkle
    col += vec3(1.0) * snowfall(uv, t) * 0.5;
    float glint = smoothstep(0.988, 1.0, vnoise(p * 60.0 + floor(t * 2.0) * 7.0));
    col += vec3(0.5) * glint * (1.0 - smoothstep(-0.4, 0.4, p.y));

    fragColor = vec4(col, 1.0);
  }`;

  /* ---------- ice block centerpiece ---------- */

  const CUBE_VERT = `#version 300 es
  layout(location=0) in vec3 aPos;
  layout(location=1) in vec3 aNorm;
  layout(location=2) in vec3 iPos;
  layout(location=3) in vec2 iData;   // x: scale, y: seed
  uniform mat4 uProj;
  uniform float uSpin;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uShell;               // 0 solid pass, 1 glow shell pass
  out vec3 vNorm;
  out vec3 vView;
  out float vSeed;

  mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }
  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }

  void main() {
    float seed = iData.y;
    float scale = iData.x * (1.0 + uShell * 0.18);
    // blocks stay roughly aligned — a built structure, not debris
    mat3 R = rotY((seed - 0.5) * 0.55 + uTime * 0.05 * (seed - 0.5))
           * rotX((fract(seed * 7.31) - 0.5) * 0.4);
    vec3 pos = R * (aPos * scale) + iPos;
    // slow scene orbit + pointer parallax
    mat3 W = rotX(0.14 + uMouse.y * -0.05) * rotY(uSpin + uMouse.x * 0.1);
    pos = W * pos;
    pos += vec3(0.0, -0.18, 0.0);
    vec3 eye = pos + vec3(0.0, 0.0, 3.3);
    vNorm = W * (R * aNorm);
    vView = normalize(-eye);
    vSeed = seed;
    gl_Position = uProj * vec4(eye.xy, -eye.z, 1.0);
  }`;

  const CUBE_FRAG = `#version 300 es
  precision highp float;
  in vec3 vNorm;
  in vec3 vView;
  in float vSeed;
  uniform float uShell;
  out vec4 fragColor;

  void main() {
    vec3 n = normalize(vNorm);
    vec3 v = normalize(vView);
    float fres = pow(1.0 - abs(dot(n, v)), 2.2);
    if (uShell > 0.5) {
      // additive halo shell — cheap bloom
      fragColor = vec4(vec3(1.0), fres * 0.17);
      return;
    }
    float ndl = dot(n, normalize(vec3(0.45, 0.85, 0.55))) * 0.5 + 0.5;
    vec3 base = mix(vec3(0.60, 0.65, 0.72), vec3(1.02, 1.03, 1.05), ndl);
    // some blocks burn brighter, like lit ice
    float hot = step(0.62, vSeed) * (0.18 + 0.22 * vSeed);
    vec3 col = base + fres * 0.5 + hot;
    fragColor = vec4(col, 1.0);
  }`;

  /* ---------- composite: the frost flip ---------- */

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

    float noise = fbm(uv * vec2(3.0, 2.2) + 7.0) - 0.5;
    float coord = uv.x * 0.32 + (1.0 - uv.y) * 0.68 + noise * 0.22;
    float thr = t * 1.7 - 0.35;
    float m = smoothstep(thr + 0.05, thr - 0.05, coord);
    // edge effects must die completely when a section is at rest
    float gate = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.94, t);
    float band = exp(-pow((coord - thr) * 5.0, 2.0)) * gate;

    vec2 c = uv - 0.5;
    float bulge = (band * 0.09 + v * 0.05) * dot(c, c);
    vec2 buv = uv - c * bulge;

    vec2 uvA = buv + vec2(0.0, t * 0.045);
    vec2 uvB = buv - vec2(0.0, (1.0 - t) * 0.045);

    vec2 dir = normalize(c + 1e-5);
    float ca = band * 0.010 + v * 0.008;
    vec3 colA = spectral(tA, clamp(uvA, 0.001, 0.999), dir, ca);
    vec3 colB = spectral(tB, clamp(uvB, 0.001, 0.999), dir, ca);
    vec3 col = mix(colA, colB, m);

    // the cut edge flashes white, like light through a crack in ice
    col += vec3(1.0) * band * 0.16 * (0.4 + v);

    // gentle photographic vignette + grain
    col *= 1.0 - 0.16 * dot(c, c) * 1.6;
    float g = hash21(uv * uRes + fract(uTime) * 373.7) - 0.5;
    col += g * 0.02;

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

  function program(vertSrc, fragSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || "program link failed");
    }
    return p;
  }

  let terrainProg, cubeProg, compProg;
  try {
    terrainProg = program(QUAD_VERT, TERRAIN_FRAG);
    cubeProg = program(CUBE_VERT, CUBE_FRAG);
    compProg = program(QUAD_VERT, COMP_FRAG);
  } catch (err) {
    console.error("MiroFish site: shader failure, falling back.", err);
    document.body.classList.add("no-webgl");
    return;
  }

  const U = (prog, name) => gl.getUniformLocation(prog, name);
  const tu = {
    res: U(terrainProg, "uRes"), time: U(terrainProg, "uTime"),
    id: U(terrainProg, "uId"), mouse: U(terrainProg, "uMouse"),
  };
  const ku = {
    proj: U(cubeProg, "uProj"), spin: U(cubeProg, "uSpin"),
    mouse: U(cubeProg, "uMouse"), time: U(cubeProg, "uTime"),
    shell: U(cubeProg, "uShell"),
  };
  const cu = {
    a: U(compProg, "tA"), b: U(compProg, "tB"), prog: U(compProg, "uProg"),
    vel: U(compProg, "uVel"), time: U(compProg, "uTime"), res: U(compProg, "uRes"),
  };

  /* fullscreen triangle */
  const quadVao = gl.createVertexArray();
  gl.bindVertexArray(quadVao);
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  /* ---------- rounded-cube mesh (built from 6 face grids) ---------- */

  function buildRoundedCube(segments, cubify) {
    const verts = [];
    const idx = [];
    const faces = [
      { u: [1, 0, 0], v: [0, 1, 0], w: [0, 0, 1] },
      { u: [-1, 0, 0], v: [0, 1, 0], w: [0, 0, -1] },
      { u: [0, 0, -1], v: [0, 1, 0], w: [1, 0, 0] },
      { u: [0, 0, 1], v: [0, 1, 0], w: [-1, 0, 0] },
      { u: [1, 0, 0], v: [0, 0, -1], w: [0, 1, 0] },
      { u: [1, 0, 0], v: [0, 0, 1], w: [0, -1, 0] },
    ];
    const point = (f, s, t2) => {
      const c = [
        f.u[0] * s + f.v[0] * t2 + f.w[0],
        f.u[1] * s + f.v[1] * t2 + f.w[1],
        f.u[2] * s + f.v[2] * t2 + f.w[2],
      ];
      const len = Math.hypot(c[0], c[1], c[2]);
      const sph = [c[0] / len, c[1] / len, c[2] / len];
      // blend sphere → cube: rounded block
      return [
        (sph[0] + (c[0] - sph[0]) * cubify) * 0.5,
        (sph[1] + (c[1] - sph[1]) * cubify) * 0.5,
        (sph[2] + (c[2] - sph[2]) * cubify) * 0.5,
      ];
    };
    for (const f of faces) {
      const baseIndex = verts.length / 6;
      for (let j = 0; j <= segments; j++) {
        for (let i = 0; i <= segments; i++) {
          const s = (i / segments) * 2 - 1;
          const t2 = (j / segments) * 2 - 1;
          const p = point(f, s, t2);
          // normal from finite-difference tangents
          const e = 0.01;
          const pu = point(f, s + e, t2);
          const pv = point(f, s, t2 + e);
          const du = [pu[0] - p[0], pu[1] - p[1], pu[2] - p[2]];
          const dv = [pv[0] - p[0], pv[1] - p[1], pv[2] - p[2]];
          let n = [
            du[1] * dv[2] - du[2] * dv[1],
            du[2] * dv[0] - du[0] * dv[2],
            du[0] * dv[1] - du[1] * dv[0],
          ];
          const nl = Math.hypot(n[0], n[1], n[2]) || 1;
          n = [n[0] / nl, n[1] / nl, n[2] / nl];
          // ensure outward
          if (n[0] * p[0] + n[1] * p[1] + n[2] * p[2] < 0) n = [-n[0], -n[1], -n[2]];
          verts.push(p[0], p[1], p[2], n[0], n[1], n[2]);
        }
      }
      for (let j = 0; j < segments; j++) {
        for (let i = 0; i < segments; i++) {
          const a = baseIndex + j * (segments + 1) + i;
          const b = a + 1;
          const c2 = a + segments + 1;
          const d = c2 + 1;
          idx.push(a, c2, b, b, c2, d);
        }
      }
    }
    return { verts: new Float32Array(verts), idx: new Uint16Array(idx) };
  }

  const mesh = buildRoundedCube(5, 0.78);

  /* ---------- formations: one per section ---------- */

  const COUNT = 110;
  const rand = (i, k) => {
    // deterministic pseudo-random per instance/channel
    const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  // Grid-packed cells inside a left-facing fish silhouette — blocks stack
  // like masonry so the shape reads even from a wall of cubes.
  const fishCells = (() => {
    const cells = [];
    const pitch = 0.145;
    for (let gy = -4; gy <= 4; gy++) {
      for (let gx = -7; gx <= 7; gx++) {
        const x = gx * pitch + (gy % 2 ? pitch * 0.5 : 0); // brick offset
        const y = gy * pitch;
        const inBody = ((x + 0.2) ** 2) / (0.7 ** 2) + (y ** 2) / (0.34 ** 2) < 1;
        const inTail = x > 0.42 && x < 1.0 && Math.abs(y) < 0.32 * ((x - 0.42) / 0.58);
        const inFin = y > 0.3 && y < 0.3 + Math.max(0, 0.26 - Math.abs(x + 0.3) * 1.1);
        if (inBody || inTail || inFin) cells.push([x, y]);
      }
    }
    return cells;
  })();

  function fishPoint(i, scale, salt) {
    const cell = fishCells[i % fishCells.length];
    const layer = Math.floor(i / fishCells.length) % 2 ? -0.07 : 0.07;
    return [
      (cell[0] + (rand(i, 31 + salt) - 0.5) * 0.05) * scale,
      (cell[1] + (rand(i, 32 + salt) - 0.5) * 0.05) * scale,
      (layer + (rand(i, 33 + salt) - 0.5) * 0.05) * scale,
    ];
  }

  const formations = [
    // 0 — hero: the block-built fish
    (i) => fishPoint(i, 1.15, 0),
    // 1 — seed: fibonacci lattice sphere (a world crystallizing)
    (i) => {
      const g = (1 + Math.sqrt(5)) / 2;
      const th = (2 * Math.PI * i) / g;
      const ph = Math.acos(1 - (2 * (i + 0.5)) / COUNT);
      const r = 0.92;
      return [
        r * Math.sin(ph) * Math.cos(th),
        r * Math.cos(ph),
        r * Math.sin(ph) * Math.sin(th),
      ];
    },
    // 2 — swarm: tilted vortex ring
    (i) => {
      const a = (i / COUNT) * Math.PI * 2 * 3 + rand(i, 3);
      const R = 0.85 + (rand(i, 4) - 0.5) * 0.22;
      const y = (rand(i, 5) - 0.5) * 0.4;
      const p = [Math.cos(a) * R, y, Math.sin(a) * R];
      const tilt = 0.5;
      return [
        p[0],
        p[1] * Math.cos(tilt) - p[2] * Math.sin(tilt) * 0.4,
        p[1] * Math.sin(tilt) * 0.4 + p[2] * Math.cos(tilt),
      ];
    },
    // 3 — rehearse: futures fanning out from one origin
    (i) => {
      const line = i % 7;
      const along = Math.floor(i / 7) / Math.floor(COUNT / 7);
      const slope = (line - 3) * 0.28;
      const x = -1.0 + along * 2.1;
      const s2 = (x + 1.0) / 2.1;
      return [
        x,
        slope * s2 * s2 * 1.1 + (rand(i, 6) - 0.5) * 0.06,
        (rand(i, 7) - 0.5) * 0.3 * s2,
      ];
    },
    // 4 — cases: ordered lab grid vs. loose playful cloud
    (i) => {
      if (i % 2 === 0) {
        const k = i / 2;
        const gx = k % 4, gy = Math.floor(k / 4) % 4, gz = Math.floor(k / 16);
        return [-0.95 + gx * 0.21, -0.32 + gy * 0.21, -0.2 + gz * 0.21];
      }
      const r = 0.55 * Math.cbrt(rand(i, 8));
      const th = rand(i, 9) * Math.PI * 2;
      const ph = Math.acos(rand(i, 10) * 2 - 1);
      return [
        0.75 + r * Math.sin(ph) * Math.cos(th),
        r * Math.cos(ph) * 0.8,
        r * Math.sin(ph) * Math.sin(th),
      ];
    },
    // 5 — outro: the fish meets its reflection
    (i) => {
      const p = fishPoint(Math.floor(i / 2), 0.95, 40);
      const mirrored = i % 2 === 1;
      return [
        p[0] + (mirrored ? (rand(i, 11) - 0.5) * 0.1 : 0),
        mirrored ? -0.62 - p[1] : 0.62 + p[1],
        p[2],
      ];
    },
  ];

  /* Per-formation placement: keep the sculpture clear of the copy on wide
   * screens; xFactor squeezes it back toward center on narrow viewports. */
  const FORM_OFF = [
    [0.85, 0.05, 0], [0.82, 0.0, 0], [0.78, 0.0, 0],
    [0.42, 0.0, 0], [0.35, 0.42, 0], [0.0, 0.12, 0],
  ];
  const FORM_SCALE = [0.95, 0.9, 0.85, 0.95, 0.72, 0.78];

  /* instance state: positions ease toward the active formation */
  const cur = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT);
  const seeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const p = formations[0](i);
    cur.set(p, i * 3);
    scales[i] = 0.105 + rand(i, 20) * 0.05;
    seeds[i] = rand(i, 21);
  }

  /* cube VAO with per-instance buffer */
  const cubeVao = gl.createVertexArray();
  gl.bindVertexArray(cubeVao);
  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.verts, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
  const ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.idx, gl.STATIC_DRAW);

  const instBuf = gl.createBuffer();
  const instData = new Float32Array(COUNT * 5); // pos.xyz, scale, seed
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
  gl.bufferData(gl.ARRAY_BUFFER, instData.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 20, 0);
  gl.vertexAttribDivisor(2, 1);
  gl.enableVertexAttribArray(3);
  gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 20, 12);
  gl.vertexAttribDivisor(3, 1);
  gl.bindVertexArray(null);

  /* ---------- render targets (color + depth) ---------- */

  function makeTarget() {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return { tex, fbo: gl.createFramebuffer(), depth: gl.createRenderbuffer() };
  }
  const targetA = makeTarget();
  const targetB = makeTarget();

  let W = 0, H = 0;
  const proj = new Float32Array(16);

  function perspective(out, fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    out.fill(0);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) / (near - far);
    out[11] = -1;
    out[14] = (2 * far * near) / (near - far);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
    W = Math.max(2, Math.floor(innerWidth * dpr));
    H = Math.max(2, Math.floor(innerHeight * dpr));
    canvas.width = W;
    canvas.height = H;
    for (const t of [targetA, targetB]) {
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, t.depth);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, W, H);
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, t.depth);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    perspective(proj, 0.66, W / H, 0.1, 20);
  }
  resize();
  addEventListener("resize", resize);

  /* ---------- pointer ---------- */

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * -2 + 1;
  }, { passive: true });

  /* ---------- render passes ---------- */

  function renderInto(target, id, time, spin) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, W, H);

    // 1. terrain backdrop
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.useProgram(terrainProg);
    gl.bindVertexArray(quadVao);
    gl.uniform2f(tu.res, W, H);
    gl.uniform1f(tu.time, time);
    gl.uniform1i(tu.id, id);
    gl.uniform2f(tu.mouse, mouse.sx, mouse.sy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 2. ice blocks
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(cubeProg);
    gl.bindVertexArray(cubeVao);
    gl.uniformMatrix4fv(ku.proj, false, proj);
    gl.uniform1f(ku.spin, spin);
    gl.uniform2f(ku.mouse, mouse.sx, mouse.sy);
    gl.uniform1f(ku.time, time);
    gl.uniform1f(ku.shell, 0);
    gl.drawElementsInstanced(gl.TRIANGLES, mesh.idx.length, gl.UNSIGNED_SHORT, 0, COUNT);

    // 3. glow shells (additive)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthMask(false);
    gl.uniform1f(ku.shell, 1);
    gl.drawElementsInstanced(gl.TRIANGLES, mesh.idx.length, gl.UNSIGNED_SHORT, 0, COUNT);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  }

  /* ---------- main loop ---------- */

  let last = performance.now();
  const frozenTime = 40.0;

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

    // morph instances toward the blended formation target
    const ease = t * t * (3 - 2 * t);
    const mk = reducedMotion ? 1 : 1 - Math.exp(-dt * 3.4);
    const xf = Math.min(1, (W / H) * 0.62); // recenter on narrow screens
    const b = Math.min(a + 1, N - 1);
    for (let i = 0; i < COUNT; i++) {
      const pa = formations[a](i);
      const pb = formations[b](i);
      for (let c = 0; c < 3; c++) {
        const ga = pa[c] * FORM_SCALE[a] + FORM_OFF[a][c] * (c === 0 ? xf : 1);
        const gb = pb[c] * FORM_SCALE[b] + FORM_OFF[b][c] * (c === 0 ? xf : 1);
        const goal = ga + (gb - ga) * ease;
        cur[i * 3 + c] += (goal - cur[i * 3 + c]) * mk;
      }
      instData[i * 5] = cur[i * 3];
      instData[i * 5 + 1] = cur[i * 3 + 1];
      instData[i * 5 + 2] = cur[i * 3 + 2];
      instData[i * 5 + 3] = scales[i];
      instData[i * 5 + 4] = seeds[i];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, instData);

    const spin = reducedMotion ? 0 : Math.sin(time * 0.22) * 0.2;
    renderInto(targetA, a, time, spin);
    if (t > 0.0005) renderInto(targetB, a + 1, time, spin);

    // composite
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(compProg);
    gl.bindVertexArray(quadVao);
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
    gl.bindVertexArray(null);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
