// ─────────────────────────────────────────────────────────────────────────────
// Environment / sky / floor GLSL — ported 1:1 from bundle.js.
//   skyFrag(B1)   procedural fbm "marble" sky  -> rendered to tSky
//   wavesFrag(F1) radial wave field            -> block tDisplacement
//   envFrag(l1)/envVert(c1)  dome MeshStandardMaterial sampling tSky + bands
//   floorFrag(s1)/floorVert(r1)  reflective floor (projected reflection + normal distortion)
// Helper consts keep their original bundle names (xg/gg/vg/_g/dg/ug/pg) so the
// shaders' ${...} interpolations resolve exactly as in the source.
// ─────────────────────────────────────────────────────────────────────────────
import { blendModes } from "../post/blendModes.glsl.js";
import { glVignette, glContrast, glDither } from "../post/shaders.js";

const Ro = glVignette, Fr = glContrast, Po = blendModes, lg = glDither;

const xg = `
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+10.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const gg = `
float randomF(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float customRoughness(float roughness, vec2 vUv, float size, float time) {
  float roughnessFactor = roughness;
  // Triangular tiling
  vec2 triangle = vec2(mod(vUv.x * size, 1.0), mod(vUv.y * size, 1.0));

    // Generate random shades of grey based on the cell position
  vec2 cell = floor(vUv * size);
  float shade = randomF(cell) * 0.8 + 0.1; // Shades between 0.25 and 0.75
  vec4 roughnessColor = vec4(1.);

    // Create the triangle pattern
  if(triangle.y > triangle.x) {
    roughnessColor = vec4(vec3(shade), 1.0);
  } else {
    roughnessColor = vec4(vec3(1.0 - shade), 1.0);
  }

   roughnessFactor *= roughnessColor.g;

  return roughnessFactor;
}
`;

const vg = `
float noiseShaderRandom(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);

  float res = mix(mix(noiseShaderRandom(ip), noiseShaderRandom(ip + vec2(1.0, 0.0)), u.x), mix(noiseShaderRandom(ip + vec2(0.0, 1.0)), noiseShaderRandom(ip + vec2(1.0, 1.0)), u.x), u.y);
  return res * res;
}

const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p, float time, float speed) {
  float f = 0.0;

  f += 0.500000 * noise(p - time * speed);
  p = mtx * p * 2.02;
  f += 0.031250 * noise(p);
  p = mtx * p * 2.01;
  f += 0.250000 * noise(p);
  p = mtx * p * 2.03;
  f += 0.125000 * noise(p);
  p = mtx * p * 2.01;
  f += 0.062500 * noise(p - time * (speed * 5.));
  p = mtx * p * 2.04;
  f += 0.015625 * noise(p + time * (speed * 5.));

  return f / 0.96875;
}

float pattern(vec2 p, float time, float speed) {
  float f1 = fbm(p, time, speed);
  float f2 = fbm(p + f1, time, speed);

  return fbm(p + f2, time, speed);
}
vec4 noiseShader(vec2 uv, float time, float speed) {
  float shade = pattern(uv, time, speed);
  return vec4(vec3(shade), shade);
}
`;

const _g = `

vec4 oil(vec2 uv, float time, float strength) {
    float t = time;
    vec3 col = vec3(0.0);
    vec2 pos = uv;
    float noisePos = snoise(uv * 1.15) * .005;

    for (float k = 1.0; k < 5.0; k += 1.) {
        pos.x += strength * sin(2.0 * t + k * 1.5 * pos.y + noisePos * 10.);
        pos.y += strength * cos(2.0 * t + k * 1.5 * pos.x - noisePos);
    }

    col += clamp(-0.0 + 0.5 * cos(t * 0.5 + pos.xyx * 3.0).xxx, -0.1, 0.99);
    return vec4(col, 1.0);
}
`;

const dg = `
float blendReflect(float base, float blend) {
	return (blend==1.0)?blend:min(base*base/(1.0-blend),1.0);
}

vec3 blendReflect(vec3 base, vec3 blend) {
	return vec3(blendReflect(base.r,blend.r),blendReflect(base.g,blend.g),blendReflect(base.b,blend.b));
}

vec3 blendReflect(vec3 base, vec3 blend, float opacity) {
	return (blendReflect(base, blend) * opacity + base * (1.0 - opacity));
}
`;

const ug = `
vec3 blendNegation(vec3 base, vec3 blend) {
	return vec3(1.0)-abs(vec3(1.0)-base-blend);
}

vec3 blendNegation(vec3 base, vec3 blend, float opacity) {
	return (blendNegation(base, blend) * opacity + base * (1.0 - opacity));
}
`;

const pg = `
float blendColorBurn(float base, float blend) {
	return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
}

vec3 blendColorBurn(vec3 base, vec3 blend) {
	return vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));
}

