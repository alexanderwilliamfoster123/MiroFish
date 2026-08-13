// Prize pool hero: the golden-ticket design rebuilt in holographic rainbow
// chrome (matched to the star-coin reference), orbited by iridescent star
// coins. Every $25 ticket adds a coin to the ring and rolls the pool
// counter up. Apple-clean white page; feed the live count via
// ?sold= URL param or window.pool.setSold(n).

import * as THREE from "three";

export const TICKET_PRICE = 25;

/* ----------------------------------------------------------- materials */

function makeHoloEnvironment(renderer, scene) {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0xf2f2f5);
  const strip = (w, h, rgb, position, lookAt) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...rgb), side: THREE.DoubleSide })
    );
    mesh.position.set(...position);
    mesh.lookAt(...lookAt);
    envScene.add(mesh);
  };
  // saturated bands are what paint the rainbow sweeps across the chrome
  strip(14, 4, [9, 8.8, 8.6], [0, 8, 2], [0, 0, 0]);        // hot white overhead
  strip(5, 9, [2.6, 0.9, 2.8], [-8, 2, 2], [0, 0, 0]);      // magenta left
  strip(5, 9, [0.7, 2.2, 3.2], [8, 2, -1], [0, 0, 0]);      // cyan right
  strip(6, 5, [3.0, 2.2, 0.8], [3, -5, 4], [0, 0, 0]);      // amber low front
  strip(6, 5, [1.4, 0.9, 3.2], [-4, -5, -3], [0, 0, 0]);    // violet low back
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.03).texture;
  pmrem.dispose();
}

function holoMaterial(tint, roughness = 0.16) {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 1,
    roughness,
    iridescence: 1,
    iridescenceIOR: 1.9,
    iridescenceThicknessRange: [100, 800],
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.6
  });
}

/* ------------------------------------------------------------ geometry */

function starShape(R = 1, r = 0.44) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? R : r;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function starGeometry(size, depth) {
  const geometry = new THREE.ExtrudeGeometry(starShape(size, size * 0.44), {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.6,
    bevelSize: depth * 0.6,
    bevelSegments: 2,
    curveSegments: 4
  });
  geometry.center();
  return geometry;
}

// ticket outline: rounded rectangle with semicircular side notches
function ticketShape(W, H, corner, notchR) {
  const s = new THREE.Shape();
  const hw = W / 2;
  const hh = H / 2;
  s.moveTo(-hw + corner, -hh);
  s.lineTo(hw - corner, -hh);
  s.absarc(hw - corner, -hh + corner, corner, -Math.PI / 2, 0);
  s.lineTo(hw, -notchR);
  s.absarc(hw, 0, notchR, -Math.PI / 2, Math.PI / 2, true); // right notch (inward)
  s.lineTo(hw, hh - corner);
  s.absarc(hw - corner, hh - corner, corner, 0, Math.PI / 2);
  s.lineTo(-hw + corner, hh);
  s.absarc(-hw + corner, hh - corner, corner, Math.PI / 2, Math.PI);
  s.lineTo(-hw, notchR);
  s.absarc(-hw, 0, notchR, Math.PI / 2, Math.PI * 1.5, true);  // left notch
  s.lineTo(-hw, -hh + corner);
  s.absarc(-hw + corner, -hh + corner, corner, Math.PI, Math.PI * 1.5);
  s.closePath();
  return s;
}

// engraved face detail: sunburst rays + fine grain + frame line, as a bump map
function ticketBumpTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 1024, 640);
  // grain
  const img = ctx.getImageData(0, 0, 1024, 640);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 120 + Math.random() * 16;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  // sunburst
  ctx.strokeStyle = "#9a9a9a";
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(512 + Math.cos(a) * 90, 320 + Math.sin(a) * 90);
    ctx.lineTo(512 + Math.cos(a) * 620, 320 + Math.sin(a) * 620);
    ctx.stroke();
  }
  // inner frame
  ctx.strokeStyle = "#5c5c5c";
  ctx.lineWidth = 7;
  ctx.strokeRect(46, 42, 1024 - 92, 640 - 84);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function makeTicket() {
  const W = 3.2;
  const H = 1.9;
  const T = 0.09;
  const group = new THREE.Group();

  const faceMat = chromeMaterial(spectrumTexture(4, 0.6));
  faceMat.roughness = 0.16;
  faceMat.bumpMap = ticketBumpTexture();
  faceMat.bumpScale = 3.2;

  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(ticketShape(W, H, 0.14, 0.22), {
      depth: T,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 24
    }),
    faceMat
  );
  body.geometry.center();
  group.add(body);

  // raised frame ridge
  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(ticketShape(W - 0.3, H - 0.28, 0.1, 0.24), {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 1,
      curveSegments: 24
    }),
    holoMaterial(0xe6e6ee, 0.1)
  );
  frame.geometry.center();
  frame.position.z = T / 2 + 0.012;
  group.add(frame);
  const frameBack = frame.clone();
  frameBack.position.z = -T / 2 - 0.012;
  group.add(frameBack);

  // embossed star, front and back
  const star = new THREE.Mesh(starGeometry(0.52, 0.05), holoMaterial(0xf2f2f8, 0.08));
  star.position.z = T / 2 + 0.03;
  group.add(star);
  const starBack = star.clone();
  starBack.rotation.y = Math.PI;
  starBack.position.z = -T / 2 - 0.03;
  group.add(starBack);

  return group;
}

