import * as THREE from "three";
import { BOOKS } from "./books.js";
import { createBook } from "./tapeFactory.js";

const canvas = document.getElementById("scene");
const markersEl = document.getElementById("markers");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const closeBtn = document.getElementById("closeBtn");
const inspectUI = document.getElementById("inspectUI");
const inspectTitle = document.getElementById("inspectTitle");
const watchLink = document.getElementById("watchLink");
const browseNav = document.querySelector(".browse");
const hintEl = document.getElementById("hint");
document.getElementById("volumeCount").textContent = `${BOOKS.length} tapes`;

const MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.25 : 1;

// spine and cover titles are baked into canvas textures, so Inter must be
// resolved before any book is built
try {
  await Promise.all([document.fonts.load('44px "Inter"'), document.fonts.load('34px "Inter"')]);
} catch { /* fall back to the system font inside the textures */ }

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (err) {
  document.getElementById("fallback").hidden = false;
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// procedural studio environment: a few emissive strips baked to a PMREM so
// the plastic shells pick up believable reflections
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
  strip(14, 4, [5.5, 5.1, 4.5], [0, 7, 3], [0, 0, 0]);      // warm overhead softbox
  strip(3, 9, [1.1, 1.4, 2.0], [-8, 2, -3], [0, 1, 0]);     // cool side strip
  strip(2.4, 7, [1.4, 1.2, 0.9], [8, 1.5, 2], [0, 1, 0]);   // faint warm return
  strip(16, 8, [0.35, 0.34, 0.32], [0, -5, 2], [0, 0, 0]);  // dim floor bounce
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.06).texture;
  pmrem.dispose();
}

const camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 0.1, 60);
const CAMERA_Z = 8.5;
const CAMERA_Y = 1.55;
camera.position.set(0, CAMERA_Y, CAMERA_Z);

// ---------------------------------------------------------------- lighting
const hemi = new THREE.HemisphereLight(0x2c2e33, 0x050506, 0.55);
scene.add(hemi);

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
scene.add(key, key.target);

const rim = new THREE.DirectionalLight(0xbfd0e8, 1.1);
scene.add(rim, rim.target);

// camera-axis fill that fades in with the veil so an inspected shell never
// silhouettes into the black background while orbiting
const inspectLight = new THREE.DirectionalLight(0xfff4e6, 0);
scene.add(inspectLight, inspectLight.target);
// flat ambient floor for inspection so no orientation reads as a silhouette
const inspectAmbient = new THREE.AmbientLight(0xf2ede2, 0);
scene.add(inspectAmbient);

// ------------------------------------------------------------------- shelf
const shelfGroup = new THREE.Group();
scene.add(shelfGroup);

// ------------------------------------------------------------------- books
const books = [];
{
  let cursor = 0;
  const seededGap = (i) => 0.1 + ((i * 37) % 7) * 0.012;
  for (let i = 0; i < BOOKS.length; i++) {
    const book = createBook(i, BOOKS[i]);
    const slot = new THREE.Group();
    const tilt = new THREE.Group();
    slot.add(tilt);
    tilt.add(book.pivot);

    cursor += book.thickness / 2;
    slot.position.set(cursor, book.height / 2, 0);
    cursor += book.thickness / 2 + seededGap(i);

    book.slot = slot;
    book.tilt = tilt;
    book.baseX = slot.position.x;
    book.baseY = slot.position.y;
    // slight push-in/out and lean so the row of identical shells reads lived-in
    book.restZ = (((i * 53) % 9) - 4) * 0.014;
    slot.position.z = book.restZ;
    slot.rotation.y = (((i * 31) % 7) - 3) * 0.006;
    scene.add(slot);
    books.push(book);
  }
  const span = cursor;
  const offset = span / 2 - books[0].thickness / 2 - 0.05;
  for (const book of books) {
    book.slot.position.x -= offset;
    book.baseX -= offset;
  }

  const boardLen = span + 3.2;
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(boardLen, 0.16, 2.1),
    new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.55, metalness: 0.15 })
  );
  board.position.y = -0.08;
  board.receiveShadow = true;
  shelfGroup.add(board);

  // thin light rule along the shelf's front edge
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(boardLen, 0.012, 0.012),
    new THREE.MeshBasicMaterial({ color: 0x6d685c })
  );
  edge.position.set(0, 0.002, 1.05);
  shelfGroup.add(edge);
}

