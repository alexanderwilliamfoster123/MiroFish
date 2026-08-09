// Standalone, embeddable VHS tape shelf.
//
//   import { mountTapeShelf } from "./tape-shelf.js";
//   const app = mountTapeShelf(document.querySelector("#shelf"), {
//     tapes: [{ title, url }, ...],
//     background: "#000000",        // any css color, or "transparent"
//     theme: "dark",                // "dark" (light text) | "light" (dark text)
//     fontFamily: "Inter, sans-serif",
//     linkLabel: "watch on youtube ↗"
//   });
//   app.destroy();
//
// A continuous shelf of procedural 90s cassettes (beveled clearcoat shells,
// cream stickers with per-tape stripe accents, spool windows with per-tape
// wind ratios) with drag / wheel / arrow browsing and click-to-inspect
// orbit, pan, and zoom. The only peer dependency is three (import-map entry
// or bundler resolution for "three").

import * as THREE from "three";

/* ------------------------------------------------------------------ tapes */

const INK = "#2b2721";
const STRIPE_SETS = [
  ["#9c4a40", "#c0803a", "#54683f"],
  ["#3f5c82", "#9c4a40", "#c8b98a"],
  ["#54683f", "#3f5c82", "#9c4a40"],
  ["#7d5c8a", "#c0803a", "#3f5c82"],
  ["#c0803a", "#54683f", "#7d5c8a"],
  ["#456e6a", "#c8b98a", "#9c4a40"]
];

const TAPE_H = 2.6;
const TAPE_T = 0.35;
const TAPE_D = 1.43;
const BEVEL = 0.016;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function stripes(ctx, x, y, w, set) {
  const bandH = 7;
  set.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y + i * (bandH + 4), w, bandH);
  });
  return y + set.length * (bandH + 4) + 8;
}

function paperBase(ctx, w, h, age) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `rgb(${233 - age * 14}, ${228 - age * 18}, ${212 - age * 24})`);
  g.addColorStop(1, `rgb(${225 - age * 18}, ${219 - age * 22}, ${200 - age * 28})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(90, 74, 50, 0.18)";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
}

function makeSpineSticker(title, index, set, age, font) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1560;
  const ctx = canvas.getContext("2d");
  roundedRectPath(ctx, 6, 6, 244, 1548, 26);
  ctx.save();
  ctx.clip();
  paperBase(ctx, 256, 1560, age);
  stripes(ctx, 30, 42, 196, set);
  ctx.fillStyle = INK;
  ctx.save();
  ctx.translate(150, 148);
  ctx.rotate(Math.PI / 2);
  ctx.font = `46px ${font}`;
  ctx.textBaseline = "middle";
  ctx.fillText(title.toLowerCase(), 0, 0);
  ctx.restore();
  ctx.font = `38px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText(String(index + 1).padStart(2, "0"), 128, 1488);
  ctx.restore();
  return makeTexture(canvas);
}

function makeFaceSticker(title, index, set, age, font) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 340;
  const ctx = canvas.getContext("2d");
  roundedRectPath(ctx, 6, 6, 888, 328, 22);
  ctx.save();
  ctx.clip();
  paperBase(ctx, 900, 340, age);
  const after = stripes(ctx, 40, 40, 820, set);
  ctx.fillStyle = INK;
  ctx.font = `58px ${font}`;
  ctx.textAlign = "left";
  ctx.fillText(title.toLowerCase(), 40, after + 78);
  ctx.font = `34px ${font}`;
  ctx.textAlign = "right";
  ctx.fillText(String(index + 1).padStart(2, "0"), 860, 340 - 42);
  ctx.strokeStyle = "rgba(90, 74, 50, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, after + 108);
  ctx.lineTo(860, after + 108);
  ctx.stroke();
  ctx.restore();
  return makeTexture(canvas);
}

