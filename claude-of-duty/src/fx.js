// fx.js — GPU-lite particle & effect pool. Tracers, muzzle flashes, impact
// sparks, blood bursts, bullet-hole decals and death debris. All pooled and
// updated each frame; no textures (soft round sprite generated once).
import * as THREE from 'three';

function sprite() {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export class FX {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.sprite = sprite();

    // particle pool via Points
    this.MAX = opts.max || 2000;
    this.pos = new Float32Array(this.MAX * 3);
    this.col = new Float32Array(this.MAX * 3);
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    const mat = new THREE.PointsMaterial({
      size: opts.pointSize || 0.18, map: this.sprite, vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.p = new Array(this.MAX).fill(null).map(() => ({ life: 0, vx: 0, vy: 0, vz: 0, grav: 0 }));
    this._orig = new Float32Array(this.MAX * 3);   // original (pre-fade) colors
    this.head = 0;

    // tracers as line segments pool
    this.tracers = [];
    this.tracerMat = new THREE.LineBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.9 });

    // decals
    this.decals = [];
    this.decalMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
    this.decalGeo = new THREE.CircleGeometry(0.08, 8);
  }

  _spawn(x, y, z, vx, vy, vz, r, g, b, life, grav) {
    const i = this.head; this.head = (this.head + 1) % this.MAX;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.col[i * 3] = r; this.col[i * 3 + 1] = g; this.col[i * 3 + 2] = b;
    this._orig[i * 3] = r; this._orig[i * 3 + 1] = g; this._orig[i * 3 + 2] = b;
    const pp = this.p[i]; pp.life = life; pp.maxLife = life; pp.vx = vx; pp.vy = vy; pp.vz = vz; pp.grav = grav;
  }

  muzzleFlash(pos, dir) {
    for (let i = 0; i < 10; i++) {
      const s = 6 + Math.random() * 6;
      this._spawn(pos.x, pos.y, pos.z,
        dir.x * s + (Math.random() - 0.5) * 3,
        dir.y * s + (Math.random() - 0.5) * 3,
        dir.z * s + (Math.random() - 0.5) * 3,
        1.0, 0.8, 0.35, 0.06 + Math.random() * 0.05, 0);
    }
  }

  tracer(from, to) {
    const geo = new THREE.BufferGeometry().setFromPoints([from.clone(), to.clone()]);
    const line = new THREE.Line(geo, this.tracerMat.clone());
    this.scene.add(line);
    this.tracers.push({ line, life: 0.06 });
  }

  impact(pos, normal, kind = 'wall') {
    const n = normal || new THREE.Vector3(0, 1, 0);
    const base = kind === 'wall' ? [1, 0.8, 0.5] : [0.9, 0.9, 0.9];
    for (let i = 0; i < 14; i++) {
      const sp = 3 + Math.random() * 5;
      this._spawn(pos.x, pos.y, pos.z,
        (n.x + (Math.random() - 0.5) * 1.5) * sp,
        (n.y + Math.random() * 1.2) * sp,
        (n.z + (Math.random() - 0.5) * 1.5) * sp,
        base[0], base[1], base[2], 0.35 + Math.random() * 0.25, 14);
    }
    if (kind === 'wall') this._decal(pos, n);
  }

  blood(pos, dir) {
    for (let i = 0; i < 20; i++) {
      const sp = 2 + Math.random() * 6;
      this._spawn(pos.x, pos.y, pos.z,
        dir.x * sp + (Math.random() - 0.5) * 4,
        (Math.random() * 3) + 1,
        dir.z * sp + (Math.random() - 0.5) * 4,
        0.6, 0.05, 0.05, 0.5 + Math.random() * 0.3, 10);
    }
  }

  // large mid-air explosion — fireball + sparks (scale for aircraft kills)
  explosion(pos, scale = 1) {
    const n = Math.floor(40 * scale);
    for (let i = 0; i < n; i++) {
      const sp = (4 + Math.random() * 22) * scale;
      const a = Math.random() * Math.PI * 2, e = (Math.random() - 0.5) * Math.PI;
      const dx = Math.cos(a) * Math.cos(e), dy = Math.sin(e), dz = Math.sin(a) * Math.cos(e);
      const hot = Math.random();
      const r = 1.0, g = 0.4 + hot * 0.5, b = hot * 0.2;
      this._spawn(pos.x, pos.y, pos.z, dx * sp, dy * sp + 2, dz * sp,
        r, g, b, 0.5 + Math.random() * 0.7, 6 * scale);
    }
    // dark smoke puffs (low, slow)
    for (let i = 0; i < Math.floor(14 * scale); i++) {
      const sp = (1 + Math.random() * 6) * scale;
      const a = Math.random() * Math.PI * 2;
      this._spawn(pos.x, pos.y, pos.z, Math.cos(a) * sp, Math.random() * 4, Math.sin(a) * sp,
        0.12, 0.1, 0.09, 1.2 + Math.random() * 0.8, 2);
    }
  }

  // small smoke/heat puff for missile & contrail trails
  trailPuff(pos, r = 0.8, g = 0.8, b = 0.85, life = 0.6) {
    this._spawn(pos.x, pos.y, pos.z, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5,
      r, g, b, life, 0.5);
  }

  deathBurst(pos) {
    for (let i = 0; i < 30; i++) {
      const sp = 2 + Math.random() * 7;
      const a = Math.random() * Math.PI * 2, up = Math.random() * 4 + 1;
      this._spawn(pos.x, pos.y + 0.8, pos.z,
        Math.cos(a) * sp, up, Math.sin(a) * sp,
        0.5, 0.06, 0.06, 0.7 + Math.random() * 0.4, 12);
    }
  }

  _decal(pos, normal) {
    const m = new THREE.Mesh(this.decalGeo, this.decalMat);
    m.position.copy(pos).addScaledVector(normal, 0.02);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    m.quaternion.copy(q);
    this.scene.add(m);
    this.decals.push(m);
    if (this.decals.length > 80) { const old = this.decals.shift(); this.scene.remove(old); }
  }

  update(dt) {
    // particles
    for (let i = 0; i < this.MAX; i++) {
      const pp = this.p[i];
      if (pp.life <= 0) { this.col[i * 3] = this.col[i * 3 + 1] = this.col[i * 3 + 2] = 0; continue; }
      pp.life -= dt;
      const k = i * 3;
      pp.vy -= pp.grav * dt;
      this.pos[k] += pp.vx * dt; this.pos[k + 1] += pp.vy * dt; this.pos[k + 2] += pp.vz * dt;
      const f = Math.max(0, pp.life / pp.maxLife);
      // encode fade by scaling color (additive → darker = fades)
      this.col[k] = this._orig[k] * f; this.col[k + 1] = this._orig[k + 1] * f; this.col[k + 2] = this._orig[k + 2] * f;
      if (this.pos[k + 1] < 0) { this.pos[k + 1] = 0; pp.vy *= -0.3; pp.vx *= 0.6; pp.vz *= 0.6; }
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.color.needsUpdate = true;

    // tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i]; t.life -= dt;
      t.line.material.opacity = Math.max(0, t.life / 0.06) * 0.9;
      if (t.life <= 0) { this.scene.remove(t.line); t.line.geometry.dispose(); t.line.material.dispose(); this.tracers.splice(i, 1); }
    }
  }
}
