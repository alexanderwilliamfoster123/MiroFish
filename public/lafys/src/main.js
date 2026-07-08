import * as THREE from "three";
import gsap from "gsap";
import { Stage } from "./Stage.js";
import { RenderManager } from "./post/RenderManager.js";
import { ColorController } from "./ColorController.js";
import { palettes } from "./palettes.js";
import { animateLafysUI } from "./lafysAnim.js";
import { createLearnMoreButton } from "./learnMoreButton.js";
import { addCubeToScene } from "./cube/cubeInScene.js";
import { createSwirlLoader } from "./swirlLoader.js";
import { initScrollSection } from "./scrollSection.js";

// #boot — статичный тёмный экран из index.html до монтирования swirl-лоадера (ниже).
document.getElementById("boot")?.remove();
const uiEl = document.querySelector(".ui");
if (uiEl) uiEl.style.opacity = "1";

// shared manager → real load progress drives the loader ring
const manager = new THREE.LoadingManager();
let assetsDone = false;
let realFrac = 0;
manager.onProgress = (url, loaded, total) => (realFrac = total ? loaded / total : 0);
manager.onLoad = () => (assetsDone = true);

// ── ПРЕЛОАДЕР «вихрь» (lafys/swirl-loader) — % от реального прогресса ──
const swirl = createSwirlLoader();
window.__swirl = swirl;   // debug (форсировать reveal)
const loadStart = performance.now();
// % = max(доля ассетов, мягкий тайм-рамп) — чтобы счётчик жил, пока грузятся куб/EXR/частицы
const progTimer = setInterval(() => {
  const tRamp = Math.min(0.9, (performance.now() - loadStart) / 4200);
  swirl.setProgress(Math.max(realFrac * 0.9, tRamp));
}, 100);

const canvas = document.getElementById("gl");
// DPR-кап: на Retina рендерим в 1.25× (а не 1.5×) — площадь пикселей 1.56× вместо
// 2.25×, минус ~30% фрагментной работы GPU, визуально почти незаметно. Для макс.
// экономии поставь 1.0; для макс. чёткости — верни 1.5.
const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(dpr);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.autoClear = true;

// perlin displacement texture (scrolled in the block vertex shader)
const texLoader = new THREE.TextureLoader(manager);
const perlin = texLoader.load("https://qclay.design/lovable/lafys/textures/perlin-1.webp");
perlin.wrapS = perlin.wrapT = THREE.RepeatWrapping;
const floorNormal = texLoader.load("https://qclay.design/lovable/lafys/textures/floor-normal.webp");
const perlin2 = texLoader.load("https://qclay.design/lovable/lafys/textures/perlin-2.webp");
perlin2.wrapS = perlin2.wrapT = THREE.RepeatWrapping;
const blueNoise = texLoader.load("https://qclay.design/lovable/lafys/textures/blue-noise.png");
blueNoise.wrapS = blueNoise.wrapT = THREE.RepeatWrapping;

const stage = new Stage(renderer, perlin, floorNormal, palettes.length, manager);
const rm = new RenderManager(renderer, stage.scene, stage.camera);
window.__rm = rm; window.__stage = stage;   // доступ для панели (эффекты камеры/поста/линзы)
rm.renderTargetA.texture.colorSpace = THREE.SRGBColorSpace;
rm.resize(innerWidth, innerHeight, dpr);
rm.setLensTextures(perlin2, blueNoise);

// scroll-driven second section + circle-reveal transition (ported from lafys)
const scroll = initScrollSection({ renderer, rm, stage });
window.__scroll = scroll;   // debug: window.__scroll.progress = .6

// feed the fluid velocity field into the block mouse-ripple + composite
if (rm.fluidSimulation && rm.fluidSimulation.fbos.main) {
  stage.setFluidTexture(rm.fluidSimulation.fbos.main.texture);
}

