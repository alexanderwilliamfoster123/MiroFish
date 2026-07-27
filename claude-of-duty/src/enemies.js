// enemies.js — procedural humanoid soldiers with a small behavior FSM
// (seek → engage → reposition), steering around obstacles, line-of-sight
// gated hitscan fire, animated walk cycle, per-part hitboxes (headshots),
// and a lightweight topple "ragdoll" on death.
import * as THREE from 'three';

let EID = 0;

const PALETTES = [
  { body: 0x3b4a3a, gear: 0x232b22, skin: 0xb98a63 },
  { body: 0x4a4335, gear: 0x2b2820, skin: 0xa9764f },
  { body: 0x39424a, gear: 0x22282b, skin: 0xc49a72 },
];

export class Enemy {
  constructor(scene, world, audio, fx, spawn, tier = 0) {
    this.scene = scene; this.world = world; this.audio = audio; this.fx = fx;
    this.id = ++EID;
    this.tier = tier;

    this.maxHealth = 60 + tier * 25;
    this.health = this.maxHealth;
    this.speed = 3.0 + tier * 0.5 + Math.random() * 0.6;
    this.damage = 7 + tier * 2;
    this.fireInterval = Math.max(0.28, 0.75 - tier * 0.08);
    this.accuracy = 0.55 + tier * 0.08;   // chance a shot connects when in LOS
    this.range = 45;
    this.optimalRange = 14 + Math.random() * 8;

    this.pos = spawn.clone();
    this.vel = new THREE.Vector3();
    this.radius = 0.45;
    this.state = 'seek';
    this.lastFire = 0;
    this.dead = false;
    this.deadTime = 0;
    this.topple = 0;
    this.walkPhase = Math.random() * Math.PI * 2;
    this.repositionTarget = null;
    this.stateTimer = 0;

    this._build();
  }

