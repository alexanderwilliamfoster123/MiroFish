import { DataTexture, RGBAFormat, RepeatWrapping, LinearFilter } from 'three';

// Точный порт генератора tNoise из Background-*.js (lafys Editions):
// 256x256 тайлящийся Perlin-fbm, 4 октавы, базовый период ap=8.
// Именно от него зависит характер неровностей круга — «несколько мягких
// бугров», а не одна большая амёба.

const SIZE = 256; // Tr
const AP = 8;     // ap — базовая частота/период (8 периодов на ширину текстуры)

// таблица перестановок (как у них: случайная, продублированная до 512)
const perm = new Uint8Array(512);
for (let i = 0; i < 256; i++) perm[i] = i;
for (let i = 255; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [perm[i], perm[j]] = [perm[j], perm[i]];
}
for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];

// градиенты, fade (smootherstep), lerp, grad-dot
const grads = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + t * (b - a);
const grad = (h, x, y) => { const g = grads[h & 7]; return g[0] * x + g[1] * y; };

// тайлящийся Perlin-шум с периодом period
function perlin(x, y, period) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const x1 = (X + 1) % period, y1 = (Y + 1) % period;
  const x0 = X % period, y0 = Y % period;
  const u = fade(xf), v = fade(yf);
  const aa = perm[perm[x0] + y0], ab = perm[perm[x0] + y1];
  const ba = perm[perm[x1] + y0], bb = perm[perm[x1] + y1];
  const n0 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
  const n1 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
  return lerp(n0, n1, v);
}

// fbm: 4 октавы, амплитуда 0.5 (halving), частота x2, период x2
function fbm(x, y, period) {
  let sum = 0, amp = 0.5, freq = 1, p = period;
  for (let o = 0; o < 4; o++) {
    sum += amp * perlin(x * freq, y * freq, p);
    amp *= 0.5; freq *= 2; p *= 2;
  }
  return sum;
}

export function makeNoiseTexture() {
  const data = new Uint8Array(SIZE * SIZE * 4);
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const x = (col / SIZE) * AP;
      const y = (row / SIZE) * AP;
      const v = (fbm(x, y, AP) + 1) * 0.5;          // [-1..1] -> [0..1]
      const u = Math.max(0, Math.min(255, Math.floor(v * 255)));
      const i = (row * SIZE + col) * 4;
      data[i] = u; data[i + 1] = u; data[i + 2] = u; data[i + 3] = 255;
    }
  }
  const tex = new DataTexture(data, SIZE, SIZE, RGBAFormat);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
