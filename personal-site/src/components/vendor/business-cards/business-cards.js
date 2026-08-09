// Standalone, embeddable 3D business-card gallery.
//
//   import { mountBusinessCards } from "./business-cards.js";
//   const app = mountBusinessCards(document.querySelector("#cards"), {
//     businesses: [{ name, tagline, url }, ...],
//     background: "#000000",        // any css color, or "transparent"
//     theme: "dark",                // "dark" (light text) | "light" (dark text)
//     fontFamily: "Inter, sans-serif",
//     linkLabel: "visit ↗"
//   });
//   app.destroy();
//
// Everything (renderer, cards, browse/inspect interactions, UI chrome) is
// created inside the container and torn down by destroy(). The only peer
// dependency is three (an import-map entry or bundler resolution for "three").

import * as THREE from "three";

/* ------------------------------------------------------------------ cards */

const CARD_W = 1.5;
const CARD_H = 2.1;
const CARD_T = 0.045;

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

function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

function makeTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeFaceTexture(entry, index, font) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 896;
  const ctx = canvas.getContext("2d");

  roundedRectPath(ctx, 0, 0, 640, 896, 42);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#101114";
  ctx.fillRect(0, 0, 640, 896);

  ctx.strokeStyle = "rgba(235, 233, 228, 0.12)";
  ctx.lineWidth = 2;
  roundedRectPath(ctx, 18, 18, 604, 860, 30);
  ctx.stroke();

  const cream = "rgba(235, 233, 228, 0.92)";
  const dim = "rgba(235, 233, 228, 0.45)";

  ctx.fillStyle = cream;
  ctx.font = `30px ${font}`;
  ctx.fillText(entry.name.toLowerCase(), 52, 84);
  ctx.fillStyle = dim;
  ctx.font = `22px ${font}`;
  ctx.fillText("business", 52, 120);
  ctx.fillText("card series", 52, 150);

  ctx.font = `26px ${font}`;
  ctx.textAlign = "right";
  ctx.fillStyle = cream;
  ctx.fillText(`c-${String(index + 1).padStart(2, "0")}`, 588, 88);
  ctx.textAlign = "left";

  ctx.fillStyle = cream;
  ctx.font = `40px ${font}`;
  ctx.fillText(entry.name.toLowerCase(), 52, 756);
  if (entry.tagline) {
    ctx.fillStyle = dim;
    ctx.font = `22px ${font}`;
    wrapText(ctx, entry.tagline.toLowerCase(), 52, 796, 536, 30);
  }

  ctx.restore();
  return makeTexture(canvas);
}

