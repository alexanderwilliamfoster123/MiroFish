import * as THREE from "three";
import { screenVert } from "./glsl.js";

// Renders a fullscreen fragment shader to an offscreen RT each frame — used for
// the procedural sky (B1) and the wave displacement field (F1). Mirrors the
// bundle's tiny offscreen render scenes (O1/H1 + Lo render managers).
const grey = (() => {
  const t = new THREE.DataTexture(new Uint8Array([102, 102, 102, 255]), 1, 1, THREE.RGBAFormat);
  t.needsUpdate = true;
  return t;
})();

export class ProceduralTexture {
  constructor(renderer, fragmentShader, uniforms, w = 256, h = 256) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.rt = new THREE.WebGLRenderTarget(w, h, {
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, 3, 0, -1, -1, 0, 3, -1, 0]), 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 2, 0, 0, 2, 0]), 2));

    this.material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: screenVert,
      fragmentShader,
      uniforms: { tScene: { value: grey }, uTime: { value: 0 }, ...uniforms },
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  get texture() {
    return this.rt.texture;
  }

  setSize(w, h) {
    this.rt.setSize(Math.max(2, Math.round(w)), Math.max(2, Math.round(h)));
  }

  render(time) {
    this.material.uniforms.uTime.value = time;
    const prev = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(prev);
  }
}
