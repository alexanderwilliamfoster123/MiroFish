// Procedural hardcover stand-ins. Mint MCP was not reachable from the build
// session, so the 19-piece clothbound asset pack is generated locally with
// deterministic proportions and foil motifs. If a Mint-generated pack is
// synced later, replace this factory with manifest-driven GLB loading and
// keep the returned record shape.

import * as THREE from "three";

const FOIL = "#b6ad97";
const PAPER = 0xe7e2d4;

const CLOTH_COLORS = [
  0x4a3f3a, 0x39424a, 0x45443a, 0x503c40, 0x3d4440,
  0x46403f, 0x3a3f4d, 0x4d463b, 0x423a45, 0x37403c,
  0x4b4238, 0x3e4347, 0x483d3d, 0x3c463f, 0x453f4b,
  0x424038, 0x384347, 0x4e4440, 0x3f3d43
];

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

function css(color) {
  return "#" + color.getHexString();
}

let clothBumpTexture = null;

function getClothBump() {
  if (clothBumpTexture) return clothBumpTexture;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const rand = mulberry32(4021);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 108 + rand() * 40;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  clothBumpTexture = new THREE.CanvasTexture(canvas);
  clothBumpTexture.wrapS = clothBumpTexture.wrapT = THREE.RepeatWrapping;
  clothBumpTexture.repeat.set(3, 3);
  return clothBumpTexture;
}