  _build() {
    const pal = PALETTES[this.id % PALETTES.length];
    const g = new THREE.Group();
    this.root = g;
    const bodyMat = new THREE.MeshStandardMaterial({ color: pal.body, roughness: 0.85 });
    const gearMat = new THREE.MeshStandardMaterial({ color: pal.gear, roughness: 0.7, metalness: 0.2 });
    const skinMat = new THREE.MeshStandardMaterial({ color: pal.skin, roughness: 0.9 });
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x181a1d, roughness: 0.5, metalness: 0.6 });

    const mk = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

    // hip pivot at y=0.9
    this.hips = new THREE.Group(); this.hips.position.y = 0.92; g.add(this.hips);

    this.torso = mk(0.5, 0.62, 0.28, bodyMat); this.torso.position.y = 0.32; this.hips.add(this.torso);
    const vest = mk(0.52, 0.4, 0.3, gearMat); vest.position.y = 0.34; this.hips.add(vest);

    this.head = mk(0.24, 0.26, 0.24, skinMat); this.head.position.y = 0.78; this.hips.add(this.head);
    const helmet = mk(0.28, 0.16, 0.28, gearMat); helmet.position.y = 0.86; this.hips.add(helmet);

    // arms
    this.armL = mk(0.14, 0.5, 0.14, bodyMat); this.armL.position.set(-0.33, 0.34, 0.05);
    this.armR = mk(0.14, 0.5, 0.14, bodyMat); this.armR.position.set(0.33, 0.34, 0.05);
    this.hips.add(this.armL); this.hips.add(this.armR);

    // gun in right hand pointing forward (-z of root)
    this.gun = mk(0.08, 0.1, 0.5, gunMat); this.gun.position.set(0.3, 0.34, -0.28); this.hips.add(this.gun);

    // legs (pivot at hip)
    this.legL = new THREE.Group(); this.legL.position.set(-0.14, 0, 0);
    this.legR = new THREE.Group(); this.legR.position.set(0.14, 0, 0);
    const legMeshL = mk(0.16, 0.82, 0.16, gearMat); legMeshL.position.y = -0.45; this.legL.add(legMeshL);
    const legMeshR = mk(0.16, 0.82, 0.16, gearMat); legMeshR.position.y = -0.45; this.legR.add(legMeshR);
    this.hips.add(this.legL); this.hips.add(this.legR);

    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

    g.position.copy(this.pos);
    this.scene.add(g);

    // health bar sprite
    this._makeHealthBar();
  }

  _makeHealthBar() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 10;
    this._hbCanvas = c; this._hbCtx = c.getContext('2d');
    this._hbTex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: this._hbTex, depthTest: false, transparent: true });
    this.healthBar = new THREE.Sprite(mat);
    this.healthBar.scale.set(1.1, 0.17, 1);
    this.healthBar.position.y = 2.1;
    this.root.add(this.healthBar);
    this._drawHealthBar();
  }

  _drawHealthBar() {
    const ctx = this._hbCtx; ctx.clearRect(0, 0, 64, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, 64, 10);
    const f = Math.max(0, this.health / this.maxHealth);
    ctx.fillStyle = f > 0.5 ? '#7ee08a' : f > 0.25 ? '#ffcf4d' : '#ff5a4d';
    ctx.fillRect(1, 1, 62 * f, 8);
    this._hbTex.needsUpdate = true;
  }

  // returns hit info if the ray from o along d (len maxT) hits this enemy.
  raycastHit(o, d, maxT) {
    if (this.dead) return null;
    // two boxes: head and body, in world space
    const boxes = [
      { c: new THREE.Vector3(this.pos.x, this.pos.y + 1.7, this.pos.z), h: new THREE.Vector3(0.16, 0.16, 0.16), head: true },
      { c: new THREE.Vector3(this.pos.x, this.pos.y + 1.15, this.pos.z), h: new THREE.Vector3(0.32, 0.55, 0.24), head: false },
    ];
    let best = null;
    for (const b of boxes) {
      const t = this._rayBox(o, d, b.c, b.h, maxT);
      if (t !== null && (best === null || t < best.t)) {
        best = { t, head: b.head, point: o.clone().addScaledVector(d, t) };
      }
    }
    return best;
  }

  _rayBox(o, d, center, half, maxT) {
    let tmin = 0, tmax = maxT;
    for (const ax of ['x', 'y', 'z']) {
      const inv = 1 / (d[ax] || 1e-9);
      let t1 = (center[ax] - half[ax] - o[ax]) * inv;
      let t2 = (center[ax] + half[ax] - o[ax]) * inv;
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
      tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
    return tmin;
  }

  hurt(amount, head, dir) {
    this.health -= amount;
    this._drawHealthBar();
    const hp = new THREE.Vector3(this.pos.x, this.pos.y + (head ? 1.7 : 1.2), this.pos.z);
    this.fx.blood(hp, dir);
    if (this.health <= 0 && !this.dead) { this.die(dir); return true; }
    return false;
  }

  die(dir) {
    this.dead = true; this.deadTime = 0;
    this.fx.deathBurst(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z));
    this.healthBar.visible = false;
    this._toppleDir = Math.atan2(dir.x, dir.z);
  }

  // simple steering: head toward target, add avoidance from nearby obstacles
  _steer(target, dt) {
    const desired = new THREE.Vector3().subVectors(target, this.pos); desired.y = 0;
    const dist = desired.length();
    if (dist > 0.001) desired.normalize();

    // obstacle avoidance: sample colliders near us, push away
    const avoid = new THREE.Vector3();
    for (const c of this.world.colliders) {
      if (this.pos.y + 1.5 < c.min.y || this.pos.y > c.max.y) continue;
      const cx = Math.max(c.min.x, Math.min(this.pos.x, c.max.x));
      const cz = Math.max(c.min.z, Math.min(this.pos.z, c.max.z));
      const dx = this.pos.x - cx, dz = this.pos.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 < 9 && d2 > 1e-4) {
        const d = Math.sqrt(d2);
        avoid.x += (dx / d) * (3 - d) / 3;
        avoid.z += (dz / d) * (3 - d) / 3;
      }
    }
    desired.x += avoid.x * 1.4; desired.z += avoid.z * 1.4;
    if (desired.lengthSq() > 0) desired.normalize();

    this.vel.x += (desired.x * this.speed - this.vel.x) * Math.min(1, dt * 6);
    this.vel.z += (desired.z * this.speed - this.vel.z) * Math.min(1, dt * 6);
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    this.world.resolve(this.pos, this.radius);
    return dist;
  }

  update(dt, time, player, onShootPlayer) {
    if (this.dead) return this._updateDead(dt);

    const toPlayer = new THREE.Vector3().subVectors(player.pos, this.pos);
    const dist = Math.hypot(toPlayer.x, toPlayer.z);

    // line of sight check from chest to player's eye
    const eyeFrom = new THREE.Vector3(this.pos.x, this.pos.y + 1.4, this.pos.z);
    const eyeTo = new THREE.Vector3(player.pos.x, player.pos.y + player.eyeHeight * 0.8, player.pos.z);
    const hasLOS = dist < this.range && !this.world.segmentBlocked(eyeFrom, eyeTo);

    this.stateTimer -= dt;

    // decide state
    if (hasLOS && dist < this.range) {
      if (dist > this.optimalRange + 4) this.state = 'seek';
      else this.state = 'engage';
    } else {
      this.state = 'seek';
    }

    let moved = 0;
    if (this.state === 'engage') {
      // strafe/hold near optimal range
      if (dist < this.optimalRange - 3) {
        // back off a little
        const away = new THREE.Vector3(this.pos.x - toPlayer.x, this.pos.y, this.pos.z - toPlayer.z);
        moved = this._steer(away, dt) > 0 ? 1 : 0;
      } else if (dist > this.optimalRange + 2) {
        moved = this._steer(player.pos, dt) > 0.1 ? 1 : 0;
      } else {
        // hold; gentle strafe
        this.vel.multiplyScalar(Math.max(0, 1 - dt * 8));
      }
      // fire
      if (time - this.lastFire > this.fireInterval) {
        this.lastFire = time;
        this._fireAt(player, dist, onShootPlayer);
      }
    } else {
      moved = this._steer(player.pos, dt) > 0.1 ? 1 : 0;
    }

    // face player (or movement dir)
    const faceAng = Math.atan2(toPlayer.x, toPlayer.z);
    this.root.rotation.y = faceAng;
    this.root.position.copy(this.pos);

    // animate walk
    const spd = Math.hypot(this.vel.x, this.vel.z);
    if (spd > 0.3) {
      this.walkPhase += dt * spd * 2.2;
      const sw = Math.sin(this.walkPhase) * 0.6;
      this.legL.rotation.x = sw; this.legR.rotation.x = -sw;
      this.armL.rotation.x = -sw * 0.5; this.armR.rotation.x = sw * 0.3;
      this.hips.position.y = 0.92 + Math.abs(Math.sin(this.walkPhase)) * 0.04;
    } else {
      this.legL.rotation.x *= 0.85; this.legR.rotation.x *= 0.85;
      this.armL.rotation.x *= 0.85;
    }

    // billboard health bar toward camera handled by Sprite automatically
  }

  _fireAt(player, dist, onShootPlayer) {
    // muzzle flash at gun
    const mp = new THREE.Vector3(); this.gun.getWorldPosition(mp);
    const dir = new THREE.Vector3().subVectors(player.pos, this.pos).normalize();
    this.fx.muzzleFlash(mp, dir);
    this.audio.enemyFire(dist);
    // tracer toward player
    const target = new THREE.Vector3(player.pos.x, player.pos.y + 1.2, player.pos.z);
    this.fx.tracer(mp, target);
    // hit resolution: accuracy falls with distance
    const hitChance = this.accuracy * Math.max(0.2, 1 - dist / this.range);
    if (Math.random() < hitChance) onShootPlayer(this.damage, this);
  }

  _updateDead(dt) {
    this.deadTime += dt;
    // topple over
    this.topple = Math.min(Math.PI / 2, this.topple + dt * 4);
    this.root.rotation.z = 0;
    this.hips.rotation.x = this.topple * 0.4;
    this.root.position.y = Math.max(0, this.pos.y - this.topple * 0.3);
    // fade out then flag for removal
    if (this.deadTime > 4) {
      this._fade = (this._fade ?? 1) - dt;
      this.root.traverse(o => { if (o.isMesh) { o.material.transparent = true; o.material.opacity = Math.max(0, this._fade); } });
      if (this._fade <= 0) this.remove = true;
    }
  }

  dispose() {
    this.scene.remove(this.root);
    this.root.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
    this._hbTex.dispose();
  }
}