// darkening veil between the shelf and an inspected book
const veil = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 80),
  new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })
);
veil.position.set(0, 1.5, 1.35);
veil.visible = false;
scene.add(veil);

// ------------------------------------------------------------------ tweens
const tweens = [];
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function tween(dur, update, done) {
  const item = { t: 0, dur: Math.max(dur * MOTION, 0.001), update, done };
  tweens.push(item);
  return item;
}

function runTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const item = tweens[i];
    item.t = Math.min(item.t + dt / item.dur, 1);
    item.update(easeInOut(item.t), item.t);
    if (item.t >= 1) {
      tweens.splice(i, 1);
      if (item.done) item.done();
    }
  }
}

// ------------------------------------------------------------------- state
const minX = books[0].baseX;
const maxX = books[books.length - 1].baseX;

const startIndex = Math.floor(books.length / 2);
let scrollTarget = books[startIndex].baseX;
let scrollX = scrollTarget;
let scrollVel = 0;
let focusIndex = startIndex;

// mode: "browse" | "opening" | "inspect" | "closing"
let mode = "browse";
let inspected = null;
const orbit = { yaw: 0, pitch: 0, yawVel: 0, pitchVel: 0, dist: 2.0, distTarget: 2.0, panX: 0, panY: 0 };
const INSPECT_Z = 2.0;
const INSPECT_Y = CAMERA_Y + 0.14;
const INSPECT_YAW = -Math.PI * 0.34;

// ----------------------------------------------------------------- markers
const markerButtons = BOOKS.map((entry, i) => {
  const btn = document.createElement("button");
  btn.className = "marker";
  btn.setAttribute("aria-label", `${entry.title.toLowerCase()}, position ${i + 1}`);
  btn.appendChild(document.createElement("span"));
  btn.addEventListener("click", () => {
    if (mode === "inspect") switchTo(books[i]);
    else if (mode === "browse") goTo(i);
  });
  markersEl.appendChild(btn);
  return btn;
});

function setFocus(i) {
  i = THREE.MathUtils.clamp(i, 0, books.length - 1);
  if (i === focusIndex) return;
  markerButtons[focusIndex].classList.remove("active");
  focusIndex = i;
  markerButtons[focusIndex].classList.add("active");
}
markerButtons[focusIndex].classList.add("active");

function goTo(i) {
  i = THREE.MathUtils.clamp(i, 0, books.length - 1);
  scrollTarget = books[i].baseX;
  scrollVel = 0;
}

// ------------------------------------------------------------ inspect flow
function openInspect(book) {
  if (mode !== "browse") return;
  mode = "opening";
  inspected = book;
  goTo(book.index);
  hintEl.classList.add("hidden-ui");
  browseNav.classList.add("hidden-ui");

  orbit.yaw = 0;
  orbit.pitch = 0;
  orbit.yawVel = 0;
  orbit.pitchVel = 0;
  orbit.dist = INSPECT_Z;
  orbit.distTarget = INSPECT_Z;
  orbit.panX = 0;
  orbit.panY = 0;

  veil.visible = true;
  const fromY = book.baseY;
  const fromZ = book.slot.position.z;
  const veilFrom = veil.material.opacity;
  tween(0.9, (e) => {
    book.slot.position.z = THREE.MathUtils.lerp(fromZ, INSPECT_Z, e);
    book.slot.position.y = THREE.MathUtils.lerp(fromY, INSPECT_Y, e);
    book.pivot.rotation.y = THREE.MathUtils.lerp(0, INSPECT_YAW, e);
    veil.material.opacity = THREE.MathUtils.lerp(veilFrom, 0.84, e);
  }, () => {
    mode = "inspect";
  });

  inspectTitle.textContent = book.title.toLowerCase();
  watchLink.href = book.youtubeUrl;
  inspectUI.hidden = false;
  requestAnimationFrame(() => inspectUI.classList.add("visible"));
  closeBtn.focus({ preventScroll: true });
}