function makeWindowTexture(wind) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1d1d20";
  ctx.fillRect(0, 0, 640, 300);

  const reels = [
    { cx: 160, r: 58 + wind * 60 },
    { cx: 480, r: 58 + (1 - wind) * 60 }
  ];
  for (const { cx, r } of reels) {
    ctx.fillStyle = "#211b16";
    ctx.beginPath();
    ctx.arc(cx, 150, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, 150, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1.6;
    for (let rr = 34; rr < r - 4; rr += 6) {
      ctx.beginPath();
      ctx.arc(cx, 150, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#b9b3a2";
    ctx.beginPath();
    ctx.arc(cx, 150, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1a1613";
    ctx.lineWidth = 5;
    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * Math.PI * 2 + 0.3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 10, 150 + Math.sin(a) * 10);
      ctx.lineTo(cx + Math.cos(a) * 25, 150 + Math.sin(a) * 25);
      ctx.stroke();
    }
    ctx.fillStyle = "#6f6a5e";
    ctx.beginPath();
    ctx.arc(cx, 150, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  const frame = ctx.createLinearGradient(0, 0, 0, 300);
  frame.addColorStop(0, "rgba(0,0,0,0.6)");
  frame.addColorStop(0.12, "rgba(0,0,0,0)");
  frame.addColorStop(0.88, "rgba(0,0,0,0)");
  frame.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = frame;
  ctx.fillRect(0, 0, 640, 300);
  ctx.strokeStyle = "rgba(0,0,0,0.7)";
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, 640, 300);
  return makeTexture(canvas);
}

function makeBackDetail() {
  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = "rgba(0,0,0,0.32)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 250);
  ctx.lineTo(530, 250);
  ctx.moveTo(30, 760);
  ctx.lineTo(530, 760);
  ctx.stroke();
  for (const [sx, sy] of [[48, 52], [512, 52], [48, 972], [512, 972], [280, 500]]) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.arc(sx, sy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx - 6, sy);
    ctx.lineTo(sx + 6, sy);
    ctx.stroke();
  }
  return makeTexture(canvas);
}

function makeShellGeometry() {
  const d = TAPE_D - BEVEL * 2;
  const h = TAPE_H - BEVEL * 2;
  const r = 0.045;
  const shape = new THREE.Shape();
  shape.moveTo(-d / 2 + r, -h / 2);
  shape.absarc(d / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0);
  shape.absarc(d / 2 - r, h / 2 - r, r, 0, Math.PI / 2);
  shape.absarc(-d / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI);
  shape.absarc(-d / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: TAPE_T - BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
    curveSegments: 10
  });
  geometry.center();
  geometry.rotateY(Math.PI / 2);
  return geometry;
}

