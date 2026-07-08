// ───────────────────────────────────────────────────────────────────────────
// Post-processing GLSL ported 1:1 from lafys.com (bundle.js).
// RawShaderMaterial + GLSL3. three resolves `#include <...>` even for raw
// materials, so the composite's tonemapping includes are kept verbatim.
// ───────────────────────────────────────────────────────────────────────────
import { blendModes } from "./blendModes.glsl.js";

// ── helper functions (Ur, Ro, Za, Fr, Ja, Qa) ──────────────────────────────
export const glSaturation = /* glsl */ `
vec3 saturation(vec3 rgb, float adjustment) {
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return mix(intensity, rgb, adjustment);
}
`;

export const glVignette = /* glsl */ `
float vignette(vec2 coords, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, vec2(0.5, 0.5));
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}
`;

export const glCircle = /* glsl */ `
vec3 circle(vec2 uv, vec2 center, vec3 color, float size) {
  float circle = length(uv - center);
  circle = 1. - smoothstep(0.0, size, circle);
  return color * circle;
}
`;

export const glContrast = /* glsl */ `
vec3 contrast(vec3 color, float value) {
  return 0.5 + value * (color - 0.5);
}
`;

export const glHue = /* glsl */ `
vec3 hue(vec3 color, float hue) {
  const vec3 k = vec3(0.57735, 0.57735, 0.57735);
  float cosAngle = cos(hue);
  return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}
`;

export const glRgbShift = /* glsl */ `
vec4 rgbshift(sampler2D image, vec2 uv, float angle, float amount) {
    vec2 offset = vec2(cos(angle), sin(angle)) * amount;
    vec4 r = texture(image, uv + offset);
    vec4 g = texture(image, uv);
    vec4 b = texture(image, uv - offset);
    return vec4(r.r, g.g, b.b, g.a);
}
`;

// random + dither (tA + lg) used by the bloom-combine pass
export const glRandom = /* glsl */ `
float random(vec2 co) {
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt = dot(co.xy, vec2(a, b));
    float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}
`;

export const glDither = /* glsl */ `
${glRandom}

vec3 dither(vec3 color) {
    float grid_position = random(gl_FragCoord.xy);
    vec3 dither_shift_RGB = vec3(0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0);
    dither_shift_RGB = mix(2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position);
    return color + dither_shift_RGB;
}
`;

// ── FXAA (FT vertex / UT fragment) ──────────────────────────────────────────
export const fxaaVert = /* glsl */ `
precision mediump float;
in vec3 position;
in vec2 uv;
uniform vec2 uResolution;
out vec2 v_rgbNW;
out vec2 v_rgbNE;
out vec2 v_rgbSW;
out vec2 v_rgbSE;
out vec2 v_rgbM;
out vec2 vUv;
void main() {
    vUv = uv;
    vec2 fragCoord = uv * uResolution;
    vec2 inverseVP = 1.0 / uResolution.xy;
    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
    v_rgbM = vec2(fragCoord * inverseVP);
    gl_Position = vec4(position, 1.0);
}
`;

export const fxaaFrag = /* glsl */ `
precision mediump float;
uniform sampler2D tMap;
uniform vec2 uResolution;
in vec2 v_rgbNW;
in vec2 v_rgbNE;
in vec2 v_rgbSW;
in vec2 v_rgbSE;
in vec2 v_rgbM;
in vec2 vUv;
out vec4 FragColor;
#ifndef FXAA_REDUCE_MIN
    #define FXAA_REDUCE_MIN   (1.0/ 128.0)
#endif
#ifndef FXAA_REDUCE_MUL
    #define FXAA_REDUCE_MUL   (1.0 / 8.0)
#endif
#ifndef FXAA_SPAN_MAX
    #define FXAA_SPAN_MAX     8.0
#endif
vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,
            vec2 v_rgbNW, vec2 v_rgbNE,
            vec2 v_rgbSW, vec2 v_rgbSE,
            vec2 v_rgbM) {
    vec4 color;
    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
    vec3 rgbNW = texture(tex, v_rgbNW).xyz;
    vec3 rgbNE = texture(tex, v_rgbNE).xyz;
    vec3 rgbSW = texture(tex, v_rgbSW).xyz;
    vec3 rgbSE = texture(tex, v_rgbSE).xyz;
    vec4 texColor = texture(tex, v_rgbM);
    vec3 rgbM  = texColor.xyz;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
    mediump vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
              dir * rcpDirMin)) * inverseVP;
    vec3 rgbA = 0.5 * (
        texture(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
        texture(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture(tex, fragCoord * inverseVP + dir * -0.5).xyz +
        texture(tex, fragCoord * inverseVP + dir * 0.5).xyz);
    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
        color = vec4(rgbA, texColor.a);
    } else {
        color = vec4(rgbB, texColor.a);
    }
    return color;
}
void main() {
    FragColor = fxaa(tMap, vUv * uResolution, uResolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
}
`;

