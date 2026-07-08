import * as THREE from "three";
import {
  faceVert,
  boundaryVert,
  mouseVert,
  advectionFrag,
  divergenceFrag,
  mouseFrag,
  poissonFrag,
  pressureFrag,
  viscosityFrag,
} from "./shaders.js";

// ───────────────────────────────────────────────────────────────────────────
// Orchestrator ported 1:1 from bundle.js classes:
//   Ir (Pass base), GT (advection), qT (force), eA (viscosity),
//   jT (divergence), KT (poisson), JT (pressure), ag (FluidSimulation).
// Shaders are verbatim; the JS plumbing mirrors the original. Pass order:
//   advection → force → [viscosity] → divergence → poisson(N) → pressure.
//
// NOTE: the original ships this simulation disabled (FLUID_ENABLED:false) and
// its resize wiring collapsed the grid to ~1px, so there is no canonical
// "enabled" grid size to match. We size the grid from `resolution` to working
// values. The GLSL itself is unchanged.
// ───────────────────────────────────────────────────────────────────────────

const RT_OPTS = {
  depthBuffer: false,
  stencilBuffer: false,
  type: THREE.HalfFloatType,
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
};

// Ir — base pass: a full quad (shrunk by one boundary cell) + plain camera.
class Pass {
  constructor(props) {
    this.props = props;
    this.renderer = props.renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
  }
  init() {
    this.geometry = new THREE.PlaneGeometry(
      2 - this.props.cellScale.x * 2,
      2 - this.props.cellScale.y * 2,
    );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
  update() {
    this.renderer.setRenderTarget(this.output);
    this.renderer.render(this.scene, this.camera);
  }
}

// GT — advection (+ a boundary line that reflects velocity at the edges)
class AdvectionPass extends Pass {
  constructor(props) {
    super(props);
    this.uniforms = {
      bounds: { value: props.cellScale },
      px: { value: props.cellScale },
      fboSize: { value: props.fboSize },
      velocity: { value: props.src.texture },
      dt: { value: props.delta },
    };
    this.material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      blending: THREE.NoBlending,
      depthWrite: false,
      depthTest: false,
      vertexShader: faceVert,
      fragmentShader: advectionFrag,
      uniforms: this.uniforms,
    });
    this.output = props.dst;
    this.init();
  }
  init() {
    super.init();
    this.createBounds();
  }
  createBounds() {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array([
      -1, -1, 0, -1, 1, 0, -1, 1, 0, 1, 1, 0, 1, 1, 0, 1, -1, 0, 1, -1, 0, -1, -1, 0,
    ]);
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      blending: THREE.NoBlending,
      depthWrite: false,
      depthTest: false,
      vertexShader: boundaryVert,
      fragmentShader: advectionFrag,
      uniforms: this.uniforms,
    });
    this.line = new THREE.LineSegments(g, m);
    this.scene.add(this.line);
  }
}

