// loaders.js — KTX2 (le) / Draco (zt) / EXR wrappers replicating the bundle API.
//   le.load(key, hint?)  -> THREE.Texture   (cached; hint controls wrap/filter/colorspace)
//   zt.load(key)         -> Promise<BufferGeometry>
// All assets must be preloaded via preloadAll(renderer) BEFORE any class that
// calls le.load/zt.load is constructed (the bundle assumes a warm cache).
import * as THREE from 'three';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

const THREE_CDN = 'https://unpkg.com/three@0.165.0/examples/jsm/libs/';

// logical key (as used in bundle) -> local file under https://qclay.design/lovable/lafys/assets/
const KEYS = {
  'cubes/cube3.drc': 'https://qclay.design/lovable/lafys/assets/cube3.drc',
  'lafys.drc': 'https://qclay.design/lovable/lafys/assets/lafys.drc',
  'cubes/cube3_roughness.ktx2': 'https://qclay.design/lovable/lafys/assets/cube3_roughness.ktx2',
  'cubes/cube3_normal.ktx2': 'https://qclay.design/lovable/lafys/assets/cube3_normal.ktx2',
  'cubes/lafys_color.ktx2': 'https://qclay.design/lovable/lafys/assets/lafys_color.ktx2',
  'lafys/triangles_tiling.ktx2': 'https://qclay.design/lovable/lafys/assets/triangles_tiling.ktx2',
  'noises/blue-8-128-rgb.ktx2': 'https://qclay.design/lovable/lafys/assets/blue-8-128-rgb.ktx2',
  'wind_noise.ktx2': 'https://qclay.design/lovable/lafys/assets/wind_noise.ktx2',
  'cubes/advect.png': 'https://qclay.design/lovable/lafys/assets/advect.png',
  'cubes/bg.png': 'https://qclay.design/lovable/lafys/assets/bg.png',
  'cubes_env.exr': 'https://qclay.design/lovable/lafys/assets/cubes_env.exr',
};

// Basis transcoder is hosted locally (https://qclay.design/lovable/lafys/assets/basis/) — a cross-origin CDN worker
// hangs under some setups (notably headless Chrome). Draco decoder stays on CDN.
const ktx2Loader = new KTX2Loader().setTranscoderPath('https://qclay.design/lovable/lafys/assets/basis/');
const dracoLoader = new DRACOLoader().setDecoderPath(THREE_CDN + 'draco/');
const exrLoader = new EXRLoader();
const texLoader = new THREE.TextureLoader();

const texCache = new Map();
const geoCache = new Map();

// Neutral 4×4 mid-gray fallback for assets missing from the source mirror.
// (The site scrape saved HTML placeholders instead of the real advect.png / bg.png.)
function makeFallbackTex() {
  const size = 4, data = new Uint8Array(size * size * 4).fill(128);
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

function applyHint(tex, hint) {
  if (!hint) return tex;
  const parts = hint.split('-');
  if (parts.includes('srgb')) tex.colorSpace = THREE.SRGBColorSpace;
  else if (parts.includes('colordata')) tex.colorSpace = THREE.NoColorSpace;
  if (parts.includes('repeat')) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; }
  if (parts.includes('nearest')) { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; }
  tex.needsUpdate = true;
  return tex;
}

export const le = {
  load(key, hint) {
    const tex = texCache.get(key);
    if (!tex) { console.warn('[loaders] ktx2 not preloaded:', key); return new THREE.Texture(); }
    return applyHint(tex, hint);
  },
};

export const zt = {
  load(key) {
    const geo = geoCache.get(key);
    if (!geo) return Promise.reject(new Error('[loaders] draco not preloaded: ' + key));
    return Promise.resolve(geo);
  },
};

export async function preloadAll(renderer) {
  ktx2Loader.detectSupport(renderer);
  const ktx2Keys = Object.keys(KEYS).filter(k => k.endsWith('.ktx2'));
  const dracoKeys = Object.keys(KEYS).filter(k => k.endsWith('.drc'));
  const pngKeys = Object.keys(KEYS).filter(k => k.endsWith('.png'));
  await Promise.all([
    ...ktx2Keys.map(async k => { texCache.set(k, await ktx2Loader.loadAsync(KEYS[k])); }),
    ...dracoKeys.map(async k => { geoCache.set(k, await dracoLoader.loadAsync(KEYS[k])); }),
    ...pngKeys.map(async k => {
      // advect.png / bg.png отсутствуют в скрейпе (сохранились HTML-плейсхолдеры) —
      // нейтральный серый fallback это ШТАТНО (эффекты работают), поэтому без варнинга.
      try { texCache.set(k, await texLoader.loadAsync(KEYS[k])); }
      catch { texCache.set(k, makeFallbackTex()); }
    }),
  ]);
}

// Equirectangular EXR environment -> loaded texture (mapping set by caller/PMREM).
export async function loadEnvEXR() {
  const tex = await exrLoader.loadAsync(KEYS['cubes_env.exr']);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}
