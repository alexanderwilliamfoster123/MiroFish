// Shared Three.js boilerplate for the demo pages: renderer, scene, camera,
// lights, environment reflections, a scroll-progress signal, and a render loop.
// Each page imports this, builds its own object(s), and supplies an update(ctx)
// callback that runs every frame with eased scroll `progress` (0..1).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createScene({ update, cameraZ = 9, fov = 35, envIntensity = 0.04 } = {}) {
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, cameraZ);

  // Environment reflections — essential for believable glass and metal.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), envIntensity).texture;

  // Lights
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1; key.shadow.camera.far = 30;
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const rim = new THREE.DirectionalLight(0xffffff, 1.0);
  rim.position.set(-5, 2, -4);
  scene.add(rim);

  // Scroll progress (0 at top → 1 at bottom), eased for buttery scrubbing.
  let target = 0, progress = 0;
  const getScroll = () => {
    const max = document.body.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  };
  window.addEventListener('scroll', () => { target = getScroll(); }, { passive: true });

  // Pointer parallax
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  });

  const clock = new THREE.Clock();
  function loop() {
    requestAnimationFrame(loop);
    progress += (target - progress) * 0.08;
    const t = clock.getElapsedTime();
    if (update) update({ THREE, scene, camera, renderer, progress, t, mouseX, mouseY, key, rim });
    renderer.render(scene, camera);
  }
  loop();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  requestAnimationFrame(() => setTimeout(() => {
    const l = document.getElementById('loading');
    if (l) l.classList.add('hide');
  }, 300));

  return { THREE, scene, camera, renderer };
}