vec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {
	return (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));
}
`;

export const envFrag = `
${xg}
${gg}
${vg}
${Po}
${_g}

uniform float uMultiplier;
uniform float uShader1Speed;
uniform float uShader1Alpha;
uniform float uShader1Scale;

uniform float uShader2Alpha;
uniform float uShader2Scale;

uniform float uShader3Speed;
uniform float uShader3Alpha;
uniform float uShader3Scale;

uniform float uShader1Mix2;
uniform float uShader1Mix3;

uniform vec3 uDarkenColor;
uniform float uDarken;

uniform sampler2D tSky;

uniform float uTime;
varying vec2 vUv;

#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
uniform float ior;
#endif
#ifdef SPECULAR
uniform float specularIntensity;
uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
uniform float clearcoat;
uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
uniform float iridescence;
uniform float iridescenceIOR;
uniform float iridescenceThicknessMinimum;
uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
uniform vec3 sheenColor;
uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
// #include <color_pars_fragment>
#include <uv_pars_fragment>
// #include <map_pars_fragment>
// #include <alphamap_pars_fragment>
// #include <alphatest_pars_fragment>
// #include <aomap_pars_fragment>
// #include <lightmap_pars_fragment>
// #include <emissivemap_pars_fragment>
#include <bsdfs>
// #include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
// #include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
// #include <bumpmap_pars_fragment>
// #include <normalmap_pars_fragment>
// #include <clearcoat_pars_fragment>
// #include <iridescence_pars_fragment>
// #include <roughnessmap_pars_fragment>
// #include <metalnessmap_pars_fragment>
// #include <logdepthbuf_pars_fragment>
// #include <clipping_planes_pars_fragment>

float smoothMask(float coord, float center, float spread) {
  return (1. - smoothstep(coord,  center, center - spread)) + (1. - smoothstep(coord,  center, center + spread));
}

void main() {
	// #include <clipping_planes_fragment>
  vec4 diffuseColor = vec4(diffuse, opacity);
  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
  vec3 totalEmissiveRadiance = emissive;

	// #include <logdepthbuf_fragment>
	// #include <map_fragment>
	// #include <color_fragment>

  vec2 skyUv = vUv;
  vec2 skyUv2 = vUv;


  skyUv.x += .5;
  skyUv2.x -= .75;

  vec4 noise = texture(tSky, (skyUv * 2.));
  vec4 noise2 = texture(tSky, (skyUv2 * 1.));

  vec3 maskColor = vec3(1.0, 1.0, 1.0);

  float m = 0.0;

  m = max(m, 1. - smoothstep(vUv.x, 0.00, 0.015));
  m = max(m, 1. - smoothstep(vUv.x, 1.015, 0.985));
  m = max(m, smoothMask(vUv.x, .5, 0.01));
  m = m * 1. - smoothMask(vUv.x, .75, 0.02);
  m = clamp(m, 0.0, 1.0);

  vec4 noiseMixed = mix(noise, noise2, m);

  diffuseColor.rgb = blend(4, diffuseColor.rgb, noiseMixed.rgb, 0.5);

  vec2 skyMaskUv = vUv;

  skyMaskUv.y -= .1;

  float skyMask = mod((skyMaskUv.y) * 5., 1.);
  skyMask = max(skyMask, step(0.6, skyMaskUv.y));

  diffuseColor.rgb = blend(16, diffuseColor.rgb, noiseMixed.rgb , skyMask);
  diffuseColor.rgb += vec3(smoothstep(vUv.y, .45, .595));

  float skyMask2 = mod((skyMaskUv.y) * 2.5, 1.);
  skyMask2 = max(skyMask, step(0.6, skyMaskUv.y));

  diffuseColor.rgb = mix(vec3(1.0, 1.0, 1.0), diffuseColor.rgb, skyMask2 * 1.5);
  diffuseColor.rgb *= 1.15;
  diffuseColor.rgb *= clamp(diffuseColor.rgb, vec3(0.0), vec3(1.0));

	// #include <alphamap_fragment>
	// #include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	// #include <clearcoat_normal_fragment_begin>
	// #include <clearcoat_normal_fragment_maps>
	// #include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	// #include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	// #include <transmission_fragment>
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;

  vec3 black = vec3(0.095, 0.095, 0.095);

	#include <opaque_fragment>

  gl_FragColor.rgb = blend(4, gl_FragColor.rgb, uDarkenColor, uDarken);
  // gl_FragColor.rgb = 1. - noiseMixed.rgb;
  // gl_FragColor.rgb = vec3(mask4);



	// #include <tonemapping_fragment>
	// #include <colorspace_fragment>
	// #include <fog_fragment>
	// #include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}
`;

export const envVert = `
varying vec2 vUv;
#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  vUv = uv;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}
`;

export const skyFrag = `
precision highp float;

${Fr}
${xg}
${gg}
${vg}
${dg}
${ug}
${pg}
${_g}

#include <tonemapping_pars_fragment>

uniform sampler2D tScene;
uniform float uTime;
uniform float uShader1Speed;
uniform float uShader1Alpha;
uniform float uShader1Scale;
uniform float uShader2Speed;
uniform float uShader2Scale;
uniform float uShader1Mix3;
uniform float uShader3Scale;
uniform float uShaderMix;

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec2 uv = vUv;

  vec2 pos = vUv.xy * 4.;
  pos.x *= 1.5;

  vec4 noise = noiseShader(pos, uTime, uShader1Speed * .1);
  vec4 diffuseColor = texture(tScene, vUv);

  diffuseColor.rgb = blendReflect(diffuseColor.rgb, noise.rgb, .5);
  diffuseColor.rgb = contrast(diffuseColor.rgb, 2.);
  diffuseColor.rgb = diffuseColor.rgb * 2.;

  FragColor = vec4(.9 - diffuseColor.rgb, 1.);

  #include <tonemapping_fragment>
}
`;

export const wavesFrag = `
precision highp float;