const COIN_PALETTES = [
  ["#00b4e8", "#6fe8ff", "#3a2f9e", "#ff4fae"],
  ["#0a5aa8", "#3fd4ff", "#0096d6", "#7de0ff"],
  ["#c96a1e", "#ffd75e", "#f5a800", "#ffe89a"],
  ["#8a2fd0", "#ff8fce", "#ff3d9a", "#ffc4e8"],
  ["#2b2e8f", "#9a8cff", "#5a48e8", "#e0d8ff"],
  ["#0a7a8f", "#5af0d0", "#00c8a8", "#a8ffe8"]
];

// smooth spectrum gradient, the actual source of the rainbow chrome look
function spectrumTexture(index, angleJitter = 0) {
  const palette = COIN_PALETTES[index % COIN_PALETTES.length];
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const a = (index * 0.9 + angleJitter) % (Math.PI * 2);
  const x = Math.cos(a) * 256;
  const y = Math.sin(a) * 256;
  const grad = ctx.createLinearGradient(256 - x, 256 - y, 256 + x, 256 + y);
  palette.forEach((c, i) => grad.addColorStop(i / (palette.length - 1), c));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  // soft counter-sweep so the gradient bends like a reflection
  const grad2 = ctx.createLinearGradient(256 + y, 256 - x, 256 - y, 256 + x);
  grad2.addColorStop(0, "rgba(255,255,255,0.28)");
  grad2.addColorStop(0.45, "rgba(255,255,255,0)");
  grad2.addColorStop(1, "rgba(60,20,120,0.22)");
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, 512, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function chromeMaterial(map) {
  return new THREE.MeshPhysicalMaterial({
    map,
    metalness: 1,
    roughness: 0.12,
    iridescence: 0.9,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [120, 700],
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.1
  });
}

// remap extrude UVs to the shape's bounding box so gradients span the face
function planarUVs(geometry) {
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const sx = bb.max.x - bb.min.x || 1;
  const sy = bb.max.y - bb.min.y || 1;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - bb.min.x) / sx, (pos.getY(i) - bb.min.y) / sy);
  }
  uv.needsUpdate = true;
  return geometry;
}

// the paktos four-chevron mark, normalized to fit a coin face
function paktosShapes(size) {
  const w = 0.34;
  const unit = [[0, 1], [1, 1], [1, 0], [1 - w, w], [1 - w, 1 - w], [w, 1 - w]];
  const placements = [[-1.16, 0.12], [0.04, -0.14], [-1.16, -1.08], [0.04, -1.34]];
  const glyphs = placements.map(([ox, oy]) =>
    unit.map(([x, y]) => {
      const px = x + ox;
      const py = y + oy;
      return [py, -px]; // rotate -90° so the mark points lower-right
    })
  );
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const g of glyphs) for (const [x, y] of g) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const scale = size / Math.max(maxX - minX, maxY - minY);
  return glyphs.map((g) => {
    const shape = new THREE.Shape();
    g.forEach(([x, y], i) => {
      const px = (x - cx) * scale;
      const py = (y - cy) * scale;
      if (i === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    });
    shape.closePath();
    return shape;
  });
}

export function makeStarCoin(radius, tintIndex) {
  const t = radius * 0.24;
  const coin = new THREE.Group();
  const faceMap = spectrumTexture(tintIndex);
  const wallMap = spectrumTexture(tintIndex + 3, 1.2);

  // full-thickness body: its cap is the engraved star's floor
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, t, 64), chromeMaterial(wallMap));
  body.rotation.x = Math.PI / 2;
  coin.add(body);

  // face plates with a star-shaped hole -> the star reads debossed
  const plateShape = new THREE.Shape();
  plateShape.absarc(0, 0, radius * 0.995, 0, Math.PI * 2);
  plateShape.holes.push(...paktosShapes(radius * 1.12));
  const plateGeo = planarUVs(new THREE.ExtrudeGeometry(plateShape, {
    depth: t * 0.32,
    bevelEnabled: true,
    bevelThickness: t * 0.12,
    bevelSize: t * 0.12,
    bevelSegments: 2,
    curveSegments: 48
  }));
  const plate = new THREE.Mesh(plateGeo, chromeMaterial(faceMap));
  plate.position.z = t / 2 - t * 0.1;
  coin.add(plate);
  const plateBack = new THREE.Mesh(plateGeo, chromeMaterial(spectrumTexture(tintIndex, 2.1)));
  plateBack.rotation.y = Math.PI;
  plateBack.position.z = -t / 2 + t * 0.1;
  coin.add(plateBack);

  return coin;
}

/* ---------------------------------------------------------------- app */

