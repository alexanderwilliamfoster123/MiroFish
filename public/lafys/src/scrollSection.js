import * as THREE from "three";
import {
  EffectComposer as PostComposer,
  RenderPass as PostRenderPass,
  EffectPass,
  BloomEffect,
  BlendFunction,
  KernelSize,
} from "postprocessing";
import { TransitionEffect } from "./loaderEffect/TransitionEffect.js";
import { scrambleNode } from "./lafysAnim.js";
import { createLearnMoreButton } from "./learnMoreButton.js";
import { createSectionBg } from "./sectionBg.js";

// ─────────────────────────────────────────────────────────────────────────────
// Scroll-driven second section + circle-reveal transition.
//
// Recreates the lafys.com scroll flow inside this single-screen scene:
//   • the page has no native scroll (overflow:hidden) → a virtual scroll driver
//     accumulates a normalized progress p (0..1) from wheel / touch / keys;
//   • as p rises past the hero, the camera eases slightly SIDEWAYS while keeping
//     the crystal figure in frame and DOLLIES IN toward it (cc.origin + cc.lookAt);
//   • during that move the circle-reveal transition fires (the exact lafys
//     Editions hero transition already ported in loaderEffect/): texA = the frozen
//     hero frame, texB = the live dollied frame, blended by an organic glowing
//     circle whose HDR ring the bloom turns into a soft glow;
//   • a placeholder section-2 (heading + copy) fades in over the revealed close-up.
//
// The transition IS the ported TransitionEffect (1:1 shader), driven here by
// scroll instead of a load timer.
// ─────────────────────────────────────────────────────────────────────────────

const START = 0.04; // below this, pure hero (rendered straight to screen)
const PH = 0.23;    // CAMERA dolly split: hero→endOrigin by PH, then →farOrigin (unchanged)
const REVEAL_START = 0.16; // circle-reveal transition begins here (independent of the camera)
const REVEAL_END = 0.55;   // …and is fully open here — a tight range + a small floor so
                           // the circle is VISIBLE right at 16% (not imperceptibly slow)
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;

const STYLE = `
/* ── "scroll down to discover more" hero indicator (lafys-style) ── */
/* scroll-down indicator (в позиции бывшей карточки About Us: низ-справа).
   Линия слева + 2 строки текста (left-aligned), всё по центру относительно линии. */
.scroll-cta {
  position: fixed; right: 3vw; bottom: 44px; z-index: 40;
  display: flex; flex-direction: row; align-items: center; gap: 16px;
  background: none; border: 0; cursor: pointer; padding: 0;
  font-family: 'Roboto Condensed', ui-sans-serif, system-ui, sans-serif;
  font-size: 11px; line-height: 1.35; letter-spacing: .16em; text-transform: uppercase;
  color: rgba(255,255,255,.82); transition: opacity .4s ease;
}
@media (min-width: 1700px) { .scroll-cta { right: 56px; } }
.scroll-cta .scroll-cta__text { display: flex; flex-direction: column; align-items: flex-end; text-align: right; }
.scroll-cta .scroll-cta__line {
  position: relative; width: 1px; height: 40px; overflow: hidden; flex: none;
  background: rgba(255,255,255,.22);
}
.scroll-cta .scroll-cta__line::after {
  content: ""; position: absolute; left: 0; top: 0; width: 100%; height: 40%;
  background: linear-gradient(to bottom, rgba(255,255,255,.95), transparent);
  animation: scroll-cta-run 1.8s cubic-bezier(.7,0,.3,1) infinite;
}
@keyframes scroll-cta-run { 0% { transform: translateY(-100%); } 100% { transform: translateY(250%); } }

/* ── section 2 — центрированный блок: заголовок + описание + 2 CTA ── */
.section2 {
  position: fixed; inset: 0; z-index: 30; opacity: 0; pointer-events: none;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 0 8vw; color: #fff;
  font-family: 'Roboto Condensed', ui-sans-serif, system-ui, sans-serif;
}
.section2 .s2-title {
  font-family: '__helvetica_827732', ui-sans-serif, system-ui, sans-serif; font-weight: 300;
  font-size: clamp(32px, 4.4vw, 60px); line-height: .9; letter-spacing: -.015em;
  max-width: none; margin: 0 0 22px; text-shadow: 0 2px 34px rgba(6,10,24,.6);
}
.section2 .s2-title .line { overflow: hidden; padding: .06em 0 .16em; margin-bottom: -.12em; }
/* адаптивные переносы заголовка: десктоп «Built without / touching the code»,
   мобайл «Built without touching / the code». SplitText замеряет фактические строки
   на момент ревила, скрытый display:none <br> разрыв не создаёт. */
.section2 .s2-title .s2-br-m { display: none; }
.section2 .s2-copy {
  font-size: clamp(15px, 1.4vw, 20px); font-weight: 400; line-height: 1.4;
  color: #B2B2B2; max-width: 42ch; margin: 0 auto 30px; text-wrap: balance;
}
.section2 .s2-actions { display: flex; gap: 14px; justify-content: center; pointer-events: none; flex-wrap: wrap; }

/* ── адаптив секции 2 + scroll-cta ── */
@media (max-width: 640px) {
  .scroll-cta { right: 20px; bottom: 30px; }
  .section2 { padding: 0 22px; }
  /* меньше кегль, чтобы «Built without touching» влезала в 1 строку, а <br> клал «the code» на 2-ю */
  .section2 .s2-title { font-size: clamp(23px, 6.6vw, 32px); max-width: none; margin: 0 0 18px; }
  .section2 .s2-title .s2-br-d { display: none; }    /* мобайл: перенос после «touching», не после «without» */
  .section2 .s2-title .s2-br-m { display: inline; }
  .section2 .s2-copy { font-size: 15px; max-width: 32ch; margin: 0 auto 24px; }
}
`;

