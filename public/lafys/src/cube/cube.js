// cube.js — the portfolio cube `nF` (obj:"cube3" = lafys Penguins) ported 1:1.
// Group holding: the glass cube mesh (FrostMaterial), the inner lafys model,
// the interior "smoke" plane (mesh2), the mouse-frost effect and the plexus.
// The two-pass transmission render that feeds the glass shader lives in the
// container's update() (see index.html) — exactly as in the bundle's `aF`.
import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { Fe, ie, he } from './engine.js';
import { le, zt } from './loaders.js';
import { ae, Nt, stripMRT } from './chunks.js';
import { FrostMaterial } from './frostMaterial.js';
import { MouseFrost } from './mouseFrost.js';
import { Plexus } from './plexus.js';

export class Cube extends THREE.Group {
  constructor(scene, options = {}) {
    super();
    this.scene = scene;
    this.options = {
      index: 0, obj: 'cube3', innerobject: 'lafys',
      centeredProgress: 0, scrollPosition: 0, rand: Math.random(),
      interior: { enabled: true },
      ...options,
    };
    this.name = `group${this.options.index}`;
    this.position.y = this.options.scrollPosition;
    this.additionalRotationAmount = { value: 1 };
    this.ready = new Promise(r => { this.isReady = r; });
    this.init();
  }