// One cassette: spine toward +z, large faces toward +x / -x, resting on y=0.
function createTape(index, entry, font, shared) {
  const rand = mulberry32(index * 7919 + 131);

  const tone = new THREE.Color(0x26282c);
  tone.offsetHSL((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.02);
  const set = STRIPE_SETS[index % STRIPE_SETS.length];
  const age = rand();

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: tone,
    roughness: 0.44,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.32,
    envMapIntensity: 0.85
  });
  const stickerMat = (map) => new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    roughness: 0.86,
    metalness: 0,
    envMapIntensity: 0.25,
    polygonOffset: true,
    polygonOffsetFactor: -1
  });

  const pivot = new THREE.Group();

  const shell = new THREE.Mesh(shared.shell, shellMat);
  shell.castShadow = true;
  pivot.add(shell);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(TAPE_T + 0.014, TAPE_H * 0.14, TAPE_D * 0.965),
    shellMat
  );
  door.position.y = -TAPE_H / 2 + TAPE_H * 0.075;
  door.castShadow = true;
  pivot.add(door);
  const seam = new THREE.Mesh(
    new THREE.BoxGeometry(TAPE_T + 0.016, 0.012, TAPE_D * 0.965),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  seam.position.y = -TAPE_H / 2 + TAPE_H * 0.145;
  pivot.add(seam);

  const spineSticker = new THREE.Mesh(
    new THREE.PlaneGeometry(TAPE_T * 0.82, TAPE_H * 0.72),
    stickerMat(makeSpineSticker(entry.title, index, set, age, font))
  );
  spineSticker.position.set(0, TAPE_H * 0.09, TAPE_D / 2 + 0.002);
  spineSticker.rotation.z = (rand() - 0.5) * 0.022;
  pivot.add(spineSticker);

  const faceSticker = new THREE.Mesh(
    new THREE.PlaneGeometry(TAPE_D * 0.78, TAPE_D * 0.78 * (340 / 900)),
    stickerMat(makeFaceSticker(entry.title, index, set, age, font))
  );
  faceSticker.position.set(TAPE_T / 2 + 0.002, TAPE_H * 0.3, 0);
  faceSticker.rotation.y = Math.PI / 2;
  faceSticker.rotation.x = (rand() - 0.5) * 0.02;
  pivot.add(faceSticker);

  const windowW = TAPE_D * 0.62;
  const windowH = windowW * (300 / 640);
  const windowPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(windowW, windowH),
    new THREE.MeshStandardMaterial({
      map: makeWindowTexture(0.2 + 0.6 * (index / 18)),
      roughness: 0.5,
      metalness: 0,
      envMapIntensity: 0.3,
      polygonOffset: true,
      polygonOffsetFactor: -1
    })
  );
  windowPlate.position.set(TAPE_T / 2 + 0.0015, -TAPE_H * 0.07, 0);
  windowPlate.rotation.y = Math.PI / 2;
  pivot.add(windowPlate);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(windowW, windowH),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.09,
      roughness: 0.06,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.6,
      depthWrite: false
    })
  );
  glass.position.set(TAPE_T / 2 + 0.006, -TAPE_H * 0.07, 0);
  glass.rotation.y = Math.PI / 2;
  pivot.add(glass);

  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(TAPE_D * 0.94, TAPE_H * 0.94),
    new THREE.MeshStandardMaterial({
      map: shared.backDetail,
      transparent: true,
      roughness: 0.44,
      metalness: 0,
      envMapIntensity: 0,
      polygonOffset: true,
      polygonOffsetFactor: -1
    })
  );
  back.position.set(-TAPE_T / 2 - 0.002, 0, 0);
  back.rotation.y = -Math.PI / 2;
  pivot.add(back);

  return { index, title: entry.title, url: entry.url, pivot };
}

/* -------------------------------------------------------------------- app */

const CAMERA_Z = 8.5;
const CAMERA_Y = 1.55;
const INSPECT_Z = 2.0;
const INSPECT_Y = CAMERA_Y + 0.14;
const OPEN_YAW = -Math.PI * 0.34;

