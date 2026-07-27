// flight.js — Flight Combat mode. A jet dogfighting game sharing the renderer
// with the on-foot mode. Everything is procedural: atmospheric sky, a shading
// ocean with sun glint, billboard cloudscape, islands, an aircraft carrier, a
// detailed fighter jet, heat-seeking missiles with lock-on, enemy dogfight AI,
// and a full canvas-drawn HUD (pitch ladder, tapes, radar, target boxes).
import * as THREE from 'three';
import { FX } from './fx.js';

const DEG = Math.PI / 180;
const SEA_LEVEL = 0;

// ----------------------------------------------------------------------
// procedural textures / helpers
// ----------------------------------------------------------------------

function cloudTexture() {
  const s = 128, c = document.createElement('canvas'); c.width = c.height = s;
  const ctx = c.getContext('2d');
  // soft lumpy puff: several overlapping radial blobs
  ctx.clearRect(0, 0, s, s);
  for (let i = 0; i < 10; i++) {
    const x = s / 2 + (Math.random() - 0.5) * s * 0.5;
    const y = s / 2 + (Math.random() - 0.5) * s * 0.4;
    const r = s * (0.18 + Math.random() * 0.22);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ----------------------------------------------------------------------
// Missile
// ----------------------------------------------------------------------

class Missile {
  constructor(scene, fx, audio, pos, dir, target, friendly) {
    this.scene = scene; this.fx = fx; this.audio = audio;
    this.pos = pos.clone();
    this.vel = dir.clone().normalize().multiplyScalar(180);
    this.target = target;         // Aircraft or null
    this.friendly = friendly;     // fired by player?
    this.life = 6.0;
    this.dead = false;
    this.turnRate = 2.6;          // rad/s max steering
    this.speed = 320;
    this._trailAcc = 0;

    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5, metalness: 0.4 }));
    body.rotation.x = Math.PI / 2; g.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x333333 }));
    nose.rotation.x = Math.PI / 2; nose.position.z = -1.5; g.add(nose);
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
      fin.position.z = 1.0; fin.rotation.z = i * Math.PI / 2; fin.position.x = Math.cos(i * Math.PI / 2) * 0.3; fin.position.y = Math.sin(i * Math.PI / 2) * 0.3;
      g.add(fin);
    }
    this.thrust = new THREE.PointLight(0xff9040, 3, 20, 2);
    this.thrust.position.z = 1.4; g.add(this.thrust);
    scene.add(g);
    this.mesh = g;
  }

  update(dt, decoys) {
    if (this.dead) return;
    this.life -= dt;
    if (this.life <= 0) { this.detonate(false); return; }

    // seek target (or nearest decoy flare it might be spoofed by)
    let seek = this.target;
    // flares can decoy: if a decoy is close to line of sight, chance to lock it
    if (decoys && decoys.length && Math.random() < 0.04) {
      for (const d of decoys) {
        if (d.pos.distanceTo(this.pos) < 220) { this._spoofed = d; break; }
      }
    }
    const aim = this._spoofed && this._spoofed.life > 0 ? this._spoofed.pos
      : (seek && !seek.dead ? seek.aimPoint() : null);

    if (aim) {
      const desired = new THREE.Vector3().subVectors(aim, this.pos).normalize();
      const cur = this.vel.clone().normalize();
      const angle = cur.angleTo(desired);
      const maxTurn = this.turnRate * dt;
      const t = angle > 1e-4 ? Math.min(1, maxTurn / angle) : 1;
      cur.lerp(desired, t).normalize();
      this.vel.copy(cur.multiplyScalar(this.speed));
    }

    this.pos.addScaledVector(this.vel, dt);
    this.mesh.position.copy(this.pos);
    this.mesh.lookAt(this.pos.clone().add(this.vel));

    // smoke trail
    this._trailAcc += dt;
    if (this._trailAcc > 0.02) { this._trailAcc = 0; this.fx.trailPuff(this.pos, 0.7, 0.7, 0.75, 0.7); }

    // proximity detonation
    if (seek && !seek.dead) {
      const d = this.pos.distanceTo(seek.pos);
      if (d < 22) { seek.damage(70, this.pos); this.detonate(true); return; }
    }
    if (this.pos.y <= SEA_LEVEL + 1) this.detonate(false);
  }

  detonate(hit) {
    if (this.dead) return;
    this.dead = true;
    this.fx.explosion(this.pos, 0.7);
    this.audio.explosion(this._distToCam || 40);
    this.scene.remove(this.mesh);
    this.mesh.traverse(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
  }
}

// small countermeasure flare
class Flare {
  constructor(scene, fx, pos, vel) {
    this.pos = pos.clone(); this.vel = vel.clone(); this.life = 3.5; this.fx = fx;
    this.light = new THREE.PointLight(0xffd060, 4, 30, 2);
    scene.add(this.light); this.scene = scene;
  }
  update(dt) {
    this.life -= dt;
    this.vel.multiplyScalar(0.98); this.vel.y -= 6 * dt;
    this.pos.addScaledVector(this.vel, dt);
    this.light.position.copy(this.pos);
    this.light.intensity = 4 * Math.max(0, this.life / 3.5);
    this.fx.trailPuff(this.pos, 1.0, 0.7, 0.2, 0.4);
    if (this.life <= 0) { this.scene.remove(this.light); this.dead = true; }
  }
}

// ----------------------------------------------------------------------
// Aircraft (player and enemy)
// ----------------------------------------------------------------------

