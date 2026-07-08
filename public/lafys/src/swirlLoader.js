// swirlLoader.js — прелоадер «вихрь» из lafys/swirl-loader, подключённый
// к РЕАЛЬНОМУ прогрессу загрузки сцены (в оригинале был авто-цикл; здесь progress ведётся извне).
// Движок и шейдеры (vertexShader + HEAD/TAIL + swirl-маска + RGBShift) — вербатим из сниппета.
// Отличие от сниппета: three берётся из бандла проекта (не CDN), убран авто-цикл frame(),
// progress = внешний реальный процент; по готовности -> 100% + fade-out.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';

const vertexShader = [
  'varying vec2 vUv;',
  'void main() {',
  'vUv = vec2( uv.x, uv.y );',
  'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
  '}',
].join('\n');
// HEAD/TAIL вербатим из бандла; swirl-маска = расширение (спираль из центра)
const HEAD = 'uniform float time;uniform float progress;uniform sampler2D texture1;uniform sampler2D texture2;uniform sampler2D displacement;uniform vec4 resolution;varying vec2 vUv;varying vec4 vPosition;varying vec2 texCoord;vec2 mirrored(vec2 v) {vec2 m = mod(v,2.);return mix(m,2.0 - m, step(1.0 ,m));}void main()\t{vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);vec4 noise = texture2D(displacement, mirrored(newUV + time * 0.04));float prog = progress * 0.8 -0.05 + noise.g * 0.06;';
// TAIL: где swirl раскрылся (intpl->1) -> alpha 0 (растворяем лоадер, проступает САМ САЙТ, не второй экран).
const TAIL = 'vec4 t1 = texture2D( texture1, (newUV - 0.5) * (1.0 - intpl) + 0.5 ) ;gl_FragColor = vec4( t1.rgb, 1.0 - intpl ) ;}';
const fragmentShaderSwirl = HEAD +
  'vec2 sp = (vUv - 0.5); sp.x *= resolution.x / resolution.y; float sd = length(sp); float sa = atan(sp.y, sp.x);' +
  'float intpl = pow(abs(smoothstep(0., 0.0000001, (prog * 12. + (1.25 - sd * 1.5) + sin(sa * 2.0 + sd * 9.0) * 0.22))), 10.);' + TAIL;

