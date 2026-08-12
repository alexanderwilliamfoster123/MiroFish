// Business cards recreated from the user's Spline reference (dark rounded
// card, holographic triangle emblem, small technical labels): rebuilt in
// Three.js so every card carries its own business name and link while
// sharing the site's environment, lighting, and Inter typography.

import * as THREE from "three";

const CARD_W = 1.5;
const CARD_H = 2.1;
const CARD_T = 0.045;

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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

function makeTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// front face design: transparent canvas decal covering the whole card
function makeFaceTexture(entry, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 896;
  const ctx = canvas.getContext("2d");

  roundedRectPath(ctx, 0, 0, 640, 896, 42);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#101114";
  ctx.fillRect(0, 0, 640, 896);

  // hairline inner frame
  ctx.strokeStyle = "rgba(235, 233, 228, 0.12)";
  ctx.lineWidth = 2;
  roundedRectPath(ctx, 18, 18, 604, 860, 30);
  ctx.stroke();

  const cream = "rgba(235, 233, 228, 0.92)";
  const dim = "rgba(235, 233, 228, 0.45)";

  // top-left stack
  ctx.fillStyle = cream;
  ctx.font = '30px Inter, sans-serif';
  ctx.fillText(entry.name.toLowerCase(), 52, 84);
  ctx.fillStyle = dim;
  ctx.font = '22px Inter, sans-serif';
  ctx.fillText("business", 52, 120);
  ctx.fillText("card series", 52, 150);

  // top-right index chip
  ctx.font = '26px Inter, sans-serif';
  ctx.textAlign = "right";
  ctx.fillStyle = cream;
  ctx.fillText(`c-${String(index + 1).padStart(2, "0")}`, 588, 88);
  ctx.textAlign = "left";

  // bottom block
  ctx.fillStyle = cream;
  ctx.font = '40px Inter, sans-serif';
  ctx.fillText(entry.name.toLowerCase(), 52, 756);
  ctx.fillStyle = dim;
  ctx.font = '22px Inter, sans-serif';
  wrapText(ctx, entry.tagline.toLowerCase(), 52, 796, 536, 30);

  ctx.restore();
  return makeTexture(canvas);
}

// back: faint centered mark and index
function makeBackTexture(index) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 896;
  const ctx = canvas.getContext("2d");
  roundedRectPath(ctx, 0, 0, 640, 896, 42);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#0f1013";
  ctx.fillRect(0, 0, 640, 896);
  ctx.strokeStyle = "rgba(235, 233, 228, 0.16)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(320, 388);
  ctx.lineTo(384, 498);
  ctx.lineTo(256, 498);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(235, 233, 228, 0.3)";
  ctx.font = '24px Inter, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(`c-${String(index + 1).padStart(2, "0")}`, 320, 852);
  ctx.restore();
  return makeTexture(canvas);
}

let bodyGeometry = null;
let triangleGeometry = null;

function makeBodyGeometry() {
  const w = CARD_W - 0.016;
  const h = CARD_H - 0.016;
  const r = 0.1;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0);
  shape.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2);
  shape.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI);
  shape.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: CARD_T - 0.016,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 12
  });
  geometry.center();
  return geometry;
}

function makeTriangleGeometry() {
  const s = 0.56;
  const fillet = 0.09;
  const pts = [
    new THREE.Vector2(0, s * 0.66),
    new THREE.Vector2(s * 0.62, -s * 0.4),
    new THREE.Vector2(-s * 0.62, -s * 0.4)
  ];
  // straight edges with small corner fillets, like the reference emblem
  const shape = new THREE.Shape();
  const towards = (a, b, dist) => a.clone().add(b.clone().sub(a).setLength(dist));
  for (let i = 0; i < 3; i++) {
    const prev = pts[(i + 2) % 3];
    const p = pts[i];
    const next = pts[(i + 1) % 3];
    const entry = towards(p, prev, fillet);
    const exit = towards(p, next, fillet);
    if (i === 0) shape.moveTo(entry.x, entry.y);
    else shape.lineTo(entry.x, entry.y);
    shape.quadraticCurveTo(p.x, p.y, exit.x, exit.y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 3,
    curveSegments: 10
  });
  geometry.center();
  return geometry;
}

export function createCard(index, entry) {
  const rand = mulberry32(index * 4243 + 977);

  bodyGeometry = bodyGeometry || makeBodyGeometry();
  triangleGeometry = triangleGeometry || makeTriangleGeometry();

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x141518,
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.7,
    clearcoatRoughness: 0.24,
    envMapIntensity: 0.9
  });

  const pivot = new THREE.Group();

  const body = new THREE.Mesh(bodyGeometry, bodyMat);
  body.castShadow = true;
  pivot.add(body);

  const decal = (map) => new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    roughness: 0.55,
    metalness: 0,
    envMapIntensity: 0.35,
    polygonOffset: true,
    polygonOffsetFactor: -1
  });

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_W - 0.02, CARD_H - 0.02),
    decal(makeFaceTexture(entry, index))
  );
  face.position.z = CARD_T / 2 + 0.002;
  pivot.add(face);

  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_W - 0.02, CARD_H - 0.02),
    decal(makeBackTexture(index))
  );
  back.position.z = -CARD_T / 2 - 0.002;
  back.rotation.y = Math.PI;
  pivot.add(back);

  // holographic triangle emblem, slightly proud of the face
  const triangle = new THREE.Mesh(
    triangleGeometry,
    new THREE.MeshPhysicalMaterial({
      // polished gold, matched to the shiny-coins reference
      color: 0xffc35c,
      roughness: 0.14,
      metalness: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 3.0
    })
  );
  triangle.position.set(0, CARD_H * 0.06, CARD_T / 2 + 0.018);
  triangle.rotation.z = (rand() - 0.5) * 0.04;
  triangle.castShadow = true;
  pivot.add(triangle);

  return {
    index,
    title: entry.name,
    url: entry.url,
    pivot,
    height: CARD_H,
    thickness: CARD_W,
    depth: CARD_T,
    lift: 0.32,
    sway: true,
    openYaw: 0.14,
    linkLabel: "visit ↗"
  };
}
