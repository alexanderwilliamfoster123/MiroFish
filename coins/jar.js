// Prize vault: every ticket sold for the trading competition drops a tiny
// holographic coin into an armored-glass vault — and celebrates it like a
// casino win: a shower of cosmetic coins, spark bursts, a glow pulse, a
// camera kick, and the gold vault wheel spinning up. Rapid sales streak
// (tier 1→3) and the whole thing escalates. The pile height still tracks
// sold / total exactly, so it scales from a hundred tickets to millions.
//
// Embeddable: mountJar(canvas, ui, opts) sizes itself to the canvas's
// parent element (ResizeObserver), so it can live full-page or inside a
// dashboard card. Feed it the live count via ?sold=&total= URL params or
// window-side calls to .setTickets(sold, total); .buy(n) increments.
// ui: { count?, bar?, onCelebrate?(tier, streak) } — all optional.

import * as THREE from "three";

const GOLD = 0xffc35c;
const COIN_R = 0.22;
const COIN_T = COIN_R * 0.22;
const PER_LAYER = 16;
const LAYER_H = COIN_T * 3.1;
const JAR_R = 1.55;
const JAR_H = 3.7;
const JAR_Y = -1.9; // vault floor world y

// the deep holographic palettes from the coins page
const PALETTES = [
  ["#00b4e8", "#6fe8ff", "#3a2f9e", "#ff4fae"],
  ["#0a5aa8", "#3fd4ff", "#0096d6", "#7de0ff"],
  ["#c96a1e", "#ffd75e", "#f5a800", "#ffe89a"],
  ["#8a2fd0", "#ff8fce", "#ff3d9a", "#ffc4e8"],
  ["#2b2e8f", "#9a8cff", "#5a48e8", "#e0d8ff"],
  ["#0a7a8f", "#5af0d0", "#00c8a8", "#a8ffe8"]
];

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

// deterministic resting pose for the k-th coin in the pile
function slotFor(k) {
  const rand = mulberry32(k * 2654435761 + 7);
  const layer = Math.floor(k / PER_LAYER);
  const rr = (JAR_R - COIN_R - 0.16) * Math.sqrt(rand());
  const a = rand() * Math.PI * 2;
  const lean = (rand() - 0.5) * 0.7;
  const quaternion = new THREE.Quaternion()
    .setFromEuler(new THREE.Euler(Math.PI / 2 + lean, rand() * Math.PI * 2, (rand() - 0.5) * 0.5, "YXZ"));
  return {
    position: new THREE.Vector3(
      Math.cos(a) * rr,
      JAR_Y + COIN_T * 1.4 + layer * LAYER_H + rand() * COIN_T,
      Math.sin(a) * rr
    ),
    quaternion
  };
}

export const JAR_CAPACITY = (() => {
  const usable = JAR_H - 0.7;
  return Math.floor(usable / LAYER_H) * PER_LAYER;
})();