const colors = new ColorController({
  ambientLight: stage.ambientLight,
  keyLight: stage.keyLight,
  accentA: stage.accentA,
  accentB: stage.accentB,
  heroMaterials: stage.heroMaterials,
  fog: stage.fog,
  scene: stage.scene,
  envDome: stage.envDome,
  composite: rm.compositeCA.uniforms,
});

// starting section / colour (default = Default — по просьбе основная цветокоррекция)
const DEFAULT_INDEX = Math.max(0, palettes.findIndex((p) => p.name === "Default"));

colors.apply(palettes[DEFAULT_INDEX], true);
stage.revealIn();

// на место убранного логотипа ставим настоящий cube3 lafys + частицы lafys (в ЭТУ сцену)
let cubeCtl = null;
let loaderFinished = false;

// ── Смена темы: палитра + цвета ГОР(силуэт)/ИНЕЯ пер-тема + пульс (bloom) ──
const THEME_COLORS = {
  "Default":  { mtn: "#685e87", frost: "#cfcfcf" },
  "Blue":     { mtn: "#606a9a", frost: "#4a3dff" },
  "Уголь":    { mtn: "#6b6c76", frost: "#000000" },
  "Wildfire": { mtn: "#706161", frost: "#ff4d00" },
};
const BLOOM_BASE = rm.settings.bloom.strength;
const _tc = new THREE.Color();
const tweenCol = (target, hex, dur = 1.0) => { _tc.set(hex); gsap.to(target, { r: _tc.r, g: _tc.g, b: _tc.b, duration: dur, ease: "expo.out", overwrite: true }); };
function applyThemeColors(name) {
  const c = THEME_COLORS[name];
  if (!c || !cubeCtl) return;
  if (cubeCtl.silhouetteMat) tweenCol(cubeCtl.silhouetteMat.color, c.mtn);
  if (cubeCtl.frostColor) tweenCol(cubeCtl.frostColor, c.frost);
}
const refreshBloom = () => { rm.BloomMaterial.uniforms.uBloomFactors.value = rm.bloomFactors(); };
function themePulse() {   // пульс свечения при смене темы
  const s = rm.settings.bloom;
  gsap.killTweensOf(s);
  gsap.timeline()
    .to(s, { strength: 0.65, duration: 0.22, ease: "power2.out", onUpdate: refreshBloom })
    .to(s, { strength: BLOOM_BASE, duration: 0.7, ease: "power2.inOut", onUpdate: refreshBloom });
}
function switchTheme(idx, opts = {}) {
  colors.apply(palettes[idx]);
  if (opts.dolly) stage.goTo(idx);
  applyThemeColors(palettes[idx].name);
  if (opts.pulse) themePulse();
}

const finishLoader = () => {
  if (loaderFinished) return;
  loaderFinished = true;
  clearInterval(progTimer);
  swirl.setProgress(1);
  swirl.finish(() => { if (window.__revealHeading) window.__revealHeading(); });   // reveal заголовка ПОСЛЕ лоадера
  scroll.enable();   // включаем скролл-переход только после лоадера
};
addCubeToScene({ renderer, scene: stage.scene, camera: stage.camera, logoSlot: stage.logoSlot })
  .then((c) => { cubeCtl = c; applyThemeColors(palettes[DEFAULT_INDEX].name); finishLoader(); })
  .catch((e) => { console.error("cube integration failed:", e); finishLoader(); });
// страховка: не держать лоадер вечно, если что-то зависло
setTimeout(finishLoader, 15000);

// nav теперь = обычные ссылки (Featured/Index/About/info@lafys/тел/the best prompts),
// к палитрам НЕ привязаны (тема переключается удержанием круга).