const HINT_HTML = `
  <span class="scroll-cta__text"><span>Scroll down</span><span>To discover more</span></span>
  <span class="scroll-cta__line"></span>
`;

const SECTION2_HTML = `
  <h2 class="s2-title">Built without <br class="s2-br-d">touching<br class="s2-br-m"> the code</h2>
  <p class="s2-copy">Everything below took a team and months. Here it took one person.</p>
  <div class="s2-actions">
    <div id="s2-learn"></div>
    <div id="s2-contact"></div>
  </div>
`;

export function initScrollSection({ renderer, rm, stage }) {
  const cc = stage.cameraController;

  // camera poses -------------------------------------------------------------
  const heroOrigin = new THREE.Vector3(0, 0, stage.baseCamZ);          // (0,0,11)
  const heroLookAt = new THREE.Vector3(0, 0, stage.radius);            // (0,0,6)
  const figure = new THREE.Vector3(stage.logoSlot.x, stage.logoSlot.y, stage.logoSlot.z); // (0,.35,6)
  // slightly to the side + dollied in toward the figure — reached at PH (dolly end)
  const endOrigin = new THREE.Vector3(2.0, 0.4, stage.radius + 1.7);
  // the camera KEEPS travelling the same trajectory THROUGH the transition,
  // ending even closer to the figure at scroll = 1 (it never stops at PH).
  const farOrigin = new THREE.Vector3(2.9, 0.58, stage.radius + 0.2);
  const endLookAt = figure.clone();

  // render targets for the two composited frames ----------------------------
  const makeRT = () => {
    const s = renderer.getDrawingBufferSize(new THREE.Vector2());
    const t = new THREE.WebGLRenderTarget(s.x, s.y, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
      stencilBuffer: false,
    });
    // LINEAR targets: rm writes linear-light into them and the postprocessing
    // composer encodes to sRGB ONCE at output. Marking them sRGB double-encodes
    // (composer samples raw sRGB as linear, then re-encodes) → the whole frame
    // washes brighter the instant Phase B's composer kicks in.
    t.texture.colorSpace = THREE.LinearSRGBColorSpace;
    return t;
  };
  const rtA = makeRT(); // frozen first-scene close-up (end of dolly)
  const rtB = makeRT(); // section-2 backdrop surface

  // Section-2 backdrop = «атмосфера lafys без монет»: тёмный фон с мягким светом
  // сверху + виньетка + зерно (sectionBg.js). Рендерится в rtB → circle-reveal 2-й
  // секции раскрывается прямо на это свечение. SECTION2_BG = fallback-заливка.
  const bg = createSectionBg();
  const SECTION2_BG = new THREE.Color("#000000");
  const _clear = new THREE.Color();

  // postprocessing composer running the ported circle-reveal + bloom --------
  const postComposer = new PostComposer(renderer, { frameBufferType: THREE.HalfFloatType });
  postComposer.addPass(new PostRenderPass(new THREE.Scene(), new THREE.PerspectiveCamera()));
  const transition = new TransitionEffect();
  transition.setAspect(innerWidth, innerHeight);
  transition.blendMode.setBlendFunction(BlendFunction.SET);
  const bloom = new BloomEffect({
    intensity: 1.0, mipmapBlur: true, luminanceThreshold: 1, luminanceSmoothing: 0.05,
    radius: 0.85, kernelSize: KernelSize.LARGE, resolutionScale: 0.5,
  });
  postComposer.addPass(new EffectPass(undefined, transition, bloom));
  if (typeof window !== "undefined") window.__bloom = bloom; // debug: window.__bloom.intensity

  // DOM ---------------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = STYLE;
  document.head.appendChild(style);

  const hint = document.createElement("button");
  hint.className = "scroll-cta";
  hint.innerHTML = HINT_HTML;
  document.body.appendChild(hint);


  const section2 = document.createElement("section");
  section2.className = "section2";
  section2.innerHTML = SECTION2_HTML;
  document.body.appendChild(section2);

  // кнопки = pixel-sweep как в первой секции (learnMoreButton.js)
  const btnBase = { radius: 0, paddingX: 24, paddingY: 10, fontFamily: "Roboto Condensed", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", uppercase: true, pixelSize: 5 };
  createLearnMoreButton(section2.querySelector("#s2-learn"), { ...btnBase, label: "learn more", bg: "#FFFFFF", text: "#10122a", border: "#FFFFFF", hoverBg: "#10122a", hoverText: "#FFFFFF" });
  createLearnMoreButton(section2.querySelector("#s2-contact"), { ...btnBase, label: "contact us", bg: "transparent", text: "#FFFFFF", border: "#FFFFFF", hoverBg: "#FFFFFF", hoverText: "#10122a" });
  const s2Actions = section2.querySelector(".s2-actions");

  // reveal: заголовок = SplitText slide-up (как hero первой секции), описание = scramble
  let s2Revealed = false;
  function revealSection2() {
    if (s2Revealed) return; s2Revealed = true;
    const titleEl = section2.querySelector(".s2-title");
    // Адаптивный перенос: SplitText режет по <br> СТРУКТУРНО (display:none не помогает),
    // поэтому убираем неактуальный <br> из DOM ДО сплита. Десктоп: остаётся break после
    // «Built without» → «touching the code» на 2-й строке. Мобайл: break после «touching».
    if (titleEl) titleEl.querySelectorAll(innerWidth <= 640 ? ".s2-br-d" : ".s2-br-m").forEach((br) => br.remove());
    if (window.gsap && window.SplitText && titleEl) {
      const sp = window.SplitText.create(titleEl, { type: "lines,chars", linesClass: "line" });
      window.gsap.from(sp.chars, { yPercent: 110, opacity: 0, duration: 1.2, ease: "power3.inOut", stagger: 0.02 });
    }
    const copy = section2.querySelector(".s2-copy");
    if (copy) scrambleNode(copy, 0.15, 0.5);
  }

  // state -------------------------------------------------------------------
  let enabled = false;
  let targetP = 0;
  let curP = 0;
  let mask = 0;
  const mouse = new THREE.Vector2(0.5, 0.5);

  // virtual scroll input ----------------------------------------------------
  const WHEEL_SENS = 1 / 1400;
  const TOUCH_SENS = 1 / 700;
  const onWheel = (e) => {
    if (!enabled) return;
    e.preventDefault();
    targetP = clamp01(targetP + e.deltaY * WHEEL_SENS);
  };
  let touchY = null;
  const onTouchStart = (e) => { if (enabled) touchY = e.touches[0].clientY; };
  const onTouchMove = (e) => {
    if (!enabled || touchY === null) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    targetP = clamp01(targetP + (touchY - y) * TOUCH_SENS);
    touchY = y;
  };
  const onTouchEnd = () => { touchY = null; };
  const onKey = (e) => {
    if (!enabled) return;
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") targetP = clamp01(targetP + 0.12);
    else if (e.key === "ArrowUp" || e.key === "PageUp") targetP = clamp01(targetP - 0.12);
  };
  const onPointer = (e) => {
    mouse.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
  };
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("keydown", onKey);
  window.addEventListener("pointermove", onPointer);
  hint.addEventListener("click", () => { if (enabled) targetP = 1; });

  // The HERO content (NOT the header) is carved away by the SAME circle as the
  // webgl reveal — a growing radial mask, not an opacity fade. Header (logo + nav
  // + stats) stays untouched and always visible.
  const heroMaskEls = [...document.querySelectorAll(
    ".hero-title, .goal, .designby, .scroll-cta"
  )];
  let heroRects = [];
  const cacheHeroRects = () => { heroRects = heroMaskEls.map((el) => el.getBoundingClientRect()); };
  let maskCleared = false;

  // side-nav как scroll-progress: активный пункт + заливка полосы следуют за скроллом.
  const navEl = document.querySelector(".side-nav");
  const navItems = navEl ? [...navEl.querySelectorAll("a")] : [];
  const updateNav = () => {
    if (!navEl || navItems.length < 2) return;
    // Скролл = переход от 1-й секции (Home) ко 2-й (Our Services) — reveal завершается
    // на REVEAL_END. Заполняется ТОЛЬКО первый сегмент (плавно), к секции 2. Остальные
    // пункты — будущие секции (пока placeholder), не заполняются.
    const p = clamp01(curP / REVEAL_END);
    const reached = curP >= REVEAL_END;
    navItems.forEach((el, i) => {
      el.style.setProperty("--f", (i === 0 ? p * 100 : 0).toFixed(1) + "%");
      el.classList.toggle("active", i === (reached ? 1 : 0));
      el.classList.toggle("passed", i === 0 && reached);
    });
  };

  function resize() {
    const s = renderer.getDrawingBufferSize(new THREE.Vector2());
    rtA.setSize(s.x, s.y);
    rtB.setSize(s.x, s.y);
    postComposer.setSize(innerWidth, innerHeight);
    transition.setAspect(innerWidth, innerHeight);
    bg.setSize(s.x, s.y);
    cacheHeroRects();
  }

  // Called BEFORE stage.update() so the camera is posed from the new targets.
  function preUpdate() {
    curP += (targetP - curP) * 0.08;
    if (curP < 0.0005) curP = 0;

    // Camera dolly runs continuously and NEVER stops at the transition:
    //   [START, PH]  hero → endOrigin (the close-up, reached when the reveal starts)
    //   [PH, 1]      endOrigin → farOrigin (keeps travelling the same trajectory)
    const uDolly = clamp01((curP - START) / (PH - START));
    if (curP < PH) {
      cc.origin.lerpVectors(heroOrigin, endOrigin, easeInOutSine(uDolly));
      cc.lookAt.lerpVectors(heroLookAt, endLookAt, easeInOutSine(uDolly));
    } else {
      const uCont = clamp01((curP - PH) / (1 - PH));
      cc.origin.lerpVectors(endOrigin, farOrigin, easeInOutSine(uCont));
      cc.lookAt.copy(endLookAt);
    }

    // Circle-reveal to section 2 during [REVEAL_START, REVEAL_END] — independent of
    // the camera dolly. A small floor (0.08) makes the circle immediately visible
    // right at REVEAL_START instead of ramping up imperceptibly for the first ~20%.
    const v = clamp01((curP - REVEAL_START) / (REVEAL_END - REVEAL_START));
    mask = v <= 0 ? 0 : Math.min(1, 0.08 + 0.92 * v);

    // Hero content carved by the SAME circle as the webgl reveal (mask, not fade).
    // Centre = viewport centre, radius grows with the reveal progress.
    if (mask <= 0) {
      if (!maskCleared) {
        for (const el of heroMaskEls) { el.style.webkitMaskImage = "none"; el.style.maskImage = "none"; }
        maskCleared = true;
      }
    } else {
      maskCleared = false;
      const w = innerWidth, h = innerHeight;
      const cx = w / 2, cy = h / 2;
      const Rmax = Math.hypot(w / 2, h / 2) * 1.12;
      const r = clamp01(mask * 1.12) * Rmax;
      const inner = Math.max(0, r - 120); // soft feather ring matching the reveal edge
      for (let i = 0; i < heroMaskEls.length; i++) {
        const rc = heroRects[i]; if (!rc) continue;
        const m = `radial-gradient(circle at ${(cx - rc.left).toFixed(1)}px ${(cy - rc.top).toFixed(1)}px, transparent ${inner.toFixed(1)}px, #000 ${r.toFixed(1)}px)`;
        heroMaskEls[i].style.webkitMaskImage = m;
        heroMaskEls[i].style.maskImage = m;
      }
    }
    hint.style.pointerEvents = curP > 0.12 ? "none" : "auto";   // opacity больше не гасим — уходит маской (в heroMaskEls)
    // раньше проступает — секция видна ПОКА круг ещё раскрывается («сквозь эффект»),
    // а не появляется чёрным пятном после.
    const s2 = smoothstep(0.3, 0.72, v);
    section2.style.opacity = String(s2);
    // секция pointer-events:none (клики проходят к хедеру/nav); кнопки активны только когда открыта
    s2Actions.style.pointerEvents = s2 > 0.9 ? "auto" : "none";
    if (s2 > 0.02) revealSection2();
    else if (s2 <= 0.001) s2Revealed = false;
    updateNav();   // активный пункт + заливка полосы по скроллу
  }

  // Called AFTER cube.beforeRender(). Returns true if it drew to screen (so the
  // main loop should NOT also call rm.update()).
  function render(time, dt, dpr) {
    // Before the reveal starts: render the LIVE scene straight to screen (no
    // postprocessing composer → no global brightening). The camera dollies here.
    if (curP < REVEAL_START) {
      rm.update(time, dt, dpr);
      return true;
    }

    // Phase B — render the LIVE scene into rtA every frame so the camera keeps
    // visibly moving through the un-revealed part of the frame (no freeze).
    rm.update(time, dt, dpr, rtA);
    // …and render the section-2 backdrop (lafys coin field) into rtB, preserving
    // renderer state. rtB хранит sRGB-encoded пиксели (как rtA от rm) → композитор
    // передаёт их без повторного sRGB-кодирования, поэтому монеты рендерим в sRGB-выходе.
    renderer.getClearColor(_clear);
    const _a = renderer.getClearAlpha();
    const _cs0 = renderer.outputColorSpace;
    renderer.setRenderTarget(rtB);
    renderer.setClearColor(SECTION2_BG, 1);
    renderer.clear(true, true, false);
    bg.update(dt);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.render(bg.scene, bg.camera);
    renderer.outputColorSpace = _cs0;
    renderer.setClearColor(_clear, _a);
    renderer.setRenderTarget(null);

    transition.setInputs(rtA.texture, rtB.texture, mask);
    transition.setMouse(mouse.x, mouse.y);

    // Render the composer with the renderer's output kept LINEAR so it doesn't
    // re-encode the already-sRGB frames rm wrote into rtA/rtB (that double-encode
    // is what brightens the whole scene the moment the composer takes over).
    const _cs = renderer.outputColorSpace;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    postComposer.render(dt);
    renderer.outputColorSpace = _cs;
    return true;
  }

  window.addEventListener("resize", resize);

  return {
    preUpdate,
    render,
    enable() { enabled = true; cacheHeroRects(); },
    disable() { enabled = false; },
    resize,
    get progress() { return curP; },
    set progress(v) { targetP = clamp01(v); },
  };
}