function closeInspect(done) {
  if (mode !== "inspect") return;
  mode = "closing";
  const book = inspected;
  const from = {
    z: book.slot.position.z,
    y: book.slot.position.y,
    x: book.slot.position.x,
    yaw: book.pivot.rotation.y,
    pitch: book.tilt.rotation.x,
    veil: veil.material.opacity
  };
  tween(0.8, (e) => {
    book.slot.position.z = THREE.MathUtils.lerp(from.z, book.restZ, e);
    book.slot.position.y = THREE.MathUtils.lerp(from.y, book.baseY, e);
    book.slot.position.x = THREE.MathUtils.lerp(from.x, book.baseX, e);
    book.pivot.rotation.y = THREE.MathUtils.lerp(from.yaw, 0, e);
    book.tilt.rotation.x = THREE.MathUtils.lerp(from.pitch, 0, e);
    veil.material.opacity = THREE.MathUtils.lerp(from.veil, 0, e);
  }, () => {
    veil.visible = false;
    inspected = null;
    mode = "browse";
    if (done) done();
  });
  inspectUI.classList.remove("visible");
  if (!done) {
    hintEl.classList.remove("hidden-ui");
    browseNav.classList.remove("hidden-ui");
  }
  setTimeout(() => { if (mode !== "inspect") inspectUI.hidden = true; }, 450 * MOTION + 50);
}

function switchTo(book) {
  if (mode !== "inspect" || book === inspected) return;
  closeInspect(() => openInspect(book));
}

closeBtn.addEventListener("click", () => closeInspect());

// ------------------------------------------------------------------- input
prevBtn.addEventListener("click", () => goTo(focusIndex - 1));
nextBtn.addEventListener("click", () => goTo(focusIndex + 1));

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    const dir = e.key === "ArrowLeft" ? -1 : 1;
    if (mode === "browse") {
      goTo(focusIndex + dir);
      e.preventDefault();
    } else if (mode === "inspect") {
      const next = THREE.MathUtils.clamp(inspected.index + dir, 0, books.length - 1);
      if (next !== inspected.index) switchTo(books[next]);
      e.preventDefault();
    }
  } else if (e.key === "Enter" && mode === "browse" && document.activeElement.tagName !== "BUTTON" && document.activeElement.tagName !== "A") {
    openInspect(books[focusIndex]);
  } else if (e.key === "Escape") {
    closeInspect();
  }
});

const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();

function pickBook(clientX, clientY) {
  pointerNDC.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(books.map((b) => b.pivot), true);
  if (!hits.length) return null;
  let obj = hits[0].object;
  while (obj) {
    const found = books.find((b) => b.pivot === obj);
    if (found) return found;
    obj = obj.parent;
  }
  return null;
}

const pointers = new Map();
let dragTotal = 0;
let lastPinchDist = 0;
const WORLD_PER_PIXEL = () => 9.5 / window.innerHeight;

canvas.addEventListener("pointerdown", (e) => {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button, shift: e.shiftKey });
  dragTotal = 0;
  scrollVel = 0;
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add("dragging");
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    lastPinchDist = Math.hypot(a.x - b.x, a.y - b.y);
  }
});

canvas.addEventListener("pointermove", (e) => {
  const p = pointers.get(e.pointerId);
  if (!p) {
    if (mode === "browse") {
      canvas.classList.toggle("over-book", !!pickBook(e.clientX, e.clientY));
    }
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
    orbit.panX = THREE.MathUtils.clamp(orbit.panX + dx * 0.5 * WORLD_PER_PIXEL(), -1.4, 1.4);
    orbit.panY = THREE.MathUtils.clamp(orbit.panY - dy * 0.5 * WORLD_PER_PIXEL(), -0.9, 0.9);
    return;
  }

  if (mode === "browse") {
    scrollTarget = THREE.MathUtils.clamp(scrollTarget - dx * WORLD_PER_PIXEL(), minX, maxX);
    scrollVel = -dx * WORLD_PER_PIXEL() * 60;
  } else if (mode === "inspect") {
    if (p.shift || p.button === 2 || p.button === 1) {
      orbit.panX = THREE.MathUtils.clamp(orbit.panX + dx * WORLD_PER_PIXEL(), -1.4, 1.4);
      orbit.panY = THREE.MathUtils.clamp(orbit.panY - dy * WORLD_PER_PIXEL(), -0.9, 0.9);
    } else {
      orbit.yawVel = dx * 0.005;
      orbit.pitchVel = dy * 0.005;
    }
  }
});