// LEARN MORE — пиксельная sweep-кнопка (learnMoreButton.js), вид из Figma:
// прозрачный фон + белая рамка, на hover заливается белым с тёмным текстом.
const lmHost = document.getElementById("learn-more");
if (lmHost) {
  createLearnMoreButton(lmHost, {
    label: "learn more",
    bg: "transparent", text: "#FFFFFF", border: "#FFFFFF",
    hoverBg: "#FFFFFF", hoverText: "#10122a",
    radius: 0, paddingX: 16, paddingY: 6,
    fontFamily: "Roboto Condensed", fontSize: 10, fontWeight: 500,
    letterSpacing: "0.04em", uppercase: true, pixelSize: 5,
  });
}

// Хедер nav: оборачиваем лейбл в .txt (чтобы intro/hover-scramble не стирал стрелку и
// не перебирал её), добавляем стрелку → (hover-эффект = CSS: стрелка у левой границы,
// текст сдвигается вправо). ДО animateLafysUI, только пункты меню (не кнопка/лого).
document.querySelectorAll("#nav a").forEach((a) => {
  if (!a.querySelector(".txt")) {
    const txt = document.createElement("span");
    txt.className = "txt";
    [...a.childNodes].forEach((n) => { if (n.nodeType === 3 && n.textContent.trim()) txt.appendChild(n); });
    a.appendChild(txt);
  }
  if (!a.querySelector(".arr")) {
    const arr = document.createElement("span"); arr.className = "arr"; arr.textContent = "→";
    a.insertBefore(arr, a.firstChild);
  }
});

// интро UI (scramble/hover); реальный reveal хедера играет после лоадера (__revealHeading)
animateLafysUI(document);

// ── Бургер (мобайл) → открывает/закрывает мобильное меню ──
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobile-menu");
if (burger && mobileMenu) {
  const setMenu = (open) => {
    burger.classList.toggle("open", open);
    mobileMenu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
  };
  burger.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
  mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
}

