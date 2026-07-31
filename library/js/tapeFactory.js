// Procedural VHS cassette stand-ins. Mint MCP was not reachable from the
// build session, so the 19-piece tape pack is generated locally: uniform
// 90s cassette proportions, dark shells, cream stickers with per-tape
// stripe accents. If a Mint-generated pack is synced later, replace this
// factory with manifest-driven GLB loading and keep the returned shape.

import * as THREE from "three";

const INK = "#26241f";
const CREAM = "#e7e2d4";

const STRIPE_SETS = [
  ["#9c4a40", "#c0803a", "#54683f"],
  ["#3f5c82", "#9c4a40", "#c8b98a"],
  ["#54683f", "#3f5c82", "#9c4a40"],
  ["#7d5c8a", "#c0803a", "#3f5c82"],
  ["#c0803a", "#54683f", "#7d5c8a"],
  ["#456e6a", "#c8b98a", "#9c4a40"]
];

// standing VHS: 187 x 103 x 25 mm scaled so the shelf reads like the books did
const TAPE_H = 2.6;
const TAPE_T = 0.35;
const TAPE_D = 1.43;

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

function shellBase(ctx, w, h, tone) {
  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, w, h);
  // faint molding streaks so the plastic is not dead flat
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#ffffff";
  for (let y = 0; y < h; y += 7) ctx.fillRect(0, y, w, 1);
  ctx.globalAlpha = 1;
}

function stripes(ctx, x, y, w, set) {
  const bandH = 7;
  set.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y + i * (bandH + 4), w, bandH);
  });
  return y + set.length * (bandH + 4) + 8;
}

// spine: the narrow edge that faces out of the shelf
function makeSpineTexture(title, index, tone, set) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  shellBase(ctx, 256, 1024, tone);

  // cream sticker, inset like a real spine label
  const pad = 26;
  const top = 60;
  const stickerH = 780;
  ctx.fillStyle = CREAM;
  ctx.fillRect(pad, top, 256 - pad * 2, stickerH);

  stripes(ctx, pad + 16, top + 26, 256 - pad * 2 - 32, set);

  ctx.fillStyle = INK;
  ctx.save();
  ctx.translate(148, top + 120);
  ctx.rotate(Math.PI / 2);
  ctx.font = '42px Inter, sans-serif';
  ctx.textBaseline = "middle";
  ctx.fillText(title.toLowerCase(), 0, 0);
  ctx.restore();

  ctx.font = '34px Inter, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(String(index + 1).padStart(2, "0"), 128, top + stickerH - 42);

  // door-end seam near the bottom of the shell
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 950);
  ctx.lineTo(256, 950);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// large face: sticker up top, spool window below, seen while inspecting
function makeFaceTexture(title, index, tone, set, mirrored) {
  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  shellBase(ctx, 560, 1024, tone);

  if (mirrored) {
    // back of the shell: screw bosses only
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (const [sx, sy] of [[50, 60], [510, 60], [50, 964], [510, 964], [280, 520]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // sticker
    const pad = 44;
    ctx.fillStyle = CREAM;
    ctx.fillRect(pad, 64, 560 - pad * 2, 300);
    const afterStripes = stripes(ctx, pad + 24, 96, 560 - pad * 2 - 48, set);
    ctx.fillStyle = INK;
    ctx.font = '44px Inter, sans-serif';
    ctx.textAlign = "left";
    ctx.fillText(title.toLowerCase(), pad + 24, afterStripes + 74);
    ctx.font = '30px Inter, sans-serif';
    ctx.fillText(String(index + 1).padStart(2, "0"), pad + 24, 64 + 300 - 34);

    // spool window
    const wx = 92;
    const wy = 470;
    const ww = 376;
    const wh = 250;
    ctx.fillStyle = "#0b0b0c";
    ctx.fillRect(wx, wy, ww, wh);
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 4;
    ctx.strokeRect(wx, wy, ww, wh);
    for (const cx of [wx + 92, wx + ww - 92]) {
      ctx.fillStyle = "#2c2a26";
      ctx.beginPath();
      ctx.arc(cx, wy + wh / 2, 78, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e8e4da";
      ctx.beginPath();
      ctx.arc(cx, wy + wh / 2, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0b0b0c";
      ctx.lineWidth = 5;
      for (let s = 0; s < 6; s++) {
        const a = (s / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 12, wy + wh / 2 + Math.sin(a) * 12);
        ctx.lineTo(cx + Math.cos(a) * 28, wy + wh / 2 + Math.sin(a) * 28);
        ctx.stroke();
      }
    }

    // door seam near the bottom edge
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 950);
    ctx.lineTo(560, 950);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Builds one cassette. Same contract as the previous book factory: spine
// toward +z, large faces toward +x / -x, resting on y = 0.
export function createBook(index, entry) {
  const rand = mulberry32(index * 7919 + 131);

  const height = TAPE_H;
  const thickness = TAPE_T;
  const depth = TAPE_D;

  // slight per-tape shell tone drift
  const tone = new THREE.Color(0x26282c);
  tone.offsetHSL((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.015);
  const toneCss = "#" + tone.getHexString();
  const set = STRIPE_SETS[index % STRIPE_SETS.length];

  const shellMat = new THREE.MeshStandardMaterial({
    color: tone,
    roughness: 0.34,
    metalness: 0.18
  });
  const spineMat = new THREE.MeshStandardMaterial({
    map: makeSpineTexture(entry.title, index, toneCss, set),
    roughness: 0.5,
    metalness: 0.06
  });
  const frontMat = new THREE.MeshStandardMaterial({
    map: makeFaceTexture(entry.title, index, toneCss, set, false),
    roughness: 0.5,
    metalness: 0.06
  });
  const backMat = new THREE.MeshStandardMaterial({
    map: makeFaceTexture(entry.title, index, toneCss, set, true),
    roughness: 0.5,
    metalness: 0.06
  });

  const pivot = new THREE.Group();

  const shell = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, depth), [
    frontMat, backMat, shellMat, shellMat, spineMat, shellMat
  ]);
  pivot.add(shell);

  // raised door ridge along the bottom edge of the shell
  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(thickness + 0.012, 0.16, depth * 0.94),
    shellMat
  );
  ridge.position.y = -height / 2 + 0.14;
  pivot.add(ridge);

  for (const mesh of [shell, ridge]) {
    mesh.castShadow = true;
    mesh.receiveShadow = false;
  }

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
