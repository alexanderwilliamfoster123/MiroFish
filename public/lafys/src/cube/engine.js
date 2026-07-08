// engine.js — shared runtime singletons ported 1:1 from the lafys bundle.
//  Fe  -> global clock/ticker  (Fe.time seconds, Fe.ratio = dt/(1/60) fps ratio)
//  ie  -> math utility object  (copied VERBATIM from the source bundle)
//  he  -> engine singleton     (he.renderer.webgl, he.camera, he.scene, he.pointer,
//                               he.uniforms.resolution, he.UBO)
import * as THREE from 'three';

// ---- Fe : ticker -----------------------------------------------------------
export const Fe = { time: 0, ratio: 1, delta: 1 / 60 };

// ---- ie : math utils (VERBATIM from bundle line 4217) ----------------------
export const ie = {
  TWO_PI: Math.PI * 2, HALF_PI: Math.PI * 0.5, DEG2RAD: Math.PI / 180, RAD2DEG: 180 / Math.PI,
  degrees(i) { return i * this.RAD2DEG; },
  radians(i) { return i * this.DEG2RAD; },
  clamp(i, e = 0, t = 1) { return Math.max(e, Math.min(t, i)); },
  lerp(i, e, t) { return (1 - t) * i + t * e; },
  mix(i, e, t) { return this.lerp(i, e, t); },
  deltaRatio() { return Fe.ratio; },
  lerpCoefFPS(i) { return this.damp(i, Fe.ratio); },
  lerpFPS(i, e, t) { return this.lerp(i, e, this.lerpCoefFPS(t)); },
  lerpFPSLimited(i, e, t, s = 1 / 0) { const n = this.lerpFPS(i, e, t), r = s * Fe.ratio, a = this.clamp(n - i, -r, r); return i + a; },
  damp(i, e) { return 1 - Math.exp(Math.log(1 - i) * e); },
  frictionFPS(i) { return this.friction(i, Fe.ratio); },
  friction(i, e) { return Math.exp(Math.log(i) * e); },
  efit(i, e, t, s, n) { return s + (i - e) * (n - s) / (t - e); },
  fit(i, e, t, s, n) { return this.efit(this.clamp(i, Math.min(e, t), Math.max(e, t)), e, t, s, n); },
  fit01(i, e, t) { return this.fit(i, 0, 1, e, t); },
  fit10(i, e, t) { return this.fit(i, 1, 0, e, t); },
  fit11(i, e, t) { return this.fit(i, -1, 1, e, t); },
  step(i, e) { return e < i ? 0 : 1; },
  linearstep(i, e, t) { return this.clamp((t - i) / (e - i), 0, 1); },
  smoothstep(i, e, t) { const s = this.linearstep(i, e, t); return s * s * (3 - 2 * s); },
  smootherstep(i, e, t) { const s = this.linearstep(i, e, t); return s * s * s * (s * (s * 6 - 15) + 10); },
  parabola(i, e) { return Math.pow(4 * i * (1 - i), e); },
  ease(i, e = 2) { return i < 0.5 ? Math.pow(2 * i, e) / 2 : 1 - Math.pow(2 * (1 - i), e) / 2; },
};

// ---- he : engine singleton -------------------------------------------------
// UBO: shaders include the `${ae}` chunk which declares (VERBATIM from bundle):
//   uniform Global { vec2 resolution; vec2 resolutionUI; float aspect; float time; float dtRatio; };
// So he.UBO must be a THREE.UniformsGroup named "Global" with those five members
// in that exact order (std140). Materials keep `uniformsGroups:[he.UBO]` unchanged.
const uResolution   = new THREE.Uniform(new THREE.Vector2(1, 1));
const uResolutionUI = new THREE.Uniform(new THREE.Vector2(1, 1));
const uAspect       = new THREE.Uniform(1);
const uTime         = new THREE.Uniform(0);
const uDtRatio      = new THREE.Uniform(1);

const UBO = new THREE.UniformsGroup();
UBO.setName('Global');
UBO.add(uResolution);
UBO.add(uResolutionUI);
UBO.add(uAspect);
UBO.add(uTime);
UBO.add(uDtRatio);

export const he = {
  renderer: { webgl: /** @type {THREE.WebGLRenderer} */ (null) },
  camera: /** @type {THREE.PerspectiveCamera} */ (null),
  scene: /** @type {THREE.Scene} */ (null),
  pointer: new THREE.Vector2(0, 0),   // NDC -1..1
  raycaster: new THREE.Raycaster(),
  uniforms: { resolution: uResolution, resolutionUI: uResolutionUI, aspect: uAspect, time: uTime, dtRatio: uDtRatio },
  UBO,
  setSize(w, h) {
    uResolution.value.set(w, h);
    uResolutionUI.value.set(w, h);
    uAspect.value = w / h;
  },
};

// Advance the ticker; call once per frame with the delta in seconds.
export function tick(dt) {
  Fe.delta = dt;
  Fe.time += dt;
  Fe.ratio = dt / (1 / 60);
  uTime.value = Fe.time;
  uDtRatio.value = Fe.ratio;
}