function makeBackTexture(index, font) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 896;
  const ctx = canvas.getContext("2d");
  roundedRectPath(ctx, 0, 0, 640, 896, 42);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#0f1013";
  ctx.fillRect(0, 0, 640, 896);
  ctx.strokeStyle = "rgba(235, 233, 228, 0.16)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(320, 388);
  ctx.lineTo(384, 498);
  ctx.lineTo(256, 498);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(235, 233, 228, 0.3)";
  ctx.font = `24px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText(`c-${String(index + 1).padStart(2, "0")}`, 320, 852);
  ctx.restore();
  return makeTexture(canvas);
}

function makeBodyGeometry() {
  const w = CARD_W - 0.016;
  const h = CARD_H - 0.016;
  const r = 0.1;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0);
  shape.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2);
  shape.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI);
  shape.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: CARD_T - 0.016,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 12
  });
  geometry.center();
  return geometry;
}

function makeTriangleGeometry() {
  const s = 0.56;
  const fillet = 0.09;
  const pts = [
    new THREE.Vector2(0, s * 0.66),
    new THREE.Vector2(s * 0.62, -s * 0.4),
    new THREE.Vector2(-s * 0.62, -s * 0.4)
  ];
  const shape = new THREE.Shape();
  const towards = (a, b, dist) => a.clone().add(b.clone().sub(a).setLength(dist));
  for (let i = 0; i < 3; i++) {
    const prev = pts[(i + 2) % 3];
    const p = pts[i];
    const next = pts[(i + 1) % 3];
    const entry = towards(p, prev, fillet);
    const exit = towards(p, next, fillet);
    if (i === 0) shape.moveTo(entry.x, entry.y);
    else shape.lineTo(entry.x, entry.y);
    shape.quadraticCurveTo(p.x, p.y, exit.x, exit.y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 3,
    curveSegments: 10
  });
  geometry.center();
  return geometry;
}

function createCard(index, entry, font, shared) {
  const rand = mulberry32(index * 4243 + 977);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x141518,
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.7,
    clearcoatRoughness: 0.24,
    envMapIntensity: 0.9
  });

  const pivot = new THREE.Group();
  const body = new THREE.Mesh(shared.body, bodyMat);
  body.castShadow = true;
  pivot.add(body);

  const decal = (map) => new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    roughness: 0.55,
    metalness: 0,
    envMapIntensity: 0.35,
    polygonOffset: true,
    polygonOffsetFactor: -1
  });

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_W - 0.02, CARD_H - 0.02),
    decal(makeFaceTexture(entry, index, font))
  );
  face.position.z = CARD_T / 2 + 0.002;
  pivot.add(face);

  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_W - 0.02, CARD_H - 0.02),
    decal(makeBackTexture(index, font))
  );
  back.position.z = -CARD_T / 2 - 0.002;
  back.rotation.y = Math.PI;
  pivot.add(back);

  const triangle = new THREE.Mesh(
    shared.triangle,
    new THREE.MeshPhysicalMaterial({
      color: 0xd2ddcc,
      roughness: 0.12,
      metalness: 1,
      iridescence: 1,
      iridescenceIOR: 1.8,
      iridescenceThicknessRange: [120, 700],
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 2.6
    })
  );
  triangle.position.set(0, CARD_H * 0.06, CARD_T / 2 + 0.018);
  triangle.rotation.z = (rand() - 0.5) * 0.04;
  pivot.add(triangle);

  return { index, title: entry.name, url: entry.url, pivot };
}

/* -------------------------------------------------------------------- app */

const CAMERA_Z = 8.5;
const CAMERA_Y = 1.55;
const INSPECT_Z = 2.0;
const INSPECT_Y = CAMERA_Y + 0.14;
const OPEN_YAW = 0.14;
const CARD_LIFT = 0.32;

export function mountBusinessCards(container, options = {}) {
  const {
    businesses = [],
    background = "#000000",
    theme = "dark",
    fontFamily = "Inter, sans-serif",
    linkLabel = "visit ↗",
    hint = "drag, scroll or use arrow keys · select a card to inspect"
  } = options;
  if (!businesses.length) throw new Error("mountBusinessCards: businesses is empty");

  const MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.25 : 1;

  /* ------------------------------------------------------------- DOM */
  container.classList.add("bc");
  if (theme === "light") container.classList.add("bc-light");
  container.tabIndex = container.tabIndex >= 0 ? container.tabIndex : 0;
  container.innerHTML = `
    <canvas class="bc-canvas" aria-label="3d business cards"></canvas>
    <nav class="bc-browse" aria-label="card navigation">
      <button class="bc-nav" data-bc="prev" aria-label="previous card">&larr;</button>
      <div class="bc-markers" role="tablist"></div>
      <button class="bc-nav" data-bc="next" aria-label="next card">&rarr;</button>
    </nav>
    <p class="bc-hint"></p>
    <div class="bc-inspect" hidden>
      <button class="bc-close" aria-label="close inspection">&times;</button>
      <div class="bc-caption">
        <span class="bc-title"></span>
        <a class="bc-link" target="_blank" rel="noopener noreferrer"></a>
      </div>
    </div>`;
  const canvas = container.querySelector(".bc-canvas");
  const browseNav = container.querySelector(".bc-browse");
  const markersEl = container.querySelector(".bc-markers");
  const hintEl = container.querySelector(".bc-hint");
  const inspectUI = container.querySelector(".bc-inspect");
  const titleEl = container.querySelector(".bc-title");
  const linkEl = container.querySelector(".bc-link");
  hintEl.textContent = hint;
  linkEl.textContent = linkLabel;

  /* -------------------------------------------------------- renderer */
  const transparent = background === "transparent";
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: transparent });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

  const hemi = new THREE.HemisphereLight(0x2c2e33, 0x050506, 0.55);
  const key = new THREE.DirectionalLight(0xfff2e2, 1.75);
  const rim = new THREE.DirectionalLight(0xbfd0e8, 1.1);
  const fill = new THREE.DirectionalLight(0xfff4e6, 0);
  const ambient = new THREE.AmbientLight(0xf2ede2, 0);
  scene.add(hemi, key, key.target, rim, rim.target, fill, fill.target, ambient);

  const veil = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 80),
    new THREE.MeshBasicMaterial({
      color: transparent || theme !== "light" ? 0x000000 : new THREE.Color(background),
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
  );
  veil.position.set(0, 1.5, 1.35);
  veil.visible = false;
  scene.add(veil);

  /* ---------------------------------------------------------- cards */
  const shared = { body: makeBodyGeometry(), triangle: makeTriangleGeometry() };
  const cards = [];
  {
    let cursor = 0;
    for (let i = 0; i < businesses.length; i++) {
      const card = createCard(i, businesses[i], fontFamily, shared);
      const slot = new THREE.Group();
      const tilt = new THREE.Group();
      slot.add(tilt);
      tilt.add(card.pivot);
      cursor += CARD_W / 2;
      slot.position.set(cursor, CARD_H / 2 + CARD_LIFT, 0);
      cursor += CARD_W / 2 + 0.55;
      card.slot = slot;
      card.tilt = tilt;
      card.baseX = slot.position.x;
      card.baseY = slot.position.y;
      scene.add(slot);
      cards.push(card);
    }
    const offset = cursor / 2 - CARD_W / 2 - 0.05;
    for (const card of cards) {
      card.slot.position.x -= offset;
      card.baseX -= offset;
    }
  }
  const minX = cards[0].baseX;
  const maxX = cards[cards.length - 1].baseX;

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
  let scrollTarget = cards[Math.floor(cards.length / 2)].baseX;
  let scrollX = scrollTarget;
  let scrollVel = 0;
  let focusIndex = Math.floor(cards.length / 2);
  let mode = "browse"; // browse | opening | inspect | closing
  let inspected = null;
  const orbit = { yaw: 0, pitch: 0, yawVel: 0, pitchVel: 0, dist: INSPECT_Z, distTarget: INSPECT_Z, panX: 0, panY: 0 };

  /* -------------------------------------------------------- markers */
  const markerButtons = cards.map((card, i) => {
    const btn = document.createElement("button");
    btn.className = "bc-marker";
    btn.setAttribute("aria-label", `${card.title.toLowerCase()}, position ${i + 1}`);
    btn.appendChild(document.createElement("span"));
    btn.addEventListener("click", () => {
      if (mode === "inspect") switchTo(cards[i]);
      else if (mode === "browse") goTo(i);
    });
    markersEl.appendChild(btn);
    return btn;
  });
  markerButtons[focusIndex].classList.add("active");

  const setFocus = (i) => {
    i = THREE.MathUtils.clamp(i, 0, cards.length - 1);
    if (i === focusIndex) return;
    markerButtons[focusIndex].classList.remove("active");
    focusIndex = i;
    markerButtons[focusIndex].classList.add("active");
  };
  const goTo = (i) => {
    i = THREE.MathUtils.clamp(i, 0, cards.length - 1);
    scrollTarget = cards[i].baseX;
    scrollVel = 0;
  };

  /* --------------------------------------------------- inspect flow */
  function openInspect(card) {
    if (mode !== "browse") return;
    mode = "opening";
    inspected = card;
    goTo(card.index);
    hintEl.classList.add("bc-hidden");
    browseNav.classList.add("bc-hidden");
    Object.assign(orbit, { yaw: 0, pitch: 0, yawVel: 0, pitchVel: 0, dist: INSPECT_Z, distTarget: INSPECT_Z, panX: 0, panY: 0 });

    veil.visible = true;
    const fromY = card.slot.position.y;
    const fromZ = card.slot.position.z;
    const fromYaw = card.pivot.rotation.y;
    const veilFrom = veil.material.opacity;
    tween(0.9, (e) => {
      card.slot.position.z = THREE.MathUtils.lerp(fromZ, INSPECT_Z, e);
      card.slot.position.y = THREE.MathUtils.lerp(fromY, INSPECT_Y, e);
      card.pivot.rotation.y = THREE.MathUtils.lerp(fromYaw, OPEN_YAW, e);
      veil.material.opacity = THREE.MathUtils.lerp(veilFrom, 0.84, e);
    }, () => { mode = "inspect"; });

    titleEl.textContent = card.title.toLowerCase();
    linkEl.href = card.url;
    inspectUI.hidden = false;
    requestAnimationFrame(() => inspectUI.classList.add("visible"));
  }

  function closeInspect(done) {
    if (mode !== "inspect") return;
    mode = "closing";
    const card = inspected;
    const from = {
      z: card.slot.position.z, y: card.slot.position.y, x: card.slot.position.x,
      yaw: card.pivot.rotation.y, pitch: card.tilt.rotation.x, veil: veil.material.opacity
    };
    tween(0.8, (e) => {
      card.slot.position.z = THREE.MathUtils.lerp(from.z, 0, e);
      card.slot.position.y = THREE.MathUtils.lerp(from.y, card.baseY, e);
      card.slot.position.x = THREE.MathUtils.lerp(from.x, card.baseX, e);
      card.pivot.rotation.y = THREE.MathUtils.lerp(from.yaw, 0, e);
      card.tilt.rotation.x = THREE.MathUtils.lerp(from.pitch, 0, e);
      veil.material.opacity = THREE.MathUtils.lerp(from.veil, 0, e);
    }, () => {
      veil.visible = false;
      inspected = null;
      mode = "browse";
      if (done) done();
    });
    inspectUI.classList.remove("visible");
    if (!done) {
      hintEl.classList.remove("bc-hidden");
      browseNav.classList.remove("bc-hidden");
    }
    setTimeout(() => { if (mode !== "inspect") inspectUI.hidden = true; }, 450 * MOTION + 50);
  }

  const switchTo = (card) => {
    if (mode !== "inspect" || card === inspected) return;
    closeInspect(() => openInspect(card));
  };

  /* ---------------------------------------------------------- input */
  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();
  const pickCard = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    pointerNDC.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointerNDC, camera);
    const hits = raycaster.intersectObjects(cards.map((c) => c.pivot), true);
    if (!hits.length) return null;
    let obj = hits[0].object;
    while (obj) {
      const found = cards.find((c) => c.pivot === obj);
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
      if (mode === "browse") canvas.classList.toggle("over-card", !!pickCard(e.clientX, e.clientY));
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
    const hit = pickCard(e.clientX, e.clientY);
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
        const next = THREE.MathUtils.clamp(inspected.index + dir, 0, cards.length - 1);
        if (next !== inspected.index) switchTo(cards[next]);
      }
      e.preventDefault();
    } else if (e.key === "Enter" && mode === "browse" && e.target === container) {
      openInspect(cards[focusIndex]);
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
  container.querySelector('[data-bc="prev"]').addEventListener("click", () => goTo(focusIndex - 1));
  container.querySelector('[data-bc="next"]').addEventListener("click", () => goTo(focusIndex + 1));
  container.querySelector(".bc-close").addEventListener("click", () => closeInspect());

  /* ----------------------------------------------------------- loop */
  const clock = new THREE.Clock();
  let elapsed = 0;
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
      for (let i = 0; i < cards.length; i++) {
        const d = Math.abs(cards[i].baseX - scrollX);
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

    elapsed += dt;
    for (const card of cards) {
      if (card === inspected) continue;
      const targetZ = mode === "browse" && card.index === focusIndex ? 0.24 : 0;
      card.slot.position.z += (targetZ - card.slot.position.z) * Math.min(dt * 7, 1);
      card.slot.rotation.y = Math.sin(elapsed * 0.6 + card.index * 1.7) * 0.055;
      card.slot.position.y = card.baseY + Math.sin(elapsed * 0.85 + card.index * 2.3) * 0.024;
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
    open: (i) => openInspect(cards[THREE.MathUtils.clamp(i, 0, cards.length - 1)]),
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
      container.classList.remove("bc", "bc-light");
    }
  };
}
