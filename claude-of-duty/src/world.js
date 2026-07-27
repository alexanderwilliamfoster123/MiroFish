// world.js — procedural environment. No texture files: every surface is a
// canvas-generated texture. Builds a walled combat arena of ~90x90m with
// buildings, cover crates, barriers and props, plus sky + lighting.
import * as THREE from 'three';

// ---- procedural canvas textures ---------------------------------------

function canvasTex(size, draw, repeat = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function noise(ctx, size, base, amt) {
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amt;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

function asphaltTex() {
  return canvasTex(256, (ctx, s) => {
    ctx.fillStyle = '#3a3d42'; ctx.fillRect(0, 0, s, s);
    noise(ctx, s, 60, 40);
    // cracks
    ctx.strokeStyle = 'rgba(20,20,22,0.5)'; ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      let x = Math.random() * s, y = Math.random() * s;
      ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) { x += (Math.random() - 0.5) * 60; y += (Math.random() - 0.5) * 60; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }, 12);
}

function concreteTex(tint = '#8a8d92') {
  return canvasTex(256, (ctx, s) => {
    ctx.fillStyle = tint; ctx.fillRect(0, 0, s, s);
    noise(ctx, s, 130, 26);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * s, Math.random() * s, 2 + Math.random() * 4, 2 + Math.random() * 4);
  }, 2);
}

function brickTex() {
  return canvasTex(256, (ctx, s) => {
    ctx.fillStyle = '#6b3b2e'; ctx.fillRect(0, 0, s, s);
    const bw = 42, bh = 20, gap = 3;
    ctx.fillStyle = '#8a8580';
    for (let y = 0, row = 0; y < s; y += bh + gap, row++) {
      const off = (row % 2) * (bw / 2);
      for (let x = -bw; x < s; x += bw + gap) {
        ctx.fillStyle = `hsl(${12 + Math.random() * 14}, ${35 + Math.random() * 15}%, ${32 + Math.random() * 12}%)`;
        ctx.fillRect(x + off + gap, y + gap, bw, bh);
      }
    }
    noise(ctx, s, 0, 24);
  }, 3);
}

function metalTex(tint = '#556') {
  return canvasTex(128, (ctx, s) => {
    ctx.fillStyle = tint; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    for (let x = 0; x < s; x += 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s); ctx.stroke(); }
    noise(ctx, s, 0, 18);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, s - 8, s - 8);
  }, 1);
}

function crateTex() {
  return canvasTex(128, (ctx, s) => {
    ctx.fillStyle = '#7a5a34'; ctx.fillRect(0, 0, s, s);
    noise(ctx, s, 0, 30);
    ctx.strokeStyle = 'rgba(40,26,12,0.8)'; ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, s - 6, s - 6);
    ctx.beginPath(); ctx.moveTo(3, 3); ctx.lineTo(s - 3, s - 3); ctx.moveTo(s - 3, 3); ctx.lineTo(3, s - 3); ctx.stroke();
    // stencil
    ctx.fillStyle = 'rgba(230,220,180,0.55)'; ctx.font = 'bold 22px sans-serif';
    ctx.fillText('CoD-7', 26, 70);
  }, 1);
}

// ---- world -------------------------------------------------------------