export function createSwirlLoader() {
  // UI лоадера = макет Figma (node 26:189): чёрный фон, ВИДИМЫЙ хедер (лого+нав+learn more,
  // 1:1 с сайтом), низ-слева «LFS», низ-справа «NN%» + «Page is Loading», снизу — сегментный
  // прогресс-бар из вертикальных линий, заполняется по мере загрузки. Swirl-эффект (WebGL
  // ниже) и логика раскрытия НЕ трогались — меняется только этот DOM-оверлей.
  // UI лоадера в оверлее = только «LFS» (низ-слева) + «NN%»/«Page is Loading» (низ-справа)
  // + сегментный прогресс-бар (низ). ХЕДЕР НЕ дублируем: лоадер лежит ПОД .ui (z8), поэтому
  // виден РЕАЛЬНЫЙ хедер сайта (.ui z10) — как просил юзер. hero-контент прячем на загрузке.
  const style = document.createElement('style');
  style.textContent = `
    #swirl-loader{ --px:3vw; }
    @media (min-width:1700px){ #swirl-loader{ --px:56px; } }
    #swirl-loader .pl-ui{ position:absolute; inset:0; z-index:2; pointer-events:none; color:#fff;
      font-family:'Roboto Condensed',Arial,sans-serif; }
    #swirl-loader .pl-ui > *{ position:absolute; }
    #swirl-loader .pl-lfs{ left:calc(var(--px) - 19px); bottom:70px;
      font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:300;
      font-size:clamp(64px,8.33vw,120px); line-height:.86; letter-spacing:0; }
    #swirl-loader .pl-stat{ right:var(--px); bottom:70px; text-align:right; }
    #swirl-loader .pl-pct{ font-weight:300; font-size:clamp(38px,3.75vw,54px); line-height:1;
      letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
    #swirl-loader .pl-load{ font-weight:500; font-size:clamp(13px,1.18vw,17px); line-height:1;
      text-transform:uppercase; margin-top:9px; }
    /* прогресс-бар: вертикальные линии ОДИНАКОВОЙ ширины (2px), реже и толще прежних;
       КАЖДАЯ заполняется белым СНИЗУ ВВЕРХ по мере прогресса; старт слева = левая граница «LFS» */
    #swirl-loader .pl-bar{ left:calc(var(--px) - 11px); right:var(--px); bottom:19px; height:32px;
      display:flex; justify-content:space-between; align-items:stretch; }
    #swirl-loader .pl-bar .seg{ width:4px; position:relative; background:rgba(255,255,255,.22); }
    #swirl-loader .pl-bar .seg > i{ position:absolute; left:0; right:0; bottom:0; height:0; background:#fff;
      transition:height .45s cubic-bezier(.33,0,.2,1); }
    /* hero-контент скрыт ПОКА грузится (над лоадером виден только реальный хедер);
       проявляется, когда swirl растворяется */
    body.pl-loading .goal, body.pl-loading .side-nav, body.pl-loading .designby,
    body.pl-loading .scroll-cta{
      opacity:0 !important; pointer-events:none !important; }
    .goal, .side-nav, .designby{ transition:opacity .7s ease; }
    /* ── адаптив лоадера ── */
    @media (max-width:640px){
      /* на мобиле убираем десктопный bearing-сдвиг (−19/−11px) — при малом --px он
         уводил «LFS» за левый край; выравниваем LFS и бар по --px */
      #swirl-loader .pl-lfs{ font-size:clamp(40px,13vw,64px); bottom:54px; left:var(--px); }
      #swirl-loader .pl-stat{ bottom:54px; }
      #swirl-loader .pl-pct{ font-size:clamp(30px,9vw,44px); }
      #swirl-loader .pl-load{ font-size:11px; }
      #swirl-loader .pl-bar{ left:var(--px); bottom:18px; height:26px; }
    }
  `;
  document.head.appendChild(style);
  document.body.classList.add('pl-loading');

  // overlay DOM — z8: НИЖЕ .ui(z10) → реальный хедер сайта поверх; ВЫШЕ #gl(z0)/#boot(z5)
  const root = document.createElement('div');
  root.id = 'swirl-loader';
  root.style.cssText = 'position:fixed;inset:0;z-index:8;background:#000;overflow:hidden;transition:opacity .6s ease';
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute;inset:0;z-index:0';

  const ui = document.createElement('div');
  ui.className = 'pl-ui';
  ui.innerHTML = `
    <div class="pl-lfs">LFS</div>
    <div class="pl-stat"><div class="pl-pct">0%</div><div class="pl-load">Page is Loading</div></div>
    <div class="pl-bar"></div>
  `;
  const pctEl = ui.querySelector('.pl-pct');
  const barEl = ui.querySelector('.pl-bar');

  root.appendChild(wrap); root.appendChild(ui);
  document.body.appendChild(root);

  // сегменты бара: N линий по ширине бара (шаг ~16px → вдвое меньше и вдвое толще прежних).
  // Пересобираются на resize.
  const SEG_PERIOD = 12;
  let segFills = [];
  function layoutBar() {
    const w = barEl.clientWidth || (innerWidth - 80);
    const n = Math.max(8, Math.floor(w / SEG_PERIOD));
    barEl.innerHTML = '';
    segFills = [];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div'); s.className = 'seg';
      const f = document.createElement('i'); s.appendChild(f); barEl.appendChild(s); segFills.push(f);
    }
  }
  // КАЖДАЯ линия заполняется снизу вверх; фронт заполнения бежит слева-направо по прогрессу
  function paintBar(frac) {
    const n = segFills.length; if (!n) return;
    const f = Math.max(0, Math.min(1, frac));
    for (let i = 0; i < n; i++) {
      const fill = Math.max(0, Math.min(1, f * n - i));
      segFills[i].style.height = (fill * 100).toFixed(1) + '%';
    }
  }
  layoutBar(); paintBar(0);

  // hero-контент (goal/side-nav/designby) проявляется, когда swirl уже растворяется
  let heroShown = false;
  function showHero() { if (heroShown) return; heroShown = true; document.body.classList.remove('pl-loading'); }

  let vw = innerWidth, vh = innerHeight;
  const PR = devicePixelRatio > 1 ? 2 : 1;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: false });
  renderer.setClearColor(0x000000, 0);   // прозрачный клир -> сквозь растворённый лоадер виден сайт
  renderer.setPixelRatio(PR); renderer.setSize(vw, vh);
  wrap.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(vw / -2, vw / 2, vh / 2, vh / -2, -10, 10);
  scene.add(camera);

  const displacement = new THREE.TextureLoader().load('https://qclay.design/lovable/lafys/loader/displacement-3.webp');
  displacement.wrapS = displacement.wrapT = THREE.RepeatWrapping;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }, progress: { value: -0.18 }, texture1: { value: null }, texture2: { value: null },
      displacement: { value: displacement }, resolution: { value: new THREE.Vector4(vw, vh, 1, 1) },
    },
    vertexShader, fragmentShader: fragmentShaderSwirl,
    transparent: true, depthTest: false, depthWrite: false,
  });
  let quad = new THREE.Mesh(new THREE.PlaneGeometry(vw, vh, 1, 1), material);
  scene.add(quad);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(PR); composer.setSize(vw, vh);
  composer.addPass(new RenderPass(scene, camera, null, new THREE.Color(0, 0, 0), 0));   // clearAlpha 0
  const rgbPass = new ShaderPass(RGBShiftShader);
  rgbPass.uniforms.angle.value = 2; rgbPass.uniforms.amount.value = 0.00128;
  composer.addPass(rgbPass);

  // texture1 = сплошной чёрный слой лоадера (бренд/тексты теперь HTML, не в WebGL).
  // swirl растворяет ИМЕННО этот чёрный слой → сквозь прозрачность проступает сайт.
  const cLoad = document.createElement('canvas');
  const tLoad = new THREE.CanvasTexture(cLoad);
  tLoad.minFilter = THREE.LinearFilter;
  // texture2 объявлен в verbatim-шейдере (HEAD), но НЕ сэмплится (TAIL берёт только
  // texture1) — привязываем к той же tLoad, чтобы сэмплер был занят (без WebGL-warning).
  material.uniforms.texture1.value = tLoad; material.uniforms.texture2.value = tLoad;
  function redraw() {
    const w = Math.max(2, Math.floor(vw * PR)), h = Math.max(2, Math.floor(vh * PR));
    cLoad.width = w; cLoad.height = h;
    const x = cLoad.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
    tLoad.needsUpdate = true;
  }
  redraw();

  addEventListener('resize', () => {
    if (killed) return;
    vw = innerWidth; vh = innerHeight;
    camera.left = vw / -2; camera.right = vw / 2; camera.top = vh / 2; camera.bottom = vh / -2; camera.updateProjectionMatrix();
    renderer.setSize(vw, vh); composer.setSize(vw, vh);
    material.uniforms.resolution.value.set(vw, vh, 1, 1);
    quad.geometry.dispose(); quad.geometry = new THREE.PlaneGeometry(vw, vh, 1, 1);
    redraw();
    layoutBar(); paintBar(counterP);
  });

  // ── ДВЕ ФАЗЫ (по просьбе: паттерн НЕ во время загрузки, а ПОСЛЕ) ──
  //   'load'   — тёмный экран (progress держится -0.18, swirl НЕ идёт) + счётчик % от реального прогресса.
  //   'reveal' — когда сайт готов: swirl-паттерн раскрывается (progress -0.18 -> 0.18) как reveal-переход, затем fade к сайту.
  const lerp = (a, b, t) => a + (b - a) * t;
  let counterP = 0, targetP = 0, revealP = 0, phase = 'load', killed = false, doneCb = null, holdT = 0, cbFired = false;
  const clock = new THREE.Clock();
  const REVEAL_DUR = 4.2;   // сек, длительность swirl-раскрытия (медленно/плавно, по просьбе)
  function frame() {
    if (killed) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    material.uniforms.time.value += dt;
    if (phase === 'load') {
      counterP += (Math.min(targetP, 1) - counterP) * Math.min(1, dt * 3.0);   // счётчик тянется к реальному %
      pctEl.textContent = Math.round(counterP * 100) + '%';
      paintBar(counterP);                          // сегментный бар заполняется по прогрессу
      material.uniforms.progress.value = -0.18;   // тёмный: swirl-паттерн НЕ показывается пока грузится
    } else {   // 'reveal' — swirl растворяет лоадер, проступает САМ САЙТ
      pctEl.textContent = '100%'; paintBar(1);
      revealP = Math.min(1, revealP + dt / REVEAL_DUR);
      const e = revealP * revealP * (3 - 2 * revealP);   // smoothstep (ease-in-out) — мягкий старт и финиш
      material.uniforms.progress.value = lerp(-0.18, 0.18, e);   // swirl раскрывается ПОСЛЕ загрузки
      ui.style.opacity = String(Math.max(0, 1 - revealP * 1.6));   // UI лоадера (LFS/%/бар) гаснет
      if (revealP >= 0.5) showHero();   // hero-контент проявляется по мере растворения swirl
      // Раскрыть заголовок КАК ТОЛЬКО секция проступила (середина reveal), а не в
      // самом конце 4.2с — иначе Title появляется через 3-4с после первой секции.
      if (!cbFired && revealP >= 0.4) { cbFired = true; if (doneCb) doneCb(); }
      if (revealP >= 1) {
        holdT += dt;
        if (holdT > 0.12) {   // раскрылось -> сайт уже виден сквозь прозрачность, убираем оверлей
          killed = true; showHero(); try { renderer.dispose(); } catch (e) {} root.remove();
          return;
        }
      }
    }
    composer.render();
    requestAnimationFrame(frame);
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { redraw(); requestAnimationFrame(frame); });

  return {
    setProgress(f) { targetP = Math.max(targetP, Math.max(0, Math.min(1, f))); },
    finish(cb) { doneCb = cb || null; if (phase === 'load') { counterP = 1; phase = 'reveal'; root.style.background = 'transparent'; } },   // сайт готов -> swirl растворяет лоадер -> сайт
  };
}