  async init() {
    const [geo, innerGeo] = await Promise.all([
      zt.load(`cubes/${this.options.obj}.drc`),
      zt.load(`${this.options.innerobject}.drc`),
    ]);

    // bE = THREE.Mesh with three-mesh-bvh accelerated raycast (patched globally in index.html)
    this.mesh = new THREE.Mesh(geo, new FrostMaterial(3));
    this.mesh.name = `cube${this.options.index}`;
    this.mesh.renderOrder = 3;
    this.mesh.geometry.computeBoundingBox();
    this.mesh.geometry.computeBoundingSphere();
    this.mesh.geometry.boundsTree = new MeshBVH(this.mesh.geometry);
    this.add(this.mesh);

    // --- glass material params (verbatim from nF) ---
    const s = this.mesh.material;
    s.color.setStyle('#e0e8ef');
    s.roughnessMap = le.load(`cubes/${this.options.obj}_roughness.ktx2`);
    s.roughness = 0.65;
    s.envMap = this.scene.envmap;
    s.envMapIntensity = 0.91;
    s.envMapRotation.y = Math.PI;
    s.normalMap = le.load(`cubes/${this.options.obj}_normal.ktx2`);
    s.normalScale.set(1, 1);
    s.ior = 1.18;
    s.reflectivity = 0.3;
    s.transmission = 0;

    // --- mouse frost (interactive) ---
    this.mouseFrost = new MouseFrost(this, {});

    // --- inner model (lafys), seen through the glass via the transmission pass ---
    this.mesh3 = new THREE.Mesh(innerGeo, new THREE.MeshBasicMaterial({
      map: le.load(`cubes/${this.options.innerobject}_color.ktx2`),
    }));
    this.mesh3.name = `${this.options.innerobject}${this.options.index}`;
    this.mesh3.renderOrder = 10;
    this.add(this.mesh3);

    // Only refresh the frost RT during the FrontSide (main) pass — es === FrontSide.
    this.mesh.onBeforeRender = () => {
      // guard: у природной скалы MeshStandardMaterial без uniforms (иней не применяется)
      if (this.mesh.material.uniforms && this.mesh.material.side === THREE.FrontSide) {
        this.mouseFrost.update();
        this.mesh.material.uniforms.tMouseFrost.value = this.mouseFrost.finalRT.texture;
      }
    };

    // --- interior "smoke" plane (mesh2), billboarded, additive-ish reveal ---
    this.mesh2 = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), new THREE.ShaderMaterial({
      // No explicit glslVersion: three auto-selects GLSL3 for the UBO block and
      // provides gl_FragColor — matching how the plexus ShaderMaterials compile.
      uniformsGroups: [he.UBO],
      uniforms: {
        tTexture1: { value: le.load('wind_noise.ktx2', 'srgb-repeat') },
        uColor1: { value: new THREE.Color('#886a3d') },
        uProgress: { value: 100 },
      },
      vertexShader: `${Nt}

uniform sampler2D tTexture1;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;
    gl_Position = projectionMatrix * viewMatrix * (billboardModelMatrix() * vec4(position, 1.0));
}
`,
      fragmentShader: stripMRT(`layout(location = 1) out highp vec4 gInfo;

${ae}

varying vec2 vUv;

uniform sampler2D tTexture1;
uniform float uProgress;

void main() {
    vec2 uv = vUv;
    vec2 st = uv;
    st.y *= 0.75;
    st *= 1.5;
    float t = time * 0.075;
    vec2 offset = vec2(0.0, t);
    float noise = texture2D(tTexture1, st + offset).r;
    noise *= texture2D(tTexture1, st * 0.5 + offset).r;
    float grad = 1.0 - clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
    noise *= grad;
    noise *= length(vUv - 0.5);
    noise = noise * 6.5;

    // fade by scroll distance
    float scrollDist = clamp(1.0 - abs(uProgress) * 20.0, 0.0, 1.0);
    noise *= scrollDist;

    vec3 color = vec3(1.0);
    float alpha = noise;
    gl_FragColor = vec4(color, alpha);
}
`),
      transparent: true, depthTest: false, depthWrite: false,
    }));
    this.mesh2.name = `smoke${this.options.index}`;
    this.mesh2.renderOrder = 15;
    this.mesh2.position.y = -0.35;
    this.add(this.mesh2);

    // --- plexus network ---
    this.plexus = new Plexus(this);

    // NOTE (documented omission): the bundle also builds `this.texts = new KL(this)` —
    // the floating "PORTFOLIO_CO_01 / Summary" typography (MSDF font subsystem).
    // That is typography, not a graphical effect, and depends on a separate font/atlas
    // pipeline; it is intentionally omitted from this effects snippet.

    await Promise.all([this.plexus.ready]);
    this.scene.add(this);
    this.isReady();
  }

  update(e, t, s) {
    if (this.mesh.material.uniforms) {   // guard: только для FrostMaterial (у природной скалы uniforms нет)
      this.mesh.material.uniforms.uBlueOffset.value.set(Math.random(), Math.random());
      this.mesh.material.uniforms.uResolution.value.copy(he.uniforms.resolution.value);
    }
    const n = this.options.centeredProgress - e;
    const r = this.options.scrollPosition - t;
    const a = n;
    const o = (s + this.scene.cubes[0].options.rand) * 242.45353 % 1 < 0.5 ? -1 : 1;
    const l = o, c = -o, h = o;
    const d = ie.fit(this.options.rand * 12.3423 % 1, 0, 1, 0.1, 0.2);
    const u = ie.fit(this.options.rand * 123.5343 % 1, 0, 1, 0.1, 0.3);
    const f = ie.fit(this.options.rand * 54.654 % 1, 0, 1, 0.1, 0.25);
    const p = 11 * l * (1 - d), A = 14 * c * (1 - u), m = 6 * h * (1 - f);
    const g = 0.3, x = 0.1 * this.additionalRotationAmount.value;
    const v = Math.sin(Fe.time * g + this.options.rand * 12.423) * x * Math.sign(this.options.rand - 0.5);
    const y = Math.sin(Fe.time * g + this.options.rand * 42.987) * x * Math.sign(this.options.rand - 0.5);
    const S = Math.sin(Fe.time * g + this.options.rand * 2.53) * x * Math.sign(this.options.rand - 0.5);
    this.rotation.y = p * a + v;
    this.rotation.x = A * a + y;
    this.rotation.z = m * a + S;
    this.mesh2.material.uniforms.uProgress.value = a;
    this.plexus.update(s, n, r);

    // interaction enable/disable (detail view is never open in this standalone snippet)
    const detailOpen = this.scene.controller && this.scene.controller.isDetailOpen;
    if (detailOpen) this.mouseFrost.setEnabled?.(false);
    else this.mouseFrost.setEnabled?.(Math.abs(r) < 2);
  }
}