// ── Удержание ПКМ → круг-прогресс у курсора → на 2с смена темы по циклу
//    (Blue → Уголь → Wildfire → Default). Волнообразный warp линзы на выстреле УБРАН
//    по просьбе. Отпустил не досчитав — круг уезжает обратно к 0. ──
let holdShake = 0;      // целевая интенсивность эффекта камеры при холде (0..1 = rawT), пишется из holdToTheme
let shakeEnv = 0;       // сглаженная огибающая (плавный вход/возврат)
const _shakeFwd = new THREE.Vector3();
(function holdToTheme() {
  const CYCLE = ["Blue", "Уголь", "Wildfire", "Default"];
  const idxOf = (name) => palettes.findIndex((p) => p.name === name);
  let cyclePos = 0;

  const ring = document.createElement("div");
  ring.id = "hold-ring";
  ring.style.cssText =
    "position:fixed;z-index:2147483002;pointer-events:none;width:58px;height:58px;" +
    "margin:-29px 0 0 -29px;opacity:0;transition:opacity .18s;will-change:transform,opacity;";
  const R = 25, CIRC = 2 * Math.PI * R;
  ring.innerHTML =
    '<svg viewBox="0 0 58 58" width="58" height="58">' +
    '<circle cx="29" cy="29" r="' + R + '" fill="rgba(8,12,24,.28)" stroke="rgba(255,255,255,.28)" stroke-width="2.5"/>' +
    '<circle class="bar" cx="29" cy="29" r="' + R + '" fill="none" stroke="#fff" stroke-width="2.5" ' +
    'stroke-linecap="round" transform="rotate(-90 29 29)" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/></svg>';
  document.body.appendChild(ring);
  const bar = ring.querySelector(".bar");

  let held = false, armed = false, rawT = 0, visible = false;
  const HOLD = 1.5;          // сек до полного заполнения
  const RECEDE = 0.45;       // сек отката к 0 при отпускании
  const easeIn = (x) => x * x;   // easeInQuad — отсчёт ускоряется (не linear)

  const place = (x, y) => { ring.style.left = x + "px"; ring.style.top = y + "px"; };
  window.addEventListener("pointermove", (e) => place(e.clientX, e.clientY), true);
  window.addEventListener("contextmenu", (e) => e.preventDefault());   // без системного меню

  // Триггер: ПРАВАЯ кнопка (мышь) ИЛИ зажатие на самой сцене (левая кнопка на
  // canvas — чтобы работало и на трекпаде, где правую кнопку удержать нельзя).
  // Не срабатывает на UI-элементах (кнопки/панель/меню).
  const isSceneTarget = (el) =>
    el && (el.id === "gl" || el.tagName === "CANVAS" || el === document.body ||
           el.classList.contains("ui") || el.classList.contains("frame"));
  const onDown = (e) => {
    if (scroll && scroll.progress > 0.12) return;   // смена темы — ТОЛЬКО на первой секции (не в секции 2)
    const right = e.button === 2;
    const leftOnScene = e.button === 0 && isSceneTarget(e.target);
    if (!right && !leftOnScene) return;
    if (right) e.preventDefault();
    held = true; armed = true; rawT = 0;   // каждое НАЖАТИЕ = новый отсчёт (после смены темы надо нажать заново)
    place(e.clientX, e.clientY);
    ring.style.opacity = "1"; visible = true;
  };
  const onUp = () => { held = false; };
  window.addEventListener("pointerdown", onDown, true);   // capture — не перехватят дочерние
  window.addEventListener("pointerup", onUp, true);
  window.addEventListener("pointercancel", onUp, true);
  window.addEventListener("blur", () => (held = false));

  function fire() {
    // сменить тему + пульс свечения (bloom) + КОРОТКИЙ хроматический флеш (RGB-split).
    // Вихревой geo-warp (uFluidStrength) НЕ трогаем — он «закруглял» сцену; вместо него
    // только цветовой сдвиг каналов (uChromaPulse), форма НЕ искажается.
    const pi = idxOf(CYCLE[cyclePos]);
    if (pi >= 0) switchTheme(pi, { pulse: true });
    cyclePos = (cyclePos + 1) % CYCLE.length;
    const cp = rm.finalMaterial.uniforms.uChromaPulse;
    gsap.killTweensOf(cp);
    gsap.timeline()
      .to(cp, { value: 0.010, duration: 0.14, ease: "power2.out" })   // резкий флеш хроматики
      .to(cp, { value: 0, duration: 0.5, ease: "power2.inOut" });     // плавный откат
  }

  let last = performance.now();
  (function loop() {
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (held && armed) {
      rawT += dt / HOLD;
      if (rawT >= 1) { rawT = 1; armed = false; fire(); }   // сработал → armed off: держать дальше НЕ переключает, нужно отпустить и нажать заново
    } else if (rawT > 0) {
      rawT = Math.max(0, rawT - dt / RECEDE);
    }
    holdShake = (held && armed) ? rawT : 0;   // цель = прогресс холда (плавно растёт; после fire/release → 0 → камера возвращается)
    if (visible) {
      const p = easeIn(rawT);
      bar.style.strokeDashoffset = String(CIRC * (1 - p));           // дуга заполняется по easeIn
      ring.style.transform = "scale(" + (1 - 0.30 * rawT) + ")";      // круг постепенно уменьшается
      if (!held && rawT === 0) { ring.style.opacity = "0"; ring.style.transform = "scale(1)"; visible = false; }
    }
    requestAnimationFrame(loop);
  })();
})();