function releasePointer(e) {
  const wasTap = pointers.has(e.pointerId) && dragTotal < 7;
  pointers.delete(e.pointerId);
  lastPinchDist = 0;
  canvas.classList.remove("dragging");
  if (!wasTap) return;
  if (e.button !== 0) return;
  const hit = pickBook(e.clientX, e.clientY);
  if (mode === "browse" && hit) openInspect(hit);
  else if (mode === "inspect" && hit && hit !== inspected) switchTo(hit);
}
canvas.addEventListener("pointerup", releasePointer);
canvas.addEventListener("pointercancel", (e) => pointers.delete(e.pointerId));
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

window.addEventListener("wheel", (e) => {
  if (e.target.closest && e.target.closest(".browse, .inspect")) return;
  if (mode === "browse") {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    scrollTarget = THREE.MathUtils.clamp(scrollTarget + delta * 0.0035, minX, maxX);
    scrollVel = 0;
  } else if (mode === "inspect") {
    orbit.distTarget = THREE.MathUtils.clamp(orbit.distTarget - e.deltaY * 0.0022, 1.2, 3.6);
  }
}, { passive: true });

// ------------------------------------------------------------------ resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// -------------------------------------------------------------------- loop
const clock = new THREE.Clock();

function animate() {
  const rawDt = clock.getDelta();
  // physics-ish damping uses a tight clamp; tweens track real elapsed time
  const dt = Math.min(rawDt, 0.05);
  const tweenDt = Math.min(rawDt, 0.25);

  // shelf scrolling with inertia
  if (mode === "browse") {
    if (pointers.size === 0 && Math.abs(scrollVel) > 0.001) {
      scrollTarget = THREE.MathUtils.clamp(scrollTarget + scrollVel * dt, minX, maxX);
      scrollVel *= Math.pow(0.06, dt);
    }
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < books.length; i++) {
      const d = Math.abs(books[i].baseX - scrollX);
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
  inspectLight.position.set(scrollX + 0.6, CAMERA_Y + 0.9, CAMERA_Z);
  inspectLight.target.position.set(scrollX, CAMERA_Y, INSPECT_Z);
  inspectLight.intensity = veil.material.opacity * 2.6;
  inspectAmbient.intensity = veil.material.opacity * 0.9;

  // gentle pull-forward on the focused book while browsing
  for (const book of books) {
    if (book === inspected) continue;
    const targetZ = book.restZ + (mode === "browse" && book.index === focusIndex ? 0.24 : 0);
    book.slot.position.z += (targetZ - book.slot.position.z) * Math.min(dt * 7, 1);
  }

  // inspect orbit
  if (mode === "inspect" && inspected) {
    orbit.yaw += orbit.yawVel;
    orbit.pitch = THREE.MathUtils.clamp(orbit.pitch + orbit.pitchVel, -0.62, 0.62);
    orbit.yawVel *= Math.pow(0.0001, dt);
    orbit.pitchVel *= Math.pow(0.0001, dt);
    orbit.dist += (orbit.distTarget - orbit.dist) * Math.min(dt * 8, 1);

    inspected.pivot.rotation.y = INSPECT_YAW + orbit.yaw;
    inspected.tilt.rotation.x = orbit.pitch;
    inspected.slot.position.z = orbit.dist;
    inspected.slot.position.x = scrollX + orbit.panX;
    inspected.slot.position.y = INSPECT_Y + orbit.panY;
  }

  runTweens(tweenDt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

