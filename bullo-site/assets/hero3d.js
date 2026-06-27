// Reusable 3D hero. Reads <canvas data-scene="coin|ring|coins|bead">, builds the
// matching object, and drives it from scroll. Three.js is vendored locally.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function init(canvas, type) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 1; key.shadow.camera.far = 30;
  key.shadow.bias = -0.0002;
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const rim = new THREE.DirectionalLight(0xffd9e8, 1.1);
  rim.position.set(-5, 2, -4); scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.14 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -3.4; ground.receiveShadow = true; scene.add(ground);

  const update = builders[type] ? builders[type](THREE, scene) : builders.coin(THREE, scene);

  let target = 0, progress = 0;
  const getScroll = () => { const m = document.body.scrollHeight - window.innerHeight; return m > 0 ? window.scrollY / m : 0; };
  window.addEventListener('scroll', () => { target = getScroll(); }, { passive: true });
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; });

  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    progress += (target - progress) * 0.075;
    update({ progress, t, mouseX: mx, mouseY: my, camera });
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  requestAnimationFrame(() => setTimeout(() => {
    const l = document.getElementById('loading'); if (l) l.classList.add('hide');
  }, 350));
}

/* ---------------- object builders ---------------- */
const builders = {
  coin(THREE, scene) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xf0c9d6, metalness: 1.0, roughness: 0.16 });
    const coin = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.42, 120, 1, false), mat);
    disc.rotation.x = Math.PI / 2; disc.castShadow = true; coin.add(disc);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.12, 28, 120), mat);
    ring.position.z = 0.21; coin.add(ring);
    const ringB = ring.clone(); ringB.position.z = -0.21; coin.add(ringB);

    const s = new THREE.Shape();
    s.moveTo(-0.4,-0.7); s.lineTo(-0.4,0.7); s.lineTo(0.2,0.7);
    s.quadraticCurveTo(0.6,0.7,0.6,0.35); s.quadraticCurveTo(0.6,0.05,0.25,0.0);
    s.quadraticCurveTo(0.65,-0.05,0.65,-0.4); s.quadraticCurveTo(0.65,-0.7,0.2,-0.7); s.lineTo(-0.4,-0.7);
    const lg = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
    lg.center();
    const L = new THREE.Mesh(lg, mat); L.position.z = 0.27; L.castShadow = true; coin.add(L);
    const Lb = L.clone(); Lb.position.z = -0.27; Lb.rotation.y = Math.PI; coin.add(Lb);
    scene.add(coin);

    return ({ progress, t, mouseX, mouseY, camera }) => {
      coin.rotation.z = -progress * Math.PI * 6;
      coin.position.x = 2.6 + Math.sin(progress * Math.PI) * 1.2 - progress * 1.0;
      coin.position.y = 2.2 - progress * 6.0;
      coin.position.z = -progress * 2.0;
      coin.rotation.x = mouseY * 0.3 + Math.sin(t * 0.8) * 0.04;
      coin.rotation.y = mouseX * 0.4;
      camera.position.z = 9 + progress * 1.5;
      camera.lookAt(0, coin.position.y * 0.3, 0);
    };
  },

  ring(THREE, scene) {
    const rose = new THREE.MeshPhysicalMaterial({ color: 0xf6d9d2, metalness: 0.25, roughness: 0.08,
      transmission: 0.92, thickness: 1.6, ior: 1.45, clearcoat: 1.0, clearcoatRoughness: 0.08,
      attenuationColor: new THREE.Color(0xe8a98f), attenuationDistance: 2.0, sheen: 0.5, sheenColor: new THREE.Color(0xffd9c9) });
    const ring = new THREE.Group();
    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.62, 80, 200), rose); torus.castShadow = true; ring.add(torus);
    ring.add(new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.12, 40, 140), rose));
    scene.add(ring);
    return ({ progress, t, mouseX, mouseY, camera }) => {
      ring.rotation.z = -progress * Math.PI * 3.0;
      ring.rotation.x = 0.5 + Math.sin(t * 0.4) * 0.05 + mouseY * 0.3 + progress * 0.8;
      ring.rotation.y = t * 0.15 + mouseX * 0.4;
      ring.position.x = 1.4 - progress * 0.4 + Math.sin(t * 0.4) * 0.1;
      ring.position.y = 1.4 - progress * 5.2;
      ring.position.z = -progress * 1.0;
      camera.position.z = 7.6 + progress * 1.0;
      camera.lookAt(0.6, -progress * 1.4, 0);
    };
  },

  bead(THREE, scene) {
    const rose = new THREE.MeshPhysicalMaterial({ color: 0xf6dbd3, metalness: 0.2, roughness: 0.09,
      transmission: 0.9, thickness: 1.6, ior: 1.45, clearcoat: 1.0, clearcoatRoughness: 0.08,
      attenuationColor: new THREE.Color(0xe5a98d), attenuationDistance: 2.2 });
    const metal = new THREE.MeshStandardMaterial({ color: 0xeec7b6, metalness: 1.0, roughness: 0.25 });
    const group = new THREE.Group();
    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.6, 80, 200), rose); torus.castShadow = true; group.add(torus);
    const pivot = new THREE.Group();
    const bead = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 12, 1), metal);
    bead.position.set(1.7, 0, 0); bead.rotation.z = Math.PI / 2; bead.castShadow = true; pivot.add(bead); group.add(pivot);
    scene.add(group);
    return ({ progress, t, mouseX, mouseY, camera }) => {
      group.rotation.z = -progress * Math.PI * 2.6;
      group.rotation.x = 0.5 + mouseY * 0.3 + Math.sin(t * 0.4) * 0.05;
      group.rotation.y = t * 0.12 + mouseX * 0.4;
      pivot.rotation.z = Math.PI * 1.18 + t * 0.22 + progress * Math.PI * 2.6;
      bead.rotation.y = t * 2.0;
      group.position.x = 1.2 - progress * 0.3;
      group.position.y = 1.4 - progress * 5.2;
      group.position.z = -progress * 1.0;
      camera.position.z = 7.6 + progress * 1.0;
      camera.lookAt(0.6, -progress * 1.4, 0);
    };
  },

  coins(THREE, scene) {
    const glass = (tint) => new THREE.MeshPhysicalMaterial({ color: tint, metalness: 0, roughness: 0.06,
      transmission: 1.0, thickness: 1.4, ior: 1.5, iridescence: 0.6, iridescenceIOR: 1.3,
      clearcoat: 1.0, clearcoatRoughness: 0.1, attenuationColor: new THREE.Color(0x7a4fe0), attenuationDistance: 3.0 });
    const mkCoin = (tint, r) => {
      const g = new THREE.Group();
      const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.34, 96, 1, false), glass(tint)); d.rotation.x = Math.PI / 2; g.add(d);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.92, r * 0.07, 24, 96), glass(0x9a6cff)); ring.position.z = r * 0.17; g.add(ring);
      const rb = ring.clone(); rb.position.z = -r * 0.17; g.add(rb);
      return g;
    };
    const coins = [
      { m: mkCoin(0x8b5cf6, 1.15), b: new THREE.Vector3(-1.9, 0.9, 0.4), sp: 1.0, ph: 0 },
      { m: mkCoin(0x7c5cf0, 0.95), b: new THREE.Vector3(0.5, -0.2, 1.2), sp: -1.4, ph: 1.7 },
      { m: mkCoin(0x9d7bff, 1.05), b: new THREE.Vector3(2.4, 0.4, -0.6), sp: 0.8, ph: 3.1 },
    ];
    coins.forEach(c => scene.add(c.m));
    return ({ progress, t, mouseX, mouseY, camera }) => {
      coins.forEach(c => {
        const m = c.m;
        m.rotation.x = c.ph + t * 0.25 * c.sp + progress * Math.PI * 2 * c.sp;
        m.rotation.y = c.ph * 0.7 + t * 0.2 * c.sp + progress * Math.PI * 1.5;
        m.position.x = c.b.x + Math.sin(t * 0.4 + c.ph) * 0.18 + mouseX * 0.5;
        m.position.y = c.b.y - progress * 5.5 + Math.cos(t * 0.5 + c.ph) * 0.18 - mouseY * 0.4;
        m.position.z = c.b.z + Math.sin(progress * Math.PI) * 0.6;
      });
      camera.position.z = 8.5 + progress * 1.2;
      camera.lookAt(0, -progress * 1.6, 0);
    };
  },
};

// Kick off after builders are defined (avoids temporal-dead-zone on `builders`).
const heroCanvas = document.querySelector('canvas[data-scene]');
if (heroCanvas) init(heroCanvas, heroCanvas.dataset.scene);