// ── plain fullscreen vertex (OT / BT / HT / iA share this form) ─────────────
export const screenVert = /* glsl */ `
in vec3 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

// ── luminosity threshold (NT) ───────────────────────────────────────────────
export const luminosityFrag = /* glsl */ `
precision mediump float;
uniform sampler2D tMap;
uniform float uThreshold;
uniform float uSmoothing;
in vec2 vUv;
out vec4 FragColor;
void main() {
    vec4 texel = texture(tMap, vUv);
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float v = dot(texel.xyz, luma);
    float alpha = smoothstep(uThreshold, uThreshold + uSmoothing, v);
    FragColor = mix(vec4(0), texel, alpha);
}
`;

// ── bloom mip blur (kT) — separable gaussian, KERNEL_RADIUS/SIGMA via defines
export const bloomBlurFrag = /* glsl */ `
precision mediump float;
uniform sampler2D tMap;
uniform vec2 uDirection;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 FragColor;
float gaussianPdf(float x, float sigma) {
    return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}
vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
    vec2 invSize = 1.0 / resolution;
    float fSigma = float(SIGMA);
    float weightSum = gaussianPdf(0.0, fSigma);
    vec3 diffuseSum = texture(image, uv).rgb * weightSum;
    for (int i = 1; i < KERNEL_RADIUS; i++) {
        float x = float(i);
        float w = gaussianPdf(x, fSigma);
        vec2 uvOffset = direction * invSize * x;
        vec3 sample1 = texture(image, uv + uvOffset).rgb;
        vec3 sample2 = texture(image, uv - uvOffset).rgb;
        diffuseSum += (sample1 + sample2) * w;
        weightSum += 2.0 * w;
    }
    return vec4(diffuseSum / weightSum, 1.0);
}
void main() {
    FragColor = blur(tMap, vUv, uResolution, uDirection);
}
`;

// ── bloom combine (nA) — weighted sum of 5 mips + dither ────────────────────
export const bloomCombineFrag = /* glsl */ `
precision mediump float;

${glDither}

uniform sampler2D tBlur1;
uniform sampler2D tBlur2;
uniform sampler2D tBlur3;
uniform sampler2D tBlur4;
uniform sampler2D tBlur5;
uniform float uBloomFactors[NUM_MIPS];
in vec2 vUv;
out vec4 FragColor;
void main() {
  FragColor = uBloomFactors[0] * texture(tBlur1, vUv) +
    uBloomFactors[1] * texture(tBlur2, vUv) +
    uBloomFactors[2] * texture(tBlur3, vUv) +
    uBloomFactors[3] * texture(tBlur4, vUv) +
    uBloomFactors[4] * texture(tBlur5, vUv);
    #ifdef DITHERING
  FragColor.rgb = dither(FragColor.rgb);
    #endif
}
`;

// ── general gaussian 9-tap blur (zT) — used by the optional blur pass ────────
export const gaussBlurFrag = /* glsl */ `
precision highp float;

vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 sum = vec4(0.0);
  vec2 pixel = 1.0 / resolution;
  sum += texture(image, uv - 4.0 * pixel * direction) * 0.051;
  sum += texture(image, uv - 3.0 * pixel * direction) * 0.0918;
  sum += texture(image, uv - 2.0 * pixel * direction) * 0.12245;
  sum += texture(image, uv - 1.0 * pixel * direction) * 0.1531;
  sum += texture(image, uv) * 0.1633;
  sum += texture(image, uv + 1.0 * pixel * direction) * 0.1531;
  sum += texture(image, uv + 2.0 * pixel * direction) * 0.12245;
  sum += texture(image, uv + 3.0 * pixel * direction) * 0.0918;
  sum += texture(image, uv + 4.0 * pixel * direction) * 0.051;
  return sum;
}

uniform sampler2D tMap;
uniform float uBluriness;
uniform vec2 uDirection;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 FragColor;

void main() {
  FragColor = blur(tMap, vUv, uResolution, uBluriness * uDirection);
}
`;

// ── composite vertex (el) ───────────────────────────────────────────────────
export const compositeVert = /* glsl */ `
in vec3 position;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
out vec2 vUv;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`;

// ── composite fragment (CA) — chromatic aberration + bloom + fluid distortion
//    + darken (blend modes) + saturation + tonemapping. Verbatim.
export const compositeFrag = /* glsl */ `
precision highp float;

#include <tonemapping_pars_fragment>

${glSaturation}
${glVignette}
${glCircle}
${glContrast}
${glHue}
${glRgbShift}
${blendModes}


float luminance(vec3 rgb) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return dot(rgb, W);
}

uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tFluid;
uniform sampler2D tBlur;
uniform sampler2D tMouseSim;

uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

uniform float uDarken;
uniform float uSaturation;

