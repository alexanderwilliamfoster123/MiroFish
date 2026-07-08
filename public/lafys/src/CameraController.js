import * as THREE from "three";

// Cinematic camera — ported from bundle.js class IT. A nested group rig
// (group → rotateGroup → innerGroup) is driven by the pointer and the camera
// transform is decomposed from innerGroup's world matrix each frame. This gives
//   • smooth parallax (origin + targetXY * mouse, slow lerp), with a vertical
//     dolly on z, and
//   • a banking ROLL (rotateGroup.rotation.z) that responds to horizontal mouse
//     velocity — the signature cinematic tilt.
const map = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

export class CameraController {
  constructor(camera, lookAt = new THREE.Vector3(0, 0, 0)) {
    this.camera = camera;
    this.lookAt = lookAt.clone();
    this.enabled = true;

    this.mouse = new THREE.Vector2(innerWidth / 2, innerHeight / 2);
    this.last = this.mouse.clone();
    this.delta = new THREE.Vector2();

    this.group = new THREE.Group();
    this.rotateGroup = new THREE.Group();
    this.innerGroup = new THREE.Group();
    this.rotateGroup.add(this.innerGroup);
    this.group.add(this.rotateGroup);
    this.rotateGroup.rotation.y = Math.PI;

    this.group.position.copy(camera.position);
    this.origin = camera.position.clone();
    this.target = new THREE.Vector3();
    this.targetXY = new THREE.Vector2(0.4, 0.3); // parallax amount
    this.rotation = 0;
    this.rotateAngle = THREE.MathUtils.degToRad(12); // max bank

    window.addEventListener("pointermove", (e) => {
      if (this.enabled) this.mouse.set(e.clientX, e.clientY);
    });
  }

  setOriginZ(z) {
    this.origin.z = z;
  }

  update(dt) {
    if (!this.enabled) return;
    const a = Math.min(Math.max(2 / (dt * 60 || 1), 0), 2) * 0.03;
    this.delta.subVectors(this.mouse, this.last);
    this.last.copy(this.mouse);

    const c = map(this.mouse.x, 0, innerWidth, -1, 1);
    const u = map(this.mouse.y, 0, innerHeight, 1, -1);
    this.target.x = this.origin.x + this.targetXY.x * c;
    this.target.y = this.origin.y + this.targetXY.y * u;
    this.target.z = this.origin.z + this.targetXY.y * (u * 1.25);
    this.group.position.lerp(this.target, a);
    this.group.lookAt(this.lookAt);

    const d = map(Math.abs(this.delta.x) / innerWidth, 0, 0.02, 0, 0.5);
    this.rotation += (this.rotateAngle * d * Math.sign(this.delta.x) - this.rotation) * a;
    this.rotateGroup.rotation.z += (this.rotation - this.rotateGroup.rotation.z) * a;

    this.group.updateMatrixWorld(true);
    this.innerGroup.matrixWorld.decompose(this.camera.position, this.camera.quaternion, this.camera.scale);
  }
}