// полный дамп настроек камеры — вызвать window.__cam() в консоли
window.__cam = () => {
  const c = stage.camera, cc = stage.cameraController;
  const d = {
    fov: c.fov, near: c.near, far: c.far, zoom: c.zoom, aspect: +c.aspect.toFixed(3),
    position: { x: +c.position.x.toFixed(3), y: +c.position.y.toFixed(3), z: +c.position.z.toFixed(3) },
    rotationDeg: { x: +THREE.MathUtils.radToDeg(c.rotation.x).toFixed(2), y: +THREE.MathUtils.radToDeg(c.rotation.y).toFixed(2), z: +THREE.MathUtils.radToDeg(c.rotation.z).toFixed(2) },
    lookAt: { x: cc.lookAt.x, y: cc.lookAt.y, z: cc.lookAt.z },
    baseZ: stage.baseCamZ, radius: stage.radius, camDist: stage.camDist,
    rig: { parallaxXY: [cc.targetXY.x, cc.targetXY.y], maxBankDeg: +THREE.MathUtils.radToDeg(cc.rotateAngle).toFixed(1), enabled: cc.enabled },
  };
  console.table({ fov: d.fov, near: d.near, far: d.far, zoom: d.zoom, baseZ: d.baseZ, radius: d.radius, camDist: d.camDist });
  console.log('position', d.position, '| rotation°', d.rotationDeg, '| lookAt', d.lookAt, '| rig', d.rig);
  return d;
};
window.__camDump = window.__cam;

// ── pointer ──
const pointerClip = new THREE.Vector2(0, 0);
window.addEventListener("pointermove", (e) => {
  const nx = (e.clientX / innerWidth) * 2 - 1;
  const ny = -((e.clientY / innerHeight) * 2 - 1);
  pointerClip.set(nx, ny);
});

// ── resize ──
window.addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  stage.resize(innerWidth, innerHeight);
  rm.resize(innerWidth, innerHeight, dpr);
});

// ── loop ──
const coords = new THREE.Vector2();
const clock = new THREE.Clock();
// FPS-кап: на ProMotion-дисплеях (120 Гц) rAF идёт 120 раз/с → вдвое больше работы
// GPU без выигрыша в плавности для этой сцены. Рендерим не чаще 60 fps. Хочешь 120 —
// поставь TARGET_FPS = 120. Плюс пауза, когда вкладка скрыта.
const TARGET_FPS = 60;
const FRAME_MS = 1000 / TARGET_FPS;
let lastFrameT = performance.now();
function tick() {
  requestAnimationFrame(tick);
  if (document.hidden) { lastFrameT = performance.now(); return; }   // вкладка скрыта — не рендерим
  const nowT = performance.now();
  if (nowT - lastFrameT < FRAME_MS - 0.5) return;                    // ещё рано для след. кадра — пропускаем
  lastFrameT = nowT;
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  coords.set(innerWidth * dpr, innerHeight * dpr);
  if (rm.fluidSimulation) rm.fluidSimulation.setMouse(pointerClip.x, pointerClip.y);
  scroll.preUpdate();                       // скролл-прогресс → цели камеры (вбок+наезд) + DOM
  stage.update(t, dt, coords);
  // при холде круга: камера чуть ОТДАЛЯЕТСЯ + очень плавный sine-shake; огибающая
  // сглажена → вход мягкий, а после смены сцены (holdShake→0) камера плавно возвращается.
  shakeEnv += (holdShake - shakeEnv) * Math.min(1, dt * 5);
  if (shakeEnv > 0.002) {
    stage.camera.getWorldDirection(_shakeFwd);
    stage.camera.position.addScaledVector(_shakeFwd, -0.7 * shakeEnv);        // отдаление по направлению взгляда
    stage.camera.position.x += Math.sin(t * 2.6) * 0.06 * shakeEnv + (Math.random() - 0.5) * 0.03 * shakeEnv;   // плавное покачивание + лёгкое дёргание
    stage.camera.position.y += Math.sin(t * 3.7 + 1.3) * 0.05 * shakeEnv + (Math.random() - 0.5) * 0.03 * shakeEnv;
  }
  if (cubeCtl) cubeCtl.beforeRender(dt);   // куб: two-pass transmission + частицы перед рендером
  scroll.render(t, dt, dpr);                // hero → экран, либо circle-reveal переход
}
tick();