// qT — mouse force splat (additive)
class ForcePass extends Pass {
  constructor(props) {
    super(props);
    this.init();
    this.output = props.dst;
    this.mouse = {
      coords: new THREE.Vector2(),
      coordsOld: new THREE.Vector2(),
      diff: new THREE.Vector2(),
    };
    this.hasMouse = false;
  }
  init() {
    const { cursorSize: e, cellScale: t } = this.props;
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      vertexShader: mouseVert,
      fragmentShader: mouseFrag,
      blending: THREE.AdditiveBlending,
      uniforms: {
        px: { value: t },
        force: { value: new THREE.Vector2(0, 0) },
        center: { value: new THREE.Vector2(0, 0) },
        scale: { value: new THREE.Vector2(e, e) },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
  // coords in clip space [-1,1]
  setCoords(x, y) {
    this.mouse.coords.set(x, y);
    this.hasMouse = true;
  }
  updateMouseDiff() {
    this.mouse.diff.subVectors(this.mouse.coords, this.mouse.coordsOld);
    this.mouse.coordsOld.copy(this.mouse.coords);
    if (this.mouse.coordsOld.x === 0 && this.mouse.coordsOld.y === 0) this.mouse.diff.set(0, 0);
  }
  update() {
    this.updateMouseDiff();
    const { cellScale: e, mouseForce: t, cursorSize: n } = this.props;
    const i = (this.mouse.diff.x / 2) * t;
    const r = (this.mouse.diff.y / 2) * t;
    const o = n * e.x;
    const a = n * e.y;
    const c = Math.min(Math.max(this.mouse.coords.x, -1 + o + e.x * 2), 1 - o - e.x * 2);
    const u = Math.min(Math.max(this.mouse.coords.y, -1 + a + e.y * 2), 1 - a - e.y * 2);
    this.material.uniforms.force.value.set(i, r);
    this.material.uniforms.center.value.set(c, u);
    this.material.uniforms.scale.value.set(n, n);
    super.update();
  }
}

// jT — divergence
class DivergencePass extends Pass {
  constructor(props) {
    super(props);
    this.material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending,
      vertexShader: faceVert,
      fragmentShader: divergenceFrag,
      uniforms: {
        bounds: { value: props.bounds },
        velocity: { value: props.src.texture },
        px: { value: props.cellScale },
        dt: { value: props.delta },
      },
    });
    this.output = props.dst;
    this.init();
  }
  update(src) {
    this.material.uniforms.velocity.value = src.texture;
    super.update();
  }
}

// KT — pressure jacobi (ping-pong N iterations)
class PoissonPass extends Pass {
  constructor(props) {
    super(props);
    this.material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending,
      vertexShader: faceVert,
      fragmentShader: poissonFrag,
      uniforms: {
        bounds: { value: props.bounds },
        pressure: { value: props.dst_.texture },
        divergence: { value: props.src.texture },
        px: { value: props.cellScale },
      },
    });
    this.output = props.dst;
    this.output0 = props.dst_;
    this.output1 = props.dst;
    this.init();
  }
  update() {
    const { poissonIterations: e } = this.props;
    let t, n;
    for (let i = 0; i < e; i++) {
      if (i % 2 === 0) {
        t = this.output0;
        n = this.output1;
      } else {
        t = this.output1;
        n = this.output0;
      }
      this.material.uniforms.pressure.value = t.texture;
      this.output = n;
      super.update();
    }
    return n;
  }
}

// JT — pressure gradient subtract
class PressurePass extends Pass {
  constructor(props) {
    super(props);
    this.material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending,
      vertexShader: faceVert,
      fragmentShader: pressureFrag,
      uniforms: {
        bounds: { value: props.bounds },
        pressure: { value: props.pressure.texture },
        velocity: { value: props.viscosity.texture },
        px: { value: props.cellScale },
        dt: { value: props.delta },
      },
    });
    this.output = props.dst;
    this.init();
  }
  update({ pressure, velocity }) {
    this.material.uniforms.pressure.value = pressure.texture;
    this.material.uniforms.velocity.value = velocity.texture;
    super.update();
  }
}

// eA — viscosity (off by default; ported for completeness)
class ViscosityPass extends Pass {
  constructor(props) {
    super(props);
    this.material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NoBlending,
      vertexShader: faceVert,
      fragmentShader: viscosityFrag,
      uniforms: {
        bounds: { value: props.bounds },
        velocity: { value: props.src.texture },
        velocity_new: { value: props.dst_.texture },
        v: { value: props.viscosityIntensity },
        px: { value: props.cellScale },
        dt: { value: props.delta },
      },
    });
    this.output = props.dst;
    this.output0 = props.dst_;
    this.output1 = props.dst;
    this.init();
  }
  update() {
    const { viscosityIntensity: e, viscosityIterations: t } = this.props;
    let n, i;
    this.material.uniforms.v.value = e;
    for (let r = 0; r < t; r++) {
      if (r % 2 === 0) {
        n = this.output0;
        i = this.output1;
      } else {
        n = this.output1;
        i = this.output0;
      }
      this.material.uniforms.velocity_new.value = n.texture;
      this.output = i;
      super.update();
    }
    return i;
  }
}

