import * as THREE from "three";
import { floorVert, floorFrag } from "./glsl.js";

// Planar reflector — ported from bundle.js class i1 (the classic mirror virtual
// camera + oblique near-plane clipping). Blur is skipped (blurIterations 0).
// Renders the scene from the mirrored camera into `renderTarget`, and exposes
// `textureMatrix` for projective sampling.
class Reflector extends THREE.Group {
  constructor({ width = 1024, height = 1024, clipBias = 0.003 } = {}) {
    super();
    this.clipBias = clipBias;
    this.reflectorPlane = new THREE.Plane();
    this.normal = new THREE.Vector3();
    this.reflectorWorldPosition = new THREE.Vector3();
    this.cameraWorldPosition = new THREE.Vector3();
    this.rotationMatrix = new THREE.Matrix4();
    this.lookAtPosition = new THREE.Vector3(0, 0, -1);
    this.clipPlane = new THREE.Vector4();
    this.view = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.q = new THREE.Vector4();
    this.textureMatrix = new THREE.Matrix4();
    this.virtualCamera = new THREE.PerspectiveCamera();
    this.virtualCamera.layers.enable(2);   // слой 2 = террейн-«земля» -> ОТРАЖАЕТСЯ в воде (слой 1 = силуэт остаётся без отражения)
    this.renderTarget = new THREE.WebGLRenderTarget(width, height, { depthBuffer: true });
    this.renderTarget.texture.colorSpace = THREE.SRGBColorSpace;
  }

  setSize(w, h) {
    this.renderTarget.setSize(Math.max(2, Math.round(w * 0.75)), Math.max(2, Math.round(h * 0.75)));
  }

  update(renderer, scene, camera) {
    this.reflectorWorldPosition.setFromMatrixPosition(this.matrixWorld);
    this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
    this.rotationMatrix.extractRotation(this.matrixWorld);
    this.normal.set(0, 0, 1).applyMatrix4(this.rotationMatrix);
    this.view.subVectors(this.reflectorWorldPosition, this.cameraWorldPosition);
    if (this.view.dot(this.normal) > 0) return; // behind the mirror

    this.view.reflect(this.normal).negate().add(this.reflectorWorldPosition);
    this.rotationMatrix.extractRotation(camera.matrixWorld);
    this.lookAtPosition.set(0, 0, -1).applyMatrix4(this.rotationMatrix).add(this.cameraWorldPosition);
    this.target.subVectors(this.reflectorWorldPosition, this.lookAtPosition);
    this.target.reflect(this.normal).negate().add(this.reflectorWorldPosition);

    this.virtualCamera.position.copy(this.view);
    this.virtualCamera.up.set(0, 1, 0).applyMatrix4(this.rotationMatrix).reflect(this.normal);
    this.virtualCamera.lookAt(this.target);
    this.virtualCamera.far = camera.far;
    this.virtualCamera.updateMatrixWorld();
    this.virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

    this.textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    this.textureMatrix.multiply(this.virtualCamera.projectionMatrix);
    this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse);
    this.textureMatrix.multiply(this.matrixWorld);

    this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal, this.reflectorWorldPosition);
    this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse);
    this.clipPlane.set(
      this.reflectorPlane.normal.x,
      this.reflectorPlane.normal.y,
      this.reflectorPlane.normal.z,
      this.reflectorPlane.constant,
    );

    const p = this.virtualCamera.projectionMatrix;
    this.q.x = (Math.sign(this.clipPlane.x) + p.elements[8]) / p.elements[0];
    this.q.y = (Math.sign(this.clipPlane.y) + p.elements[9]) / p.elements[5];
    this.q.z = -1;
    this.q.w = (1 + p.elements[10]) / p.elements[14];
    this.clipPlane.multiplyScalar(2 / this.clipPlane.dot(this.q));
    p.elements[2] = this.clipPlane.x;
    p.elements[6] = this.clipPlane.y;
    p.elements[10] = this.clipPlane.z + 1 - this.clipBias;
    p.elements[14] = this.clipPlane.w;

    const prevRT = renderer.getRenderTarget();
    const prevXr = renderer.xr.enabled;
    const prevShadow = renderer.shadowMap.autoUpdate;
    renderer.xr.enabled = false;
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(this.renderTarget);
    renderer.state.buffers.depth.setMask(true);
    if (renderer.autoClear === false) renderer.clear();
    renderer.render(scene, this.virtualCamera);
    renderer.xr.enabled = prevXr;
    renderer.shadowMap.autoUpdate = prevShadow;
    renderer.setRenderTarget(prevRT);
  }
}

// Floor material o1 (RawShaderMaterial) — projected reflection distorted by the
// floor normal map + a Fresnel term. Verbatim shaders.
function makeFloorMaterial(reflector, normalMap) {
  return new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    defines: { USE_NORMALMAP: "", DITHERING: "" },
    blending: THREE.NoBlending,
    vertexShader: floorVert,
    fragmentShader: floorFrag,
    uniforms: {
      tReflect: { value: reflector.renderTarget.texture },
      uMatrix: { value: reflector.textureMatrix },
      uMapTransform: { value: new THREE.Matrix3() },
      uColor: { value: new THREE.Color("#4a4a4a") },
      uReflectivity: { value: 0.97 },
      uMirror: { value: 1 },
      uFloorMixStrength: { value: 15 },
      uNormalDistortionStrength: { value: 2.5 },
      tNormalMap: { value: normalMap },
      uNormalScale: { value: new THREE.Vector2(1, 1) },
    },
  });
}

export class ReflectiveFloor extends THREE.Group {
  constructor(normalMap, atZ = 0) {
    super();
    if (normalMap) {
      normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
      normalMap.repeat.set(45, 45);
      normalMap.updateMatrix();
    }
    this.reflector = new Reflector({ width: 1024, height: 1024 });

    const geo = new THREE.CircleGeometry(60, 48);
    this.material = makeFloorMaterial(this.reflector, normalMap);
    if (normalMap) this.material.uniforms.uMapTransform.value.copy(normalMap.matrix);

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.add(this.reflector); // reflector plane = floor plane
    this.mesh.onBeforeRender = (renderer, scene, camera) => {
      this.mesh.visible = false;
      this.reflector.update(renderer, scene, camera);
      this.mesh.visible = true;
    };
    this.add(this.mesh);
    this.position.set(0, -1.65, atZ);
  }

  resize(w, h) {
    this.reflector.setSize(w, h);
  }
}
