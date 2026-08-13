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

  const faceMat = holoMaterial(0xdde3ec, 0.15);
  faceMat.envMapIntensity = 2.2;
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

const COIN_TINTS = [0x33ccff, 0xff5cb8, 0xffc93c, 0x8a6bff, 0xe8e8f2, 0x4de3b0];

export function makeStarCoin(radius, tintIndex) {
  const tint = COIN_TINTS[tintIndex % COIN_TINTS.length];
  const t = radius * 0.22;
  const coin = new THREE.Group();
  const face = holoMaterial(tint, 0.18);
  const rim = holoMaterial(0xe8e8f0, 0.12);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, t, 64), face);
  body.rotation.x = Math.PI / 2;
  coin.add(body);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.985, t * 0.5, 16, 80), rim);
  coin.add(edge);

  const star = new THREE.Mesh(starGeometry(radius * 0.58, t * 0.35), holoMaterial(tint, 0.08));
  star.position.z = t / 2;
  coin.add(star);
  const starBack = star.clone();
  starBack.rotation.y = Math.PI;
  starBack.position.z = -t / 2;
  coin.add(starBack);

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
  camera.position.set(0, 0, 11);

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

  // hero ticket, floating above the headline
  const ticket = makeTicket();
  ticket.position.y = 2.0;
  ticket.scale.setScalar(0.85);
  world.add(ticket);

  // coin ring: one coin per N tickets, orbiting below the headline space
  const ringGroup = new THREE.Group();
  ringGroup.position.y = -0.4;
  world.add(ringGroup);
  const coins = [];
  const RING_MAX = 14;
  const arriving = [];

  function coinPose(i, count) {
    const a = (i / Math.max(count, 1)) * Math.PI * 2;
    const rx = 4.8;
    const ry = 0.85;
    return {
      position: new THREE.Vector3(Math.cos(a) * rx, Math.sin(a * 2) * 0.14 - 1.55, Math.sin(a) * ry),
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

    // ticket float
    ticket.rotation.y = Math.sin(elapsed * 0.4) * 0.5 * MOTION;
    ticket.rotation.x = Math.sin(elapsed * 0.31) * 0.12 * MOTION;
    ticket.position.y = 2.0 + Math.sin(elapsed * 0.8) * 0.07 * MOTION;

    // ring drift + coin spins
    ringGroup.rotation.y += dt * 0.08 * MOTION;
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
