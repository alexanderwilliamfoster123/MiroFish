// game.js — top-level orchestrator. Owns the renderer/scene/camera, wires the
// subsystems (world, player, weapon, enemies, fx, audio, hud), runs the fixed
// game loop, resolves bullet hits, and drives the wave / score / win-loss
// state machine.
import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { Weapon } from './weapons.js';
import { FX } from './fx.js';
import { EnemyManager } from './enemies.js';
import { AudioEngine } from './audio.js';
import { HUD } from './hud.js';

const BASE_FOV = 75;

export class Game {
  constructor(container) {
    this.container = container;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(BASE_FOV, window.innerWidth / window.innerHeight, 0.05, 600);
    this.scene.add(this.camera);

    this.audio = new AudioEngine();
    this.hud = new HUD();
    this.fx = new FX(this.scene);
    this.world = new World(this.scene, this.renderer);
    this.player = new Player(this.camera, this.world, this.audio);
    this.weapon = new Weapon(this.camera, this.player, this.audio, this.fx);
    this.enemies = new EnemyManager(this.scene, this.world, this.audio, this.fx);

    this.state = 'menu';    // menu | playing | paused | dead | won
    this.time = 0;
    this.score = 0;
    this.wave = 0;
    this.totalWaves = 8;
    this.betweenWaves = false;
    this.nextWaveAt = 0;
    this.kills = 0;
    this.headshots = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;

    this._bindWeaponHits();
    this._bindPlayerReload();
    this._bindInput();

    window.addEventListener('resize', () => this._onResize());

    // prewarm shaders by rendering one hidden frame
    this.renderer.compile(this.scene, this.camera);
    this.renderer.render(this.scene, this.camera);

    this._raf = null;
    this._last = performance.now();
  }

  _bindWeaponHits() {
    this.weapon.onShoot = (origin, dir, damage, range, muzzlePos) => {
      this.shotsFired++;
      // enemy hit
      const eHit = this.enemies.raycast(origin, dir, range);
      // world hit
      let wallT = range;
      const wHit = this._raycastWorld(origin, dir, range);
      if (wHit) wallT = wHit.t;

      if (eHit && eHit.t <= wallT) {
        this.shotsHit++;
        const dmg = eHit.head ? damage * 2.4 : damage;
        this.hud.hitMarker();
        this.audio.hitConfirm();
        const killed = eHit.enemy.hurt(dmg, eHit.head, dir);
        this.fx.tracer(muzzlePos, eHit.point);
        if (killed) {
          this.kills++;
          if (eHit.head) this.headshots++;
          const pts = (eHit.head ? 150 : 100) + this.wave * 10;
          this.score += pts;
          this.hud.kill('HOSTILE', eHit.head);
          this.hud.setScore(this.score);
        }
      } else if (wHit) {
        this.fx.tracer(muzzlePos, wHit.point);
        this.fx.impact(wHit.point, wHit.normal, 'wall');
        this.audio.impact(origin.distanceTo(wHit.point));
      } else {
        // shot into the sky
        const end = origin.clone().addScaledVector(dir, range);
        this.fx.tracer(muzzlePos, end);
      }
    };
  }

  _bindPlayerReload() {
    this.player.onReload = () => { if (this.state === 'playing') this.weapon.startReload(this.time); };
  }

  // ray vs world colliders + ground, returns {t, point, normal}
  _raycastWorld(origin, dir, maxT) {
    let best = null;
    for (const c of this.world.colliders) {
      const r = this._rayBox(origin, dir, c, maxT);
      if (r && (best === null || r.t < best.t)) best = r;
    }
    // ground plane y=0
    if (dir.y < -1e-4) {
      const t = -origin.y / dir.y;
      if (t > 0 && t < maxT && (best === null || t < best.t)) {
        best = { t, point: origin.clone().addScaledVector(dir, t), normal: new THREE.Vector3(0, 1, 0) };
      }
    }
    return best;
  }

