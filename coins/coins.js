// Shiny coins loop, rebuilt natively in Three.js so the owner's chevron
// logo can be minted into the coin faces as real relief geometry. The
// hosted Spline original couldn't be edited from this environment (its
// scene streams from Spline's CDN); spline-original.html still loads it.

import * as THREE from "three";

const GOLD = 0xffc35c;

// one mitred chevron glyph: a thick band bent at a right angle, both tips
// cut at 45°, traced from the uploaded logo
function chevronShape(size, w = 0.34) {
  const s = new THREE.Shape();
  const p = (x, y) => new THREE.Vector2(x * size, y * size);
  const pts = [
    p(0, 1), p(1, 1), p(1, 0),      // outer edge through the corner
    p(1 - w, w),                     // mitred bottom tip
    p(1 - w, 1 - w),                 // inner corner
    p(w, 1 - w)                      // mitred left tip
  ];
  s.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].y);
  s.closePath();
  return s;
}

// four glyphs, staggered 2x2 like the reference mark
function logoGeometry(scale, depth) {
  const shapes = [];
  const placements = [
    [-1.16, 0.12], [0.04, -0.14],
    [-1.16, -1.08], [0.04, -1.34]
  ];
  for (const [x, y] of placements) {
    const shape = chevronShape(1);
    // Shape has no transform; bake offsets by translating points
    const pts = shape.getPoints(1).map((pt) => pt.clone().add(new THREE.Vector2(x, y)));
    const moved = new THREE.Shape();
    moved.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) moved.lineTo(pts[i].x, pts[i].y);
    moved.closePath();
    shapes.push(moved);
  }
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.5,
    bevelSize: depth * 0.5,
    bevelSegments: 2,
    curveSegments: 4
  });
  // reference glyphs point toward the lower right
  geometry.rotateZ(-Math.PI / 2);
  geometry.center();
  geometry.scale(scale, scale, 1);
  return geometry;
}

export function makeCoin(radius, faceMat, reliefMat, rimMat) {
  const coin = new THREE.Group();
  const t = radius * 0.16; // thickness

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.985, radius * 0.985, t, 96),
    faceMat
  );
  body.rotation.x = Math.PI / 2;
  coin.add(body);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.96, t * 0.52, 24, 120),
    rimMat
  );
  coin.add(rim);

  // raised inner ring, like a minted border
  const ring = (z) => {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.8, t * 0.12, 12, 96),
      reliefMat
    );
    mesh.position.z = z;
    return mesh;
  };
  coin.add(ring(t / 2), ring(-t / 2));

  // logo relief on both faces
  const logo = new THREE.Mesh(logoGeometry(radius * 0.46, t * 0.5), reliefMat);
  logo.position.z = t / 2;
  coin.add(logo);
  const logoBack = logo.clone();
  logoBack.rotation.y = Math.PI;
  logoBack.position.z = -t / 2;
  coin.add(logoBack);

  return coin;
}

export function mountCoins(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.2, 9);
  camera.lookAt(0, 0, 0);

  const size = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  size();
  window.addEventListener("resize", size);

  // bright white studio so the gold reads like the reference coins
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
    strip(16, 5, [8, 7.6, 7], [0, 8, 2], [0, 0, 0]);      // hot overhead softbox
    strip(4, 10, [2.2, 2.4, 3.2], [-9, 1, -2], [0, 0, 0]); // cool left strip
    strip(3, 8, [3.2, 2.6, 1.8], [9, 0, 3], [0, 0, 0]);    // warm right return
    strip(18, 10, [1.4, 1.35, 1.3], [0, -7, 2], [0, 0, 0]);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();
  }

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 7, 6);
  scene.add(key, new THREE.AmbientLight(0xffffff, 0.55));

  const faceMat = new THREE.MeshPhysicalMaterial({
    color: GOLD, metalness: 1, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1.3
  });
  const reliefMat = new THREE.MeshPhysicalMaterial({
    color: GOLD, metalness: 1, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.8
  });
  const rimMat = new THREE.MeshPhysicalMaterial({
    color: GOLD, metalness: 1, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.6
  });

  // soft contact shadows so the coins sit in the white space
  const shadowTexture = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 126);
    grad.addColorStop(0, "rgba(30,30,40,0.32)");
    grad.addColorStop(1, "rgba(30,30,40,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const shadow = (scale, x, y) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(scale, scale * 0.36),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
    );
    mesh.position.set(x, y, -0.6);
    scene.add(mesh);
  };

  const coins = [];
  const place = (radius, x, y, tiltX, tiltZ, spin, bobPhase) => {
    const coin = makeCoin(radius, faceMat, reliefMat, rimMat);
    const holder = new THREE.Group();
    holder.add(coin);
    holder.position.set(x, y, 0);
    holder.rotation.set(tiltX, 0, tiltZ);
    scene.add(holder);
    coins.push({ coin, holder, spin, baseY: y, bobPhase });
    shadow(radius * 3.2, x, y - radius * 1.55);
  };

  place(1.5, 0, 0.25, 0.12, 0.06, 0.55, 0);         // hero, slow spin
  place(0.9, -2.7, -0.7, 0.5, -0.28, 0.8, 2.1);     // left, tilted
  place(1.05, 2.75, -0.55, -0.35, 0.3, -0.65, 4.2); // right, counter-spin

  const clock = new THREE.Clock();
  let elapsed = 0;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    for (const { coin, holder, spin, baseY, bobPhase } of coins) {
      coin.rotation.y += spin * dt;
      holder.position.y = baseY + Math.sin(elapsed * 0.8 + bobPhase) * 0.06;
    }
    renderer.render(scene, camera);
  });

  return { renderer, scene };
}