export class EnemyManager {
  constructor(scene, world, audio, fx) {
    this.scene = scene; this.world = world; this.audio = audio; this.fx = fx;
    this.list = [];
  }

  spawnWave(count, tier) {
    for (let i = 0; i < count; i++) {
      const sp = this.world.spawnPoints[(i + Math.floor(Math.random() * this.world.spawnPoints.length)) % this.world.spawnPoints.length].clone();
      sp.x += (Math.random() - 0.5) * 6; sp.z += (Math.random() - 0.5) * 6;
      this.list.push(new Enemy(this.scene, this.world, this.audio, this.fx, sp, tier));
    }
  }

  get alive() { return this.list.filter(e => !e.dead).length; }

  update(dt, time, player, onShootPlayer) {
    for (const e of this.list) e.update(dt, time, player, onShootPlayer);
    // cull removed
    for (let i = this.list.length - 1; i >= 0; i--) {
      if (this.list[i].remove) { this.list[i].dispose(); this.list.splice(i, 1); }
    }
  }

  // returns closest enemy hit by ray, or null
  raycast(origin, dir, maxT) {
    let best = null;
    for (const e of this.list) {
      const hit = e.raycastHit(origin, dir, maxT);
      if (hit && (best === null || hit.t < best.t)) best = { ...hit, enemy: e };
    }
    return best;
  }

  clear() {
    for (const e of this.list) e.dispose();
    this.list = [];
  }
}