function spectrumTexture(colors) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 128, 128);
  colors.forEach((col, i) => grad.addColorStop(i / (colors.length - 1), col));
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const sweep = g.createLinearGradient(128, 0, 0, 128);
  sweep.addColorStop(0, "rgba(255,255,255,0)");
  sweep.addColorStop(0.45, "rgba(255,255,255,0.32)");
  sweep.addColorStop(0.55, "rgba(60,20,120,0.2)");
  sweep.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = sweep;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function mountJar(canvas, ui = {}, opts = {}) {
  const MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;
  const container = canvas.parentElement || document.body;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.background ?? 0xffffff);

  const CAM_Z = opts.camZ ?? 11.4; // pull back for full-page, in for cards
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.1, CAM_Z);
  camera.lookAt(0, -0.2, 0);

  const size = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(container);

  // studio environment with colour in it — the holo coins pick it up
  {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xdadade);
    const strip = (w, h, rgb, position, lookAt) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...rgb), side: THREE.DoubleSide })
      );
      mesh.position.set(...position);
      mesh.lookAt(...lookAt);
      envScene.add(mesh);
    };
    strip(16, 5, [8, 7.6, 7], [0, 8, 2], [0, 0, 0]);
    strip(4, 10, [2.2, 2.4, 3.2], [-9, 1, -2], [0, 0, 0]);
    strip(3, 8, [3.2, 2.6, 1.8], [9, 0, 3], [0, 0, 0]);
    strip(5, 6, [2.6, 1.6, 3], [-5, 6, 6], [0, 0, 0]);
    strip(18, 10, [1.4, 1.35, 1.3], [0, -7, 2], [0, 0, 0]);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();
  }

  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(4, 7, 6);
  scene.add(key, new THREE.AmbientLight(0xffffff, 0.6));

  // ---------------------------------------------------------- the vault
  // armored glass on a brushed-steel plinth with a gold vault wheel — the
  // pool stays visible (that's the product) but the frame says "vault"
  const steel = new THREE.MeshPhysicalMaterial({
    color: 0x2b2d31, metalness: 0.92, roughness: 0.38, envMapIntensity: 1.1
  });
  const goldTrim = new THREE.MeshPhysicalMaterial({
    color: GOLD, metalness: 1, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.6
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xeef2f6,
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.13,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.2,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(JAR_R + 0.1, JAR_R + 0.05, JAR_H, 64, 1, true),
    glass
  );
  wall.position.y = JAR_Y + JAR_H / 2 - 0.02;
  scene.add(wall);

  // plinth
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(JAR_R + 0.28, JAR_R + 0.36, 0.52, 64),
    steel
  );
  plinth.position.y = JAR_Y - 0.28;
  scene.add(plinth);
  const plinthTrim = new THREE.Mesh(
    new THREE.TorusGeometry(JAR_R + 0.28, 0.022, 12, 72),
    goldTrim
  );
  plinthTrim.rotation.x = Math.PI / 2;
  plinthTrim.position.y = JAR_Y - 0.02;
  scene.add(plinthTrim);

  // top rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(JAR_R + 0.1, 0.09, 16, 72), steel);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = JAR_Y + JAR_H - 0.04;
  scene.add(rim);
  const rimTrim = new THREE.Mesh(new THREE.TorusGeometry(JAR_R + 0.1, 0.024, 12, 72), goldTrim);
  rimTrim.rotation.x = Math.PI / 2;
  rimTrim.position.y = JAR_Y + JAR_H + 0.06;
  scene.add(rimTrim);

  // gold vault wheel on the plinth face — idles slowly, spins on a win
  const wheel = new THREE.Group();
  const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.032, 12, 48), goldTrim);
  wheel.add(wheelRing);
  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 10), goldTrim);
    spoke.rotation.z = (i / 3) * Math.PI;
    wheel.add(spoke);
  }
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), goldTrim);
  hub.scale.z = 0.6;
  wheel.add(hub);
  wheel.position.set(0, JAR_Y - 0.28, JAR_R + 0.34);
  scene.add(wheel);
  let wheelVel = 0;

  // soft shadow under the vault
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 256;
  {
    const g = shadowCanvas.getContext("2d");
    const grad = g.createRadialGradient(128, 128, 12, 128, 128, 126);
    grad.addColorStop(0, "rgba(30,30,40,0.32)");
    grad.addColorStop(1, "rgba(30,30,40,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
  }
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 2.9),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = JAR_Y - 0.56;
  scene.add(shadow);

  // ------------------------------------------------------------- coins
  // tiny holographic chrome coins — one shared geometry, six shared
  // spectrum materials, so hundreds of clones stay cheap
  const coinGeo = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 24);
  coinGeo.rotateX(Math.PI / 2);
  const holoMats = PALETTES.map((p) => new THREE.MeshPhysicalMaterial({
    map: spectrumTexture(p),
    metalness: 1,
    roughness: 0.12,
    iridescence: 0.9,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [120, 700],
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.3
  }));
  const coinFor = (k) => new THREE.Mesh(coinGeo, holoMats[k % holoMats.length]);

  const pile = [];      // settled + falling coins, one per pile slot
  const falling = [];

  const pileTopY = () => JAR_Y + (Math.floor(pile.length / PER_LAYER) + 0.6) * LAYER_H;

  // ------------------------------------------------- celebration rig
  // glow pulse behind the vault
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 256;
  {
    const g = glowCanvas.getContext("2d");
    const grad = g.createRadialGradient(128, 128, 8, 128, 128, 126);
    grad.addColorStop(0, "rgba(255,195,92,0.9)");
    grad.addColorStop(0.55, "rgba(255,195,92,0.35)");
    grad.addColorStop(1, "rgba(255,195,92,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(glowCanvas),
    transparent: true,
    opacity: 0,
    depthWrite: false
  }));
  glow.position.set(0, JAR_Y + JAR_H * 0.45, -2.2);
  glow.scale.set(5, 5, 1);
  scene.add(glow);
  let glowPulse = 0;

  // spark bursts (one pooled Points system)
  const SPARK_MAX = 420;
  const sparkPos = new Float32Array(SPARK_MAX * 3).fill(-999);
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparkCanvas = document.createElement("canvas");
  sparkCanvas.width = sparkCanvas.height = 32;
  {
    const g = sparkCanvas.getContext("2d");
    const grad = g.createRadialGradient(16, 16, 1, 16, 16, 15);
    grad.addColorStop(0, "rgba(255,236,190,1)");
    grad.addColorStop(0.5, "rgba(255,195,92,0.85)");
    grad.addColorStop(1, "rgba(255,195,92,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
  }
  const sparkMat = new THREE.PointsMaterial({
    size: 0.11,
    map: new THREE.CanvasTexture(sparkCanvas),
    transparent: true,
    depthWrite: false
  });
  const sparkPts = new THREE.Points(sparkGeo, sparkMat);
  sparkPts.frustumCulled = false;
  scene.add(sparkPts);
  const sparks = []; // {i, x,y,z, vx,vy,vz, life}
  const freeSparkSlots = Array.from({ length: SPARK_MAX }, (_, i) => SPARK_MAX - 1 - i);

  function spawnSparks(x, y, z, n, speed) {
    for (let k = 0; k < n; k++) {
      const i = freeSparkSlots.pop();
      if (i === undefined) break;
      const a = Math.random() * Math.PI * 2;
      const up = Math.random();
      const v = speed * (0.4 + Math.random() * 0.9);
      sparks.push({
        i,
        x, y, z,
        vx: Math.cos(a) * v * (1 - up * 0.5),
        vy: v * up * 1.4 + 0.6,
        vz: Math.sin(a) * v * (1 - up * 0.5) * 0.5,
        life: 0.55 + Math.random() * 0.35
      });
    }
  }

  // cosmetic holo shower — extra coins that rain into the vault and
  // vanish, so the frenzy never corrupts the sold/total pile
  const cosmetics = [];
  function shower(tier) {
    const n = [0, 6, 11, 17][tier] || 6;
    for (let k = 0; k < n; k++) {
      const coin = coinFor((Math.random() * 6) | 0);
      const s = 0.8 + Math.random() * 0.5;
      coin.scale.setScalar(s);
      const a = Math.random() * Math.PI * 2;
      const rr = Math.random() * JAR_R * 0.55;
      coin.position.set(
        Math.cos(a) * rr,
        JAR_Y + JAR_H + 1.2 + Math.random() * 1.8,
        Math.sin(a) * rr
      );
      coin.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      scene.add(coin);
      cosmetics.push({
        coin,
        vy: -1 - Math.random() * 2,
        spin: new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5),
        floorY: pileTopY() + Math.random() * 0.3,
        bounced: false,
        out: 0,
        s
      });
    }
  }

  // camera kick + streak state — one celebration per TICKET sold, not per
  // pile coin (the pile is proportional to fill, but the fireworks aren't)
  let kick = 0;
  let streak = 0;
  let streakAt = -1e9;
  let lastTier = 1;
  let celebrationQueue = 0;
  let celebrationTimer = 0;

  function fxBuy() {
    const now = performance.now() / 1000;
    streak = now - streakAt < 4 ? streak + 1 : 1;
    streakAt = now;
    const tier = streak >= 8 ? 3 : streak >= 4 ? 2 : 1;
    lastTier = tier;
    if (MOTION) {
      kick = Math.min(kick + 0.4 + 0.22 * tier, 1.7);
      glowPulse = Math.min(glowPulse + 0.4 + 0.28 * tier, 1.6);
      wheelVel = Math.min(wheelVel + 2.4 + tier * 1.4, 12);
      shower(tier);
      spawnSparks(0, JAR_Y + JAR_H + 0.4, 0, 18 + 14 * tier, 3.2);
    }
    ui.onCelebrate?.(tier, streak);
    return tier;
  }

  function spawnCoin(slotIndex, instant) {
    const coin = coinFor(slotIndex);
    const slot = slotFor(slotIndex);
    if (instant || !MOTION) {
      coin.position.copy(slot.position);
      coin.quaternion.copy(slot.quaternion);
      scene.add(coin);
      pile.push(coin);
      return;
    }
    const tier = lastTier;
    const rand = mulberry32(slotIndex * 97 + 13);
    coin.position.set((rand() - 0.5) * 0.8, JAR_Y + JAR_H + 1.6, (rand() - 0.5) * 0.4);
    coin.quaternion.setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3));
    scene.add(coin);
    pile.push(coin);
    falling.push({
      coin,
      slot,
      tier,
      vy: 0,
      spin: new THREE.Vector3(rand() * 6 - 3, rand() * 6 - 3, rand() * 6 - 3),
      bounces: 0,
      settling: 0
    });
  }

  function removeCoin() {
    const coin = pile.pop();
    if (coin) scene.remove(coin);
  }

  // ------------------------------------------------------------- state
  let sold = 0;
  let total = 100000;
  const targetCoins = () =>
    sold <= 0 ? 0 : Math.max(1, Math.round(Math.min(sold / total, 1) * JAR_CAPACITY));

  let queue = 0; // coins waiting to drop (staggered)
  let queueTimer = 0;

  function sync(instant) {
    const target = targetCoins();
    while (pile.length + queue > target) {
      if (queue > 0) queue--;
      else removeCoin();
    }
    if (instant) {
      while (pile.length < target) spawnCoin(pile.length, true);
      queue = 0;
    } else {
      // pile already includes coins that are mid-fall
      queue = target - pile.length;
      if (queue < 0) queue = 0;
    }
    if (ui.count) {
      ui.count.textContent = `${sold.toLocaleString("en-US")} / ${total.toLocaleString("en-US")} tickets`;
    }
    if (ui.bar) ui.bar.style.width = `${Math.min(sold / total, 1) * 100}%`;
  }

  function setTickets(nextSold, nextTotal) {
    if (Number.isFinite(nextTotal) && nextTotal > 0) total = Math.round(nextTotal);
    const prev = sold;
    sold = Math.max(0, Math.round(nextSold));
    sync(false);
    if (sold > prev) {
      celebrationQueue = Math.min(celebrationQueue + (sold - prev), 14);
    }
  }

  // ------------------------------------------------------------- loop
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);

    if (celebrationQueue > 0) {
      celebrationTimer -= dt;
      if (celebrationTimer <= 0) {
        fxBuy();
        celebrationQueue--;
        celebrationTimer = 0.18;
      }
    }

    if (queue > 0) {
      queueTimer -= dt;
      if (queueTimer <= 0) {
        spawnCoin(pile.length, false);
        queue--;
        queueTimer = 0.16;
      }
    }

    for (let i = falling.length - 1; i >= 0; i--) {
      const f = falling[i];
      if (f.settling > 0) {
        f.settling = Math.min(f.settling + dt / 0.25, 1);
        f.coin.position.lerp(f.slot.position, f.settling);
        f.coin.quaternion.slerp(f.slot.quaternion, f.settling);
        if (f.settling >= 1) falling.splice(i, 1);
        continue;
      }
      f.vy -= 22 * dt;
      f.coin.position.y += f.vy * dt;
      f.coin.position.x += (f.slot.position.x - f.coin.position.x) * dt * 2.2;
      f.coin.position.z += (f.slot.position.z - f.coin.position.z) * dt * 2.2;
      f.coin.rotation.x += f.spin.x * dt;
      f.coin.rotation.y += f.spin.y * dt;
      f.coin.rotation.z += f.spin.z * dt;
      if (f.coin.position.y <= f.slot.position.y) {
        f.coin.position.y = f.slot.position.y;
        if (f.bounces < 2 && Math.abs(f.vy) > 2.2) {
          if (f.bounces === 0) {
            spawnSparks(f.coin.position.x, f.coin.position.y + 0.1, f.coin.position.z, 12 + 8 * (f.tier || 1), 2.4);
          }
          f.vy = -f.vy * 0.32;
          f.bounces++;
          f.spin.multiplyScalar(0.5);
        } else {
          f.settling = 0.0001;
        }
      }
    }

    // cosmetic shower coins
    for (let i = cosmetics.length - 1; i >= 0; i--) {
      const c = cosmetics[i];
      if (c.out > 0) {
        c.out = Math.min(c.out + dt / 0.22, 1);
        c.coin.scale.setScalar(c.s * (1 - c.out));
        if (c.out >= 1) {
          scene.remove(c.coin);
          cosmetics.splice(i, 1);
        }
        continue;
      }
      c.vy -= 22 * dt;
      c.coin.position.y += c.vy * dt;
      c.coin.rotation.x += c.spin.x * dt;
      c.coin.rotation.y += c.spin.y * dt;
      c.coin.rotation.z += c.spin.z * dt;
      if (c.coin.position.y <= c.floorY) {
        c.coin.position.y = c.floorY;
        if (!c.bounced && Math.abs(c.vy) > 2) {
          c.vy = -c.vy * 0.3;
          c.bounced = true;
        } else {
          c.out = 0.0001;
        }
      }
    }

    // sparks
    if (sparks.length) {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt;
        if (s.life <= 0) {
          sparkPos[s.i * 3 + 1] = -999;
          freeSparkSlots.push(s.i);
          sparks.splice(i, 1);
          continue;
        }
        s.vy -= 9 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.z += s.vz * dt;
        sparkPos[s.i * 3] = s.x;
        sparkPos[s.i * 3 + 1] = s.y;
        sparkPos[s.i * 3 + 2] = s.z;
      }
      sparkGeo.attributes.position.needsUpdate = true;
    }

    // vault wheel: slow idle turn, spins up on wins
    wheelVel *= Math.exp(-dt * 1.6);
    wheel.rotation.z -= (0.12 + wheelVel) * dt;

    // glow + camera kick decay
    glowPulse *= Math.exp(-dt * 2.2);
    glow.material.opacity = Math.min(glowPulse * 0.55, 0.7);
    glow.scale.setScalar(5 + glowPulse * 2.2);
    kick *= Math.exp(-dt * 2.6);
    const shake = kick * 0.05;
    camera.position.set(
      (Math.random() - 0.5) * shake,
      1.1 + (Math.random() - 0.5) * shake,
      CAM_Z - kick * 0.55
    );
    camera.lookAt(0, -0.2, 0);

    renderer.render(scene, camera);
  });

  // ------------------------------------------------------------- boot
  const params = new URLSearchParams(location.search);
  const pTotal = parseInt(params.get("total"), 10);
  const pSold = parseInt(params.get("sold"), 10);
  total = Number.isFinite(pTotal) && pTotal > 0 ? pTotal
    : Number.isFinite(opts.total) ? opts.total : 100000;
  sold = Number.isFinite(pSold) ? Math.max(0, pSold)
    : Number.isFinite(opts.sold) ? opts.sold : 61240;
  sync(true);

  return {
    setTickets,
    buy: (n = 1) => setTickets(sold + n),
    destroy: () => {
      ro.disconnect();
      renderer.setAnimationLoop(null);
      renderer.dispose();
    },
    get sold() { return sold; },
    get total() { return total; }
  };
}