export class World {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.colliders = [];   // {min:Vec3, max:Vec3} AABBs for player/enemy collision
    this.obstacles = [];   // for enemy navigation avoidance (same boxes)
    this.bounds = 45;      // half-size of arena
    this.spawnPoints = [];
    this._build();
  }

  _addBox(x, z, w, h, d, mat, y = null) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    const yy = y === null ? h / 2 : y;
    mesh.position.set(x, yy, z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    this.scene.add(mesh);
    const min = new THREE.Vector3(x - w / 2, yy - h / 2, z - d / 2);
    const max = new THREE.Vector3(x + w / 2, yy + h / 2, z + d / 2);
    this.colliders.push({ min, max });
    return mesh;
  }

  _build() {
    const scene = this.scene;

    // --- sky (gradient dome) ---
    const skyGeo = new THREE.SphereGeometry(500, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        top: { value: new THREE.Color(0x2a4a72) },
        mid: { value: new THREE.Color(0x93a7c0) },
        bot: { value: new THREE.Color(0xd9c4a3) },
      },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `,
      fragmentShader: `
        varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 bot;
        void main(){
          float h = normalize(vP).y;
          vec3 c = h > 0.0 ? mix(mid, top, pow(h,0.6)) : mix(mid, bot, pow(-h,0.5));
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    scene.fog = new THREE.FogExp2(0x9aa7b5, 0.008);

    // --- lights ---
    const hemi = new THREE.HemisphereLight(0xbcd0e8, 0x2a2620, 0.75);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2d8, 2.2);
    sun.position.set(40, 70, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 220;
    const S = 70;
    sun.shadow.camera.left = -S; sun.shadow.camera.right = S;
    sun.shadow.camera.top = S; sun.shadow.camera.bottom = -S;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x404652, 0.5));

    // --- ground ---
    const b = this.bounds;
    const groundMat = new THREE.MeshStandardMaterial({ map: asphaltTex(), roughness: 0.95, metalness: 0.0 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(b * 2, b * 2), groundMat);
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
    scene.add(ground);

    // road markings
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xd8d2b8, roughness: 0.8 });
    for (let z = -b + 6; z < b; z += 12) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 5), lineMat);
      line.rotation.x = -Math.PI / 2; line.position.set(0, 0.02, z); line.receiveShadow = true;
      scene.add(line);
    }

    // --- perimeter walls ---
    const wallMat = new THREE.MeshStandardMaterial({ map: concreteTex('#767a80'), roughness: 0.9 });
    const wh = 8, wt = 2;
    this._addBox(0, -b, b * 2, wh, wt, wallMat);
    this._addBox(0, b, b * 2, wh, wt, wallMat);
    this._addBox(-b, 0, wt, wh, b * 2, wallMat);
    this._addBox(b, 0, wt, wh, b * 2, wallMat);

    // --- buildings (procedural blocks arranged along a street) ---
    const brick = new THREE.MeshStandardMaterial({ map: brickTex(), roughness: 0.92 });
    const concrete = new THREE.MeshStandardMaterial({ map: concreteTex('#9a9ea3'), roughness: 0.9 });
    const rng = mulberry(1337);
    const buildingDefs = [
      [-30, -30, 16, 14], [-30, 0, 14, 18], [-32, 30, 18, 12],
      [30, -28, 18, 16], [32, 4, 14, 20], [30, 32, 16, 12],
      [0, -34, 22, 10], [-12, 20, 10, 12], [14, 22, 12, 10],
    ];
    for (const [x, z, w, d] of buildingDefs) {
      const h = 10 + rng() * 16;
      const mat = rng() > 0.5 ? brick : concrete;
      const mesh = this._addBox(x, z, w, h, d, mat);
      this._addWindows(mesh, x, z, w, h, d);
    }

    // --- cover crates & barriers scattered in the play field ---
    const crate = new THREE.MeshStandardMaterial({ map: crateTex(), roughness: 0.85 });
    const metal = new THREE.MeshStandardMaterial({ map: metalTex('#5a6470'), roughness: 0.6, metalness: 0.4 });
    const coverPositions = [
      [-6, -8], [8, -12], [-14, 6], [12, 8], [-4, 14], [6, 18],
      [-20, -4], [18, -6], [0, 4], [-10, -18], [10, -20], [22, 14],
      [-22, 14], [2, -22], [-16, 24], [16, 26],
    ];
    for (const [x, z] of coverPositions) {
      const r = rng();
      if (r < 0.5) {
        const sz = 1.6 + rng() * 0.8;
        this._addBox(x, z, sz, sz, sz, crate);
        if (rng() > 0.6) this._addBox(x + 0.2, z, sz * 0.85, sz, sz * 0.85, crate, sz + sz * 0.5);
      } else if (r < 0.8) {
        this._addBox(x, z, 3.2, 1.2, 1.0, metal); // low barrier
      } else {
        // sandbag-ish stack (concrete color, rounded look via multiple boxes)
        this._addBox(x, z, 2.4, 1.0, 1.2, concrete);
        this._addBox(x, z + 0.1, 1.8, 1.0, 1.0, concrete, 1.5);
      }
    }

    // --- decorative barrels ---
    const barrelMat = new THREE.MeshStandardMaterial({ map: metalTex('#8a5a2a'), roughness: 0.55, metalness: 0.5 });
    for (let i = 0; i < 10; i++) {
      const x = (rng() - 0.5) * b * 1.6, z = (rng() - 0.5) * b * 1.6;
      if (Math.hypot(x, z) < 6) continue;
      const geo = new THREE.CylinderGeometry(0.6, 0.6, 1.6, 14);
      const m = new THREE.Mesh(geo, barrelMat);
      m.position.set(x, 0.8, z); m.castShadow = true; m.receiveShadow = true;
      scene.add(m);
      this.colliders.push({
        min: new THREE.Vector3(x - 0.6, 0, z - 0.6),
        max: new THREE.Vector3(x + 0.6, 1.6, z + 0.6),
      });
    }

    // enemy spawn points around the perimeter
    this.spawnPoints = [
      [-38, -38], [38, -38], [-38, 38], [38, 38],
      [0, -40], [0, 40], [-40, 0], [40, 0],
      [-24, -34], [24, -34], [-24, 34], [24, 34],
    ].map(([x, z]) => new THREE.Vector3(x, 0, z));

    this.obstacles = this.colliders.slice();
  }

  _addWindows(mesh, x, z, w, h, d) {
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x1a2430, roughness: 0.15, metalness: 0.8,
      emissive: 0x24405a, emissiveIntensity: 0.35,
    });
    const rows = Math.max(2, Math.floor(h / 4));
    // four faces: [outward normal x, z, face width]
    const faces = [
      { nx: 1, nz: 0, span: d, rotY: -Math.PI / 2 },
      { nx: -1, nz: 0, span: d, rotY: Math.PI / 2 },
      { nx: 0, nz: 1, span: w, rotY: 0 },
      { nx: 0, nz: -1, span: w, rotY: Math.PI },
    ];
    for (const f of faces) {
      const cols = Math.max(2, Math.floor(f.span / 4));
      for (let c = 0; c < cols; c++) {
        for (let r = 1; r < rows; r++) {
          const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.6), winMat);
          const along = (cols === 1) ? 0 : ((c / (cols - 1)) - 0.5) * (f.span - 2);
          const py = (r / rows) * h;
          if (f.nx !== 0) {
            win.position.set(x + f.nx * (w / 2 + 0.06), py, z + along);
          } else {
            win.position.set(x + along, py, z + f.nz * (d / 2 + 0.06));
          }
          win.rotation.y = f.rotY;
          this.scene.add(win);
        }
      }
    }
  }

  // axis-aligned collision resolution for a capsule approximated as a
  // vertical cylinder (radius r) at position p (feet at p.y). Returns
  // corrected horizontal position.
  resolve(p, r) {
    for (const c of this.colliders) {
      // only consider boxes overlapping the player's height band
      if (p.y + 1.6 < c.min.y || p.y > c.max.y) continue;
      const cx = Math.max(c.min.x, Math.min(p.x, c.max.x));
      const cz = Math.max(c.min.z, Math.min(p.z, c.max.z));
      const dx = p.x - cx, dz = p.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        if (d2 > 1e-6) {
          const d = Math.sqrt(d2);
          p.x = cx + (dx / d) * r;
          p.z = cz + (dz / d) * r;
        } else {
          // center inside box: push out along smallest axis
          const pxp = c.max.x - p.x, pxn = p.x - c.min.x;
          const pzp = c.max.z - p.z, pzn = p.z - c.min.z;
          const m = Math.min(pxp, pxn, pzp, pzn);
          if (m === pxp) p.x = c.max.x + r; else if (m === pxn) p.x = c.min.x - r;
          else if (m === pzp) p.z = c.max.z + r; else p.z = c.min.z - r;
        }
      }
    }
    // arena bounds
    const lim = this.bounds - 1.5;
    p.x = Math.max(-lim, Math.min(lim, p.x));
    p.z = Math.max(-lim, Math.min(lim, p.z));
  }

  // does the segment a->b hit any collider before maxDist? used for line of
  // sight and enemy avoidance. returns true if blocked.
  segmentBlocked(a, b) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    if (len < 1e-4) return false;
    dir.multiplyScalar(1 / len);
    for (const c of this.colliders) {
      if (this._rayBox(a, dir, c, len)) return true;
    }
    return false;
  }

  _rayBox(o, d, box, maxT) {
    let tmin = 0, tmax = maxT;
    for (const ax of ['x', 'y', 'z']) {
      const inv = 1 / (d[ax] || 1e-9);
      let t1 = (box.min[ax] - o[ax]) * inv;
      let t2 = (box.max[ax] - o[ax]) * inv;
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
      tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }
    return true;
  }
}

function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
