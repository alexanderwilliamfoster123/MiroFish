// weapons.js — procedurally-generated weapon viewmodel + firing logic.
// The gun mesh is built from primitives (no models). Handles fire rate,
// full/semi auto, recoil pattern, ADS, reload timing, ammo, muzzle flash,
// and view sway/bob. Actual hit resolution is delegated to a callback so
// the game owns the enemy list.
import * as THREE from 'three';

export const WEAPONS = {
  rifle: {
    name: 'CQB RIFLE', auto: true, rpm: 720, magSize: 30, reserve: 240,
    damage: 26, spread: 0.012, adsSpread: 0.004, range: 120, reloadTime: 2.1,
    recoil: { pitch: 0.014, yaw: 0.006 }, adsFov: 55, color: 0x2a2e33,
  },
  smg: {
    name: 'MP-COMPACT', auto: true, rpm: 900, magSize: 40, reserve: 320,
    damage: 17, spread: 0.02, adsSpread: 0.009, range: 70, reloadTime: 1.7,
    recoil: { pitch: 0.010, yaw: 0.008 }, adsFov: 60, color: 0x33373d,
  },
  pistol: {
    name: 'SIDEARM', auto: false, rpm: 380, magSize: 15, reserve: 120,
    damage: 34, spread: 0.010, adsSpread: 0.003, range: 90, reloadTime: 1.4,
    recoil: { pitch: 0.02, yaw: 0.006 }, adsFov: 62, color: 0x26292e,
  },
};

export class Weapon {
  constructor(camera, player, audio, fx) {
    this.camera = camera;
    this.player = player;
    this.audio = audio;
    this.fx = fx;

    this.group = new THREE.Group();       // viewmodel parent (child of camera)
    camera.add(this.group);
    this.muzzle = new THREE.Object3D();
    this.group.add(this.muzzle);

    this.slot = ['rifle', 'smg', 'pistol'];
    this.mag = {}; this.reserve = {};
    for (const k of this.slot) { this.mag[k] = WEAPONS[k].magSize; this.reserve[k] = WEAPONS[k].reserve; }

    this.current = 'rifle';
    this.lastShot = -999;
    this.triggerDown = false;
    this.wasDown = false;
    this.reloading = false;
    this.reloadEnd = 0;
    this.ads = false;
    this.adsAmount = 0;   // 0..1

    this._muzzleLight = new THREE.PointLight(0xffd08a, 0, 12, 2);
    this.muzzle.add(this._muzzleLight);

    this._buildViewmodel();
    this.onShoot = null;   // (originVec3, dirVec3, damage) => void
  }

  get spec() { return WEAPONS[this.current]; }

  _clearViewmodel() {
    if (this._vm) { this.group.remove(this._vm); this._vm.traverse(o => { o.geometry?.dispose?.(); }); }
  }