float vignout = .55; // vignetting outer border
float vignin = 0.1; // vignetting inner border
float vignfade = 2.0; // f-stops till vignete fades

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec4 fluid = texture(tFluid, vUv);
  vec4 mouseSim = texture(tMouseSim, vUv);
  vec2 uv = vUv;
  vec4 mixed = rgbshift(tScene, uv, -1., .0015);

  if(boolBloom) {
    vec4 bloom = rgbshift(tBloom, uv, -1.5, .02);
    float angle = length(uv + 0.5);
    float uBloomDistortion = 2.5;
    float amount = .001 * uBloomDistortion;

    mixed.rgb += bloom.rgb;
    mixed.rgb += rgbshift(tBloom, uv, angle, amount / .5).rgb;
  }


  mixed.rgb += length(fluid.xy) * .015;

  float vignetteF = vignette(uv.xy, vignin, vignout, vignfade, .75);

  // mixed.rgb *= vignetteF;

  vec3 green = vec3(0.063,0.141,0.086);
  vec3 greenLight = vec3(0.337,1.,0.561);
  vec3 black = vec3(0.095,0.095,0.095);

  // mixed.rgb = blend(5, mixed.rgb, greenLight, .5);
  mixed.rgb = blend(15, mixed.rgb, black, uDarken * 2. + mouseSim.r * .25 * uDarken);
  mixed.rgb = blend(11, mixed.rgb, black, 1.);

  mixed.rgb = saturation(mixed.rgb, uSaturation);

  FragColor = vec4(mixed.rgb, 1.);

  #include <tonemapping_fragment>
}
`;

// ── FINAL "lens" composite — ported from bundle.js mainScene composite. Applied
//    on top of the scene composite (tWork): sharp centre, chromatically smeared
//    /soft edges (mix of a sharp and a displaced rgbshift by a vignette), perlin
//    UV displacement, edge brightening, film grain and contrast. This is the
//    layer that gives the original its soft, grainy edges. Verbatim trim
//    (media / lensflare / mouse-sim layers dropped — not in this scene's scope).
export const finalCompositeFrag = /* glsl */ `
precision highp float;

${glVignette}
${glRgbShift}
${glContrast}
${glSaturation}
${blendModes}

uniform sampler2D tWork;
uniform sampler2D tFluid;
uniform sampler2D tPerlin;
uniform sampler2D tNoise;

uniform float uRatio;
uniform float uTime;
uniform float uContrast;
uniform float uFluidStrength;
uniform float uChromaPulse;   // пульс ТОЛЬКО хроматики (RGB-split) на смене темы — БЕЗ geo-warp
uniform float uPerlin;
uniform vec3 uBgColor;

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec2 perlinUv = vUv * .25;
  perlinUv.xy -= 0.5;
  perlinUv.x *= uRatio;
  perlinUv.xy += 0.5;
  perlinUv.x -= uTime * .01;
  perlinUv.y -= uTime * .005;
  vec4 perlin = texture(tPerlin, perlinUv);
  perlin.rgb = contrast(perlin.rgb, 5.);

  vec4 fluid = texture(tFluid, vUv);
  vec2 uv = vUv + fluid.rg * -.2 * uFluidStrength;

  vec2 perlinCoords = vUv;
  if (uPerlin > 0.0) {
    perlinCoords += perlin.b * uPerlin;
    perlinCoords -= uPerlin * .065;
  }

  float perlinVignette = vignette(perlinCoords.xy, 0.1, .35, 2.0, .5);
  float displacementVignette = vignette(uv.xy, 0.1, .5, 2.0, .5);

  vec4 sceneDisplaced = rgbshift(tWork, uv, -1., .005 + uChromaPulse);
  vec4 scene = rgbshift(tWork, uv, -1., .0005 + .1 * length(fluid.xy) * uFluidStrength + uChromaPulse);

  vec3 mixed = mix(scene.rgb, sceneDisplaced.rgb, (1. - displacementVignette) * 1.);

  mixed.rgb = mix(mixed.rgb, mixed.rgb * 5., (1. - perlinVignette) * .075);
  mixed.rgb = blend(1, mixed.rgb, perlin.rgb, (1. - displacementVignette) * .05);

  vec2 noiseUv = vUv;
  noiseUv.xy -= 0.5;
  noiseUv.x *= uRatio;
  noiseUv.xy += 0.5;
  noiseUv.xy *= 15.;
  vec4 noise = texture(tNoise, noiseUv);

  mixed.rgb = contrast(mixed.rgb, uContrast);
  mixed.rgb *= uContrast;
  mixed.rgb = saturation(mixed.rgb, 1.15);
  mixed.rgb = blend(11, mixed.rgb, uBgColor.rgb, .85);

  mixed.rgb = mix(mixed.rgb * noise.rgb, mixed.rgb, .75);
  mixed.rgb = mix(mixed.rgb * noise.rgb, mixed.rgb, 1.5);

  FragColor = vec4(mixed.rgb, 1.);
}
`;
