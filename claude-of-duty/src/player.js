// player.js — first-person controller: pointer-lock mouse look, WASD movement
// with acceleration, sprint, crouch, jump/gravity, headbob, and capsule
// collision against the world. Health lives here too.
import * as THREE from 'three';

const PI2 = Math.PI / 2;

export class Player {
  constructor(camera, world, audio) {
    this.camera = camera;
    this.world = world;
    this.audio = audio;

    this.pos = new THREE.Vector3(0, 0, 22);   // feet position
    this.vel = new THREE.Vector3();
    this.yaw = 0;   // yaw 0 looks toward -z, i.e. into the arena
    this.pitch = 0;

    this.radius = 0.4;
    this.standHeight = 1.7;
    this.crouchHeight = 1.0;
    this.eyeHeight = this.standHeight;
    this.onGround = true;

    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.regenDelay = 5;      // seconds after last damage
    this.lastDamage = -999;
    this.dead = false;

    this.keys = {};
    this.sensitivity = 0.0022;
    this.bob = 0;
    this._stepAccum = 0;

    this.speedWalk = 5.2;
    this.speedSprint = 8.6;
    this.speedCrouch = 2.6;
    this.sprinting = false;
    this.crouching = false;

    // recoil kick applied by the weapon (radians), decays each frame
    this.recoilPitch = 0;
    this.recoilYaw = 0;
  }

  onKey(e, down) {
    const k = e.code;
    this.keys[k] = down;
    if (down && k === 'KeyR' && this.onReload) this.onReload();
  }

  onMouse(dx, dy) {
    this.yaw -= dx * this.sensitivity;
    this.pitch -= dy * this.sensitivity;
    this.pitch = Math.max(-PI2 + 0.05, Math.min(PI2 - 0.05, this.pitch));
  }

  addRecoil(pitch, yaw) { this.recoilPitch += pitch; this.recoilYaw += yaw; }

  damage(amount) {
    if (this.dead) return;
    this.health -= amount;
    this.lastDamage = this._time || 0;
    this.audio.playerHurt();
    if (this.health <= 0) { this.health = 0; this.dead = true; }
  }

  get forwardDir() {
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
  }

  update(dt, time) {
    this._time = time;
    if (this.dead) return;

    // crouch / sprint state
    this.crouching = !!this.keys['ControlLeft'] || !!this.keys['KeyC'];
    const wantSprint = !!this.keys['ShiftLeft'] && !this.crouching;
    const targetEye = this.crouching ? this.crouchHeight : this.standHeight;
    this.eyeHeight += (targetEye - this.eyeHeight) * Math.min(1, dt * 12);

    // desired movement in local space
    let mx = 0, mz = 0;
    if (this.keys['KeyW']) mz += 1;
    if (this.keys['KeyS']) mz -= 1;
    if (this.keys['KeyA']) mx -= 1;
    if (this.keys['KeyD']) mx += 1;
    const moving = (mx || mz);
    this.sprinting = wantSprint && mz > 0;

    const fwd = this.forwardDir;
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x); // perpendicular
    const wish = new THREE.Vector3()
      .addScaledVector(fwd, mz)
      .addScaledVector(right, mx);
    if (wish.lengthSq() > 0) wish.normalize();

    let speed = this.speedWalk;
    if (this.crouching) speed = this.speedCrouch;
    else if (this.sprinting) speed = this.speedSprint;

    // horizontal acceleration toward wish velocity
    const accel = this.onGround ? 55 : 12;
    const targetVel = wish.multiplyScalar(speed);
    this.vel.x += (targetVel.x - this.vel.x) * Math.min(1, accel * dt / 12);
    this.vel.z += (targetVel.z - this.vel.z) * Math.min(1, accel * dt / 12);

    // friction when no input
    if (!moving && this.onGround) {
      const damp = Math.max(0, 1 - dt * 10);
      this.vel.x *= damp; this.vel.z *= damp;
    }

    // jump + gravity
    if (this.keys['Space'] && this.onGround) {
      this.vel.y = 6.4; this.onGround = false;
    }
    this.vel.y -= 20 * dt;

    // integrate
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    this.pos.y += this.vel.y * dt;

    if (this.pos.y <= 0) { this.pos.y = 0; this.vel.y = 0; this.onGround = true; }

    // collide horizontally
    this.world.resolve(this.pos, this.radius);

    // headbob + footsteps
    const horizSpeed = Math.hypot(this.vel.x, this.vel.z);
    if (this.onGround && horizSpeed > 0.5) {
      this.bob += dt * horizSpeed * 1.5;
      this._stepAccum += horizSpeed * dt;
      const stepLen = this.sprinting ? 3.4 : 4.2;
      if (this._stepAccum > stepLen) { this._stepAccum = 0; this.audio.footstep(); }
    } else {
      this.bob += dt * 2;
    }
    const bobAmt = this.sprinting ? 0.09 : 0.05;
    const bobY = Math.sin(this.bob * 2) * bobAmt * Math.min(1, horizSpeed / 3);
    const bobX = Math.cos(this.bob) * bobAmt * 0.5 * Math.min(1, horizSpeed / 3);

    // recoil decay
    this.recoilPitch *= Math.max(0, 1 - dt * 8);
    this.recoilYaw *= Math.max(0, 1 - dt * 8);

    // health regen
    if (time - this.lastDamage > this.regenDelay && this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + dt * 12);
    }

    // apply to camera
    this.camera.position.set(this.pos.x + bobX, this.pos.y + this.eyeHeight + bobY, this.pos.z);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw + this.recoilYaw;
    this.camera.rotation.x = this.pitch + this.recoilPitch;
  }

  reset() {
    this.pos.set(0, 0, 22);
    this.vel.set(0, 0, 0);
    this.yaw = 0; this.pitch = 0;
    this.health = this.maxHealth; this.dead = false;
    this.recoilPitch = this.recoilYaw = 0;
  }
}