export function mountPrize(canvas, ui, options = {}) {
  const MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0, 13);

  const size = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  };
  size();
  window.addEventListener("resize", size);

  makeHoloEnvironment(renderer, scene);
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 6, 7);
  scene.add(key, new THREE.AmbientLight(0xffffff, 0.5));

  const world = new THREE.Group();
  scene.add(world);

  // hero ticket: a large holographic backdrop behind the prize amount
  const ticket = makeTicket();
  ticket.position.set(0, 0.1, -2.6);
  ticket.scale.setScalar(1.7);
  world.add(ticket);

  // coin ring: a camera-facing circle around the headline, like the reference
  const ringGroup = new THREE.Group();
  ringGroup.position.y = -0.1;
  world.add(ringGroup);
  const coins = [];
  const RING_MAX = 14;
  const arriving = [];

  function coinPose(i, count) {
    const a = -Math.PI / 2 + (i / Math.max(count, 1)) * Math.PI * 2;
    const r = 3.5;
    return {
      position: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, ((i % 3) - 1) * 0.6),
      angle: a
    };
  }

  function layoutRing() {
    for (let i = 0; i < coins.length; i++) {
      if (coins[i].userData.arriving) continue;
      const pose = coinPose(i, coins.length);
      coins[i].userData.home = pose.position.clone();
    }
  }

  function addCoin(instant) {
    const coin = makeStarCoin(0.44, coins.length);
    coin.rotation.set(Math.random() * 0.8 - 0.4, Math.random() * Math.PI, Math.random() * 0.5 - 0.25);
    coins.push(coin);
    ringGroup.add(coin);
    const pose = coinPose(coins.length - 1, coins.length);
    coin.userData.home = pose.position.clone();
    coin.userData.spin = 0.4 + Math.random() * 0.5;
    if (instant || !MOTION) {
      coin.position.copy(pose.position);
    } else {
      coin.position.set(0, 6.4, 0.5);
      coin.userData.arriving = 0.0001;
      arriving.push(coin);
    }
    layoutRing();
  }

  function removeCoin() {
    const coin = coins.pop();
    if (coin) ringGroup.remove(coin);
    layoutRing();
  }

  /* ------------------------------------------------------------ state */
  let sold = 0;
  const perCoin = options.ticketsPerCoin || 1;
  let shownPool = 0;
  let poolTarget = 0;

  const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");

  function sync(instant) {
    poolTarget = sold * TICKET_PRICE;
    if (instant || !MOTION) shownPool = poolTarget;
    const target = Math.min(Math.ceil(sold / perCoin), RING_MAX);
    while (coins.length > target) removeCoin();
    while (coins.length < target) addCoin(instant);
    if (instant) {
      for (const coin of coins) coin.position.copy(coin.userData.home);
    }
    ui.sub.textContent = `${sold.toLocaleString("en-US")} tickets sold · $${TICKET_PRICE} each`;
  }

  function setSold(next) {
    sold = Math.max(0, Math.round(next));
    sync(false);
  }

  /* ------------------------------------------------------------- loop */
  const clock = new THREE.Clock();
  let elapsed = 0;
  const pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    // rolling counter
    if (shownPool !== poolTarget) {
      const diff = poolTarget - shownPool;
      shownPool += diff * Math.min(dt * 3, 1);
      if (Math.abs(diff) < 1) shownPool = poolTarget;
    }
    ui.pool.textContent = fmt(shownPool);

    // ticket sway, staying face-on behind the headline
    ticket.rotation.y = Math.sin(elapsed * 0.4) * 0.16 * MOTION;
    ticket.rotation.x = Math.sin(elapsed * 0.31) * 0.06 * MOTION;
    ticket.position.y = 0.1 + Math.sin(elapsed * 0.8) * 0.06 * MOTION;

    // ring drift + coin spins
    ringGroup.rotation.z += dt * 0.05 * MOTION;
    for (const coin of coins) {
      coin.rotation.y += dt * coin.userData.spin * MOTION;
      if (coin.userData.arriving) {
        coin.userData.arriving = Math.min(coin.userData.arriving + dt / 0.9, 1);
        const e = 1 - Math.pow(1 - coin.userData.arriving, 3);
        coin.position.lerpVectors(new THREE.Vector3(0, 6.4, 0.5), coin.userData.home, e);
        if (coin.userData.arriving >= 1) delete coin.userData.arriving;
      } else {
        coin.position.lerp(coin.userData.home, Math.min(dt * 2.5, 1));
      }
    }

    // gentle parallax
    world.rotation.y += ((pointer.x * 0.08 * MOTION) - world.rotation.y) * dt * 3;
    world.rotation.x += ((pointer.y * 0.04 * MOTION) - world.rotation.x) * dt * 3;

    renderer.render(scene, camera);
  });

  /* ------------------------------------------------------------- boot */
  const params = new URLSearchParams(location.search);
  const pSold = parseInt(params.get("sold"), 10);
  sold = Number.isFinite(pSold) ? Math.max(0, pSold) : 139;
  sync(true);

  return {
    setSold,
    buy: (n = 1) => setSold(sold + n),
    get sold() { return sold; }
  };
}
