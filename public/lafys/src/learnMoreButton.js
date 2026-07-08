/* ═══════════════════════════════════════════════════════════════════════
   "Learn More" — Pixel Button (standalone)

   Самодостаточная кнопка из Framer-проекта. Эффект: поверх кнопки <canvas>
   с сеткой «пикселей», которые при наведении заполняются волной слева-направо
   (с мерцанием на фронте), а текст инвертируется. При уходе — в обратную сторону.

   Зависимостей НЕТ. Чистый ES-модуль. Один публичный экспорт:

       import { createLearnMoreButton } from './learn-more-button.js';
       createLearnMoreButton(document.querySelector('#cta'), { link: '/about' });

   Дефолты = ровно тот инстанс, что стоит на сайте (тёмный pill, белая рамка,
   шрифт Geist, sweep + shimmer). Любой параметр можно переопределить — см.
   PRESET ниже и README.md.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Пресет «как на сайте» (первая кнопка) ───────────────────────────────
   Меняй здесь, если нужно поменять вид по умолчанию для всех инстансов. */
export const PRESET = {
  label: 'Learn More',
  link: null,                 // href; если null — ссылка-оверлей не создаётся
  // Цвета: bg/text/border — покой; hoverBg/hoverText — наведение
  bg: '#111111',
  text: '#FFFFFF',
  border: '#FFFFFF',
  hoverBg: '#FFFFFF',
  hoverText: '#111111',
  // Геометрия
  radius: 0,                  // px (0 = квадратные углы; 115 = pill)
  paddingX: 64,               // ширину задаёт горизонтальный отступ
  paddingY: 16,
  // Шрифт
  fontFamily: 'Geist',
  fontSize: 14,               // px
  fontWeight: 500,
  letterSpacing: '-0.03em',
  lineHeight: '1em',
  uppercase: true,            // ЗАГЛАВНЫЕ буквы
  // Пиксельный эффект
  pixelSize: 6,               // размер клетки, px
  speed: 0.45,                // «длительность»; меньше = быстрее
  mode: 'sweep',              // 'sweep' (волной) | 'sprinkle' (вразброс)
  shimmer: true,              // мерцание на фронте волны
};

// Детерминированный псевдо-рандом на индекс пикселя (узор стабилен между кадрами).
function hash(i) {
  let t = (i * 374761393 + 668265263) | 0;
  t = ((t ^ (t >> 13)) * 1274126177) | 0;
  return ((t ^ (t >> 16)) >>> 0) / 4294967295;
}

// Framer-цвета вида "var(--token, #fff)" → берём фолбэк.
function colorOf(c) {
  if (!c) return 'rgba(0,0,0,0)';
  const m = c.match(/var\([^,]+,\s*(.+)\)\s*$/);
  return m ? m[1].trim() : c;
}

/**
 * Создаёт кнопку и добавляет её в `target`.
 * @param {HTMLElement} target — контейнер, куда вставить кнопку.
 * @param {Partial<typeof PRESET>} [opts] — переопределения пресета.
 * @returns {{ el: HTMLElement, destroy: () => void }}
 */
export function createLearnMoreButton(target, opts = {}) {
  const o = { ...PRESET, ...opts };

  // ── DOM ──
  const root = document.createElement('div');
  Object.assign(root.style, {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${o.paddingY}px ${o.paddingX}px`,
    background: colorOf(o.bg),
    border: `1px solid ${colorOf(o.border)}`,
    borderRadius: `${o.radius}px`,
    overflow: 'hidden',
    textDecoration: 'none',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  });

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none',
  });

  const span = document.createElement('span');
  span.textContent = o.label;
  Object.assign(span.style, {
    position: 'relative', zIndex: '1',
    fontFamily: `"${o.fontFamily}", sans-serif`,
    fontSize: `${o.fontSize}px`,
    fontWeight: o.fontWeight,
    lineHeight: o.lineHeight,
    letterSpacing: o.letterSpacing,
    textTransform: o.uppercase ? 'uppercase' : 'none',
    whiteSpace: 'nowrap',
    color: colorOf(o.text),
    transition: 'color 0.15s',
  });

  root.appendChild(canvas);
  root.appendChild(span);

  if (o.link) {
    const a = document.createElement('a');
    a.href = o.link;
    a.setAttribute('aria-label', o.label);
    Object.assign(a.style, { position: 'absolute', inset: '0', zIndex: '2', display: 'block' });
    root.appendChild(a);
  }

  // ── Состояние анимации ──
  let W = 0, H = 0, cols = 1, rows = 1;
  let thresholds = new Float32Array(1);
  let progress = 0, target01 = 0, raf = 0, lastT = 0, textHover = false;
  const ctx = canvas.getContext('2d');
  const speed = 1 / Math.max(o.speed, 0.1); // единиц прогресса в секунду

  function rebuildGrid() {
    cols = Math.max(1, Math.ceil(W / o.pixelSize));
    rows = Math.max(1, Math.ceil(H / o.pixelSize));
    thresholds = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        thresholds[i] = o.mode === 'sweep'
          ? (x / Math.max(cols - 1, 1) * 0.65 + hash(i) * 0.35) * 0.92
          : hash(i) * 0.92;
      }
    }
  }

  function draw(p) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (p <= 0) return;
    ctx.fillStyle = colorOf(o.hoverBg);
    const s = o.pixelSize;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const thr = thresholds[y * cols + x];
        if (p <= thr) continue;
        ctx.globalAlpha = (o.shimmer && p - thr < 0.12) ? 0.45 : 1;
        ctx.fillRect(x * s, y * s, s, s);
      }
    }
    ctx.globalAlpha = 1;
  }

  function setText(hovering) {
    if (hovering === textHover) return;
    textHover = hovering;
    span.style.color = colorOf(hovering ? o.hoverText : o.text);
  }

  function frame(now) {
    const dt = (now - lastT) / 1000;
    lastT = now;
    progress = target01 > progress
      ? Math.min(progress + dt * speed, 1)
      : Math.max(progress - dt * speed, 0);
    draw(progress);
    setText(progress > 0.6);
    raf = progress !== target01 ? requestAnimationFrame(frame) : 0;
  }

  function kick() {
    if (raf) return;
    lastT = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    const r = root.getBoundingClientRect();
    W = r.width; H = r.height;
    if (W === 0 || H === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr); }
    rebuildGrid();
    draw(progress);
  }

  root.addEventListener('pointerenter', () => { target01 = 1; kick(); });
  root.addEventListener('pointerleave', () => { target01 = 0; kick(); });

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(root); else window.addEventListener('resize', resize);

  target.appendChild(root);
  resize();

  return {
    el: root,
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
      root.remove();
    },
  };
}

export default createLearnMoreButton;
