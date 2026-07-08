import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// Фон 2-й секции = «атмосфера lafys без монет»: тёмный фон с мягким КРАСИВЫМ
// СВЕТОМ СВЕРХУ + виньетка + тонкое плёночное зерно. Монет нет.
//
// Свет сверху повторяет освещение их home-scene: 2 верхних источника (в glb —
// PointLight ≈(±7, 12, ~7)) дают два мягких световых пула у верхней кромки, которые
// сливаются в общее свечение. Палитра из их сцены: fog #0B0B0B, свет прохладно-белый
// (point white, hemi-sky #D9DDE2), ACES-тон. RGBShift/grain у них 0.001 — тут = зерно.
//
// Рендерится фуллскрин-квадом в rtB → circle-reveal 2-й секции раскрывается прямо на
// это свечение (через наш render-pipeline, без iframe и без отдельного канваса).
// ─────────────────────────────────────────────────────────────────────────────

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec3  uBase;      // тёмная база
uniform vec3  uLight;     // цвет света сверху
uniform float uGlow;      // общая сила свечения
uniform float uSpread;    // «мягкость» световых пулов (больше = шире/мягче)
uniform float uGrain;     // сила зерна
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);

  // два мягких световых пула у верхней кромки (эхо 2 верхних источников lafys),
  // сливающихся в общее свечение сверху
  vec2 a = vec2(-0.17, 1.02);
  vec2 b = vec2( 0.17, 1.02);
  float d1 = distance(p, a);
  float d2 = distance(p, b);
  float pools = exp(-d1*d1 / uSpread) + exp(-d2*d2 / uSpread);
  // широкая полоса света у самого верха + лёгкое «дыхание»
  float band = exp(-pow(1.0 - uv.y, 2.0) / 0.12) * (0.55 + 0.05 * sin(uTime * 0.4));
  float glow = clamp((pools + band) * uGlow, 0.0, 1.6);

  vec3 col = uBase + uLight * glow;

  // виньетка: центр свечения смещён вверх, низ/углы гаснут в темноту
  float vig = smoothstep(1.30, 0.18, length(vec2((uv.x - 0.5) * 1.15, uv.y - 0.62)));
  col *= mix(0.42, 1.0, vig);

  // тонкое плёночное зерно (анимированное)
  float g = hash(uv * uRes * 0.5 + fract(uTime) * 137.0);
  col += (g - 0.5) * uGrain;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

const VERT = `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export function createSectionBg() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uRes:    { value: new THREE.Vector2(1, 1) },
    uTime:   { value: 0 },
    uBase:   { value: new THREE.Color(0x060709) }, // почти чёрный (чуть холодный)
    uLight:  { value: new THREE.Color(0x9fb0c8) }, // прохладно-белый свет сверху
    uGlow:   { value: 0.62 },
    uSpread: { value: 0.24 },
    uGrain:  { value: 0.03 },
  };

  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false })
  );
  quad.frustumCulled = false;
  scene.add(quad);

  let t = 0;
  return {
    scene, camera,
    isReady: () => true,
    update(dt) { t += dt; uniforms.uTime.value = t; },
    setSize(w, h) { uniforms.uRes.value.set(w, h); },
    uniforms, // для тюнинга из панели/консоли
  };
}