  _buildViewmodel() {
    this._clearViewmodel();
    const spec = this.spec;
    const vm = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.55, metalness: 0.6 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.9, metalness: 0.1 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.4, metalness: 0.7 });

    const box = (w, h, d, mat, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z); vm.add(m); return m;
    };
    const cyl = (r1, r2, h, mat, x, y, z, rx = Math.PI / 2) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 12), mat);
      m.position.set(x, y, z); m.rotation.x = rx; vm.add(m); return m;
    };

    if (this.current === 'pistol') {
      box(0.10, 0.10, 0.34, bodyMat, 0, 0, -0.18);         // slide
      box(0.085, 0.22, 0.10, gripMat, 0, -0.15, 0.02).rotation.x = 0.25; // grip
      cyl(0.028, 0.028, 0.16, accentMat, 0, 0.01, -0.36);   // barrel
      this.muzzle.position.set(0, 0.01, -0.44);
    } else {
      const len = this.current === 'smg' ? 0.42 : 0.55;
      box(0.11, 0.13, 0.5, bodyMat, 0, -0.02, -0.15);        // receiver
      cyl(0.03, 0.03, len, accentMat, 0, 0.01, -0.15 - 0.25 - len / 2); // barrel
      box(0.09, 0.05, 0.16, accentMat, 0, 0.09, -0.2);       // rail/sight
      box(0.02, 0.05, 0.02, accentMat, 0, 0.13, -0.36);      // front sight post
      box(0.09, 0.22, 0.09, gripMat, 0, -0.18, 0.02).rotation.x = 0.28; // grip
      box(0.10, 0.14, 0.12, gripMat, 0, -0.12, -0.12);       // magazine
      box(0.09, 0.06, 0.2, gripMat, 0, -0.04, 0.16);         // stock
      this.muzzle.position.set(0, 0.01, -0.15 - 0.25 - len);
    }
    vm.scale.setScalar(0.82);
    this._vm = vm;
    this.group.add(vm);

    // resting (hip) transform
    this._hipPos = new THREE.Vector3(0.24, -0.26, -0.6);
    this._hipRot = new THREE.Euler(0.03, -0.06, 0);
    // aiming (ADS) transform — bring sights to center
    this._adsPos = new THREE.Vector3(0, -0.115, -0.42);
    this._adsRot = new THREE.Euler(0, 0, 0);
  }

  switchTo(key) {
    if (this.reloading || this.current === key || !WEAPONS[key]) return;
    this.current = key;
    this._buildViewmodel();
    return this.spec.name;
  }

  cycle(dir) {
    const i = this.slot.indexOf(this.current);
    const n = (i + dir + this.slot.length) % this.slot.length;
    return this.switchTo(this.slot[n]);
  }

  startReload(time) {
    const spec = this.spec;
    if (this.reloading || this.mag[this.current] >= spec.magSize || this.reserve[this.current] <= 0) return;
    this.reloading = true;
    this.reloadEnd = time + spec.reloadTime;
    this.audio.reload();
  }

  _finishReload() {
    const spec = this.spec, k = this.current;
    const need = spec.magSize - this.mag[k];
    const take = Math.min(need, this.reserve[k]);
    this.mag[k] += take; this.reserve[k] -= take;
    this.reloading = false;
  }

  setTrigger(down) { this.triggerDown = down; }
  setAds(on) { this.ads = on; }

  refillReserve() {
    for (const k of this.slot) this.reserve[k] = WEAPONS[k].reserve;
  }

  update(dt, time) {
    // reload completion
    if (this.reloading && time >= this.reloadEnd) this._finishReload();

    // ADS blend
    const adsTarget = (this.ads && !this.reloading) ? 1 : 0;
    this.adsAmount += (adsTarget - this.adsAmount) * Math.min(1, dt * 14);

    // firing
    const spec = this.spec;
    const interval = 60 / spec.rpm;
    const canShoot = !this.reloading && this.mag[this.current] > 0;
    const wantShoot = spec.auto ? this.triggerDown : (this.triggerDown && !this.wasDown);
    if (wantShoot && time - this.lastShot >= interval) {
      if (canShoot) this._fire(time);
      else if (this.mag[this.current] === 0 && !this.wasDown) {
        this.audio.dryFire();
        this.startReload(time);
      }
    }
    this.wasDown = this.triggerDown;

    // auto-reload on empty
    if (this.mag[this.current] === 0 && !this.reloading && this.reserve[this.current] > 0 && this.triggerDown) {
      this.startReload(time);
    }

    this._animate(dt, time);
  }

  _fire(time) {
    this.lastShot = time;
    this.mag[this.current]--;
    const spec = this.spec;

    // direction from camera with spread
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const spread = THREE.MathUtils.lerp(spec.spread, spec.adsSpread, this.adsAmount);
    dir.x += (Math.random() - 0.5) * spread;
    dir.y += (Math.random() - 0.5) * spread;
    dir.z += (Math.random() - 0.5) * spread;
    dir.normalize();

    const origin = new THREE.Vector3();
    this.camera.getWorldPosition(origin);

    // recoil on player camera (reduced while aiming)
    const rMul = THREE.MathUtils.lerp(1, 0.45, this.adsAmount);
    this.player.addRecoil(spec.recoil.pitch * rMul, (Math.random() - 0.5) * spec.recoil.yaw * 2 * rMul);
    this._kick = 1;

    // muzzle flash
    const mp = new THREE.Vector3();
    this.muzzle.getWorldPosition(mp);
    this._muzzleLight.intensity = 6;
    this.fx.muzzleFlash(mp, dir);

    this.audio.gunshot(0);

    if (this.onShoot) this.onShoot(origin, dir, spec.damage, spec.range, mp);
  }

  _animate(dt, time) {
    if (!this._vm) return;
    // interpolate between hip and ads
    const a = this.adsAmount;
    const pos = new THREE.Vector3().lerpVectors(this._hipPos, this._adsPos, a);
    // recoil viewmodel kick
    this._kick = (this._kick || 0) * Math.max(0, 1 - dt * 12);
    pos.z += this._kick * 0.06;
    pos.y += this._kick * 0.015;

    // sway from mouse velocity approximated by player recoil residual + bob
    const sway = Math.sin(this.player.bob) * 0.006 * (1 - a);
    const swayY = Math.cos(this.player.bob * 2) * 0.006 * (1 - a);

    this.group.position.lerp(pos, Math.min(1, dt * 18));
    this.group.position.x += sway;
    this.group.position.y += swayY;

    const rot = new THREE.Euler(
      THREE.MathUtils.lerp(this._hipRot.x, this._adsRot.x, a) + this._kick * 0.06,
      THREE.MathUtils.lerp(this._hipRot.y, this._adsRot.y, a),
      0
    );
    this.group.rotation.x += (rot.x - this.group.rotation.x) * Math.min(1, dt * 18);
    this.group.rotation.y += (rot.y - this.group.rotation.y) * Math.min(1, dt * 18);

    // muzzle light decay
    this._muzzleLight.intensity *= Math.max(0, 1 - dt * 22);
  }

  hudAmmo() { return { mag: this.mag[this.current], reserve: this.reserve[this.current], name: this.spec.name }; }

  reset() {
    for (const k of this.slot) { this.mag[k] = WEAPONS[k].magSize; this.reserve[k] = WEAPONS[k].reserve; }
    this.current = 'rifle';
    this.reloading = false; this.triggerDown = false; this.ads = false; this.adsAmount = 0;
    this._buildViewmodel();
  }
}