  _rayBox(o, d, box, maxT) {
    let tmin = 0, tmax = maxT, nAxis = 'x', nSign = 1;
    for (const ax of ['x', 'y', 'z']) {
      const inv = 1 / (d[ax] || 1e-9);
      let t1 = (box.min[ax] - o[ax]) * inv;
      let t2 = (box.max[ax] - o[ax]) * inv;
      let sign = -1;
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; sign = 1; }
      if (t1 > tmin) { tmin = t1; nAxis = ax; nSign = sign; }
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
    if (tmin <= 0) return null;
    const normal = new THREE.Vector3();
    normal[nAxis] = nSign;
    return { t: tmin, point: o.clone().addScaledVector(d, tmin), normal };
  }

  // ---- input --------------------------------------------------------

  _bindInput() {
    const canvas = this.renderer.domElement;

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') return;
      if (['Space', 'Tab'].includes(e.code)) e.preventDefault();
      if (this.state !== 'playing') return;
      this.player.onKey(e, true);
      if (e.code === 'Digit1') this._switch('rifle');
      else if (e.code === 'Digit2') this._switch('smg');
      else if (e.code === 'Digit3') this._switch('pistol');
    });
    document.addEventListener('keyup', (e) => { this.player.onKey(e, false); });

    document.addEventListener('mousemove', (e) => {
      if (this.state === 'playing' && document.pointerLockElement === canvas) {
        this.player.onMouse(e.movementX || 0, e.movementY || 0);
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (this.state !== 'playing') return;
      if (e.button === 0) this.weapon.setTrigger(true);
      if (e.button === 2) this.weapon.setAds(true);
    });
    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.weapon.setTrigger(false);
      if (e.button === 2) this.weapon.setAds(false);
    });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => {
      if (this.state !== 'playing') return;
      this.weapon.cycle(e.deltaY > 0 ? 1 : -1);
      this.weapon.setTrigger(false);
    });

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== canvas && this.state === 'playing') {
        this.pause();
      }
    });
  }

  _switch(key) {
    this.weapon.switchTo(key);
    this.weapon.setTrigger(false);
  }

  requestLock() { this.renderer.domElement.requestPointerLock(); }

  // ---- flow ---------------------------------------------------------

  start() {
    this.audio.init(); this.audio.resume();
    this.state = 'playing';
    this.hud.hideOverlay();
    this.requestLock();
    if (this.wave === 0) this._startWave(1);
    if (!this._raf) this._loop();
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.weapon.setTrigger(false); this.weapon.setAds(false);
    this.hud.showOverlay(`
      <h1>PAUSED</h1>
      <div class="tag">Deployment on hold</div>
      <div class="stat">Wave <b>${this.wave}</b> · Score <b>${this.score.toLocaleString()}</b></div>
      <p>Click resume to re-lock your mouse and get back in the fight.</p>
      <button class="play" data-act="resume">RESUME</button>
    `);
  }

  resume() {
    this.state = 'playing';
    this.hud.hideOverlay();
    this.audio.resume();
    this.requestLock();
  }

  _startWave(n) {
    this.wave = n;
    this.betweenWaves = false;
    const tier = Math.floor((n - 1) / 2);
    const count = 3 + n + Math.floor(n / 2);
    this.enemies.spawnWave(count, tier);
    this.hud.setWave(n);
    this.hud.setEnemiesLeft(this.enemies.alive);
    this.hud.banner('WAVE ' + n, n === this.totalWaves ? 'FINAL ASSAULT' : count + ' HOSTILES INBOUND');
    this.audio.waveStart();
  }

  _waveCleared() {
    if (this.wave >= this.totalWaves) { this._win(); return; }
    this.betweenWaves = true;
    this.nextWaveAt = this.time + 5;
    this.weapon.refillReserve();
    this.hud.banner('WAVE ' + this.wave + ' CLEARED', 'Resupplied · next wave in 5s');
  }

  _win() {
    this.state = 'won';
    document.exitPointerLock();
    this.audio.victory();
    const acc = this.shotsFired ? Math.round(this.shotsHit / this.shotsFired * 100) : 0;
    this.hud.showOverlay(`
      <h1>MISSION COMPLETE</h1>
      <div class="tag">All waves repelled</div>
      <div class="stat">Final score <b>${this.score.toLocaleString()}</b></div>
      <div class="stat">Eliminations <b>${this.kills}</b> · Headshots <b>${this.headshots}</b></div>
      <div class="stat">Accuracy <b>${acc}%</b></div>
      <p>Outstanding work, operator.</p>
      <button class="play" data-act="restart">REDEPLOY</button>
    `);
  }

  _die() {
    this.state = 'dead';
    document.exitPointerLock();
    this.weapon.setTrigger(false);
    this.audio.gameOver();
    const acc = this.shotsFired ? Math.round(this.shotsHit / this.shotsFired * 100) : 0;
    this.hud.showOverlay(`
      <h1>YOU DIED</h1>
      <div class="tag">KIA · Wave ${this.wave}</div>
      <div class="stat">Score <b>${this.score.toLocaleString()}</b></div>
      <div class="stat">Eliminations <b>${this.kills}</b> · Headshots <b>${this.headshots}</b></div>
      <div class="stat">Accuracy <b>${acc}%</b></div>
      <button class="play" data-act="restart">REDEPLOY</button>
    `);
  }

  restart() {
    this.enemies.clear();
    this.player.reset();
    this.weapon.reset();
    this.score = 0; this.wave = 0; this.kills = 0; this.headshots = 0;
    this.shotsFired = 0; this.shotsHit = 0;
    this.hud.setScore(0);
    this.betweenWaves = false;
    this.state = 'playing';
    this.hud.hideOverlay();
    this.audio.resume();
    this.requestLock();
    this._startWave(1);
  }

  onPlayerShot = (damage, enemy) => {
    if (this.state !== 'playing') return;
    this.player.damage(damage);
    this.hud.damageFlash();
    this.hud.setHealth(this.player.health, this.player.maxHealth);
    if (this.player.dead) this._die();
  };

  // ---- loop ---------------------------------------------------------

  _loop() {
    this._raf = requestAnimationFrame(() => this._loop());
    const now = performance.now();
    let dt = (now - this._last) / 1000;
    this._last = now;
    dt = Math.min(dt, 0.05);   // clamp long frames

    if (this.state === 'playing') {
      this.time += dt;
      this.player.update(dt, this.time);
      this.weapon.update(dt, this.time);
      this.enemies.update(dt, this.time, this.player, this.onPlayerShot);
      this.fx.update(dt);

      // fov kick for ADS + sprint
      const adsFov = this.weapon.spec.adsFov;
      let targetFov = THREE.MathUtils.lerp(BASE_FOV, adsFov, this.weapon.adsAmount);
      if (this.player.sprinting) targetFov += 6;
      this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, dt * 10);
      this.camera.updateProjectionMatrix();

      // HUD
      const a = this.weapon.hudAmmo();
      this.hud.setAmmo(a.mag, a.reserve, a.name);
      this.hud.setHealth(this.player.health, this.player.maxHealth);
      this.hud.setReloadHint(this.weapon.reloading ? 'RELOADING…' : (a.mag === 0 ? 'PRESS R TO RELOAD' : ''));
      this.hud.setCompass(this.player.yaw);

      const alive = this.enemies.alive;
      this.hud.setEnemiesLeft(alive);

      // wave logic
      if (!this.betweenWaves && alive === 0 && this.enemies.list.every(e => e.dead)) {
        this._waveCleared();
      }
      if (this.betweenWaves && this.time >= this.nextWaveAt) {
        this._startWave(this.wave + 1);
      }
    } else {
      // keep fx settling and render a static frame
      this.fx.update(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