// ag — FluidSimulation
export class FluidSimulation {
  constructor(e) {
    this.renderer = e.renderer;
    this.fbos = {
      main: null,
      velocity_1: null,
      viscosity_0: null,
      viscosity_1: null,
      divergence: null,
      pressure_0: null,
      pressure_1: null,
    };
    this.options = {
      mouseForce: 20,
      resolution: 0.15,
      cursorSize: 50,
      poissonIterations: 5,
      bounce: false,
      delta: 0.014,
      viscosityIntensity: 30,
      viscosityIterations: 5,
      viscosity: { enabled: false },
    };
    Object.assign(this.options, e);
    this.cellScale = new THREE.Vector2();
    this.fboSize = new THREE.Vector2();
    this.bounds = new THREE.Vector2();
  }

  // Call once renderer/size known.
  init(width, height) {
    this.calcSizes(width, height);
    this.createFbos();
    this.createForces();
  }

  calcSizes(e, t) {
    const { resolution: n } = this.options;
    this.width = Math.max(2, Math.round(e * n));
    this.height = Math.max(2, Math.round(t * n));
    this.cellScale.set(1 / this.width, 1 / this.height);
    this.fboSize.set(this.width, this.height);
  }

  createFbos() {
    for (const e in this.fbos) {
      this.fbos[e] = new THREE.WebGLRenderTarget(this.fboSize.x, this.fboSize.y, RT_OPTS);
    }
  }

  onResize(e, t) {
    this.calcSizes(e, t);
    for (const n in this.fbos) this.fbos[n].setSize(this.fboSize.x, this.fboSize.y);
  }

  createForces() {
    const { cellScale: e, fboSize: t, bounds: n } = this;
    const {
      viscosityIterations: i,
      viscosityIntensity: r,
      viscosity: o,
      delta: a,
      mouseForce: c,
      cursorSize: u,
      poissonIterations: d,
    } = this.options;
    this.advection = new AdvectionPass({
      renderer: this.renderer,
      cellScale: e,
      fboSize: t,
      delta: a,
      src: this.fbos.main,
      dst: this.fbos.velocity_1,
    });
    this.force = new ForcePass({
      renderer: this.renderer,
      cellScale: e,
      mouseForce: c,
      cursorSize: u,
      dst: this.fbos.velocity_1,
    });
    this.viscosity = new ViscosityPass({
      renderer: this.renderer,
      cellScale: e,
      bounds: n,
      delta: a,
      viscosityIntensity: r,
      viscosityIterations: i,
      viscosity: o,
      src: this.fbos.velocity_1,
      dst: this.fbos.viscosity_1,
      dst_: this.fbos.viscosity_0,
    });
    this.divergence = new DivergencePass({
      renderer: this.renderer,
      cellScale: e,
      bounds: n,
      delta: a,
      src: this.fbos.viscosity_0,
      dst: this.fbos.divergence,
    });
    this.poisson = new PoissonPass({
      renderer: this.renderer,
      cellScale: e,
      bounds: n,
      delta: a,
      poissonIterations: d,
      src: this.fbos.divergence,
      dst: this.fbos.pressure_1,
      dst_: this.fbos.pressure_0,
    });
    this.pressure = new PressurePass({
      renderer: this.renderer,
      cellScale: e,
      bounds: n,
      delta: a,
      pressure: this.fbos.pressure_0,
      viscosity: this.fbos.viscosity_0,
      dst: this.fbos.main,
    });
  }

  // clip-space mouse coords [-1,1]
  setMouse(x, y) {
    this.force.setCoords(x, y);
  }

  update() {
    const { bounce: e, viscosity: t } = this.options;
    if (e) this.bounds.set(0, 0);
    else this.bounds.copy(this.cellScale);

    // autoClear off so the additive force pass accumulates onto the advected
    // field (advection's full quad overwrites stale data first).
    const prevAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;

    this.advection.update();
    this.force.update();
    let n = this.fbos.velocity_1;
    if (t.enabled) n = this.viscosity.update();
    this.divergence.update(n);
    const i = this.poisson.update();
    this.pressure.update({ velocity: n, pressure: i });

    this.renderer.autoClear = prevAutoClear;
    this.renderer.setRenderTarget(null);
  }
}
