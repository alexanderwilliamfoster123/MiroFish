// Procedural VHS cassette stand-ins. Mint MCP was not reachable from the
// build session, so the 19-piece tape pack is generated locally. Realism
// comes from a beveled extruded shell with clearcoat, a separate door with
// a seam, decal stickers that sit proud of the plastic, and spool windows
// with per-tape wind ratios under a glossy glass layer. If a Mint pack is
// synced later, replace this factory and keep the returned record shape.

import * as THREE from "three";

const INK = "#2b2721";
const STRIPE_SETS = [
  ["#9c4a40", "#c0803a", "#54683f"],
  ["#3f5c82", "#9c4a40", "#c8b98a"],
  ["#54683f", "#3f5c82", "#9c4a40"],
  ["#7d5c8a", "#c0803a", "#3f5c82"],
  ["#c0803a", "#54683f", "#7d5c8a"],
  ["#456e6a", "#c8b98a", "#9c4a40"]
];

// standing VHS: 187 x 103 x 25 mm scaled so the shelf reads at the same size
const TAPE_H = 2.6;
const TAPE_T = 0.35;
const TAPE_D = 1.43;
const BEVEL = 0.016;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function stripes(ctx, x, y, w, set) {
  const bandH = 7;
  set.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y + i * (bandH + 4), w, bandH);
  });
  return y + set.length * (bandH + 4) + 8;
}

