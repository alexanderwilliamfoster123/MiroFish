// cubeInScene.js — встраивает НАСТОЯЩИЙ cube3 lafys (lafys) + частицы lafys в сцену lafys.
// Модули куба (cube.js/frostMaterial/plexus/mouseFrost/engine/loaders/chunks) и particles.js —
// без изменений; здесь только обвязка под рендерер/камеру/сцену lafys + two-pass transmission.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { he, tick } from './engine.js';
import { preloadAll, loadEnvEXR, le } from './loaders.js';
import { Cube } from './cube.js';
import { initParticles } from './particles.js';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const CFG = {
  cubeScale: 1.15,          // масштаб камня на месте логотипа
  cubeYOffset: 0.0,         // доп. смещение по Y от слота логотипа
  rockName: 'Moonstone',    // выбор камня по умолчанию (подобрано юзером)
  rockRot: [1.56, -3.14, 0], // поворот камня по умолчанию (подобрано юзером)
  frostPattern: 'шум',      // паттерн инея по умолчанию (подобрано юзером)
  // частицы — 1:1 из hero-rising-particles (материал/шейдеры/данные без изменений).
  // Меняем ТОЛЬКО положение/масштаб группы + fade (дистанционный отсёк под близкую камеру lafys).
  particleScale: 0.25, particleDraw: 3400,   // подобрано юзером
  particleFade: [0, 14],     // подобрано юзером
  particleSize: 0.4,         // подобрано юзером
  particleBright: 6, particleOpacity: 1,   // подобрано юзером (яркость/прозрачность)
  particleOverlay: false,    // частицы В СЦЕНЕ (встроенный GPGPU-движок оригинала), не слоем
  particleYOffset: -0.4,     // (не используется, если задан particlePos)
  particlePos: [-0.64, -2.16, 16.98],   // подобрано юзером (WASD)
  // ГОРЫ 3D (пики lafys) — ВЫКЛ (на фоне используется силуэт mtnLine)
  mtnEnabled: false, mtnSrc: 'https://qclay.design/lovable/lafys/assets/mountains-lafys.glb', mtnScale: 62, mtnZ: -4, mtnBaseY: -1.5, mtnYaw: 0, mtnStyle: 'тёмный',
  // ТЁМНЫЙ ГОРНЫЙ СИЛУЭТ на фоне (ВКЛ — это горы, что ты видел)
  mtnLine: true, mtnMeshZ: 2, mtnMeshY: -1.2, mtnMeshW: 80, mtnMeshH: 11, mtnMeshColor: 0x685e87,   // цвет силуэта подобран юзером
  mtnPos: [-4.2, 2.24, -5.99],   // подобрано юзером
  // ЗЕМЛЯ = 3D-террейн (детальные пики), ПЕРЕКЛЮЧАЕМЫЕ модели, двигать YGHJ+U/N, вращать KL+OP
  ground: true, groundColor: 0x3d3c49, groundScale: 70,   // цвет подобран юзером; меняется в панели
  groundSrc: 'https://qclay.design/lovable/lafys/assets/water/terrain.glb',   // модель земли = террейн founderssa (lafys убран)
  groundTex: 'Плоский (цвет)',   // текстура земли (пресет; раньше был только плоский цвет)
  groundPos: [-4.55, -6, -1.3], groundGrpScale: 1.1, groundRotY: -3.14, groundRotX: 0.01,   // подобрано юзером
  // ДВИЖИМЫЙ СВЕТ для террейна (стрелки: ←→ x, ↑↓ z, PgUp/PgDn или +/- y). Тип выбирается в панели.
  lightType: 'Направленный', lightColor: 0xffffff, lightIntensity: 37, lightDist: 25, lightPos: [-2.11, -1, -13.58],   // подобрано юзером
  // РАДИАЛЬНАЯ ПУЛЬС-ВОЛНА по «воде» под кубом (как у яйца lafys)
  // волна: ring-math lafys 1:1 (крисп/зернистость). waveRadius = радиус пула (мир.ед.); waveFreq = плотность колец.
  wave: true, waveY: -1.5, waveSize: 40, waveRadius: 4.4, waveColor: 0xcccccc, waveSpeed: 4.8, waveFreq: 500, wavePulse: 1.35, waveOpacity: 0.24,
  waveCenter: [0.10, 16.70],   // центр колец/импульса (мир. x, z; подобрано юзером в панели). Двигается ползунками ВОЛНА → центр X/Z.
  wavePulseSpeed: 0.5,   // подобрано юзером (темп расходящейся пульс-волны)
  // ВОДА (отражение) — подобрано юзером; применяется к ReflectiveFloor при старте
  water: { reflectivity: 0.68, mixStrength: 15, mirror: 1, distortion: 3.9, color: 0x3c3d44 },
};

