import * as THREE from "three";
import { FluidSimulation } from "../fluid/FluidSimulation.js";
import {
  fxaaVert,
  fxaaFrag,
  screenVert,
  luminosityFrag,
  bloomBlurFrag,
  bloomCombineFrag,
  gaussBlurFrag,
  compositeVert,
  compositeFrag,
  finalCompositeFrag,
} from "./shaders.js";

// ───────────────────────────────────────────────────────────────────────────
// Multi-pass post-processing — ported from bundle.js classes Lu/kA.
// Pipeline per frame:
//   scene → [blur] → luminosity threshold → 5-mip bloom → fluid → composite → [fxaa]
// Composite = chromatic aberration (rgbshift) + bloom + fluid UV distortion
//   + darken (blend modes) + saturation + tonemapping.
// ───────────────────────────────────────────────────────────────────────────

const X = new THREE.Vector2(1, 0); // horizontal direction
const Y = new THREE.Vector2(0, 1); // vertical direction

function rt(w = 1, h = 1, opts = {}) {
  return new THREE.WebGLRenderTarget(w, h, {
    depthBuffer: false,
    stencilBuffer: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    ...opts,
  });
}

const dummyBlack = (() => {
  const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat);
  t.needsUpdate = true;
  return t;
})();

export class RenderManager {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.dpr = renderer.getPixelRatio();
    this.initSettings();
    this.initRenderer();
  }

  // workScene (kA) settings — fluid switched on for this recreation.
  initSettings() {
    this.settings = {
      renderToScreen: true,
      fxaa: { enabled: false },
      luminosity: { threshold: 0.1, smoothing: 0.95, enabled: true },
      bloom: { strength: 0.15, radius: 1.5, enabled: true },
      blur: { scale: 1, strength: 8, enabled: false },
      fluid: { enabled: true, mouseForce: 25, cursorSize: 20, delta: 0.014, poissonIterations: 5, bounce: false },
    };
  }

  initRenderer() {
    this.screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.screenGeometry = new THREE.BufferGeometry();
    this.screenGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, 3, 0, -1, -1, 0, 3, -1, 0]), 3),
    );
    this.screenGeometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 2, 0, 0, 2, 0]), 2));
    this.screen = new THREE.Mesh(this.screenGeometry);
    this.screen.frustumCulled = false;

    this.renderTargetA = rt(1, 1, { depthBuffer: true });
    this.renderTargetComposite = rt();
    this.renderTargetBright = rt();

    this.nMips = 5;
    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    for (let i = 0; i < this.nMips; i++) {
      this.renderTargetsHorizontal.push(rt());
      this.renderTargetsVertical.push(rt());
    }

    this.renderTargetBlurA = rt();
    this.renderTargetBlurB = rt();
    this.renderTargetFXAA = rt();

    // gaussian 9-tap blur (Na)
    this.hBlurMaterial = this.rawMat(screenVert, gaussBlurFrag, {
      tMap: { value: null }, uBluriness: { value: 0 }, uDirection: { value: X.clone() }, uResolution: { value: new THREE.Vector2() },
    });
    this.vBlurMaterial = this.rawMat(screenVert, gaussBlurFrag, {
      tMap: { value: null }, uBluriness: { value: 0 }, uDirection: { value: Y.clone() }, uResolution: { value: new THREE.Vector2() },
    });

    // FXAA (ig)
    this.FxaaMaterial = this.rawMat(fxaaVert, fxaaFrag, {
      tMap: { value: null }, uResolution: { value: new THREE.Vector2() },
    });

    // luminosity threshold (sg)
    this.luminosityMaterial = this.rawMat(screenVert, luminosityFrag, {
      tMap: { value: null },
      uThreshold: { value: this.settings.luminosity.threshold },
      uSmoothing: { value: this.settings.luminosity.smoothing },
    });

    // mip blur materials (rg) — radii 3,5,7,9,11
    this.blurMaterials = [];
    const kernels = [3, 5, 7, 9, 11];
    for (let i = 0; i < this.nMips; i++) {
      this.blurMaterials.push(
        this.rawMat(screenVert, bloomBlurFrag, {
          tMap: { value: null }, uDirection: { value: new THREE.Vector2(0.5, 0.5) }, uResolution: { value: new THREE.Vector2() },
        }, { KERNEL_RADIUS: kernels[i], SIGMA: kernels[i] }),
      );
    }

    // bloom combine (cg)
    this.BloomMaterial = this.rawMat(screenVert, bloomCombineFrag, {
      tBlur1: { value: this.renderTargetsVertical[0].texture },
      tBlur2: { value: this.renderTargetsVertical[1].texture },
      tBlur3: { value: this.renderTargetsVertical[2].texture },
      tBlur4: { value: this.renderTargetsVertical[3].texture },
      tBlur5: { value: this.renderTargetsVertical[4].texture },
      uBloomFactors: { value: this.bloomFactors() },
    }, { NUM_MIPS: 5, DITHERING: true });

    // composite — both original variants:
    //   CA   = home-scene composite (darken + saturation + blend modes; fluid
    //          only as a faint additive glow)
    //   aA   = fluid composite (visible UV distortion by the velocity field;
    //          no darken/saturation)
    const compositeBase = {
      glslVersion: THREE.GLSL3,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending,
      vertexShader: compositeVert,
    };
    this.compositeCA = new THREE.RawShaderMaterial({
      ...compositeBase,
      fragmentShader: compositeFrag,
      uniforms: {
        tScene: { value: null },
        tBloom: { value: dummyBlack },
        tBlur: { value: dummyBlack },
        tFluid: { value: dummyBlack },
        tMouseSim: { value: dummyBlack },
        boolBloom: { value: false },
        boolFluid: { value: false },
        boolLuminosity: { value: false },
        boolFxaa: { value: false },
        uDarken: { value: 0.2 },
        uSaturation: { value: 0.35 },
      },
    });
    // CA holds the colour uniforms the ColorController tweens (always).
    this.compositeMaterial = this.compositeCA;

    // final "lens" composite (soft/grainy edges) — applied on top of the scene
    // composite. tWork = the scene-composite output.
    this.finalMaterial = new THREE.RawShaderMaterial({
      ...compositeBase,
      fragmentShader: finalCompositeFrag,
      uniforms: {
        tWork: { value: null },
        tFluid: { value: dummyBlack },
        tPerlin: { value: dummyBlack },
        tNoise: { value: dummyBlack },
        uRatio: { value: 1 },
        uTime: { value: 0 },
        uContrast: { value: 1.04 },
        uFluidStrength: { value: 0 }, // 0 = no cursor-driven smear in the lens pass (static soft edges only)
        uChromaPulse: { value: 0 },   // пульс хроматики на смене темы (без geo-warp) — main.js fire()
        uPerlin: { value: 0.04 },
        uBgColor: { value: new THREE.Color("#14141c") },
      },
    });
    this.lensEnabled = true;

    if (this.settings.fluid.enabled) this.initFluid();
  }

  rawMat(vertexShader, fragmentShader, uniforms, defines) {
    return new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      blending: THREE.NoBlending,
      depthWrite: false,
      depthTest: false,
      vertexShader,
      fragmentShader,
      uniforms,
      defines: defines || {},
    });
  }

  initFluid() {
    this.fluidSimulation = new FluidSimulation({
      renderer: this.renderer,
      mouseForce: this.settings.fluid.mouseForce,
      resolution: 0.15,
      cursorSize: this.settings.fluid.cursorSize,
      poissonIterations: this.settings.fluid.poissonIterations,
      bounce: this.settings.fluid.bounce,
      delta: this.settings.fluid.delta,
    });
  }

  // UnrealBloom-style weights (1, .8, .6, .4, .2) shaped by strength/radius.
  bloomFactors() {
    const e = [1, 0.8, 0.6, 0.4, 0.2];
    for (let t = 0; t < this.nMips; t++) {
      const i = e[t];
      e[t] = this.settings.bloom.strength * THREE.MathUtils.lerp(i, 1.2 - i, this.settings.bloom.radius);
    }
    return e;
  }

  resize(e, t, n = this.dpr) {
    this.dpr = n;
    const W = Math.round(e * n);
    const H = Math.round(t * n);
    this.lastW = W;
    this.lastH = H;

    this.renderTargetA.setSize(W, H);
    this.renderTargetComposite.setSize(W, H);
    if (this.settings.fxaa.enabled) {
      this.renderTargetFXAA.setSize(W, H);
      this.FxaaMaterial.uniforms.uResolution.value.set(W, H);
    }
    if (this.settings.blur.enabled) {
      const i = Math.round(e * this.settings.blur.scale);
      const r = Math.round(t * this.settings.blur.scale);
      this.renderTargetBlurA.setSize(i, r);
      this.renderTargetBlurB.setSize(i, r);
      this.hBlurMaterial.uniforms.uResolution.value.set(e, t);
      this.vBlurMaterial.uniforms.uResolution.value.set(e, t);
    }

    // bright + bloom mips run at a downscaled size (≈ /4, halving per mip)
    let bw = Math.max(2, Math.floor(W / 4));
    let bh = Math.max(2, Math.floor(H / 4));
    if (this.settings.luminosity.enabled) this.renderTargetBright.setSize(bw, bh);

    if (this.settings.fluid.enabled && this.fluidSimulation) {
      if (!this.fluidSimulation.fbos.main) this.fluidSimulation.init(W, H);
      else this.fluidSimulation.onResize(W, H);
    }

    if (this.settings.bloom.enabled) {
      for (let i = 0; i < this.nMips; i++) {
        this.renderTargetsHorizontal[i].setSize(bw, bh);
        this.renderTargetsVertical[i].setSize(bw, bh);
        this.blurMaterials[i].uniforms.uResolution.value.set(bw, bh);
        bw = Math.max(1, Math.floor(bw / 2));
        bh = Math.max(1, Math.floor(bh / 2));
      }
    }
  }

  setScreenMaterial(m) {
    this.screen.material = m;
  }

  // perlin + blue-noise textures used by the final lens/grain pass
  setLensTextures(perlin, noise) {
    if (perlin) this.finalMaterial.uniforms.tPerlin.value = perlin;
    if (noise) this.finalMaterial.uniforms.tNoise.value = noise;
  }

  // outputTarget: optional WebGLRenderTarget to receive the final composited
  // frame instead of the screen (null = screen). Used by the scroll circle-reveal
  // transition, which needs the full lens/bloom composite in a texture to blend.
  update(time, delta, ratio, outputTarget = null) {
    const o = this.renderer;
    const c = this.renderTargetA;
    const u = this.renderTargetBright;
    const d = this.renderTargetsHorizontal;
    const l = this.renderTargetsVertical;
    const g = this.renderTargetBlurB;
    const v = this.renderTargetFXAA;

    // 1. scene
    o.setRenderTarget(c);
    o.clear();
    o.render(this.scene, this.camera);

    // 2. optional gaussian blur (H then V)
    if (this.settings.blur.enabled) {
      this.hBlurMaterial.uniforms.tMap.value = c.texture;
      this.setScreenMaterial(this.hBlurMaterial);
      o.setRenderTarget(this.renderTargetBlurA);
      o.render(this.screen, this.screenCamera);
      this.vBlurMaterial.uniforms.tMap.value = this.renderTargetBlurA.texture;
      this.setScreenMaterial(this.vBlurMaterial);
      o.setRenderTarget(g);
      o.render(this.screen, this.screenCamera);
    }

    // 3. luminosity threshold → bright
    if (this.settings.luminosity.enabled) {
      this.luminosityMaterial.uniforms.tMap.value = this.settings.blur.enabled ? g.texture : c.texture;
      this.setScreenMaterial(this.luminosityMaterial);
      o.setRenderTarget(u);
      o.render(this.screen, this.screenCamera);
    }

    // 4. bloom — 5 mips, each separable blur, then weighted combine
    if (this.settings.bloom.enabled) {
      let m = this.settings.luminosity.enabled ? u : c;
      for (let p = 0; p < this.nMips; p++) {
        this.setScreenMaterial(this.blurMaterials[p]);
        this.blurMaterials[p].uniforms.tMap.value = m.texture;
        this.blurMaterials[p].uniforms.uDirection.value = X;
        o.setRenderTarget(d[p]);
        o.render(this.screen, this.screenCamera);
        this.blurMaterials[p].uniforms.tMap.value = this.renderTargetsHorizontal[p].texture;
        this.blurMaterials[p].uniforms.uDirection.value = Y;
        o.setRenderTarget(l[p]);
        o.render(this.screen, this.screenCamera);
        m = l[p];
      }
      this.setScreenMaterial(this.BloomMaterial);
      o.setRenderTarget(d[0]);
      o.render(this.screen, this.screenCamera);
      this.compositeMaterial.uniforms.tBloom.value = d[0].texture;
    }

    // 5. fluid
    if (this.settings.fluid.enabled && this.fluidSimulation && this.fluidSimulation.fbos.main) {
      this.fluidSimulation.update();
      this.compositeMaterial.uniforms.tFluid.value = this.fluidSimulation.fbos.main.texture;
    }

    // 6. composite
    this.compositeMaterial.uniforms.tScene.value = this.settings.blur.enabled ? g.texture : c.texture;
    this.compositeMaterial.uniforms.boolBloom.value = this.settings.bloom.enabled;
    this.compositeMaterial.uniforms.boolFluid.value = this.settings.fluid.enabled;
    this.compositeMaterial.uniforms.boolLuminosity.value = this.settings.luminosity.enabled;
    this.compositeMaterial.uniforms.boolFxaa.value = this.settings.fxaa.enabled;
    this.setScreenMaterial(this.compositeMaterial);

    if (this.settings.fxaa.enabled) {
      o.setRenderTarget(v);
      o.render(this.screen, this.screenCamera);
      this.FxaaMaterial.uniforms.tMap.value = v.texture;
      this.setScreenMaterial(this.FxaaMaterial);
    }

    if (this.lensEnabled) {
      // scene composite → RT, then the final lens/grain pass → screen
      const h = this.renderTargetComposite;
      o.setRenderTarget(h);
      o.render(this.screen, this.screenCamera);

      const f = this.finalMaterial.uniforms;
      f.tWork.value = h.texture;
      f.uTime.value = time;
      f.uRatio.value = (this.lastW || 1) / (this.lastH || 1);
      if (this.fluidSimulation && this.fluidSimulation.fbos.main) f.tFluid.value = this.fluidSimulation.fbos.main.texture;
      this.setScreenMaterial(this.finalMaterial);
      o.setRenderTarget(outputTarget);
      o.render(this.screen, this.screenCamera);
    } else if (this.settings.renderToScreen) {
      o.setRenderTarget(outputTarget);
      o.render(this.screen, this.screenCamera);
    } else {
      o.setRenderTarget(this.renderTargetComposite);
      o.render(this.screen, this.screenCamera);
      o.setRenderTarget(null);
    }
  }
}