export function mountTapeShelf(container, options = {}) {
  const {
    tapes = [],
    background = "#000000",
    theme = "dark",
    fontFamily = "Inter, sans-serif",
    linkLabel = "watch on youtube ↗",
    hint = "drag, scroll or use arrow keys · select a tape to inspect"
  } = options;
  if (!tapes.length) throw new Error("mountTapeShelf: tapes is empty");

  const MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.25 : 1;
  const light = theme === "light";

  /* ------------------------------------------------------------- DOM */
  container.classList.add("ts");
  if (light) container.classList.add("ts-light");
  container.tabIndex = container.tabIndex >= 0 ? container.tabIndex : 0;
  container.innerHTML = `
    <canvas class="ts-canvas" aria-label="3d tape shelf"></canvas>
    <nav class="ts-browse" aria-label="tape navigation">
      <button class="ts-nav" data-ts="prev" aria-label="previous tape">&larr;</button>
      <div class="ts-markers" role="tablist"></div>
      <button class="ts-nav" data-ts="next" aria-label="next tape">&rarr;</button>
    </nav>
    <p class="ts-hint"></p>
    <div class="ts-inspect" hidden>
      <button class="ts-close" aria-label="close inspection">&times;</button>
      <div class="ts-caption">
        <span class="ts-title"></span>
        <a class="ts-link" target="_blank" rel="noopener noreferrer"></a>
      </div>
    </div>`;
  const canvas = container.querySelector(".ts-canvas");
  const browseNav = container.querySelector(".ts-browse");
  const markersEl = container.querySelector(".ts-markers");
  const hintEl = container.querySelector(".ts-hint");
  const inspectUI = container.querySelector(".ts-inspect");
  const titleEl = container.querySelector(".ts-title");
  const linkEl = container.querySelector(".ts-link");
  hintEl.textContent = hint;
  linkEl.textContent = linkLabel;

  /* -------------------------------------------------------- renderer */
  const transparent = background === "transparent";
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: transparent });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  if (!transparent) scene.background = new THREE.Color(background);

  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
  camera.position.set(0, CAMERA_Y, CAMERA_Z);

  const size = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  size();
  const resizeObserver = new ResizeObserver(size);
  resizeObserver.observe(container);

  /* ------------------------------------------------------- lighting */
  {
    const envScene = new THREE.Scene();
    const strip = (w, h, rgb, position, lookAt) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...rgb), side: THREE.DoubleSide })
      );
      mesh.position.set(...position);
      mesh.lookAt(...lookAt);
      envScene.add(mesh);
    };
    strip(14, 4, [5.5, 5.1, 4.5], [0, 7, 3], [0, 0, 0]);
    strip(3, 9, [1.1, 1.4, 2.0], [-8, 2, -3], [0, 1, 0]);
    strip(2.4, 7, [1.4, 1.2, 0.9], [8, 1.5, 2], [0, 1, 0]);
    strip(16, 8, [0.35, 0.34, 0.32], [0, -5, 2], [0, 0, 0]);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(envScene, 0.06).texture;
    pmrem.dispose();
  }

  const hemi = new THREE.HemisphereLight(
    light ? 0x9a9c9e : 0x2c2e33, 0x050506, light ? 1.1 : 0.55
  );
  const key = new THREE.DirectionalLight(0xfff2e2, 1.75);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.bias = -0.0004;
  const rim = new THREE.DirectionalLight(0xbfd0e8, 1.1);
  const fill = new THREE.DirectionalLight(0xfff4e6, 0);
  const ambient = new THREE.AmbientLight(0xf2ede2, 0);
  scene.add(hemi, key, key.target, rim, rim.target, fill, fill.target, ambient);

  const veil = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 80),
    new THREE.MeshBasicMaterial({
      color: transparent || !light ? 0x000000 : new THREE.Color(background),
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
  );
  veil.position.set(0, 1.5, 1.35);
  veil.visible = false;
  scene.add(veil);

  /* ---------------------------------------------------------- tapes */
  const shared = { shell: makeShellGeometry(), backDetail: makeBackDetail() };
  const items = [];
  {
    let cursor = 0;
    for (let i = 0; i < tapes.length; i++) {
      const item = createTape(i, tapes[i], fontFamily, shared);
      const slot = new THREE.Group();
      const tilt = new THREE.Group();
      slot.add(tilt);
      tilt.add(item.pivot);
      cursor += TAPE_T / 2;
      slot.position.set(cursor, TAPE_H / 2, 0);
      cursor += TAPE_T / 2 + 0.1 + ((i * 37) % 7) * 0.012;
      item.slot = slot;
      item.tilt = tilt;
      item.baseX = slot.position.x;
      item.baseY = slot.position.y;
      item.restZ = (((i * 53) % 9) - 4) * 0.014;
      slot.position.z = item.restZ;
      slot.rotation.y = (((i * 31) % 7) - 3) * 0.006;
      scene.add(slot);
      items.push(item);
    }
    const span = cursor;
    const offset = span / 2 - TAPE_T / 2 - 0.05;
    for (const item of items) {
      item.slot.position.x -= offset;
      item.baseX -= offset;
    }

    const boardLen = span + 3.2;
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(boardLen, 0.16, 2.1),
      new THREE.MeshStandardMaterial({
        color: light ? 0xdedcd5 : 0x1b1c1e,
        roughness: 0.55,
        metalness: 0.15
      })
    );
    board.position.y = -0.08;
    board.receiveShadow = true;
    scene.add(board);
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(boardLen, 0.012, 0.012),
      new THREE.MeshBasicMaterial({ color: light ? 0x4a473f : 0x6d685c })
    );
    edge.position.set(0, 0.002, 1.05);
    scene.add(edge);
  }
  const minX = items[0].baseX;
  const maxX = items[items.length - 1].baseX;

  /* --------------------------------------------------------- tweens */
  const tweens = [];
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tween = (dur, update, done) => tweens.push({ t: 0, dur: Math.max(dur * MOTION, 0.001), update, done });
  const runTweens = (dt) => {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const item = tweens[i];
      item.t = Math.min(item.t + dt / item.dur, 1);
      item.update(easeInOut(item.t));
      if (item.t >= 1) {
        tweens.splice(i, 1);
        if (item.done) item.done();
      }
    }
  };

  /* ---------------------------------------------------------- state */
  let scrollTarget = items[Math.floor(items.length / 2)].baseX;
  let scrollX = scrollTarget;
  let scrollVel = 0;
  let focusIndex = Math.floor(items.length / 2);
  let mode = "browse";
  let inspected = null;
  const orbit = { yaw: 0, pitch: 0, yawVel: 0, pitchVel: 0, dist: INSPECT_Z, distTarget: INSPECT_Z, panX: 0, panY: 0 };

  /* -------------------------------------------------------- markers */
  const markerButtons = items.map((item, i) => {
    const btn = document.createElement("button");
    btn.className = "ts-marker";
    btn.setAttribute("aria-label", `${item.title.toLowerCase()}, position ${i + 1}`);
    btn.appendChild(document.createElement("span"));
    btn.addEventListener("click", () => {
      if (mode === "inspect") switchTo(items[i]);
      else if (mode === "browse") goTo(i);
    });
    markersEl.appendChild(btn);
    return btn;
  });
  markerButtons[focusIndex].classList.add("active");

  const setFocus = (i) => {
    i = THREE.MathUtils.clamp(i, 0, items.length - 1);
    if (i === focusIndex) return;
    markerButtons[focusIndex].classList.remove("active");
    focusIndex = i;
    markerButtons[focusIndex].classList.add("active");
  };
  const goTo = (i) => {
    i = THREE.MathUtils.clamp(i, 0, items.length - 1);
    scrollTarget = items[i].baseX;
    scrollVel = 0;
  };

  /* --------------------------------------------------- inspect flow */
  function openInspect(item) {
    if (mode !== "browse") return;
    mode = "opening";
    inspected = item;
    goTo(item.index);
    hintEl.classList.add("ts-hidden");
    browseNav.classList.add("ts-hidden");
    Object.assign(orbit, { yaw: 0, pitch: 0, yawVel: 0, pitchVel: 0, dist: INSPECT_Z, distTarget: INSPECT_Z, panX: 0, panY: 0 });

    veil.visible = true;
    const fromY = item.slot.position.y;
    const fromZ = item.slot.position.z;
    const fromYaw = item.pivot.rotation.y;
    const veilFrom = veil.material.opacity;
    tween(0.9, (e) => {
      item.slot.position.z = THREE.MathUtils.lerp(fromZ, INSPECT_Z, e);
      item.slot.position.y = THREE.MathUtils.lerp(fromY, INSPECT_Y, e);
      item.pivot.rotation.y = THREE.MathUtils.lerp(fromYaw, OPEN_YAW, e);
      veil.material.opacity = THREE.MathUtils.lerp(veilFrom, 0.84, e);
    }, () => { mode = "inspect"; });

    titleEl.textContent = item.title.toLowerCase();
    linkEl.href = item.url;
    inspectUI.hidden = false;
    requestAnimationFrame(() => inspectUI.classList.add("visible"));
  }

  function closeInspect(done) {
    if (mode !== "inspect") return;
    mode = "closing";
    const item = inspected;
    const from = {
      z: item.slot.position.z, y: item.slot.position.y, x: item.slot.position.x,
      yaw: item.pivot.rotation.y, pitch: item.tilt.rotation.x, veil: veil.material.opacity
    };
    tween(0.8, (e) => {
      item.slot.position.z = THREE.MathUtils.lerp(from.z, item.restZ, e);
      item.slot.position.y = THREE.MathUtils.lerp(from.y, item.baseY, e);
      item.slot.position.x = THREE.MathUtils.lerp(from.x, item.baseX, e);
      item.pivot.rotation.y = THREE.MathUtils.lerp(from.yaw, 0, e);
      item.tilt.rotation.x = THREE.MathUtils.lerp(from.pitch, 0, e);
      veil.material.opacity = THREE.MathUtils.lerp(from.veil, 0, e);
    }, () => {
      veil.visible = false;
      inspected = null;
      mode = "browse";
      if (done) done();
    });
    inspectUI.classList.remove("visible");
    if (!done) {
      hintEl.classList.remove("ts-hidden");
      browseNav.classList.remove("ts-hidden");
    }
    setTimeout(() => { if (mode !== "inspect") inspectUI.hidden = true; }, 450 * MOTION + 50);
  }

  const switchTo = (item) => {
    if (mode !== "inspect" || item === inspected) return;
    closeInspect(() => openInspect(item));
  };

  /* ---------------------------------------------------------- input */
  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();
  const pickTape = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    pointerNDC.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointerNDC, camera);
    const hits = raycaster.intersectObjects(items.map((c) => c.pivot), true);
    if (!hits.length) return null;
    let obj = hits[0].object;
    while (obj) {
      const found = items.find((c) => c.pivot === obj);
      if (found) return found;
      obj = obj.parent;
    }
    return null;
  };

  const pointers = new Map();
  let dragTotal = 0;
  let lastPinchDist = 0;
  const worldPerPixel = () => 9.5 / (canvas.getBoundingClientRect().height || 1);

  const onPointerDown = (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button, shift: e.shiftKey });
    dragTotal = 0;
    scrollVel = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      lastPinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) {
      if (mode === "browse") canvas.classList.toggle("over-card", !!pickTape(e.clientX, e.clientY));
      return;
    }
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    dragTotal += Math.abs(dx) + Math.abs(dy);

    if (pointers.size === 2 && mode === "inspect") {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (lastPinchDist > 0) {
        orbit.distTarget = THREE.MathUtils.clamp(orbit.distTarget + (dist - lastPinchDist) * 0.01, 1.2, 3.6);
      }
      lastPinchDist = dist;
      orbit.panX = THREE.MathUtils.clamp(orbit.panX + dx * 0.5 * worldPerPixel(), -1.4, 1.4);
      orbit.panY = THREE.MathUtils.clamp(orbit.panY - dy * 0.5 * worldPerPixel(), -0.9, 0.9);
      return;
    }

    if (mode === "browse") {
      scrollTarget = THREE.MathUtils.clamp(scrollTarget - dx * worldPerPixel(), minX, maxX);
      scrollVel = -dx * worldPerPixel() * 60;
    } else if (mode === "inspect") {
      if (p.shift || p.button === 2 || p.button === 1) {
        orbit.panX = THREE.MathUtils.clamp(orbit.panX + dx * worldPerPixel(), -1.4, 1.4);
        orbit.panY = THREE.MathUtils.clamp(orbit.panY - dy * worldPerPixel(), -0.9, 0.9);
      } else {
        orbit.yawVel = dx * 0.005;
        orbit.pitchVel = dy * 0.005;
      }
    }
  };

  const onPointerUp = (e) => {
    const wasTap = pointers.has(e.pointerId) && dragTotal < 7;
    pointers.delete(e.pointerId);
    lastPinchDist = 0;
    canvas.classList.remove("dragging");
    if (!wasTap || e.button !== 0) return;
    const hit = pickTape(e.clientX, e.clientY);
    if (mode === "browse" && hit) openInspect(hit);
    else if (mode === "inspect" && hit && hit !== inspected) switchTo(hit);
  };

  const onPointerCancel = (e) => pointers.delete(e.pointerId);
  const onContextMenu = (e) => e.preventDefault();

  const onWheel = (e) => {
    e.preventDefault();
    if (mode === "browse") {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollTarget = THREE.MathUtils.clamp(scrollTarget + delta * 0.0035, minX, maxX);
      scrollVel = 0;
    } else if (mode === "inspect") {
      orbit.distTarget = THREE.MathUtils.clamp(orbit.distTarget - e.deltaY * 0.0022, 1.2, 3.6);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const dir = e.key === "ArrowLeft" ? -1 : 1;
      if (mode === "browse") goTo(focusIndex + dir);
      else if (mode === "inspect") {
        const next = THREE.MathUtils.clamp(inspected.index + dir, 0, items.length - 1);
        if (next !== inspected.index) switchTo(items[next]);
      }
      e.preventDefault();
    } else if (e.key === "Enter" && mode === "browse" && e.target === container) {
      openInspect(items[focusIndex]);
    } else if (e.key === "Escape") {
      closeInspect();
    }
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("contextmenu", onContextMenu);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  container.addEventListener("keydown", onKeyDown);
  container.querySelector('[data-ts="prev"]').addEventListener("click", () => goTo(focusIndex - 1));
  container.querySelector('[data-ts="next"]').addEventListener("click", () => goTo(focusIndex + 1));
  container.querySelector(".ts-close").addEventListener("click", () => closeInspect());

  /* ----------------------------------------------------------- loop */
  const clock = new THREE.Clock();
  let raf = 0;

  function animate() {
    raf = requestAnimationFrame(animate);
    const rawDt = clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const tweenDt = Math.min(rawDt, 0.25);

    if (mode === "browse") {
      if (pointers.size === 0 && Math.abs(scrollVel) > 0.001) {
        scrollTarget = THREE.MathUtils.clamp(scrollTarget + scrollVel * dt, minX, maxX);
        scrollVel *= Math.pow(0.06, dt);
      }
      let nearest = 0;
      let best = Infinity;
      for (let i = 0; i < items.length; i++) {
        const d = Math.abs(items[i].baseX - scrollX);
        if (d < best) { best = d; nearest = i; }
      }
      setFocus(nearest);
    } else if (inspected) {
      setFocus(inspected.index);
    }

    scrollX += (scrollTarget - scrollX) * Math.min(dt * 6.5, 1);
    camera.position.x = scrollX;
    camera.lookAt(scrollX, 1.32, 0);

    key.position.set(scrollX + 2.6, 6.4, 7.4);
    key.target.position.set(scrollX, 1, 0);
    rim.position.set(scrollX - 3.4, 4.2, -4.6);
    rim.target.position.set(scrollX, 1.4, 0);
    veil.position.x = scrollX;
    fill.position.set(scrollX + 0.6, CAMERA_Y + 0.9, CAMERA_Z);
    fill.target.position.set(scrollX, CAMERA_Y, INSPECT_Z);
    fill.intensity = veil.material.opacity * 2.6;
    ambient.intensity = veil.material.opacity * 0.9;

    for (const item of items) {
      if (item === inspected) continue;
      const targetZ = item.restZ + (mode === "browse" && item.index === focusIndex ? 0.24 : 0);
      item.slot.position.z += (targetZ - item.slot.position.z) * Math.min(dt * 7, 1);
    }

    if (mode === "inspect" && inspected) {
      orbit.yaw += orbit.yawVel;
      orbit.pitch = THREE.MathUtils.clamp(orbit.pitch + orbit.pitchVel, -0.62, 0.62);
      orbit.yawVel *= Math.pow(0.0001, dt);
      orbit.pitchVel *= Math.pow(0.0001, dt);
      orbit.dist += (orbit.distTarget - orbit.dist) * Math.min(dt * 8, 1);
      inspected.pivot.rotation.y = OPEN_YAW + orbit.yaw;
      inspected.tilt.rotation.x = orbit.pitch;
      inspected.slot.position.z = orbit.dist;
      inspected.slot.position.x = scrollX + orbit.panX;
      inspected.slot.position.y = INSPECT_Y + orbit.panY;
    }

    runTweens(tweenDt);
    renderer.render(scene, camera);
  }
  animate();

  /* -------------------------------------------------------- destroy */
  return {
    goTo,
    open: (i) => openInspect(items[THREE.MathUtils.clamp(i, 0, items.length - 1)]),
    close: () => closeInspect(),
    destroy() {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("contextmenu", onContextMenu);
      canvas.removeEventListener("wheel", onWheel);
      container.removeEventListener("keydown", onKeyDown);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
        for (const m of mats) {
          if (m.map) m.map.dispose();
          m.dispose();
        }
      });
      container.innerHTML = "";
      container.classList.remove("ts", "ts-light");
    }
  };
}