export async function addCubeToScene({ renderer, scene, camera, logoSlot }) {
  he.renderer.webgl = renderer;
  he.camera = camera;
  he.scene = scene;
  camera.layers.enable(1);   // слой 1 — объекты, которые НЕ должны отражаться в воде (силуэт-горы)
  camera.layers.enable(2);   // слой 2 — террейн, освещаемый ТОЛЬКО нашим движимым светом
  // тусклый ambient только для террейна (слой 2), чтобы форма чуть читалась в темноте
  const terrainAmbient = new THREE.AmbientLight(0x1a2436, 0.4); terrainAmbient.layers.set(2); scene.add(terrainAmbient);
  // ── СИСТЕМА СВЕТА ТЕРРЕЙНА (слой 2) — несколько ТИПОВ на выбор (стрелки двигают позицию) ──
  const LIGHT_TYPES = ['Точка', 'Направленный', 'Прожектор', 'Полусфера', 'Заполняющий'];
  const POSITIONAL = ['Точка', 'Направленный', 'Прожектор'];   // у этих типов имеет смысл позиция/маркер
  // множитель яркости на тип: у directional/hemi/ambient другая шкала интенсивности, чем у point/spot
  const LIGHT_FACTOR = { 'Точка': 1, 'Прожектор': 1, 'Направленный': 0.06, 'Полусфера': 0.05, 'Заполняющий': 0.03 };
  const lightState = {
    type: CFG.lightType || 'Точка', color: CFG.lightColor, intensity: CFG.lightIntensity,
    distance: CFG.lightDist, angle: 0.6, wholeScene: false, pos: new THREE.Vector3(...CFG.lightPos),
  };
  let currentLight = null;
  // маркер положения света (виден только для позиционных типов)
  const lightMarker = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: lightState.color, fog: false }));
  scene.add(lightMarker);
  function makeLight(type) {
    switch (type) {
      case 'Направленный': return new THREE.DirectionalLight(lightState.color, 1);
      case 'Прожектор':    return new THREE.SpotLight(lightState.color, 1, lightState.distance, lightState.angle, 0.4, 1.4);
      case 'Полусфера':    return new THREE.HemisphereLight(lightState.color, 0x0a0f1a, 1);
      case 'Заполняющий':  return new THREE.AmbientLight(lightState.color, 1);
      default:             return new THREE.PointLight(lightState.color, 1, lightState.distance, 1.4);   // Точка
    }
  }
  function applyLightLayers() { currentLight.layers.set(2); if (lightState.wholeScene) currentLight.layers.enable(0); }
  function applyLightIntensity() { currentLight.intensity = lightState.intensity * (LIGHT_FACTOR[lightState.type] || 1); }
  function rebuildLight() {
    if (currentLight) { scene.remove(currentLight); if (currentLight.target) scene.remove(currentLight.target); }
    currentLight = makeLight(lightState.type);
    currentLight.position.copy(lightState.pos);
    if ('distance' in currentLight) currentLight.distance = lightState.distance;
    if (currentLight.target) { currentLight.target.position.set(0, lightState.pos.y - 3, 0); scene.add(currentLight.target); }
    applyLightLayers();
    applyLightIntensity();
    scene.add(currentLight);
    const positional = POSITIONAL.includes(lightState.type);
    lightMarker.visible = positional;
    lightMarker.material.color.set(lightState.color);
    if (positional) lightMarker.position.copy(lightState.pos);
  }
  rebuildLight();
  function moveLightFn(dt) {
    const sp = ((keys.ShiftLeft || keys.ShiftRight) ? 9 : 3.5) * dt;
    let m = false;
    if (keys.ArrowLeft) { lightState.pos.x -= sp; m = true; }
    if (keys.ArrowRight) { lightState.pos.x += sp; m = true; }
    if (keys.ArrowUp) { lightState.pos.z -= sp; m = true; }
    if (keys.ArrowDown) { lightState.pos.z += sp; m = true; }
    if (keys.PageUp || keys.Equal) { lightState.pos.y += sp; m = true; }
    if (keys.PageDown || keys.Minus) { lightState.pos.y -= sp; m = true; }
    if (m) {
      currentLight.position.copy(lightState.pos);
      lightMarker.position.copy(lightState.pos);
      if (currentLight.target) currentLight.target.position.set(0, lightState.pos.y - 3, 0);
    }
  }
  scene.cubes = [];
  scene.controller = null;
  he.setSize(innerWidth, innerHeight);
  addEventListener('resize', () => he.setSize(innerWidth, innerHeight));
  addEventListener('pointermove', (e) =>
    he.pointer.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)));

  await preloadAll(renderer);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const exr = await loadEnvEXR();
  scene.envmap = pmrem.fromEquirectangular(exr).texture;   // env КУБА (их cubes_env)
  exr.dispose(); pmrem.dispose();
  const bgTex = le.load('cubes/bg.png', 'srgb');

  const transmissionRT = new THREE.WebGLRenderTarget(2, 2, {
    generateMipmaps: true, type: THREE.HalfFloatType, minFilter: THREE.LinearMipmapLinearFilter, samples: 0,
  });
  const sizeRT = () => {
    const dpr = renderer.getPixelRatio();
    transmissionRT.setSize(Math.max(2, Math.floor(innerWidth * dpr)), Math.max(2, Math.floor(innerHeight * dpr)));
  };
  sizeRT(); addEventListener('resize', sizeRT);

  const slot = logoSlot || { x: 0, y: 0.35, z: 0, scale: 1 };
  const cube = new Cube(scene, { index: 0, obj: 'cube3', innerobject: 'lafys', centeredProgress: 0, scrollPosition: 0 });
  scene.cubes.push(cube);
  await cube.ready;
  cube.position.set(slot.x, slot.y + CFG.cubeYOffset, slot.z);
  cube.scale.setScalar(CFG.cubeScale);
  // ФИКС HOVER: frostMaterial сэмплит иней по vUv1, а у cube3.drc нет uv1 -> добавляем uv1=uv (иначе иней в точке 0,0, невидим)
  { const g = cube.mesh.geometry; if (!g.getAttribute('uv1') && g.getAttribute('uv')) { g.setAttribute('uv1', g.getAttribute('uv').clone()); } }
  window.__mf = cube.mouseFrost; window.__he = he; window.__cubeMesh = cube.mesh;  // debug

  // применить КАСТОМНУЮ карту нормалей (по запросу) вместо cube3_normal.ktx2 — заменяет прошлую
  {
    const nrm = new THREE.TextureLoader().load('https://qclay.design/lovable/lafys/assets/cube3_normal_custom2.png');
    nrm.colorSpace = THREE.NoColorSpace; nrm.wrapS = nrm.wrapT = THREE.RepeatWrapping; nrm.flipY = false; nrm.anisotropy = 4;
    cube.mesh.material.normalMap = nrm; cube.mesh.material.needsUpdate = true;
  }

  // ── ПОДМЕНА КАМНЯ: меняется ТОЛЬКО геометрия, материал остаётся ЛЕДЯНОЙ cube3 (те же текстуры/frost/преломление) ──
  const ROCK_MODELS = {
    'cube3 (ориг)': null,
    'Moonstone': { glb: 'https://qclay.design/lovable/lafys/assets/rocks/moonstone/moonstone_geo.glb' },   // сжато до геометрии (17.6МБ->5КБ), лёд cube3 + frost-hover
  };
  const ROCK_NAMES = Object.keys(ROCK_MODELS);
  const origGeo = cube.mesh.geometry, origFrostMat = cube.mesh.material;
  origGeo.computeBoundingBox();
  const _os = new THREE.Vector3(); origGeo.boundingBox.getSize(_os);
  const origMaxDim = Math.max(_os.x, _os.y, _os.z);
  const rockRot = { x: (CFG.rockRot || [0, 0, 0])[0], y: (CFG.rockRot || [0, 0, 0])[1], z: (CFG.rockRot || [0, 0, 0])[2] };   // ручной поворот камня (панель) — поверх idle
  let iceActive = true;   // true = ледяной материал cube3 (frameCube/иней/плексус); false = свой материал модели
  const rockCache = {};
  async function setRock(name) {
    const spec = ROCK_MODELS[name];
    if (!spec) {   // cube3 — вернуть лёд + эффекты
      cube.mesh.geometry = origGeo; cube.mesh.material = origFrostMat; iceActive = true;
      cube.mesh3.visible = true; cube.mesh2.visible = true; cube.plexus.group.visible = true;
      return;
    }
    let entry = rockCache[name];
    if (!entry) {
      let grp;
      if (spec.fbx) grp = await new FBXLoader().loadAsync(spec.fbx);
      else grp = (await new GLTFLoader().loadAsync(spec.glb)).scene;
      // выбор меша: по имени (spec.meshName) — иначе самый детальный (не аура/plane)
      let bestN = -1, geo = null, srcMat = null;
      grp.traverse((o) => {
        if (!o.isMesh || !o.geometry.getAttribute('position')) return;
        const pick = () => { geo = o.geometry; srcMat = Array.isArray(o.material) ? o.material[0] : o.material; };
        if (spec.meshName) { if (o.name === spec.meshName) pick(); }
        else { const n = o.geometry.getAttribute('position').count; if (n > bestN) { bestN = n; pick(); } }
      });
      geo.computeBoundingBox();
      const c = new THREE.Vector3(); geo.boundingBox.getCenter(c);
      const s = new THREE.Vector3(); geo.boundingBox.getSize(s);
      const k = origMaxDim / Math.max(s.x, s.y, s.z);
      geo.translate(-c.x, -c.y, -c.z); geo.scale(k, k, k);   // центр в 0 + размер как у cube3
      if (geo.getAttribute('uv') && !geo.getAttribute('uv1')) geo.setAttribute('uv1', geo.getAttribute('uv').clone());
      geo.computeBoundingBox(); geo.computeBoundingSphere();
      if (geo.computeBoundsTree) geo.computeBoundsTree();
      // материал: keepMaterial -> свой (из модели) + env сцены; иначе лёд cube3
      let mat = origFrostMat;
      if (spec.keepMaterial && srcMat) {   // свой материал модели (PBR-текстуры), env сцены
        mat = srcMat; mat.envMap = cube.scene.envmap || null; mat.envMapIntensity = 1.0;
        if ('transmission' in mat && mat.transmission > 0.7) mat.transmission = 0.7;   // стекло не выбивало в белое
        mat.needsUpdate = true;
      }
      entry = { geo, mat, ice: !spec.keepMaterial };
      rockCache[name] = entry;
    }
    cube.mesh.geometry = entry.geo; cube.mesh.material = entry.mat; iceActive = entry.ice;
    cube.mesh3.visible = entry.ice; cube.mesh2.visible = entry.ice; cube.plexus.group.visible = entry.ice;   // лед-специфика только для ледяных
  }
  if (CFG.rockName && CFG.rockName !== ROCK_NAMES[0]) await setRock(CFG.rockName);

  // материал ОТРАЖАЮЩЕГО ПОЛА (вода) — чтобы редактировать отражение неба в воде (сила/цвет/искажение)
  let floorMat = null;
  scene.traverse((o) => { if (o.isMesh && o.material && o.material.uniforms && o.material.uniforms.uReflectivity) floorMat = o.material; });
  window.__floor = floorMat;   // debug
  if (floorMat && floorMat.uniforms && CFG.water) {   // применить подобранные юзером параметры воды
    const wu = floorMat.uniforms;
    wu.uReflectivity.value = CFG.water.reflectivity; wu.uFloorMixStrength.value = CFG.water.mixStrength;
    wu.uMirror.value = CFG.water.mirror; wu.uNormalDistortionStrength.value = CFG.water.distortion;
    wu.uColor.value.set(CFG.water.color);
  }

  // частицы lafys у основания камня (в ТОЙ ЖЕ сцене)
  const particlesGroup = new THREE.Group();
  particlesGroup.position.set(...(CFG.particlePos || [slot.x, slot.y + CFG.particleYOffset, slot.z]));
  particlesGroup.scale.setScalar(CFG.particleScale);
  scene.add(particlesGroup);
  const particles = await initParticles({
    renderer, camera, group: particlesGroup, drawCount: CFG.particleDraw,
    fadeDistance: CFG.particleFade,   // адаптация под близкую камеру lafys
    particleSize: CFG.particleSize,   // видимый размер по умолчанию (материал/цвет/opacity 1:1; крутится в панели, оригинал 0.11)
  });
  if (CFG.particleOpacity != null) particles.mesh.material.uniforms.uOpacity.value = CFG.particleOpacity;   // подобрано юзером

  // клавиатура: стрелки/PageUp-Down — свет, YGHJ/UN/KL/OP — земля. (движение частиц клавишами УБРАНО)
  const keys = {};
  addEventListener('keydown', (e) => { keys[e.code] = true; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', (e) => { keys[e.code] = false; });
  window.__particlePos = () => particlesGroup.position.clone();

  // ── ГОРЫ (terrain.glb, вытащенные из водной сцены) — V-долина за камнем, в свете lafys ──
  let mountainsGroup = null, setMountainStyle = null;
  const mountainMeshes = [];
  const MTN_STYLE_NAMES = ['тёмный', 'снег', 'камень', 'лёд', 'закат', 'зелёный', 'каркас'];
  if (CFG.mtnEnabled) {
    try {
      mountainsGroup = new THREE.Group();
      scene.add(mountainsGroup);
      const mtnNormal = new THREE.TextureLoader().load('https://qclay.design/lovable/lafys/textures/floor-normal.webp', (tx) => { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(4, 4); });
      const MTN_STYLES = {
        'тёмный': { color: 0x51689a, roughness: 0.95, metalness: 0.0, wireframe: false, normal: false },
        'снег':   { color: 0xe4edf6, roughness: 0.9,  metalness: 0.0, wireframe: false, normal: false },
        'камень': { color: 0x6b7386, roughness: 1.0,  metalness: 0.0, wireframe: false, normal: true },
        'лёд':    { color: 0x8ec2e8, roughness: 0.3,  metalness: 0.15, wireframe: false, normal: false },
        'закат':  { color: 0xb0674a, roughness: 0.9,  metalness: 0.0, wireframe: false, normal: false },
        'зелёный':{ color: 0x2f6a52, roughness: 0.95, metalness: 0.0, wireframe: false, normal: true },
        'каркас': { color: 0x9fd0ff, roughness: 1.0,  metalness: 0.0, wireframe: true,  normal: false },
      };
      setMountainStyle = (name) => {
        const st = MTN_STYLES[name] || MTN_STYLES['тёмный'];
        for (const o of mountainMeshes) {
          const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(st.color), roughness: st.roughness, metalness: st.metalness, wireframe: st.wireframe, normalMap: st.normal ? mtnNormal : null });
          m.envMapIntensity = 0.4;
          o.material = m;
        }
      };
      const draco = new DRACOLoader().setDecoderPath('https://unpkg.com/three@0.165.0/examples/jsm/libs/draco/');
      const g = await new GLTFLoader().setDRACOLoader(draco).loadAsync(CFG.mtnSrc);
      const range = g.scene;
      const box = new THREE.Box3().setFromObject(range);
      const c = new THREE.Vector3(); box.getCenter(c);
      const sz = new THREE.Vector3(); box.getSize(sz);
      const s = CFG.mtnScale / Math.max(sz.x, sz.z);
      range.position.set(-c.x, -box.min.y, -c.z);   // центр по XZ в 0, низ в 0
      range.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; mountainMeshes.push(o); } });
      const wrap = new THREE.Group();
      wrap.add(range);
      wrap.scale.setScalar(s);
      wrap.position.set(0, CFG.mtnBaseY, CFG.mtnZ);   // низкий хребет позади куба
      wrap.rotation.y = CFG.mtnYaw;
      mountainsGroup.add(wrap);
      setMountainStyle(CFG.mtnStyle);
    } catch (e) { console.warn('mountains load failed', e); }
  }

  // ── ТЁМНЫЙ ГОРНЫЙ СИЛУЭТ (3D-меш ПОЗАДИ куба) ──
  let silhouetteMat = null;   // материал силуэта -> цвет редактируется в панели
  if (CFG.mtnLine) {
    const N = 180, W = CFG.mtnMeshW, Hs = CFG.mtnMeshH;
    const prof = (t) => {
      const a = Math.sin(t * Math.PI) * 0.35;
      const p1 = Math.exp(-Math.pow((t - 0.26) / 0.07, 2)) * 0.85;  // левый пик
      const p2 = Math.exp(-Math.pow((t - 0.70) / 0.06, 2)) * 1.0;   // правый пик (выше)
      const p3 = Math.exp(-Math.pow((t - 0.46) / 0.05, 2)) * 0.45;
      const valley = Math.exp(-Math.pow((t - 0.52) / 0.11, 2)) * 0.5; // провал в центре (за камнем)
      return (a + p1 + p2 + p3 - valley) * Hs;
    };
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2, -Hs * 3);
    for (let i = 0; i <= N; i++) { const t = i / N; shape.lineTo(-W / 2 + t * W, prof(t) + (rnd() - 0.5) * Hs * 0.05); }
    shape.lineTo(W / 2, -Hs * 3); shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    // fog:false -> силуэт НЕ тонируется цветом палитры (иначе бьёт по глазам), остаётся тёмным контуром
    const mat = new THREE.MeshBasicMaterial({ color: CFG.mtnMeshColor, fog: false });
    silhouetteMat = mat;
    mountainsGroup = new THREE.Group();
    const m = new THREE.Mesh(geo, mat); m.renderOrder = -2; m.frustumCulled = false;
    m.layers.set(1);   // слой 1 -> силуэт НЕ отражается в воде (камера отражения его не видит)
    mountainsGroup.add(m);
    mountainsGroup.position.set(...(CFG.mtnPos || [0, CFG.mtnMeshY, CFG.mtnMeshZ]));   // подобрано юзером
    scene.add(mountainsGroup);
  }

  // ── ЗЕМЛЯ = 3D-террейн (ПЕРЕКЛЮЧАЕМЫЕ модели), двигать YGHJ+U/N, вращать KL+OP ──
  // 'Террейн founderssa' — их модель из движка (terrain-3-v1). lafys убран по просьбе.
  const GROUND_MODELS = {
    'Террейн founderssa': 'https://qclay.design/lovable/lafys/assets/water/terrain.glb',
  };
  const GROUND_NAMES = Object.keys(GROUND_MODELS);
  let groundGroup = null, groundWrap = null, curGroundColor = CFG.groundColor;
  const dracoG = new DRACOLoader().setDecoderPath('https://unpkg.com/three@0.165.0/examples/jsm/libs/draco/');

  // ── ТЕКСТУРЫ ЗЕМЛИ: раньше был только плоский цвет -> добавлены пресеты (рельеф/камень/снег/пыль) ──
  const _gtl = new THREE.TextureLoader();
  const _gtex = (u, srgb, rep = 6) => { const t = _gtl.load(u); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; return t; };
  const GT = {
    floorN: () => _gtex('https://qclay.design/lovable/lafys/textures/floor-normal.webp', false, 8),
    perlin: () => _gtex('https://qclay.design/lovable/lafys/textures/perlin-1.webp', true, 4),
  };
  // пресеты применяются к MeshStandardMaterial террейна (цвет умножается на curGroundColor)
  const GROUND_TEX = {
    'Плоский (цвет)': (m) => { m.map = null; m.normalMap = null; m.roughnessMap = null; m.roughness = 0.72; m.metalness = 0.12; },
    'Рельеф':         (m) => { m.map = null; m.normalMap = GT.floorN(); m.normalScale.set(1.4, 1.4); m.roughnessMap = null; m.roughness = 0.8; m.metalness = 0.1; },
    'Снег':           (m) => { m.map = null; m.normalMap = GT.floorN(); m.normalScale.set(0.6, 0.6); m.roughnessMap = null; m.roughness = 0.55; m.metalness = 0.0; },
    'Пыль/шум':       (m) => { m.map = GT.perlin(); m.normalMap = GT.floorN(); m.normalScale.set(0.9, 0.9); m.roughnessMap = null; m.roughness = 0.9; m.metalness = 0.05; },
  };
  const GROUND_TEX_NAMES = Object.keys(GROUND_TEX);
  let curGroundTex = CFG.groundTex || GROUND_TEX_NAMES[0];
  function configGroundMat(m) {
    m.color.set(curGroundColor); m.fog = false;
    (GROUND_TEX[curGroundTex] || GROUND_TEX[GROUND_TEX_NAMES[0]])(m);
    m.needsUpdate = true;
  }
  function applyGroundTex(name) {   // сменить текстуру у уже загруженной модели
    curGroundTex = name;
    if (groundGroup) groundGroup.traverse((o) => { if (o.isMesh && o.material) configGroundMat(o.material); });
  }
  // загружает/подменяет модель земли; нормализует размер под groundScale, кладёт на слой 2 (свет — только наш)
  async function loadGround(src) {
    if (!groundGroup) return;
    if (groundWrap) {   // снять прошлую модель
      groundGroup.remove(groundWrap);
      groundWrap.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
      groundWrap = null;
    }
    try {
      const gg = await new GLTFLoader().setDRACOLoader(dracoG).loadAsync(src);
      const range = gg.scene;
      const box = new THREE.Box3().setFromObject(range);
      const c = new THREE.Vector3(); box.getCenter(c);
      const sz = new THREE.Vector3(); box.getSize(sz);
      const s = CFG.groundScale / Math.max(sz.x, sz.z);
      range.position.set(-c.x, -box.min.y, -c.z);   // центр по XZ в 0, низ в 0
      // террейн на слое 2: его освещает ТОЛЬКО наш свет (палитра не трогает -> по умолчанию тёмный)
      range.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; const mt = new THREE.MeshStandardMaterial({ fog: false }); o.material = mt; configGroundMat(mt); o.layers.set(2); } });
      groundWrap = new THREE.Group(); groundWrap.add(range); groundWrap.scale.setScalar(s);
      groundGroup.add(groundWrap);
    } catch (e) { console.warn('ground load failed', src, e); }
  }
  if (CFG.ground) {
    groundGroup = new THREE.Group();
    groundGroup.position.set(...(CFG.groundPos || [0, -1.7, -8]));
    groundGroup.scale.setScalar(CFG.groundGrpScale || 1);
    groundGroup.rotation.set(CFG.groundRotX || 0, CFG.groundRotY || 0, 0);
    scene.add(groundGroup);
    await loadGround(CFG.groundSrc || GROUND_MODELS[GROUND_NAMES[0]]);
  }
  window.__ground = groundGroup;   // debug
  // движение земли: Y/H — вперёд/назад (z), G/J — влево/вправо (x), U/N — вверх/вниз (y), Shift — быстрее
  function moveGround(dt) {
    if (!groundGroup) return;
    const sp = ((keys.ShiftLeft || keys.ShiftRight) ? 9 : 3.5) * dt;
    if (keys.KeyY) groundGroup.position.z -= sp;
    if (keys.KeyH) groundGroup.position.z += sp;
    if (keys.KeyG) groundGroup.position.x -= sp;
    if (keys.KeyJ) groundGroup.position.x += sp;
    if (keys.KeyU) groundGroup.position.y += sp;
    if (keys.KeyN) groundGroup.position.y -= sp;
  }
  // вращение земли: K/L — крутить (вокруг Y), O/P — наклон (вокруг X), Shift — быстрее
  function rotateGround(dt) {
    if (!groundGroup) return;
    const rs = ((keys.ShiftLeft || keys.ShiftRight) ? 2.2 : 0.9) * dt;
    if (keys.KeyK) groundGroup.rotation.y -= rs;
    if (keys.KeyL) groundGroup.rotation.y += rs;
    if (keys.KeyO) groundGroup.rotation.x -= rs;
    if (keys.KeyP) groundGroup.rotation.x += rs;
  }

  // ── РАДИАЛЬНАЯ ПУЛЬС-ВОЛНА под кубом — ПОРТ 1:1 колец lafys (bundle DMi5XBnd.js) ──
  // ring-math verbatim: аналитическое сглаживание clamp(rings/fwidth(rings)) -> кольца ~1px, НЕ блюрятся;
  // высокая частота (uFreq~400) + bias -0.92 (тонкие гребни) + расходящиеся sonar-импульсы wideRings + зернистость rand().
  // Отличия от оригинала (обоснованно): нет depth-mask `d` и water-noise (нет этих буферов в оверлее) — на вид колец не влияет.
  let waveMat = null, waveMesh = null;
  if (CFG.wave) {
    waveMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uMusicTime: { value: 0 }, uColor: { value: new THREE.Color(CFG.waveColor) },
        uFreq: { value: CFG.waveFreq }, uSpeed: { value: CFG.waveSpeed }, uPulse: { value: CFG.wavePulse },
        uPulseSpeed: { value: CFG.wavePulseSpeed }, uOpacity: { value: CFG.waveOpacity }, uRadius: { value: CFG.waveRadius }, uCenter: { value: new THREE.Vector2((CFG.waveCenter && CFG.waveCenter[0]) ?? slot.x, (CFG.waveCenter && CFG.waveCenter[1]) ?? slot.z) },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      extensions: { derivatives: true },   // fwidth (аналитическое сглаживание колец)
      vertexShader: `varying vec3 vMPos; void main(){ vMPos=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `precision highp float; varying vec3 vMPos;
        uniform float uTime,uMusicTime,uFreq,uSpeed,uPulse,uOpacity,uRadius; uniform vec2 uCenter; uniform vec3 uColor;
        #define PI 3.14159265359
        highp float rand(const in vec2 uv){const highp float a=12.9898,b=78.233,c=43758.5453;highp float dt=dot(uv.xy,vec2(a,b)),sn=mod(dt,PI);return fract(sin(sn)*c);}
        float exponentialOut(float t){return t==1.0 ? t : 1.0-pow(2.0,-10.0*t);}
        float wideRing(float time,float rd){float ft=fract(time*0.3593786227683747);float p=exponentialOut(ft);float a=step(-0.05+p,rd)-step(0.+p,rd);return a*smoothstep(1.,0.6,ft);}
        float wideRings(float time,float rd){float t=wideRing(time-0.69,(rd*0.5));return max(t,wideRing(time,(rd*0.5)));}
        void main(){
          float ringDist = length(vMPos.xz - uCenter) / uRadius;      // нормируем на радиус пула (оригинал: мир.ед.)
          float ringsFalloff = smoothstep(1.0, 0.5, ringDist);
          float rings = sin(ringDist*uFreq - uTime*uSpeed) - 0.92;    // тонкие гребни
          rings = clamp(rings/fwidth(rings) + 0.5, 0.0, 1.0);          // <- аналитическое сглаживание: КРИСП, не блюр
          rings *= ringsFalloff;
          rings = max(wideRings(uMusicTime, ringDist) * smoothstep(2.0,1.5,ringDist) * uPulse, rings);  // расходящиеся импульсы
          rings *= rand(floor(vMPos.xz*300.0));                        // зернистость (искрится, не гладко)
          rings *= 1.0 - 0.8*rand(vMPos.xz*0.5);
          rings += ringsFalloff*0.2;                                   // базовое свечение пула
          rings *= 1.0 - 0.5*rand(vMPos.xz*1.0);
          float a = rings * uOpacity;
          if(a < 0.004) discard;
          gl_FragColor = vec4(uColor*2.0*rings, a);
        }`,
    });
    waveMesh = new THREE.Mesh(new THREE.PlaneGeometry(CFG.waveSize, CFG.waveSize), waveMat);
    waveMesh.rotation.x = -Math.PI / 2; waveMesh.position.set(slot.x, CFG.waveY, slot.z);
    window.__wave = waveMat;   // debug
    waveMesh.renderOrder = 1; scene.add(waveMesh);
  }

  // ── ГЕНЕРАТОР ПАТТЕРНОВ ИНЕЯ (canvas -> texture) для смены узора ховера ──
  function makePattern(kind) {
    const S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S;
    const x = cv.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, S, S);
    x.fillStyle = '#fff'; x.strokeStyle = '#fff';
    if (kind === 'точки') { const n = 12; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.beginPath(); x.arc((i + 0.5) * S / n, (j + 0.5) * S / n, S / (n * 4), 0, 7); x.fill(); } }
    else if (kind === 'сетка') { x.lineWidth = 3; const n = 12; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * S / n, 0); x.lineTo(i * S / n, S); x.moveTo(0, i * S / n); x.lineTo(S, i * S / n); x.stroke(); } }
    else if (kind === 'полосы') { x.lineWidth = 6; for (let i = 0; i < S; i += 18) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.stroke(); } }
    else if (kind === 'диагонали') { x.lineWidth = 5; for (let i = -S; i < S * 2; i += 20) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + S, S); x.stroke(); } }
    else if (kind === 'кресты') { const n = 8; x.lineWidth = 3; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const cx = (i + 0.5) * S / n, cy = (j + 0.5) * S / n, r = S / (n * 3); x.beginPath(); x.moveTo(cx - r, cy); x.lineTo(cx + r, cy); x.moveTo(cx, cy - r); x.lineTo(cx, cy + r); x.stroke(); } }
    else if (kind === 'шум') { const d = x.getImageData(0, 0, S, S); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() < 0.35 ? 255 : 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; return t;
  }

  // ── ПАНЕЛЬ РЕДАКТОРА ЧАСТИЦ (live) ──
  (function buildParticlePanel() {
    const pm = particles.mesh.material.uniforms;
    const baseColor = pm.uColor.value.clone(), baseBloom = pm.uBloomColor.value.clone();
    // применить стартовую яркость из CFG (подобрано юзером): умножаем цвет/bloom на множитель
    const box = document.createElement('div');
    box.id = 'particle-panel';
    box.style.cssText = 'position:fixed;top:64px;right:14px;z-index:2147483647;width:216px;max-height:82vh;overflow-y:auto;padding:12px 13px;border-radius:10px;' +
      'background:rgba(8,12,24,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.14);' +
      'font:11px/1.4 ui-monospace,Menlo,monospace;color:#cdd8ef';
    const head = document.createElement('div');
    head.textContent = 'ЧАСТИЦЫ ▾'; head.style.cssText = 'letter-spacing:.12em;color:#8fe;margin-bottom:6px;cursor:pointer;user-select:none';
    box.appendChild(head);
    const body = document.createElement('div'); box.appendChild(body);
    head.addEventListener('click', () => { body.style.display = body.style.display === 'none' ? '' : 'none'; head.textContent = body.style.display === 'none' ? 'ЧАСТИЦЫ ▸' : 'ЧАСТИЦЫ ▾'; });
    const row = (label, min, max, step, val, on) => {
      const w = document.createElement('div'); w.style.margin = '8px 0';
      const t = document.createElement('div'); t.style.color = '#9fb0d0'; t.textContent = label + ': ' + (+val).toFixed(2);
      const r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = val; r.style.width = '100%';
      r.addEventListener('input', () => { const v = +r.value; t.textContent = label + ': ' + v.toFixed(2); on(v); });
      w.appendChild(t); w.appendChild(r); body.appendChild(w);
    };
    // цветовая строка (input type=color)
    const colorRow = (label, hex, on) => {
      const w = document.createElement('div'); w.style.cssText = 'margin:8px 0;display:flex;align-items:center;gap:8px';
      const t = document.createElement('div'); t.style.cssText = 'color:#9fb0d0;flex:1'; t.textContent = label;
      const c = document.createElement('input'); c.type = 'color'; c.value = hex; c.style.cssText = 'width:34px;height:22px;border:none;background:none;cursor:pointer';
      c.addEventListener('input', () => on(c.value)); w.appendChild(t); w.appendChild(c); body.appendChild(w);
    };
    // чекбокс-строка
    const checkRow = (label, checked, on) => {
      const w = document.createElement('label'); w.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0;cursor:pointer;color:#9fb0d0';
      const c = document.createElement('input'); c.type = 'checkbox'; c.checked = checked; c.style.cursor = 'pointer';
      const t = document.createElement('span'); t.textContent = label;
      c.addEventListener('change', () => on(c.checked)); w.appendChild(c); w.appendChild(t); body.appendChild(w);
    };
    // кнопка «КОПИРОВАТЬ ВСЁ» — сверху, всегда видна
    let pBright = CFG.particleBright ?? 1;
    pm.uColor.value.copy(baseColor).multiplyScalar(pBright);
    pm.uBloomColor.value.copy(baseBloom).multiplyScalar(pBright);
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '⧉ КОПИРОВАТЬ ВСЁ';
    copyBtn.style.cssText = 'width:100%;margin:2px 0 10px;cursor:pointer;padding:9px;border-radius:6px;border:1px solid rgba(150,190,255,.5);background:rgba(150,190,255,.24);color:#eaf1ff;font:inherit;letter-spacing:.06em;font-weight:bold';
    const collectAll = () => ({
      particles: {
        particleSize: +pm.uParticleSize.value.toFixed(2), particleScale: +particlesGroup.scale.x.toFixed(3),
        brightness: +pBright.toFixed(2), particleOpacity: +pm.uOpacity.value.toFixed(2),
        particleFade: [+pm.uFadeDistance.value.x.toFixed(2), +pm.uFadeDistance.value.y.toFixed(2)],
        pos: [+particlesGroup.position.x.toFixed(2), +particlesGroup.position.y.toFixed(2), +particlesGroup.position.z.toFixed(2)],
      },
      mountains: mountainsGroup ? {
        mtnStyle: (setMountainStyle ? CFG.mtnStyle : 'силуэт'),
        color: silhouetteMat ? '#' + silhouetteMat.color.getHexString() : undefined,
        pos: [+mountainsGroup.position.x.toFixed(2), +mountainsGroup.position.y.toFixed(2), +mountainsGroup.position.z.toFixed(2)],
        scale: +mountainsGroup.scale.x.toFixed(2),
      } : null,
      ground: groundGroup ? {
        tex: curGroundTex, color: '#' + new THREE.Color(curGroundColor).getHexString(),
        pos: [+groundGroup.position.x.toFixed(2), +groundGroup.position.y.toFixed(2), +groundGroup.position.z.toFixed(2)],
        scale: +groundGroup.scale.x.toFixed(2), rotY: +groundGroup.rotation.y.toFixed(2), rotX: +groundGroup.rotation.x.toFixed(2),
      } : null,
      light: {
        type: lightState.type, wholeScene: lightState.wholeScene,
        pos: [+lightState.pos.x.toFixed(2), +lightState.pos.y.toFixed(2), +lightState.pos.z.toFixed(2)],
        intensity: +lightState.intensity.toFixed(1), distance: +lightState.distance.toFixed(1),
        color: '#' + new THREE.Color(lightState.color).getHexString(),
      },
      wave: (waveMat && waveMesh) ? {
        waveRadius: +waveMat.uniforms.uRadius.value.toFixed(2), waveSpeed: +waveMat.uniforms.uSpeed.value.toFixed(2),
        waveFreq: +waveMat.uniforms.uFreq.value.toFixed(0), wavePulse: +waveMat.uniforms.uPulse.value.toFixed(2),
        wavePulseSpeed: +waveMat.uniforms.uPulseSpeed.value.toFixed(2),
        waveOpacity: +waveMat.uniforms.uOpacity.value.toFixed(2), waveY: +waveMesh.position.y.toFixed(2),
        waveCenter: [+waveMat.uniforms.uCenter.value.x.toFixed(2), +waveMat.uniforms.uCenter.value.y.toFixed(2)],
        waveColor: '#' + waveMat.uniforms.uColor.value.getHexString(),
      } : null,
      frost: (cube && cube.mesh && cube.mesh.material.uniforms && cube.mesh.material.uniforms.uColorFrost) ? {
        color: '#' + cube.mesh.material.uniforms.uColorFrost.value.getHexString(),
        strength: +cube.mesh.material.uniforms.uFrostStrength.value.toFixed(2),
        chroma: +cube.mesh.material.uniforms.uChromaticAberration.value.toFixed(2),
        patternScale: +cube.mesh.material.uniforms.uPatternScale.value.toFixed(1),
        ...((cube.mouseFrost && cube.mouseFrost.fsQuad) ? {
          waveSpeed: +cube.mouseFrost.fsQuad.material.uniforms.uWaveSpeed.value.toFixed(2),
          damping: +cube.mouseFrost.fsQuad.material.uniforms.uDamping.value.toFixed(3),
          splatSize: +cube.mouseFrost.fsQuad.material.uniforms.uSplatSize.value.toFixed(3),
          advect: +cube.mouseFrost.fsQuad.material.uniforms.uAdvect.value.toFixed(2),
        } : {}),
      } : null,
      water: (floorMat && floorMat.uniforms) ? {
        reflectivity: +floorMat.uniforms.uReflectivity.value.toFixed(3),
        mixStrength: +floorMat.uniforms.uFloorMixStrength.value.toFixed(1),
        mirror: +floorMat.uniforms.uMirror.value.toFixed(2),
        distortion: +floorMat.uniforms.uNormalDistortionStrength.value.toFixed(2),
        color: '#' + floorMat.uniforms.uColor.value.getHexString(),
      } : null,
      post: (window.__rm) ? {
        bloomStrength: +window.__rm.settings.bloom.strength.toFixed(2), bloomRadius: +window.__rm.settings.bloom.radius.toFixed(2),
        darken: +window.__rm.compositeCA.uniforms.uDarken.value.toFixed(2), saturation: +window.__rm.compositeCA.uniforms.uSaturation.value.toFixed(2),
        lens: window.__rm.lensEnabled, grain: +window.__rm.finalMaterial.uniforms.uPerlin.value.toFixed(3),
        contrast: +window.__rm.finalMaterial.uniforms.uContrast.value.toFixed(2), lensWarp: +window.__rm.finalMaterial.uniforms.uFluidStrength.value.toFixed(2),
        vignette: '#' + window.__rm.finalMaterial.uniforms.uBgColor.value.getHexString(),
        blur: window.__rm.settings.blur.enabled, blurStrength: +window.__rm.settings.blur.strength.toFixed(1), fxaa: window.__rm.settings.fxaa.enabled,
        ...(window.__stage && window.__stage.cameraController ? { camRig: window.__stage.cameraController.enabled, parallax: [+window.__stage.cameraController.targetXY.x.toFixed(2), +window.__stage.cameraController.targetXY.y.toFixed(2)], bankDeg: +THREE.MathUtils.radToDeg(window.__stage.cameraController.rotateAngle).toFixed(0) } : {}),
      } : null,
    });
    copyBtn.addEventListener('click', () => {
      const txt = JSON.stringify(collectAll(), null, 2);
      console.log('%c=== ВСЕ НАСТРОЙКИ (скопируй и пришли мне) ===', 'color:#8fe;font-weight:bold');
      console.log(txt);
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => { copyBtn.textContent = '✓ СКОПИРОВАНО'; setTimeout(() => copyBtn.textContent = '⧉ КОПИРОВАТЬ ВСЁ', 1200); }).catch(() => {});
    });
    body.appendChild(copyBtn);

    // ── КАМЕНЬ (выбор объекта: cube3 / природные скалы) ──
    {
      const sub = document.createElement('div');
      sub.textContent = 'КАМЕНЬ'; sub.style.cssText = 'letter-spacing:.1em;color:#8fe;margin:2px 0 2px;padding-bottom:2px';
      body.appendChild(sub);
      const rselWrap = document.createElement('div'); rselWrap.style.margin = '4px 0 8px';
      const rsel = document.createElement('select');
      rsel.style.cssText = 'width:100%;background:rgba(255,255,255,.08);color:#e6eeff;border:1px solid rgba(255,255,255,.18);border-radius:5px;padding:5px;font:inherit';
      ROCK_NAMES.forEach((n) => { const op = document.createElement('option'); op.value = n; op.textContent = n; if (n === CFG.rockName) op.selected = true; rsel.appendChild(op); });
      rsel.addEventListener('change', () => { rsel.disabled = true; setRock(rsel.value).finally(() => { rsel.disabled = false; }); });
      rselWrap.appendChild(rsel); body.appendChild(rselWrap);
      // ручной поворот камня (добавляется поверх лёгкой idle-анимации)
      row('поворот X', -3.14, 3.14, 0.02, rockRot.x, (v) => (rockRot.x = v));
      row('поворот Y', -3.14, 3.14, 0.02, rockRot.y, (v) => (rockRot.y = v));
      row('поворот Z', -3.14, 3.14, 0.02, rockRot.z, (v) => (rockRot.z = v));
    }

    // ── ЧАСТИЦЫ (без позиций — двигаются WASD) ──
    row('размер', 0.1, 4, 0.05, pm.uParticleSize.value, (v) => (pm.uParticleSize.value = v));
    row('плотность поля', 0.05, 0.6, 0.01, particlesGroup.scale.x, (v) => particlesGroup.scale.setScalar(v));
    row('яркость', 0.3, 6, 0.1, pBright, (v) => { pBright = v; pm.uColor.value.copy(baseColor).multiplyScalar(v); pm.uBloomColor.value.copy(baseBloom).multiplyScalar(v); });
    row('прозрачность', 0, 1, 0.02, pm.uOpacity.value, (v) => (pm.uOpacity.value = v));
    row('fade ближе', 0, 20, 0.5, pm.uFadeDistance.value.x, (v) => (pm.uFadeDistance.value.x = v));
    row('fade дальше', 5, 80, 1, pm.uFadeDistance.value.y, (v) => (pm.uFadeDistance.value.y = v));

    if (mountainsGroup) {
      const sub = document.createElement('div');
      sub.textContent = 'ГОРЫ (двигать: стрелки)'; sub.style.cssText = 'letter-spacing:.1em;color:#8fe;margin:12px 0 2px;border-top:1px solid rgba(255,255,255,.12);padding-top:10px';
      body.appendChild(sub);
      if (setMountainStyle) {
        const selWrap = document.createElement('div'); selWrap.style.margin = '8px 0';
        const selLab = document.createElement('div'); selLab.style.color = '#9fb0d0'; selLab.textContent = 'текстура';
        const sel = document.createElement('select');
        sel.style.cssText = 'width:100%;margin-top:3px;background:rgba(255,255,255,.08);color:#e6eeff;border:1px solid rgba(255,255,255,.18);border-radius:5px;padding:5px;font:inherit';
        MTN_STYLE_NAMES.forEach((n) => { const op = document.createElement('option'); op.value = n; op.textContent = n; if (n === CFG.mtnStyle) op.selected = true; sel.appendChild(op); });
        sel.addEventListener('change', () => setMountainStyle(sel.value));
        selWrap.appendChild(selLab); selWrap.appendChild(sel); body.appendChild(selWrap);
      }
      // цвет силуэта гор на фоне (по запросу — раньше был не редактируемый)
      if (silhouetteMat) colorRow('цвет гор', '#' + new THREE.Color(CFG.mtnMeshColor).getHexString(), (hex) => silhouetteMat.color.set(hex));
      row('масштаб', 0.2, 8, 0.05, mountainsGroup.scale.x, (v) => mountainsGroup.scale.setScalar(v));
    }

    if (groundGroup) {
      const sub = document.createElement('div');
      sub.textContent = 'ЗЕМЛЯ (YGHJ/UN двиг · KL/OP крути)'; sub.style.cssText = 'letter-spacing:.08em;color:#8fe;margin:12px 0 2px;border-top:1px solid rgba(255,255,255,.12);padding-top:10px';
      body.appendChild(sub);
      // селектор модели земли (переключение между горами)
      const gselWrap = document.createElement('div'); gselWrap.style.margin = '8px 0';
      const gselLab = document.createElement('div'); gselLab.style.color = '#9fb0d0'; gselLab.textContent = 'модель';
      const gsel = document.createElement('select');
      gsel.style.cssText = 'width:100%;margin-top:3px;background:rgba(255,255,255,.08);color:#e6eeff;border:1px solid rgba(255,255,255,.18);border-radius:5px;padding:5px;font:inherit';
      GROUND_NAMES.forEach((n) => { const op = document.createElement('option'); op.value = n; op.textContent = n; if (GROUND_MODELS[n] === CFG.groundSrc) op.selected = true; gsel.appendChild(op); });
      gsel.addEventListener('change', () => loadGround(GROUND_MODELS[gsel.value]));
      gselWrap.appendChild(gselLab); gselWrap.appendChild(gsel); body.appendChild(gselWrap);
      // селектор ТЕКСТУРЫ земли (по запросу — раньше была только плоская заливка цветом)
      const gtWrap = document.createElement('div'); gtWrap.style.margin = '8px 0';
      const gtLab = document.createElement('div'); gtLab.style.color = '#9fb0d0'; gtLab.textContent = 'текстура';
      const gtSel = document.createElement('select');
      gtSel.style.cssText = 'width:100%;margin-top:3px;background:rgba(255,255,255,.08);color:#e6eeff;border:1px solid rgba(255,255,255,.18);border-radius:5px;padding:5px;font:inherit';
      GROUND_TEX_NAMES.forEach((n) => { const op = document.createElement('option'); op.value = n; op.textContent = n; if (n === curGroundTex) op.selected = true; gtSel.appendChild(op); });
      gtSel.addEventListener('change', () => applyGroundTex(gtSel.value));
      gtWrap.appendChild(gtLab); gtWrap.appendChild(gtSel); body.appendChild(gtWrap);
      row('высота Y', -6, 3, 0.05, groundGroup.position.y, (v) => (groundGroup.position.y = v));
      row('глубина Z', -20, 6, 0.1, groundGroup.position.z, (v) => (groundGroup.position.z = v));
      row('масштаб', 0.2, 6, 0.05, groundGroup.scale.x, (v) => groundGroup.scale.setScalar(v));
      row('поворот Y', -3.14, 3.14, 0.02, groundGroup.rotation.y, (v) => (groundGroup.rotation.y = v));
      row('наклон X', -1.57, 1.57, 0.02, groundGroup.rotation.x, (v) => (groundGroup.rotation.x = v));
      colorRow('цвет земли', '#' + new THREE.Color(CFG.groundColor).getHexString(), (hex) => { curGroundColor = hex; groundGroup.traverse((o) => { if (o.isMesh && o.material) o.material.color.set(hex); }); });
    }

    {
      const sub = document.createElement('div');
      sub.textContent = 'СВЕТ (стрелки/PgUp-Dn двигать)'; sub.style.cssText = 'letter-spacing:.07em;color:#8fe;margin:12px 0 2px;border-top:1px solid rgba(255,255,255,.12);padding-top:10px';
      body.appendChild(sub);
      // ТИП света (запрос: не только «сфера со светом»)
      const lselWrap = document.createElement('div'); lselWrap.style.margin = '8px 0';
      const lselLab = document.createElement('div'); lselLab.style.color = '#9fb0d0'; lselLab.textContent = 'тип';
      const lsel = document.createElement('select');
      lsel.style.cssText = 'width:100%;margin-top:3px;background:rgba(255,255,255,.08);color:#e6eeff;border:1px solid rgba(255,255,255,.18);border-radius:5px;padding:5px;font:inherit';
      LIGHT_TYPES.forEach((n) => { const op = document.createElement('option'); op.value = n; op.textContent = n; if (n === lightState.type) op.selected = true; lsel.appendChild(op); });
      lsel.addEventListener('change', () => { lightState.type = lsel.value; rebuildLight(); });
      lselWrap.appendChild(lselLab); lselWrap.appendChild(lsel); body.appendChild(lselWrap);
      row('яркость', 0, 200, 1, lightState.intensity, (v) => { lightState.intensity = v; applyLightIntensity(); });
      row('дальность', 2, 100, 1, lightState.distance, (v) => { lightState.distance = v; if ('distance' in currentLight) currentLight.distance = v; });
      row('высота Y', -6, 12, 0.1, lightState.pos.y, (v) => { lightState.pos.y = v; currentLight.position.y = v; lightMarker.position.y = v; if (currentLight.target) currentLight.target.position.y = v - 3; });
      colorRow('цвет света', '#' + new THREE.Color(CFG.lightColor).getHexString(), (hex) => { lightState.color = hex; currentLight.color.set(hex); lightMarker.material.color.set(hex); });
      // чекбокс: светить на всю сцену (иначе свет трогает только террейн-слой)
      const chkWrap = document.createElement('label'); chkWrap.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0;cursor:pointer;color:#9fb0d0';
      const chk = document.createElement('input'); chk.type = 'checkbox'; chk.checked = lightState.wholeScene; chk.style.cursor = 'pointer';
      const chkLab = document.createElement('span'); chkLab.textContent = 'светить на всю сцену';
      chk.addEventListener('change', () => { lightState.wholeScene = chk.checked; rebuildLight(); });
      chkWrap.appendChild(chk); chkWrap.appendChild(chkLab); body.appendChild(chkWrap);
    }

    // ── ВОДА (отражение неба/сцены в воде) ──
    if (floorMat && floorMat.uniforms) {
      const wu = floorMat.uniforms;
      const sub = document.createElement('div');
      sub.textContent = 'ВОДА (отражение)'; sub.style.cssText = 'letter-spacing:.08em;color:#8fe;margin:12px 0 2px;border-top:1px solid rgba(255,255,255,.12);padding-top:10px';
      body.appendChild(sub);
      // сила отражения (Френель): ниже -> небо слабее отражается в воде
      row('сила отражения', 0, 1, 0.01, wu.uReflectivity.value, (v) => (wu.uReflectivity.value = v));
      // яркость отражения (множитель): ниже -> отражение тусклее
      row('яркость отраж.', 0, 30, 0.5, wu.uFloorMixStrength.value, (v) => (wu.uFloorMixStrength.value = v));
      // зеркальность: 1 = чистое зеркало; <1 подмешивает плоский цвет воды (гасит отражение)
      row('зеркальность', 0, 1, 0.02, wu.uMirror.value, (v) => (wu.uMirror.value = v));
      // искажение отражения нормалью (рябь)
      row('искажение (рябь)', 0, 6, 0.1, wu.uNormalDistortionStrength.value, (v) => (wu.uNormalDistortionStrength.value = v));
      // цвет воды (тонирует отражение)
      colorRow('цвет воды', '#' + wu.uColor.value.getHexString(), (hex) => wu.uColor.value.set(hex));
    }

    if (waveMat && waveMesh) {
      const wu = waveMat.uniforms;
      const sub = document.createElement('div');
      sub.textContent = 'ВОЛНА'; sub.style.cssText = 'letter-spacing:.12em;color:#8fe;margin:12px 0 2px;border-top:1px solid rgba(255,255,255,.12);padding-top:10px';
      body.appendChild(sub);
      row('радиус пула', 0.5, 12, 0.1, wu.uRadius.value, (v) => (wu.uRadius.value = v));
      row('скорость', 0, 8, 0.1, wu.uSpeed.value, (v) => (wu.uSpeed.value = v));
      row('частота колец', 50, 800, 5, wu.uFreq.value, (v) => (wu.uFreq.value = v));
      row('пульс (сила)', 0, 4, 0.05, wu.uPulse.value, (v) => (wu.uPulse.value = v));
      row('пульс (скорость)', 0, 5, 0.05, wu.uPulseSpeed.value, (v) => (wu.uPulseSpeed.value = v));
      row('прозрачность', 0, 1, 0.02, wu.uOpacity.value, (v) => (wu.uOpacity.value = v));
      row('уровень Y', -4, 2, 0.05, waveMesh.position.y, (v) => (waveMesh.position.y = v));
      // позиция центра колец/импульса (мир. коорд.; камень в x=0, z=15)
      row('центр X', -12, 12, 0.1, wu.uCenter.value.x, (v) => (wu.uCenter.value.x = v));
      row('центр Z', 4, 26, 0.1, wu.uCenter.value.y, (v) => (wu.uCenter.value.y = v));
      colorRow('цвет волны', '#' + wu.uColor.value.getHexString(), (hex) => wu.uColor.value.set(hex));
    }

    // ── ИНЕЙ (frost-ховер по камню): вид + распространение следа ──
    if (cube && cube.mesh && cube.mesh.material.uniforms.uColorFrost) {
      const fu = cube.mesh.material.uniforms;   // материал инея (цвет/сила/узор/хроматика)
      const mf = (cube.mouseFrost && cube.mouseFrost.fsQuad) ? cube.mouseFrost.fsQuad.material.uniforms : null;   // распространение следа
      const origTri = fu.tTriangles.value;
      const sub = document.createElement('div');
      sub.textContent = 'ИНЕЙ (ховер по камню)'; sub.style.cssText = 'letter-spacing:.08em;color:#8fe;margin:12px 0 2px;border-top:1px solid rgba(255,255,255,.12);padding-top:10px';
      body.appendChild(sub);
      // — вид —
      colorRow('цвет инея', '#' + fu.uColorFrost.value.getHexString(), (hex) => fu.uColorFrost.value.set(hex));
      row('сила / прозрачн.', 0, 3, 0.05, fu.uFrostStrength.value, (v) => (fu.uFrostStrength.value = v));
      row('хроматика', 0, 0.5, 0.01, fu.uChromaticAberration.value, (v) => (fu.uChromaticAberration.value = v));
      row('плотность узора', 1, 40, 0.5, fu.uPatternScale.value, (v) => (fu.uPatternScale.value = v));
      // — гладкость поверхности льда (по запросу: убрать шероховатости) —
      // рельеф = normalScale (0 = гладко/без бугров, 1 = ориг.); шероховатость = roughness (0 = зеркало, 1 = матовое)
      row('рельеф поверхности', 0, 1.5, 0.05, origFrostMat.normalScale.x, (v) => origFrostMat.normalScale.set(v, v));
      row('шероховатость', 0, 1, 0.02, origFrostMat.roughness, (v) => (origFrostMat.roughness = v));
      // паттерн
      const selWrap = document.createElement('div'); selWrap.style.margin = '8px 0';
      const selLab = document.createElement('div'); selLab.style.color = '#9fb0d0'; selLab.textContent = 'паттерн';
      const sel = document.createElement('select');
      sel.style.cssText = 'width:100%;margin-top:3px;background:rgba(255,255,255,.08);color:#e6eeff;border:1px solid rgba(255,255,255,.18);border-radius:5px;padding:5px;font:inherit';
      ['оригинал', 'точки', 'сетка', 'полосы', 'диагонали', 'кресты', 'шум'].forEach((n) => { const op = document.createElement('option'); op.value = n; op.textContent = n; if (n === CFG.frostPattern) op.selected = true; sel.appendChild(op); });
      sel.addEventListener('change', () => { fu.tTriangles.value = (sel.value === 'оригинал') ? origTri : makePattern(sel.value); });
      if (CFG.frostPattern && CFG.frostPattern !== 'оригинал') fu.tTriangles.value = makePattern(CFG.frostPattern);   // применить дефолтный паттерн (подобрано юзером)
      selWrap.appendChild(selLab); selWrap.appendChild(sel); body.appendChild(selWrap);
      // — распространение следа (mouseFrost) —
      if (mf) {
        const sub2 = document.createElement('div');
        sub2.textContent = 'распространение'; sub2.style.cssText = 'color:#9fd; margin:8px 0 2px; font-size:10px; letter-spacing:.08em';
        body.appendChild(sub2);
        row('скорость расползания', 0, 5, 0.1, mf.uWaveSpeed.value, (v) => (mf.uWaveSpeed.value = v));
        row('стойкость (затух.)', 0.9, 0.999, 0.001, mf.uDamping.value, (v) => (mf.uDamping.value = v));
        row('радиус следа', 0.005, 0.25, 0.005, mf.uSplatSize.value, (v) => (mf.uSplatSize.value = v));
        row('снос узора', 0, 4, 0.1, mf.uAdvect.value, (v) => (mf.uAdvect.value = v));
      }
    }

    // ── КАМЕРА / ПОСТ / ЛИНЗА (эффекты lafys.com) ──
    {
      const rm = window.__rm, stg = window.__stage;
      if (rm || stg) {
        const sub = document.createElement('div');
        sub.textContent = 'КАМЕРА / ПОСТ / ЛИНЗА'; sub.style.cssText = 'letter-spacing:.06em;color:#8fe;margin:12px 0 2px;border-top:1px solid rgba(255,255,255,.12);padding-top:10px';
        body.appendChild(sub);
        // — камера-риг (параллакс + крен) —
        if (stg && stg.cameraController) {
          const cc = stg.cameraController;
          checkRow('камера-риг (параллакс/крен)', cc.enabled, (v) => (cc.enabled = v));
          row('параллакс X', 0, 1.5, 0.05, cc.targetXY.x, (v) => (cc.targetXY.x = v));
          row('параллакс Y', 0, 1.5, 0.05, cc.targetXY.y, (v) => (cc.targetXY.y = v));
          row('крен макс°', 0, 40, 1, THREE.MathUtils.radToDeg(cc.rotateAngle), (v) => (cc.rotateAngle = THREE.MathUtils.degToRad(v)));
        }
        if (rm) {
          const S = rm.settings;
          const cu = rm.compositeCA.uniforms;
          const lu = rm.finalMaterial.uniforms;
          const refreshBloom = () => (rm.BloomMaterial.uniforms.uBloomFactors.value = rm.bloomFactors());
          // — bloom —
          row('bloom сила', 0, 1.5, 0.01, S.bloom.strength, (v) => { S.bloom.strength = v; refreshBloom(); });
          row('bloom радиус', 0, 2, 0.05, S.bloom.radius, (v) => { S.bloom.radius = v; refreshBloom(); });
          // — композит (хроматика/цвет) —
          row('затемнение', 0, 1, 0.02, cu.uDarken.value, (v) => (cu.uDarken.value = v));
          row('насыщенность', 0, 1, 0.02, cu.uSaturation.value, (v) => (cu.uSaturation.value = v));
          // — линза —
          checkRow('линза (зерно/края)', rm.lensEnabled, (v) => (rm.lensEnabled = v));
          row('зерно (grain)', 0, 0.2, 0.005, lu.uPerlin.value, (v) => (lu.uPerlin.value = v));
          row('контраст', 0.8, 1.5, 0.01, lu.uContrast.value, (v) => (lu.uContrast.value = v));
          row('линза: warp курсором', 0, 1.5, 0.02, lu.uFluidStrength.value, (v) => (lu.uFluidStrength.value = v));   // 0 = выкл (было отключено)
          colorRow('цвет краёв (виньетка)', '#' + lu.uBgColor.value.getHexString(), (hex) => lu.uBgColor.value.set(hex));
          // — выключенные по умолчанию: blur + fxaa (тумблер + resize для аллокации RT) —
          checkRow('размытие (blur)', S.blur.enabled, (v) => { S.blur.enabled = v; if (v) { rm.hBlurMaterial.uniforms.uBluriness.value = S.blur.strength; rm.vBlurMaterial.uniforms.uBluriness.value = S.blur.strength; } rm.resize(innerWidth, innerHeight); });
          row('сила размытия', 0, 20, 0.5, S.blur.strength, (v) => { S.blur.strength = v; rm.hBlurMaterial.uniforms.uBluriness.value = v; rm.vBlurMaterial.uniforms.uBluriness.value = v; });
          checkRow('FXAA (сглаживание)', S.fxaa.enabled, (v) => { S.fxaa.enabled = v; rm.resize(innerWidth, innerHeight); });
        }
      }
    }

    // dev-панель НЕ добавляется в DOM (не показывается), но IIFE ВЫПОЛНЯЕТСЯ —
    // внутри применяются стартовые настройки (яркость частиц, паттерн инея 'шум' и др.).
    // (раньше отключение IIFE ломало иней/частицы.)
    void box;
  })();

  // two-pass transmission: рендерим сцену lafys в сэмплер (backside), стекло преломляет ЕЁ
  function frameCube() {
    const m = cube.mesh.material;
    m.side = THREE.BackSide; m.needsUpdate = true;
    m.uniforms.tTransmissionSamplerMap.value = bgTex;
    m.uniforms.uTransmissionSamplerSize.value.set(4, 4);
    cube.mesh3.visible = true; cube.mesh2.visible = false; cube.plexus.group.visible = false;
    const prev = renderer.getRenderTarget();
    const prevAutoClear = renderer.autoClear;
    renderer.autoClear = true;
    renderer.setRenderTarget(transmissionRT);
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
    renderer.setRenderTarget(prev);
    renderer.autoClear = prevAutoClear;
    m.side = THREE.FrontSide; m.needsUpdate = true;
    m.uniforms.tTransmissionSamplerMap.value = transmissionRT.texture;
    m.uniforms.uTransmissionSamplerSize.value.set(transmissionRT.width, transmissionRT.height);
    cube.mesh3.visible = false; cube.mesh2.visible = true; cube.plexus.group.visible = true;
  }

  return {
    cube,
    // материалы, чьи цвета зависят от темы (тюнятся из main.js при смене темы)
    get silhouetteMat() { return silhouetteMat; },   // цвет гор (силуэт)
    get frostColor() {
      const u = cube.mesh && cube.mesh.material && cube.mesh.material.uniforms;
      return (u && u.uColorFrost) ? u.uColorFrost.value : null;   // цвет инея (THREE.Color)
    },
    // вызывать в tick ПЕРЕД рендером lafys
    beforeRender(dt) {
      tick(dt);
      if (waveMat) { waveMat.uniforms.uTime.value += dt; waveMat.uniforms.uMusicTime.value += dt * waveMat.uniforms.uPulseSpeed.value; }
      moveLightFn(dt);   // стрелки двигают свет
      moveGround(dt);
      rotateGround(dt);
      cube.update(0, 0, 0);
      cube.rotation.x += rockRot.x; cube.rotation.y += rockRot.y; cube.rotation.z += rockRot.z;   // ручной поворот из панели (поверх idle)
      particles.step(dt);
      if (iceActive) frameCube();   // two-pass преломление только для ледяного материала (у своей модели свой материал)
    },
  };
}