function drawMotif(ctx, kind, cx, cy, radius, rand) {
  ctx.strokeStyle = FOIL;
  ctx.fillStyle = FOIL;
  ctx.lineWidth = 2.4;
  ctx.globalAlpha = 0.92;
  switch (kind) {
    case 0: {
      const rings = 3 + Math.floor(rand() * 3);
      for (let i = 0; i < rings; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * ((i + 1) / rings), 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case 1: {
      const blades = 7 + Math.floor(rand() * 5);
      for (let i = 0; i <= blades; i++) {
        const a = -Math.PI / 2 + (i / blades - 0.5) * Math.PI * 0.9;
        ctx.beginPath();
        ctx.moveTo(cx, cy + radius * 0.55);
        ctx.lineTo(cx + Math.cos(a) * radius, cy + radius * 0.55 + Math.sin(a) * radius);
        ctx.stroke();
      }
      break;
    }
    case 2: {
      const lines = 6 + Math.floor(rand() * 4);
      for (let i = 0; i < lines; i++) {
        const off = (i / (lines - 1) - 0.5) * radius * 1.7;
        ctx.beginPath();
        ctx.moveTo(cx - radius + off, cy + radius);
        ctx.lineTo(cx + radius * 0.4 + off, cy - radius);
        ctx.stroke();
      }
      break;
    }
    case 3: {
      const boxes = 3 + Math.floor(rand() * 2);
      for (let i = 0; i < boxes; i++) {
        const s = radius * 2 * ((i + 1) / boxes);
        ctx.strokeRect(cx - s / 2, cy - s / 2, s, s * 1.28);
      }
      break;
    }
    case 4: {
      const rows = 5 + Math.floor(rand() * 3);
      const cols = 3 + Math.floor(rand() * 2);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.beginPath();
          ctx.arc(
            cx + (c / (cols - 1) - 0.5) * radius * 1.4,
            cy + (r / (rows - 1) - 0.5) * radius * 1.8,
            3.2, 0, Math.PI * 2
          );
          ctx.fill();
        }
      }
      break;
    }
    default: {
      ctx.beginPath();
      ctx.arc(cx, cy - radius * 0.25, radius * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy + radius * 0.75);
      ctx.lineTo(cx + radius, cy + radius * 0.75);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function makeCoverTexture(baseColor, index, rand) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 820;
  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(baseColor);
  ctx.fillStyle = css(base);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // frame rule
  ctx.strokeStyle = FOIL;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 46, canvas.width - 84, canvas.height - 92);
  ctx.globalAlpha = 1;

  drawMotif(ctx, index % 6, canvas.width / 2, canvas.height * 0.42, 108, rand);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeSpineTexture(title, index, baseColor, rand) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(baseColor);
  ctx.fillStyle = css(base);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = FOIL;
  ctx.fillStyle = FOIL;

  // top and bottom rules
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(58, 68);
  ctx.lineTo(198, 68);
  ctx.moveTo(58, 956);
  ctx.lineTo(198, 956);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // small motif mark near the head
  drawMotifMark(ctx, index % 6, 128, 130, 26);

  // vertical title reading top to bottom
  ctx.save();
  ctx.translate(140, 210);
  ctx.rotate(Math.PI / 2);
  ctx.font = "44px Inter, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(title.toLowerCase(), 0, 0);
  ctx.restore();

  // volume numeral at the tail
  ctx.font = "34px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(index + 1).padStart(2, "0"), 128, 922);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawMotifMark(ctx, kind, cx, cy, r) {
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  if (kind === 0 || kind === 5) {
    ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
  } else if (kind === 1) {
    ctx.moveTo(cx - r, cy + r * 0.6);
    ctx.lineTo(cx, cy - r * 0.7);
    ctx.lineTo(cx + r, cy + r * 0.6);
  } else if (kind === 2) {
    ctx.moveTo(cx - r, cy + r * 0.7);
    ctx.lineTo(cx + r * 0.4, cy - r * 0.7);
    ctx.moveTo(cx - r * 0.4, cy + r * 0.7);
    ctx.lineTo(cx + r, cy - r * 0.7);
  } else if (kind === 3) {
    ctx.rect(cx - r * 0.7, cy - r * 0.7, r * 1.4, r * 1.4);
  } else {
    ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - r * 0.8, cy, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.8, cy, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// Builds one hardcover. The book stands with its spine toward +z, boards
// facing +x / -x, resting on y = 0. Returns the pivot group (centered at the
// book's core) plus dimensions used for layout and framing.
export function createBook(index, entry) {
  const rand = mulberry32(index * 7919 + 131);

  const height = 2.35 + rand() * 0.7;
  const thickness = 0.36 + rand() * 0.4;
  const depth = 1.5 + rand() * 0.35;
  const boardT = 0.05;

  const baseColor = new THREE.Color(CLOTH_COLORS[index % CLOTH_COLORS.length]);
  const hsl = {};
  baseColor.getHSL(hsl);
  baseColor.setHSL(
    (hsl.h + (rand() - 0.5) * 0.03 + 1) % 1,
    Math.max(0, hsl.s + (rand() - 0.5) * 0.05),
    Math.min(0.5, Math.max(0.16, hsl.l + (rand() - 0.5) * 0.05))
  );

  const bump = getClothBump();
  const clothMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.88,
    metalness: 0.02,
    bumpMap: bump,
    bumpScale: 0.6
  });
  const coverMat = new THREE.MeshStandardMaterial({
    map: makeCoverTexture(baseColor, index, rand),
    roughness: 0.82,
    metalness: 0.05,
    bumpMap: bump,
    bumpScale: 0.5
  });
  const spineMat = new THREE.MeshStandardMaterial({
    map: makeSpineTexture(entry.title, index, baseColor, rand),
    roughness: 0.82,
    metalness: 0.05,
    bumpMap: bump,
    bumpScale: 0.5
  });
  const paperMat = new THREE.MeshStandardMaterial({
    color: PAPER,
    roughness: 0.94,
    metalness: 0
  });

  const pivot = new THREE.Group();

  // page block, slightly recessed from every cover edge
  const pages = new THREE.Mesh(
    new THREE.BoxGeometry(thickness - boardT * 2 - 0.015, height - 0.12, depth - 0.09),
    paperMat
  );
  pages.position.z = -0.05;
  pivot.add(pages);

  // boards: outer faces carry the foil motif
  const boardGeo = new THREE.BoxGeometry(boardT, height, depth);
  const rightBoard = new THREE.Mesh(boardGeo, [
    coverMat, clothMat, clothMat, clothMat, clothMat, clothMat
  ]);
  rightBoard.position.x = (thickness - boardT) / 2;
  const leftBoard = new THREE.Mesh(boardGeo, [
    clothMat, coverMat, clothMat, clothMat, clothMat, clothMat
  ]);
  leftBoard.position.x = -(thickness - boardT) / 2;
  pivot.add(rightBoard, leftBoard);

  // rounded spine bulging toward the viewer (+z)
  const spineGeo = new THREE.CylinderGeometry(
    thickness / 2, thickness / 2, height, 24, 1, false, -Math.PI / 2, Math.PI
  );
  const spine = new THREE.Mesh(spineGeo, [spineMat, clothMat, clothMat]);
  spine.position.z = depth / 2 - 0.02;
  pivot.add(spine);

  for (const mesh of [pages, rightBoard, leftBoard, spine]) {
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