class Aircraft {
  constructor(scene, fx, audio, opts = {}) {
    this.scene = scene; this.fx = fx; this.audio = audio;
    this.ai = !!opts.ai;
    this.pos = (opts.pos || new THREE.Vector3(0, 400, 0)).clone();
    this.quat = new THREE.Quaternion();
    if (opts.heading !== undefined) this.quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), opts.heading);
    this.speed = 160;
    this.throttle = 0.6;
    this.maxHealth = opts.ai ? 100 : 120;
    this.health = this.maxHealth;
    this.dead = false;
    this.afterburner = false;

    // control rates (rad/s)
    this.pitchRate = 1.5; this.rollRate = 2.6; this.yawRate = 0.5;
    this.inputPitch = 0; this.inputRoll = 0; this.inputYaw = 0;

    this.gunCooldown = 0;
    this.missileCooldown = 0;
    this.gForce = 1;
    this._prevVel = new THREE.Vector3();

    this._build(opts.color || (opts.ai ? 0x8a2a2a : 0x3a4656));
  }

  _build(color) {
    const g = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.4 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1c2026, roughness: 0.6, metalness: 0.3 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.7 });

    // fuselage (tapered) — built along -Z (forward)
    const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 9, 12), skin);
    fus.rotation.x = Math.PI / 2; g.add(fus);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3, 12), skin);
    nose.rotation.x = -Math.PI / 2; nose.position.z = -6; g.add(nose);

    // canopy
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), glass);
    canopy.scale.set(1, 0.7, 2.2); canopy.position.set(0, 0.5, -1.5); g.add(canopy);

    // main wings (swept delta)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0); wingShape.lineTo(6, -2.2); wingShape.lineTo(6, -3.0); wingShape.lineTo(0.4, -1.2); wingShape.lineTo(0, -1.2); wingShape.lineTo(0, 0);
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.15, bevelEnabled: false });
    const wingL = new THREE.Mesh(wingGeo, skin); wingL.rotation.x = -Math.PI / 2; wingL.position.set(0.3, 0, 0.5); g.add(wingL);
    const wingR = new THREE.Mesh(wingGeo, skin); wingR.rotation.x = -Math.PI / 2; wingR.scale.x = -1; wingR.position.set(-0.3, 0, 0.5); g.add(wingR);

    // tail fins (twin)
    const tailGeo = new THREE.BoxGeometry(0.1, 1.6, 2);
    const tL = new THREE.Mesh(tailGeo, skin); tL.position.set(0.7, 0.7, 3.5); tL.rotation.z = -0.2; g.add(tL);
    const tR = new THREE.Mesh(tailGeo, skin); tR.position.set(-0.7, 0.7, 3.5); tR.rotation.z = 0.2; g.add(tR);
    // horizontal stabilizers
    const hs = new THREE.Mesh(new THREE.BoxGeometry(4, 0.12, 1.4), skin); hs.position.set(0, 0, 3.8); g.add(hs);

    // engine nozzle + afterburner flame
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.4, 1, 12), dark);
    noz.rotation.x = Math.PI / 2; noz.position.z = 4.4; g.add(noz);
    this.flame = new THREE.Mesh(new THREE.ConeGeometry(0.4, 3, 12),
      new THREE.MeshBasicMaterial({ color: 0x66aaff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.flame.rotation.x = -Math.PI / 2; this.flame.position.z = 6; g.add(this.flame);
    this.abLight = new THREE.PointLight(0x66aaff, 0, 30, 2); this.abLight.position.z = 6; g.add(this.abLight);

    g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
    g.position.copy(this.pos); g.quaternion.copy(this.quat);
    this.scene.add(g);
    this.mesh = g;
  }

  forward() { return new THREE.Vector3(0, 0, -1).applyQuaternion(this.quat); }
  up() { return new THREE.Vector3(0, 1, 0).applyQuaternion(this.quat); }
  right() { return new THREE.Vector3(1, 0, 0).applyQuaternion(this.quat); }
  aimPoint() { return this.pos.clone(); }

  applyControls(dt) {
    // pitch about local X, roll about local Z, rudder yaw about local Y
    const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.inputPitch * this.pitchRate * dt);
    const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -this.inputRoll * this.rollRate * dt);
    const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.inputYaw * this.yawRate * dt);
    this.quat.multiply(qPitch).multiply(qRoll).multiply(qYaw);

    // coordinated turn: banking induces a yaw about WORLD up proportional to
    // bank angle and speed — this is what makes turns feel like real flight.
    const up = this.up();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = this.right();
    const bank = Math.atan2(right.y, up.y); // how banked we are
    const turn = -bank * 1.1 * Math.min(1.4, this.speed / 160);
    const qTurn = new THREE.Quaternion().setFromAxisAngle(worldUp, turn * dt);
    this.quat.premultiply(qTurn);
    this.quat.normalize();
  }

  update(dt, world) {
    if (this.dead) { this._updateDead(dt); return; }
    this.applyControls(dt);

    // speed toward throttle target; afterburner boosts
    const minS = 70, maxS = this.afterburner ? 420 : 300;
    const target = minS + this.throttle * (maxS - minS);
    const accel = this.afterburner ? 90 : 45;
    this.speed += Math.sign(target - this.speed) * Math.min(Math.abs(target - this.speed), accel * dt);

    const fwd = this.forward();
    const vel = fwd.clone().multiplyScalar(this.speed);
    // gravity sag increases as speed drops below level-flight minimum (stall)
    const stall = 120;
    const sag = Math.max(0, (stall - this.speed) / stall) * 40;
    vel.y -= sag;
    this.pos.addScaledVector(vel, dt);

    // G-force estimate from velocity change (for HUD)
    const dv = vel.clone().sub(this._prevVel);
    this.gForce = 1 + dv.length() / (dt * 90 + 1e-3);
    this._prevVel.copy(vel);

    // ground/water collision
    if (this.pos.y <= SEA_LEVEL + 2) {
      this.pos.y = SEA_LEVEL + 2;
      if (!this.dead) this.crash();
    }
    // soft ceiling
    if (this.pos.y > 4000) this.pos.y = 4000;

    // afterburner visuals
    const abOn = this.afterburner || this.throttle > 0.85;
    const targetOp = this.afterburner ? 0.9 : (this.throttle > 0.5 ? 0.35 : 0.12);
    this.flame.material.opacity += (targetOp - this.flame.material.opacity) * Math.min(1, dt * 10);
    const len = this.afterburner ? 2.2 : 1.0;
    this.flame.scale.z = len + Math.random() * 0.3;
    this.abLight.intensity = this.afterburner ? 6 : 1.5;
    this.flame.material.color.setHex(this.afterburner ? 0x88bbff : 0xff8844);
    this.abLight.color.setHex(this.afterburner ? 0x88bbff : 0xff8844);

    this.mesh.position.copy(this.pos);
    this.mesh.quaternion.copy(this.quat);

    if (this.gunCooldown > 0) this.gunCooldown -= dt;
    if (this.missileCooldown > 0) this.missileCooldown -= dt;
  }

  fireGun(muzzleColor) {
    if (this.gunCooldown > 0 || this.dead) return null;
    this.gunCooldown = 0.07;
    const fwd = this.forward();
    const muzzle = this.pos.clone().addScaledVector(fwd, 7);
    // slight spread
    const dir = fwd.clone();
    dir.x += (Math.random() - 0.5) * 0.01; dir.y += (Math.random() - 0.5) * 0.01;
    dir.normalize();
    const end = muzzle.clone().addScaledVector(dir, 1200);
    this.fx.tracer(muzzle, end);
    this.audio.cannon();
    return { origin: muzzle, dir, end };
  }

  damage(amount, from) {
    if (this.dead) return;
    this.health -= amount;
    this.fx.explosion(this.pos.clone(), 0.25);
    if (this.health <= 0) this.explode();
  }

  crash() { this.explode(); }

  explode() {
    if (this.dead) return;
    this.dead = true; this._deadT = 0;
    this.fx.explosion(this.pos.clone(), 2.2);
    this.audio.explosion(this._distToCam || 30);
    this.flame.material.opacity = 0; this.abLight.intensity = 0;
  }

  _updateDead(dt) {
    this._deadT += dt;
    // spin & fall
    this.quat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0.3, 0.2, 1), dt * 3));
    this.pos.y -= (30 + this._deadT * 20) * dt;
    this.pos.addScaledVector(this.forward(), 40 * dt);
    this.fx.trailPuff(this.pos, 0.15, 0.13, 0.12, 1.2);
    this.mesh.position.copy(this.pos); this.mesh.quaternion.copy(this.quat);
    if (this.pos.y <= SEA_LEVEL + 2) {
      this.fx.explosion(this.pos.clone(), 1.5);
      this.remove = true;
    }
    if (this._deadT > 4) this.remove = true;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  }
}

