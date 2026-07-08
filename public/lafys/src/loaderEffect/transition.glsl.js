// Фрагментный шейдер перехода в формате эффекта pmndrs `postprocessing`
// (функция mainImage). Полный порт hero-перехода lafys Editions.
// Держим как JS-строку, чтобы не зависеть от загрузчиков шейдеров конкретного бандлера.
export const transitionFragmentShader = /* glsl */ `
uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform sampler2D tMudNormal;  // органическая mud_normal-текстура
uniform sampler2D tNoise;      // 256² тайлящийся Perlin-fbm (см. noiseTexture.js)
uniform float uProgress;
uniform float uAspect;
uniform float uTime;
uniform vec2 uMouse;    // курсор в uv (0..1)
uniform vec2 uCenter;   // центр раскрытия

// шум из предрасчитанной текстуры, нормализован в [-1, 1]
float sampleNoise(vec2 uv) {
  return texture(tNoise, uv).r * 2.0 - 1.0;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float progress = smoothstep(0.0, 1.0, uProgress);
  vec2 sceneCenter = uCenter;

  // Лёгкий зум: A отъезжает, B наезжает.
  vec2 currentUV = (uv - sceneCenter) * (1.0 - smoothstep(0.2, 1.0, uProgress) * 0.1) + sceneCenter;
  vec2 nextUV    = (uv - sceneCenter) * (1.0 + smoothstep(0.8, 0.0, uProgress) * 0.1) + sceneCenter;

  vec4 current = texture(tCurrent, currentUV);
  vec4 next    = texture(tNext, nextUV);

  // Edge detection (fwidth по яркости): сцены -> светящиеся контуры
  vec3 currentEdges = vec3(0.0);
  vec3 nextEdges = vec3(0.0);
  if (uProgress > 0.01 && uProgress < 0.99) {
    float currentLuma = dot(current.rgb, vec3(0.299, 0.587, 0.114));
    currentEdges = vec3(fwidth(currentLuma) * mix(1.0, 2.5, progress));
    float nextLuma = dot(next.rgb, vec3(0.299, 0.587, 0.114));
    nextEdges = vec3(fwidth(nextLuma) * mix(5.0, 10.0, 1.0 - progress));
  }

  // Mud-нормаль — органическая вариация фронта (усилено: рваный край вместо ровного круга)
  vec3 mudNormal = texture(tMudNormal, uv * 2.0).rgb;
  float mudStrength = mix(0.10, 0.20, 0.5 + 0.5 * sin(uTime - uv.x * 10.0));
  float mudOffset = (mudNormal.r - 0.5) * mudStrength;

  // Ползущий во времени шум
  vec2 aspectUv = vec2(uv.x * uAspect, uv.y) + vec2(0.0, uTime * 0.02);
  float currentNoise = sampleNoise(aspectUv * 0.25 - uTime * 0.07 * 0.125);

  // Центр маски слегка тянется за курсором
  vec2 maskCenter = mix(sceneCenter, uMouse, 0.15);

  // Порог: круг из центра (aspect-correct)
  float dist = length((uv - maskCenter) * vec2(uAspect, 1.0)) * 0.8;
  float threshold = mix(dist, uv.x,
    smoothstep(0.6, -0.4, abs(uv.x - sceneCenter.x)) * mix(0.0, 0.4, smoothstep(0.05, 0.5, progress)));
  threshold = mix(threshold, 0.0, smoothstep(0.9, 1.0, uProgress));
  threshold = threshold * 2.0 - 1.0;
  // bigger noise weight → large irregular lobes so the reveal front isn't a clean circle
  threshold = threshold / 1.2 + currentNoise * 0.16 + mudOffset;
  threshold = threshold * 0.5 + 0.5;

  float edge = progress - threshold;
  float aa = fwidth(edge) * 18.0;
  float blendFactor = smoothstep(-aa, aa, edge);

  // Контуры: уходящая сцена -> свои края, приходящая -> из краёв.
  // ADAPTED: the incoming "scene" here is transparency to the live host page
  // (not a second rendered scene), so keep next's own alpha instead of forcing
  // 1.0 — otherwise the empty next edge-detects to OPAQUE BLACK at low progress
  // and the reveal shows black before it clears. Preserving alpha lets the real
  // hero behind the canvas show through the circle from the very start.
  current = mix(current, vec4(currentEdges, 1.0), smoothstep(0.0, 0.5, progress));
  next    = mix(next, vec4(nextEdges, next.a), smoothstep(0.2, 0.8, 1.0 - progress));

  outputColor = mix(current, next, blendFactor);

  // Glow: разгон кромки в HDR, bloom подхватит
  float glowStrength = mix(12.0, 6.0, smoothstep(0.05, 0.25, progress));
  float glowThreshold = glowStrength * 0.001;
  float glowFactor = smoothstep(0.0, glowThreshold, abs(edge));
  float glowMult = mix(glowStrength * 0.5, glowStrength,
                       0.5 + 0.5 * currentNoise * sin(uTime + uv.x * 10.0));
  outputColor = mix(outputColor, outputColor * glowMult, 1.0 - glowFactor);
}
`;