${Ro}

#include <tonemapping_pars_fragment>

uniform sampler2D tScene;
uniform float uTime;
uniform float uRatio;

float vignout = .5; // vignetting outer border
float vignin = 0.01; // vignetting inner border
float vignfade = 2.0; // f-stops till vignete fades

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec2 uvOff = vUv;

  uvOff.x -= 0.5;
  uvOff.x *= uRatio;
  uvOff.x += 0.5;

  vec2 uvVignette = uvOff;

  uvOff.xy -= 0.5;
  uvOff *= 5.;
  uvOff.xy += 0.5;

  float strength = 1. - abs(sin(distance(uvOff, vec2(0.5)) - 0.5 - uTime)) ;

  float vignetteF = vignette(uvVignette.xy, vignin, vignout, vignfade, .4);

  FragColor = vec4(vec3(strength), 1.);
  FragColor.rgb *= 1. - vignetteF;

  #include <tonemapping_fragment>
}
`;

export const screenVert = `
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

export const floorFrag = `
precision mediump float;

${lg}

uniform sampler2D tReflect;
uniform vec3 uColor;
uniform float uReflectivity;
uniform float uMirror;
uniform float uFloorMixStrength;
uniform float uNormalDistortionStrength;

#ifdef USE_MAP
uniform sampler2D tMap;
#endif

#ifdef USE_NORMALMAP
uniform sampler2D tNormalMap;
uniform vec2 uNormalScale;
#endif

#ifdef USE_FOG
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
#endif

in vec2 vUv;
in vec4 vCoord;
in vec3 vNormal;
in vec3 vToEye;

out vec4 FragColor;

void main() {
    #ifdef USE_MAP
  vec4 color = texture(tMap, vUv);
    #else
  vec4 color = vec4(uColor, 1.0);
    #endif

    #ifdef USE_NORMALMAP
  vec4 normalColor = texture(tNormalMap, vUv * uNormalScale);
  vec3 normal = normalize(vec3(normalColor.r * uNormalDistortionStrength - (uNormalDistortionStrength / 2.), normalColor.b, normalColor.g * uNormalDistortionStrength - (uNormalDistortionStrength / 2.)));
  vec3 coord = vCoord.xyz / vCoord.w;
  vec2 uv = coord.xy + coord.z * normal.xz * 0.05;
  vec4 reflectColor = texture(tReflect, uv);
    #else
  vec3 normal = vNormal;
  vec4 reflectColor = textureProj(tReflect, vCoord);
    #endif

    // Fresnel term
  vec3 toEye = normalize(vToEye);
  float theta = max(dot(toEye, normal), .0);
  float reflectance = max(0.01, min(uReflectivity + (1.0 - uReflectivity) * pow((1.0 - theta), 5.0), 1.));

  reflectColor = mix(vec4(0), reflectColor, reflectance);

  FragColor.rgb = color.rgb * ((1.0 - min(1.0, uMirror)) + reflectColor.rgb * uFloorMixStrength);

    #ifdef USE_FOG
  float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = smoothstep(uFogNear, uFogFar, fogDepth);

  FragColor.rgb = mix(FragColor.rgb, uFogColor, fogFactor);
    #endif

    #ifdef DITHERING
  FragColor.rgb = dither(FragColor.rgb);
    #endif



  FragColor.a = 1.0;
}
`;

export const floorVert = `
in vec3 position;
in vec3 normal;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform mat3 uMapTransform;
uniform mat4 uMatrix;
out vec2 vUv;
out vec4 vCoord;
out vec3 vNormal;
out vec3 vToEye;
void main() {
  vUv = (uMapTransform * vec3(uv, 1.0)).xy;
  vCoord = uMatrix * vec4(position, 1.0);
  vNormal = normalMatrix * normal;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vToEye = cameraPosition - worldPosition.xyz;
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}

`;