// ----------------------------------------------------------------------
// FlightGame
// ----------------------------------------------------------------------

export class FlightGame {
  constructor(container, renderer, audio) {
    this.container = container;
    this.renderer = renderer;
    this.audio = audio;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.5, 20000);
    this.scene.add(this.camera);

    this.fx = new FX(this.scene, { pointSize: 7, max: 4000 });

    this.state = 'menu';
    this.time = 0;
    this.score = 0;
    this.wave = 0;
    this.totalWaves = 6;
    this.kills = 0;
    this.betweenWaves = false;
    this.nextWaveAt = 0;

    this.enemies = [];
    this.missiles = [];
    this.flares = [];
    this.decoys = [];   // flares that can spoof missiles

    this.keys = {};
    this.mouseX = 0; this.mouseY = 0;   // virtual stick, decays to center
    this.cockpit = false;

    // lock-on
    this.lockTarget = null;
    this.lockProgress = 0;
    this._lockBeepAcc = 0;
    this.missileWarn = false;

    this._buildWorld();
    this._buildHUD();
    this._bindInput();

    this._camPos = new THREE.Vector3();
    this._resizeHandler = () => this._onResize();
    window.addEventListener('resize', this._resizeHandler);

    this.renderer.compile(this.scene, this.camera);
  }

  // ---- world -----------------------------------------------------

  _buildWorld() {
    const scene = this.scene;
    this.sunDir = new THREE.Vector3(0.4, 0.35, 0.5).normalize();

    // atmospheric sky dome
    const skyGeo = new THREE.SphereGeometry(16000, 32, 20);
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { sunDir: { value: this.sunDir.clone() } },
      vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `,
      fragmentShader: `
        varying vec3 vD; uniform vec3 sunDir;
        void main(){
          vec3 d = normalize(vD);
          float h = clamp(d.y*0.5+0.5, 0.0, 1.0);
          vec3 zenith = vec3(0.15, 0.35, 0.72);
          vec3 horizon = vec3(0.72, 0.82, 0.92);
          vec3 col = mix(horizon, zenith, pow(h, 0.8));
          // sun disk + glow
          float s = max(dot(d, normalize(sunDir)), 0.0);
          col += vec3(1.0,0.9,0.7) * pow(s, 220.0) * 2.0;
          col += vec3(1.0,0.8,0.55) * pow(s, 6.0) * 0.35;
          // ground haze below horizon
          col = mix(col, vec3(0.6,0.68,0.75), smoothstep(0.0,-0.15,d.y));
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    this.sky = new THREE.Mesh(skyGeo, this.skyMat); scene.add(this.sky);

    scene.fog = new THREE.Fog(0xbcd0e0, 3000, 15000);

    // lights
    const sun = new THREE.DirectionalLight(0xfff2d8, 2.4);
    sun.position.copy(this.sunDir).multiplyScalar(1000);
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0xbfe0ff, 0x33506a, 0.7));

    // ocean — big plane with animated shader (sun glint + fresnel + swell)
    const oceanGeo = new THREE.PlaneGeometry(40000, 40000, 200, 200);
    this.oceanMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunDir: { value: this.sunDir.clone() },
        camPos: { value: new THREE.Vector3() },
        deep: { value: new THREE.Color(0x0a2a44) },
        shallow: { value: new THREE.Color(0x1a6a88) },
        fogColor: { value: new THREE.Color(0xbcd0e0) },
        fogNear: { value: 3000 }, fogFar: { value: 15000 },
      },
      vertexShader: `
        uniform float time; varying vec3 vW; varying vec3 vN;
        // small swell from summed sines
        float wave(vec2 p){
          return sin(p.x*0.004 + time*0.6)*3.0 + cos(p.y*0.003 - time*0.5)*3.0
               + sin((p.x+p.y)*0.008 + time)*1.2;
        }
        void main(){
          vec3 pos = position;
          vec4 wp = modelMatrix * vec4(pos,1.0);
          float h = wave(wp.xz);
          wp.y += h;
          // normal via finite differences
          float e = 6.0;
          float hx = wave(wp.xz + vec2(e,0.0));
          float hz = wave(wp.xz + vec2(0.0,e));
          vN = normalize(vec3(h-hx, e, h-hz));
          vW = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        varying vec3 vW; varying vec3 vN;
        uniform vec3 sunDir; uniform vec3 camPos; uniform vec3 deep; uniform vec3 shallow;
        uniform vec3 fogColor; uniform float fogNear; uniform float fogFar;
        void main(){
          vec3 N = normalize(vN);
          vec3 V = normalize(camPos - vW);
          vec3 L = normalize(sunDir);
          float fres = pow(1.0 - max(dot(N,V),0.0), 3.0);
          vec3 water = mix(deep, shallow, clamp(N.y*0.5+0.3,0.0,1.0));
          vec3 col = mix(water, vec3(0.6,0.72,0.85), fres*0.6);
          // sun specular glint
          vec3 H = normalize(L+V);
          float spec = pow(max(dot(N,H),0.0), 200.0);
          col += vec3(1.0,0.95,0.8) * spec * 2.0;
          float dist = length(camPos - vW);
          float fog = clamp((dist - fogNear)/(fogFar-fogNear), 0.0, 1.0);
          col = mix(col, fogColor, fog);
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    this.ocean = new THREE.Mesh(oceanGeo, this.oceanMat);
    this.ocean.rotation.x = -Math.PI / 2;
    scene.add(this.ocean);

    // cloudscape — scattered billboard puffs at a couple of altitudes
    const cloudTex = cloudTexture();
    const cloudMat = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.85, depthWrite: false, fog: true });
    this.clouds = [];
    for (let i = 0; i < 260; i++) {
      const s = new THREE.Sprite(cloudMat.clone());
      const r = 2000 + Math.random() * 9000, a = Math.random() * Math.PI * 2;
      s.position.set(Math.cos(a) * r, 500 + Math.random() * 1600, Math.sin(a) * r);
      const sc = 300 + Math.random() * 700; s.scale.set(sc, sc * 0.6, 1);
      s.material.opacity = 0.5 + Math.random() * 0.4;
      scene.add(s); this.clouds.push(s);
    }

    // islands — low hills with beach/green/rock coloring
    this._buildIslands();

    // aircraft carrier landmark
    this._buildCarrier(new THREE.Vector3(0, 0, 300));

    // player
    this.player = new Aircraft(this.scene, this.fx, this.audio, { pos: new THREE.Vector3(0, 500, 900), heading: Math.PI });
  }

  _buildIslands() {
    const rng = () => Math.random();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rng() * 0.6;
      const dist = 2500 + rng() * 5000;
      const cx = Math.cos(a) * dist, cz = Math.sin(a) * dist;
      const radius = 400 + rng() * 700;
      const geo = new THREE.ConeGeometry(radius, 120 + rng() * 260, 24, 4);
      // vertex color by height
      const colors = [];
      const posAttr = geo.attributes.position;
      const c1 = new THREE.Color(0xd8c89a), c2 = new THREE.Color(0x3f7a3a), c3 = new THREE.Color(0x6b6b66);
      for (let v = 0; v < posAttr.count; v++) {
        const y = posAttr.getY(v);
        const h = (y + geo.parameters.height / 2) / geo.parameters.height;
        const col = h < 0.12 ? c1 : (h < 0.7 ? c2 : c3);
        // add some noise
        colors.push(col.r, col.g, col.b);
        // jitter for irregular shape
        posAttr.setX(v, posAttr.getX(v) + (Math.random() - 0.5) * radius * 0.15);
        posAttr.setZ(v, posAttr.getZ(v) + (Math.random() - 0.5) * radius * 0.15);
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
      mesh.position.set(cx, 20, cz);
      this.scene.add(mesh);
    }
  }

  _buildCarrier(pos) {
    const g = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(60, 16, 300),
      new THREE.MeshStandardMaterial({ color: 0x2c2f33, roughness: 0.8 }));
    hull.position.y = 4; g.add(hull);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(70, 2, 310),
      new THREE.MeshStandardMaterial({ color: 0x33363a, roughness: 0.9 }));
    deck.position.y = 12; g.add(deck);
    // runway stripes
    for (let z = -140; z < 140; z += 20) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
      s.position.set(0, 13.2, z); g.add(s);
    }
    // island superstructure
    const isle = new THREE.Mesh(new THREE.BoxGeometry(12, 20, 40),
      new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.8 }));
    isle.position.set(28, 22, 20); g.add(isle);
    g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    g.position.copy(pos); this.scene.add(g);
    this.carrier = g;
  }

  // ---- HUD (2D canvas overlay) -----------------------------------

  _buildHUD() {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:10;';
    this.container.appendChild(c);
    this.hudCanvas = c;
    this.hctx = c.getContext('2d');
    this._sizeHUD();
  }
  _sizeHUD() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.hudCanvas.width = window.innerWidth * dpr;
    this.hudCanvas.height = window.innerHeight * dpr;
    this.hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _setBanner(main, sub) { this._banner = { main, sub, until: this.time + 2.6 }; }

  // ---- input -----------------------------------------------------

  _bindInput() {
    this._onKeyDown = (e) => {
      if (this.state !== 'playing') return;
      this.keys[e.code] = true;
      if (e.code === 'KeyV') this.cockpit = !this.cockpit;
      if (['Space'].includes(e.code)) e.preventDefault();
    };
    this._onKeyUp = (e) => { this.keys[e.code] = false; };
    this._onMouseMove = (e) => {
      if (this.state === 'playing' && document.pointerLockElement === this.renderer.domElement) {
        this.mouseX = Math.max(-1, Math.min(1, this.mouseX + (e.movementX || 0) * 0.006));
        this.mouseY = Math.max(-1, Math.min(1, this.mouseY + (e.movementY || 0) * 0.006));
      }
    };
    this._onMouseDown = (e) => {
      if (this.state !== 'playing') return;
      if (e.button === 0) this.firing = true;
      if (e.button === 2) this._launchMissile();
    };
    this._onMouseUp = (e) => { if (e.button === 0) this.firing = false; };
    this._onCtx = (e) => e.preventDefault();
    this._onPLC = () => {
      if (document.pointerLockElement !== this.renderer.domElement && this.state === 'playing') this.pause();
    };

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('contextmenu', this._onCtx);
    document.addEventListener('pointerlockchange', this._onPLC);
  }

  requestLock() { this.renderer.domElement.requestPointerLock(); }

  // ---- flow ------------------------------------------------------

  start() {
    this.audio.init(); this.audio.resume(); this.audio.startEngine();
    this.state = 'playing';
    this.requestLock();
    if (this.wave === 0) this._startWave(1);
    if (!this._raf) { this._last = performance.now(); this._loop(); }
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.firing = false;
    if (this.onPause) this.onPause();
  }
  resume() { this.state = 'playing'; this.audio.resume(); this.requestLock(); }

  _startWave(n) {
    this.wave = n; this.betweenWaves = false;
    const count = 2 + n;
    const center = this.player ? this.player.pos : new THREE.Vector3(0, 600, 0);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, r = 1500 + Math.random() * 1500;
      const pos = new THREE.Vector3(center.x + Math.cos(a) * r, THREE.MathUtils.clamp(center.y + (Math.random() - 0.3) * 600, 350, 2200), center.z + Math.sin(a) * r);
      const e = new Aircraft(this.scene, this.fx, this.audio, { ai: true, pos, heading: Math.random() * Math.PI * 2, color: 0x7a2a2a });
      e.aiState = 'pursue'; e.aiTimer = 0;
      this.enemies.push(e);
    }
    this._setBanner('WAVE ' + n, n === this.totalWaves ? 'ACE SQUADRON' : count + ' BANDITS');
    this.audio.waveStart();
  }

  aliveEnemies() { return this.enemies.filter(e => !e.dead).length; }

  _launchMissile() {
    if (this.player.missileCooldown > 0 || this.missileCount <= 0) return;
    this.missileCount--;
    this.player.missileCooldown = 0.8;
    const fwd = this.player.forward();
    const start = this.player.pos.clone().addScaledVector(fwd, 4).addScaledVector(this.player.up(), -1);
    const tgt = (this.lockProgress >= 1 && this.lockTarget && !this.lockTarget.dead) ? this.lockTarget : null;
    this.missiles.push(new Missile(this.scene, this.fx, this.audio, start, fwd, tgt, true));
    this.audio.missileLaunch();
  }

  _deployFlares() {
    if (this.flareCount <= 0 || this._flareCooldown > 0) return;
    this.flareCount--; this._flareCooldown = 0.6;
    for (let i = 0; i < 4; i++) {
      const v = this.player.forward().multiplyScalar(-40);
      v.x += (Math.random() - 0.5) * 40; v.y += (Math.random() - 0.5) * 40; v.z += (Math.random() - 0.5) * 40;
      const f = new Flare(this.scene, this.fx, this.player.pos.clone(), v);
      this.flares.push(f); this.decoys.push({ pos: f.pos, life: f.life, _f: f });
    }
  }

  // ---- enemy AI --------------------------------------------------

  _updateEnemyAI(e, dt) {
    if (e.dead) return;
    const toPlayer = new THREE.Vector3().subVectors(this.player.pos, e.pos);
    const dist = toPlayer.length();
    const fwd = e.forward();
    const dirToPlayer = toPlayer.clone().normalize();
    const ahead = fwd.dot(dirToPlayer); // 1 = player dead ahead

    // steer toward player using local error → pitch/roll inputs
    const localDir = dirToPlayer.clone().applyQuaternion(e.quat.clone().invert());
    // localDir in aircraft space: x=right, y=up, z=back(-forward)
    e.inputPitch = THREE.MathUtils.clamp(-localDir.y * 2.5, -1, 1);
    e.inputRoll = THREE.MathUtils.clamp(localDir.x * 2.5, -1, 1);
    e.inputYaw = THREE.MathUtils.clamp(localDir.x * 0.5, -1, 1);

    // throttle: close distance but don't overshoot
    e.throttle = dist > 800 ? 1.0 : 0.55;
    e.afterburner = dist > 1400;

    // avoid the sea
    if (e.pos.y < 250) { e.inputPitch = -1; }

    // fire gun when aligned & close
    if (ahead > 0.985 && dist < 700 && dist > 40) {
      const shot = e.fireGun();
      if (shot) {
        // hitscan vs player
        const hit = this._rayHitsAircraft(shot.origin, shot.dir, 1200, this.player);
        if (hit && Math.random() < 0.5) this.player.damage(4, e.pos);
      }
    }
    // occasionally launch a missile at the player
    e.aiTimer -= dt;
    if (ahead > 0.9 && dist < 1600 && e.aiTimer <= 0 && e.missileCooldown <= 0) {
      e.aiTimer = 6 + Math.random() * 6; e.missileCooldown = 5;
      const m = new Missile(this.scene, this.fx, this.audio, e.pos.clone().addScaledVector(fwd, 5), fwd, this.player, false);
      this.missiles.push(m); this.audio.missileLaunch();
    }
  }

  _rayHitsAircraft(o, d, maxT, ac) {
    if (!ac || ac.dead) return false;
    // sphere test around aircraft (radius ~6)
    const oc = new THREE.Vector3().subVectors(o, ac.pos);
    const b = oc.dot(d);
    const c = oc.dot(oc) - 36;
    const disc = b * b - c;
    if (disc < 0) return false;
    const t = -b - Math.sqrt(disc);
    return t > 0 && t < maxT;
  }

  // ---- player controls each frame --------------------------------

  _updatePlayerInput(dt) {
    const p = this.player;
    // mouse virtual stick controls pitch (Y) and roll (X); auto-centers slowly
    p.inputPitch = -this.mouseY;
    p.inputRoll = this.mouseX;
    // rudder + keyboard fallback
    p.inputYaw = (this.keys['KeyE'] ? 1 : 0) - (this.keys['KeyA'] && this.keys['ShiftLeft'] ? 0 : 0) - (this.keys['KeyQ'] ? 1 : 0);
    if (this.keys['ArrowUp']) p.inputPitch = -1;
    if (this.keys['ArrowDown']) p.inputPitch = 1;
    if (this.keys['ArrowLeft']) p.inputRoll = -1;
    if (this.keys['ArrowRight']) p.inputRoll = 1;
    // decay virtual stick toward center for a self-leveling feel
    this.mouseX *= Math.max(0, 1 - dt * 2.2);
    this.mouseY *= Math.max(0, 1 - dt * 2.2);

    // throttle
    if (this.keys['KeyW']) p.throttle = Math.min(1, p.throttle + dt * 0.6);
    if (this.keys['KeyS']) p.throttle = Math.max(0, p.throttle - dt * 0.6);
    p.afterburner = !!this.keys['ShiftLeft'] && p.throttle > 0.6;

    // flares
    if (this._flareCooldown > 0) this._flareCooldown -= dt;
    if (this.keys['KeyX']) this._deployFlares();

    // guns
    if (this.firing || this.keys['Space']) {
      const shot = p.fireGun();
      if (shot) {
        for (const e of this.enemies) {
          if (this._rayHitsAircraft(shot.origin, shot.dir, 1200, e)) {
            e.damage(9, p.pos);
            if (e.dead) this._onKill(e);
            break;
          }
        }
      }
    }
  }

  _onKill(e) {
    this.kills++;
    this.score += 500 + this.wave * 50;
    if (this.onKill) this.onKill();
  }

  // ---- lock-on ---------------------------------------------------

  _updateLock(dt) {
    // find best enemy within forward cone
    const fwd = this.player.forward();
    let best = null, bestDot = 0.94;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const to = new THREE.Vector3().subVectors(e.pos, this.player.pos);
      const dist = to.length();
      if (dist > 3500) continue;
      const dot = fwd.dot(to.normalize());
      if (dot > bestDot) { bestDot = dot; best = e; }
    }
    if (best && best === this.lockTarget) {
      this.lockProgress = Math.min(1, this.lockProgress + dt / 1.3);
    } else {
      this.lockTarget = best;
      this.lockProgress = best ? 0.05 : 0;
    }
    // lock beeping
    if (this.lockTarget) {
      this._lockBeepAcc -= dt;
      const interval = this.lockProgress >= 1 ? 0.12 : 0.4;
      if (this._lockBeepAcc <= 0) { this._lockBeepAcc = interval; this.audio.lockTone(this.lockProgress >= 1); }
    }
  }

  // ---- camera ----------------------------------------------------

  _updateCamera(dt) {
    const p = this.player;
    if (this.cockpit) {
      const eye = p.pos.clone().addScaledVector(p.forward(), -0.5).addScaledVector(p.up(), 0.6);
      this.camera.position.copy(eye);
      const look = eye.clone().addScaledVector(p.forward(), 100);
      this.camera.up.copy(p.up());
      this.camera.lookAt(look);
    } else {
      const back = p.forward().clone().multiplyScalar(-26);
      const up = p.up().clone().multiplyScalar(8);
      const desired = p.pos.clone().add(back).add(up);
      // smooth follow (snap to place on the very first frame)
      if (!this._camInit) { this._camPos.copy(desired); this._camInit = true; }
      else this._camPos.lerp(desired, Math.min(1, dt * 6));
      this.camera.position.copy(this._camPos);
      const look = p.pos.clone().addScaledVector(p.forward(), 40);
      this.camera.up.copy(p.up().lerp(new THREE.Vector3(0, 1, 0), 0.3));
      this.camera.lookAt(look);
    }
    // speed FOV
    const targetFov = 68 + (p.afterburner ? 12 : 0) + Math.min(10, p.speed / 40);
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, dt * 4);
    this.camera.updateProjectionMatrix();
  }

  // ---- main loop -------------------------------------------------

  _loop() {
    this._raf = requestAnimationFrame(() => this._loop());
    const now = performance.now();
    let dt = (now - this._last) / 1000; this._last = now;
    dt = Math.min(dt, 0.05);

    if (this.state === 'playing') {
      this.time += dt;
      this.oceanMat.uniforms.time.value = this.time;
      this.oceanMat.uniforms.camPos.value.copy(this.camera.position);
      // keep sky & ocean centered on player so world feels endless
      this.sky.position.copy(this.player.pos);
      this.ocean.position.x = this.player.pos.x; this.ocean.position.z = this.player.pos.z;

      this._updatePlayerInput(dt);
      this.player._distToCam = 0;
      this.player.update(dt, null);
      if (this.player.dead && this.player.remove) { /* handled in death check */ }

      this._updateLock(dt);

      // enemies
      this.missileWarn = false;
      for (const e of this.enemies) {
        if (!e.dead) this._updateEnemyAI(e, dt);
        e._distToCam = e.pos.distanceTo(this.camera.position);
        e.update(dt, null);
      }
      // missiles
      for (const m of this.missiles) {
        m._distToCam = m.pos.distanceTo(this.camera.position);
        m.update(dt, this.decoys);
        if (!m.friendly && !m.dead && m.pos.distanceTo(this.player.pos) < 400) this.missileWarn = true;
      }
      // flares / decoys
      for (const f of this.flares) f.update(dt);
      this.flares = this.flares.filter(f => !f.dead);
      this.decoys = this.decoys.filter(d => d._f && !d._f.dead);
      for (const d of this.decoys) { d.pos = d._f.pos; d.life = d._f.life; }

      if (this.missileWarn) { this._warnAcc = (this._warnAcc || 0) - dt; if (this._warnAcc <= 0) { this._warnAcc = 0.4; this.audio.warn(); } }

      this.missiles = this.missiles.filter(m => !m.dead);
      // cull dead enemies
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        if (this.enemies[i].remove) { this.enemies[i].dispose(); this.enemies.splice(i, 1); }
      }

      this.fx.update(dt);
      this.audio.setEngine(this.player.throttle + (this.player.afterburner ? 0.3 : 0), this.player.speed);

      this._updateCamera(dt);

      // wave logic
      if (!this.betweenWaves && this.aliveEnemies() === 0 && this.enemies.every(e => e.dead)) {
        if (this.wave >= this.totalWaves) this._win();
        else { this.betweenWaves = true; this.nextWaveAt = this.time + 5; this.missileCount = Math.min(6, this.missileCount + 3); this.flareCount = Math.min(12, this.flareCount + 4); this._setBanner('WAVE ' + this.wave + ' CLEARED', 'Rearmed · next wave 5s'); }
      }
      if (this.betweenWaves && this.time >= this.nextWaveAt) this._startWave(this.wave + 1);

      // death check
      if (this.player.dead && this.state === 'playing') this._die();

      this._drawHUD();
    } else {
      this.fx.update(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }

  _win() {
    this.state = 'won'; document.exitPointerLock(); this.audio.stopEngine(); this.audio.victory();
    if (this.onEnd) this.onEnd(true);
  }
  _die() {
    this.state = 'dead'; document.exitPointerLock(); this.audio.stopEngine(); this.audio.gameOver();
    if (this.onEnd) this.onEnd(false);
  }

  // ---- HUD drawing ----------------------------------------------

  _worldToScreen(v) {
    const p = v.clone().project(this.camera);
    return { x: (p.x * 0.5 + 0.5) * window.innerWidth, y: (-p.y * 0.5 + 0.5) * window.innerHeight, behind: p.z > 1 || p.z < -1 ? false : (v.clone().sub(this.camera.position).dot(this.camera.getWorldDirection(new THREE.Vector3())) < 0) };
  }

  _drawHUD() {
    const ctx = this.hctx, W = window.innerWidth, H = window.innerHeight;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    const green = '#7CFC7C', dim = 'rgba(124,252,124,0.5)';
    ctx.strokeStyle = green; ctx.fillStyle = green; ctx.lineWidth = 1.5;
    ctx.font = '13px monospace'; ctx.textBaseline = 'middle';
    const cx = W / 2, cy = H / 2;
    const p = this.player;

    // ---- pitch ladder + horizon ----
    const fwd = p.forward();
    const pitch = Math.asin(THREE.MathUtils.clamp(fwd.y, -1, 1));
    const right = p.right();
    const roll = Math.atan2(right.y, p.up().y);
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(roll);
    const pxPerRad = H / (70 * DEG);
    // horizon
    ctx.globalAlpha = 0.9;
    for (let deg = -30; deg <= 30; deg += 10) {
      const y = (pitch - deg * DEG) * pxPerRad;
      if (Math.abs(y) > H * 0.5) continue;
      const w = deg === 0 ? 260 : 120;
      ctx.beginPath();
      if (deg === 0) { ctx.moveTo(-w, y); ctx.lineTo(-40, y); ctx.moveTo(40, y); ctx.lineTo(w, y); }
      else {
        ctx.moveTo(-w, y); ctx.lineTo(-w + 14, y + (deg > 0 ? 8 : -8));
        ctx.moveTo(-w, y); ctx.lineTo(-40, y);
        ctx.moveTo(40, y); ctx.lineTo(w, y); ctx.lineTo(w - 14, y + (deg > 0 ? 8 : -8));
      }
      ctx.stroke();
      if (deg !== 0) { ctx.fillText(Math.abs(deg), w + 6, y); ctx.fillText(Math.abs(deg), -w - 22, y); }
    }
    ctx.restore();

    // ---- center gun pipper ----
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 7); ctx.moveTo(cx - 16, cy); ctx.lineTo(cx - 8, cy);
    ctx.moveTo(cx + 8, cy); ctx.lineTo(cx + 16, cy); ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy - 8); ctx.stroke();

    // ---- flight path marker (velocity vector) ----
    const fpm = p.pos.clone().add(p.forward().multiplyScalar(200));
    const fs = this._worldToScreen(fpm);
    if (fs.behind) {
      ctx.beginPath(); ctx.arc(fs.x, fs.y, 5, 0, 7);
      ctx.moveTo(fs.x - 10, fs.y); ctx.lineTo(fs.x - 5, fs.y);
      ctx.moveTo(fs.x + 5, fs.y); ctx.lineTo(fs.x + 10, fs.y);
      ctx.moveTo(fs.x, fs.y - 5); ctx.lineTo(fs.x, fs.y - 10); ctx.stroke();
    }

    // ---- airspeed tape (left) ----
    const kias = Math.round(p.speed * 1.94); // m/s → knots-ish
    this._tape(ctx, 90, cy, kias, 'SPD', green, false);
    // ---- altitude tape (right) ----
    const alt = Math.round(p.pos.y * 3.28); // m → ft
    this._tape(ctx, W - 90, cy, alt, 'ALT', green, true);

    // ---- heading tape (top) ----
    let hdg = (Math.atan2(fwd.x, fwd.z) / DEG + 180) % 360; if (hdg < 0) hdg += 360;
    ctx.textAlign = 'center';
    ctx.strokeRect(cx - 160, 18, 320, 22);
    for (let d = -60; d <= 60; d += 15) {
      const hh = ((Math.round((hdg + d) / 15) * 15) % 360 + 360) % 360;
      const x = cx + (d - ((hdg % 15))) * (320 / 120);
      ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, 34); ctx.stroke();
      const lbl = hh === 0 ? 'N' : hh === 90 ? 'E' : hh === 180 ? 'S' : hh === 270 ? 'W' : String(hh);
      ctx.fillText(lbl, x, 27);
    }
    ctx.beginPath(); ctx.moveTo(cx, 42); ctx.lineTo(cx - 5, 48); ctx.lineTo(cx + 5, 48); ctx.closePath(); ctx.fill();
    ctx.fillText(Math.round(hdg).toString().padStart(3, '0'), cx, 58);
    ctx.textAlign = 'left';

    // ---- throttle + G + AB ----
    ctx.fillText('THR ' + Math.round(p.throttle * 100) + '%', 30, H - 90);
    ctx.fillText('G ' + p.gForce.toFixed(1), 30, H - 70);
    if (p.afterburner) { ctx.fillStyle = '#ff9a4d'; ctx.fillText('▲ AFTERBURNER', 30, H - 50); ctx.fillStyle = green; }
    ctx.fillText('MACH ' + (p.speed / 340).toFixed(2), 30, H - 110);

    // ---- weapons / health (bottom right) ----
    ctx.textAlign = 'right';
    ctx.fillText('MSL ' + this.missileCount, W - 30, H - 110);
    ctx.fillText('FLR ' + this.flareCount, W - 30, H - 90);
    const hpFrac = Math.max(0, this.player.health / this.player.maxHealth);
    ctx.fillStyle = hpFrac > 0.3 ? green : '#ff5a4d';
    ctx.fillText('HULL ' + Math.round(hpFrac * 100) + '%', W - 30, H - 70);
    ctx.strokeStyle = ctx.fillStyle; ctx.strokeRect(W - 130, H - 58, 100, 10);
    ctx.fillRect(W - 130, H - 58, 100 * hpFrac, 10);
    ctx.fillStyle = green; ctx.strokeStyle = green; ctx.textAlign = 'left';

    // ---- target boxes + lead + lock ----
    for (const e of this.enemies) {
      if (e.dead) continue;
      const s = this._worldToScreen(e.pos);
      if (!s.behind) continue;
      const locked = (e === this.lockTarget);
      ctx.strokeStyle = locked ? (this.lockProgress >= 1 ? '#ff4d4d' : '#ffd24d') : dim;
      const sz = 22;
      ctx.strokeRect(s.x - sz, s.y - sz, sz * 2, sz * 2);
      const dist = Math.round(e.pos.distanceTo(p.pos));
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillText(dist + 'm', s.x + sz + 4, s.y);
      if (locked) {
        if (this.lockProgress >= 1) { ctx.fillText('LOCK', s.x - sz, s.y - sz - 6); }
        else {
          // growing lock brackets
          const g2 = 1 - this.lockProgress; const o = sz + 14 * g2;
          ctx.beginPath();
          ctx.moveTo(s.x - o, s.y - o + 8); ctx.lineTo(s.x - o, s.y - o); ctx.lineTo(s.x - o + 8, s.y - o);
          ctx.moveTo(s.x + o, s.y - o + 8); ctx.lineTo(s.x + o, s.y - o); ctx.lineTo(s.x + o - 8, s.y - o);
          ctx.moveTo(s.x - o, s.y + o - 8); ctx.lineTo(s.x - o, s.y + o); ctx.lineTo(s.x - o + 8, s.y + o);
          ctx.moveTo(s.x + o, s.y + o - 8); ctx.lineTo(s.x + o, s.y + o); ctx.lineTo(s.x + o - 8, s.y + o);
          ctx.stroke();
        }
      }
      ctx.strokeStyle = green; ctx.fillStyle = green;
    }

    // ---- off-screen target arrow for lock target ----
    if (this.lockTarget && !this.lockTarget.dead) {
      const s = this._worldToScreen(this.lockTarget.pos);
      if (!s.behind || s.x < 0 || s.x > W || s.y < 0 || s.y > H) {
        const ang = Math.atan2(s.y - cy, s.x - cx);
        const rx = cx + Math.cos(ang) * 180, ry = cy + Math.sin(ang) * 140;
        ctx.save(); ctx.translate(rx, ry); ctx.rotate(ang);
        ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-6, -6); ctx.lineTo(-6, 6); ctx.closePath();
        ctx.fillStyle = '#ffd24d'; ctx.fill(); ctx.restore();
        ctx.fillStyle = green;
      }
    }

    // ---- radar (bottom center) ----
    this._drawRadar(ctx, cx, H - 90, 70);

    // ---- missile warning ----
    if (this.missileWarn && Math.floor(this.time * 4) % 2 === 0) {
      ctx.fillStyle = '#ff3b30'; ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center';
      ctx.fillText('⚠ MISSILE — DEPLOY FLARES [X]', cx, H - 150);
      ctx.font = '13px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = green;
    }

    // ---- score / wave (top left) ----
    ctx.font = 'bold 18px monospace';
    ctx.fillText('WAVE ' + this.wave + '/' + this.totalWaves, 30, 90);
    ctx.fillText('SCORE ' + this.score.toLocaleString(), 30, 112);
    ctx.fillText('BANDITS ' + this.aliveEnemies(), 30, 134);
    ctx.font = '13px monospace';

    // ---- wave banner ----
    if (this._banner && this.time < this._banner.until) {
      const a = Math.min(1, (this._banner.until - this.time) / 0.5);
      ctx.globalAlpha = a; ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd24d'; ctx.font = 'bold 40px monospace';
      ctx.fillText(this._banner.main, cx, H * 0.32);
      ctx.font = '16px monospace'; ctx.fillStyle = green;
      if (this._banner.sub) ctx.fillText(this._banner.sub, cx, H * 0.32 + 34);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1; ctx.font = '13px monospace';
    }

    ctx.restore();
  }

  _tape(ctx, x, cy, value, label, color, right) {
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.strokeRect(x - 45, cy - 90, 90, 180);
    ctx.textAlign = 'center';
    for (let i = -4; i <= 4; i++) {
      const v = Math.round(value / 10) * 10 - i * 10 * -1;
      const yy = cy + i * 20;
      const tickV = Math.round(value / 10) * 10 + i * 10;
      ctx.beginPath();
      if (right) { ctx.moveTo(x - 45, yy); ctx.lineTo(x - 38, yy); } else { ctx.moveTo(x + 45, yy); ctx.lineTo(x + 38, yy); }
      ctx.stroke();
      if (tickV >= 0) ctx.fillText(tickV, x, yy);
    }
    // current value box
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.strokeRect(x - 45, cy - 12, 90, 24);
    ctx.font = 'bold 16px monospace'; ctx.fillText(value, x, cy); ctx.font = '13px monospace'; ctx.lineWidth = 1.5;
    ctx.fillText(label, x, cy - 100);
    ctx.textAlign = 'left'; ctx.restore();
  }

  _drawRadar(ctx, x, y, r) {
    ctx.save();
    ctx.strokeStyle = 'rgba(124,252,124,0.6)'; ctx.fillStyle = 'rgba(0,20,0,0.35)';
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.stroke();
    // player heading up: rotate world into player frame
    const p = this.player;
    const hdg = Math.atan2(p.forward().x, p.forward().z);
    const cos = Math.cos(-hdg), sin = Math.sin(-hdg);
    const range = 4000;
    // player dot
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
    for (const e of this.enemies) {
      if (e.dead) continue;
      let dx = e.pos.x - p.pos.x, dz = e.pos.z - p.pos.z;
      // rotate so player faces up (-y on screen)
      const rx = dx * cos - dz * sin;
      const rz = dx * sin + dz * cos;
      const sx = x + (rx / range) * r;
      const sy = y + (rz / range) * r; // +z behind → below
      if (Math.hypot(sx - x, sy - y) > r) continue;
      ctx.fillStyle = e === this.lockTarget ? '#ff4d4d' : '#ffd24d';
      ctx.beginPath(); ctx.arc(sx, sy, 3, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this._sizeHUD();
  }

  restart() {
    // clear entities
    for (const e of this.enemies) e.dispose();
    for (const m of this.missiles) { this.scene.remove(m.mesh); }
    for (const f of this.flares) this.scene.remove(f.light);
    this.enemies = []; this.missiles = []; this.flares = []; this.decoys = [];
    this.player.dispose();
    this.player = new Aircraft(this.scene, this.fx, this.audio, { pos: new THREE.Vector3(0, 500, 900), heading: Math.PI });
    this.score = 0; this.wave = 0; this.kills = 0; this.betweenWaves = false;
    this.missileCount = 6; this.flareCount = 12; this._flareCooldown = 0;
    this.lockTarget = null; this.lockProgress = 0;
    this.mouseX = this.mouseY = 0;
    this.state = 'playing';
    this.audio.resume(); this.audio.startEngine();
    this.requestLock();
    this._startWave(1);
  }

  // called once when mode first entered
  arm() { this.missileCount = 6; this.flareCount = 12; this._flareCooldown = 0; }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this.audio.stopEngine();
    window.removeEventListener('resize', this._resizeHandler);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('contextmenu', this._onCtx);
    document.removeEventListener('pointerlockchange', this._onPLC);
    if (this.hudCanvas && this.hudCanvas.parentNode) this.hudCanvas.parentNode.removeChild(this.hudCanvas);
  }
}