// aged paper fill with slight vertical tone drift and edge darkening
function paperBase(ctx, w, h, age) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `rgb(${233 - age * 14}, ${228 - age * 18}, ${212 - age * 24})`);
  g.addColorStop(1, `rgb(${225 - age * 18}, ${219 - age * 22}, ${200 - age * 28})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(90, 74, 50, 0.18)";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
}

// spine sticker: transparent canvas, rounded label, title reading downward
function makeSpineSticker(title, index, set, age) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1560;
  const ctx = canvas.getContext("2d");
  roundedRectPath(ctx, 6, 6, 244, 1548, 26);
  ctx.save();
  ctx.clip();
  paperBase(ctx, 256, 1560, age);
  stripes(ctx, 30, 42, 196, set);
  ctx.fillStyle = INK;
  ctx.save();
  ctx.translate(150, 148);
  ctx.rotate(Math.PI / 2);
  ctx.font = '46px Inter, sans-serif';
  ctx.textBaseline = "middle";
  ctx.fillText(title.toLowerCase(), 0, 0);
  ctx.restore();
  ctx.font = '38px Inter, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(String(index + 1).padStart(2, "0"), 128, 1488);
  ctx.restore();
  return makeTexture(canvas);
}

// face sticker: transparent canvas, rounded label with title and number
function makeFaceSticker(title, index, set, age) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 340;
  const ctx = canvas.getContext("2d");
  roundedRectPath(ctx, 6, 6, 888, 328, 22);
  ctx.save();
  ctx.clip();
  paperBase(ctx, 900, 340, age);
  const after = stripes(ctx, 40, 40, 820, set);
  ctx.fillStyle = INK;
  ctx.font = '58px Inter, sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(title.toLowerCase(), 40, after + 78);
  ctx.font = '34px Inter, sans-serif';
  ctx.textAlign = "right";
  ctx.fillText(String(index + 1).padStart(2, "0"), 860, 340 - 42);
  // faint ruled line, like the printed label stock
  ctx.strokeStyle = "rgba(90, 74, 50, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, after + 108);
  ctx.lineTo(860, after + 108);
  ctx.stroke();
  ctx.restore();
  return makeTexture(canvas);
}

// spool window backplate: reels with a per-tape wind ratio
function makeWindowTexture(wind) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1d1d20";
  ctx.fillRect(0, 0, 640, 300);

  const reels = [
    { cx: 160, r: 58 + wind * 60 },
    { cx: 480, r: 58 + (1 - wind) * 60 }
  ];
  for (const { cx, r } of reels) {
    // wound tape: flat brown-black roll, darker than the cavity behind it
    ctx.fillStyle = "#211b16";
    ctx.beginPath();
    ctx.arc(cx, 150, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, 150, r, 0, Math.PI * 2);
    ctx.stroke();
    // winding rings
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1.6;
    for (let rr = 34; rr < r - 4; rr += 6) {
      ctx.beginPath();
      ctx.arc(cx, 150, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
    // hub
    ctx.fillStyle = "#b9b3a2";
    ctx.beginPath();
    ctx.arc(cx, 150, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1a1613";
    ctx.lineWidth = 5;
    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * Math.PI * 2 + 0.3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 10, 150 + Math.sin(a) * 10);
      ctx.lineTo(cx + Math.cos(a) * 25, 150 + Math.sin(a) * 25);
      ctx.stroke();
    }
    ctx.fillStyle = "#6f6a5e";
    ctx.beginPath();
    ctx.arc(cx, 150, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  // inner frame shadow
  const frame = ctx.createLinearGradient(0, 0, 0, 300);
  frame.addColorStop(0, "rgba(0,0,0,0.6)");
  frame.addColorStop(0.12, "rgba(0,0,0,0)");
  frame.addColorStop(0.88, "rgba(0,0,0,0)");
  frame.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = frame;
  ctx.fillRect(0, 0, 640, 300);
  ctx.strokeStyle = "rgba(0,0,0,0.7)";
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, 640, 300);
  return makeTexture(canvas);
}

// subtle detail decal for the back: mold seams and screw bosses on alpha
function makeBackDetail() {
  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = "rgba(0,0,0,0.32)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 250);
  ctx.lineTo(530, 250);
  ctx.moveTo(30, 760);
  ctx.lineTo(530, 760);
  ctx.stroke();
  for (const [sx, sy] of [[48, 52], [512, 52], [48, 972], [512, 972], [280, 500]]) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.arc(sx, sy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx - 6, sy);
    ctx.lineTo(sx + 6, sy);
    ctx.stroke();
  }
  return makeTexture(canvas);
}

// beveled shell: rounded-rect profile in the depth/height plane, extruded
// through the tape thickness
function makeShellGeometry() {
  const d = TAPE_D - BEVEL * 2;
  const h = TAPE_H - BEVEL * 2;
  const r = 0.045;
  const shape = new THREE.Shape();
  shape.moveTo(-d / 2 + r, -h / 2);
  shape.absarc(d / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0);
  shape.absarc(d / 2 - r, h / 2 - r, r, 0, Math.PI / 2);
  shape.absarc(-d / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI);
  shape.absarc(-d / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: TAPE_T - BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
    curveSegments: 10
  });
  geometry.center();
  // shape plane is depth/height; extrusion runs along tape thickness (x)
  geometry.rotateY(Math.PI / 2);
  return geometry;
}

let shellGeometry = null;
let backDetailTexture = null;

export function createBook(index, entry) {
  const rand = mulberry32(index * 7919 + 131);

  const height = TAPE_H;
  const thickness = TAPE_T;
  const depth = TAPE_D;

  const tone = new THREE.Color(0x26282c);
  tone.offsetHSL((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.02);
  const set = STRIPE_SETS[index % STRIPE_SETS.length];
  const age = rand();

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: tone,
    roughness: 0.44,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.32,
    envMapIntensity: 0.85
  });
  const stickerMat = (map) => new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    roughness: 0.86,
    metalness: 0,
    envMapIntensity: 0.25,
    polygonOffset: true,
    polygonOffsetFactor: -1
  });

  const pivot = new THREE.Group();

  shellGeometry = shellGeometry || makeShellGeometry();
  const shell = new THREE.Mesh(shellGeometry, shellMat);
  shell.castShadow = true;
  pivot.add(shell);

  // hinged door, slightly proud of the shell along the bottom edge
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(thickness + 0.014, height * 0.14, depth * 0.965),
    shellMat
  );
  door.position.y = -height / 2 + height * 0.075;
  door.castShadow = true;
  pivot.add(door);
  const seam = new THREE.Mesh(
    new THREE.BoxGeometry(thickness + 0.016, 0.012, depth * 0.965),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  seam.position.y = -height / 2 + height * 0.145;
  pivot.add(seam);

  // spine sticker decal, slightly crooked like it was applied by hand
  const spineSticker = new THREE.Mesh(
    new THREE.PlaneGeometry(thickness * 0.82, height * 0.72),
    stickerMat(makeSpineSticker(entry.title, index, set, age))
  );
  spineSticker.position.set(0, height * 0.09, depth / 2 + 0.002);
  spineSticker.rotation.z = (rand() - 0.5) * 0.022;
  pivot.add(spineSticker);

  // face sticker decal
  const faceSticker = new THREE.Mesh(
    new THREE.PlaneGeometry(depth * 0.78, depth * 0.78 * (340 / 900)),
    stickerMat(makeFaceSticker(entry.title, index, set, age))
  );
  faceSticker.position.set(thickness / 2 + 0.002, height * 0.3, 0);
  faceSticker.rotation.y = Math.PI / 2;
  faceSticker.rotation.x = (rand() - 0.5) * 0.02;
  pivot.add(faceSticker);

  // spool window: painted reels plus a glossy glass layer
  const windowW = depth * 0.62;
  const windowH = windowW * (300 / 640);
  const windowPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(windowW, windowH),
    new THREE.MeshStandardMaterial({
      map: makeWindowTexture(0.2 + 0.6 * (index / 18)),
      roughness: 0.5,
      metalness: 0,
      envMapIntensity: 0.3,
      polygonOffset: true,
      polygonOffsetFactor: -1
    })
  );
  windowPlate.position.set(thickness / 2 + 0.0015, -height * 0.07, 0);
  windowPlate.rotation.y = Math.PI / 2;
  pivot.add(windowPlate);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(windowW, windowH),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.09,
      roughness: 0.06,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.6,
      depthWrite: false
    })
  );
  glass.position.set(thickness / 2 + 0.006, -height * 0.07, 0);
  glass.rotation.y = Math.PI / 2;
  pivot.add(glass);

  // back detail decal: mold seams and screws
  backDetailTexture = backDetailTexture || makeBackDetail();
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(depth * 0.94, height * 0.94),
    new THREE.MeshStandardMaterial({
      map: backDetailTexture,
      transparent: true,
      roughness: 0.44,
      metalness: 0,
      envMapIntensity: 0,
      polygonOffset: true,
      polygonOffsetFactor: -1
    })
  );
  back.position.set(-thickness / 2 - 0.002, 0, 0);
  back.rotation.y = -Math.PI / 2;
  pivot.add(back);

  return {
    index,
    title: entry.title,
    youtubeUrl: entry.youtubeUrl,
    pivot,
    height,
    thickness,
    depth
  };
}
