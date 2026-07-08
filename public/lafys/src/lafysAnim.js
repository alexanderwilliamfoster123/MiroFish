import gsap from "gsap";

// Text-reveal in soul.io's spirit: each text element scrambles through random
// glyphs and resolves left→right. Used both for the intro cascade and for the
// hover effect on links / text.

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%/<>_#*";
const rnd = (i) => GLYPHS[(i * 79 + ((i * i) % 23)) % GLYPHS.length];

function scramble(el, delay, duration) {
  // Кешируем ОРИГИНАЛ при первом вызове — иначе повторный hover во время анимации
  // захватывает уже-перемешанный текст как target и оригинал теряется навсегда.
  if (el._origText == null) el._origText = el.textContent;
  const target = el._origText;
  if (!target.trim()) return;
  if (el._scrambling) { gsap.killTweensOf(el._scrambling); el.textContent = target; }
  const n = target.length;
  // show a fully-scrambled state immediately so there's no flash of the final
  // text during the (staggered) delay — the scramble reads as starting at once
  let init = "";
  for (let i = 0; i < n; i++) {
    const c = target[i];
    init += c === " " || c === "\n" ? c : rnd(i);
  }
  el.textContent = init;
  const s = { p: 0 };
  el._scrambling = s;
  gsap.to(s, {
    p: 1,
    duration,
    delay,
    ease: "power2.out",
    onUpdate: () => {
      const reveal = Math.floor(s.p * n);
      let out = "";
      for (let i = 0; i < n; i++) {
        const c = target[i];
        out += i < reveal || c === " " || c === "\n" ? c : rnd(i + Math.floor(s.p * 47));
      }
      el.textContent = out;
    },
    onComplete: () => {
      el.textContent = target;
      el._scrambling = null;
    },
  });
}

// scramble every leaf text node inside `root` (so containers with markup work)
export function scrambleNode(root, delay = 0, duration = 0.4) {
  const leaves =
    root.children.length === 0
      ? [root]
      : [...root.querySelectorAll("*")].filter((e) => e.children.length === 0 && e.textContent.trim() && !e.classList.contains("arr"));
  leaves.forEach((el) => scramble(el, delay, duration));
}

// re-scramble on hover for links / interactive text
function attachHoverScramble(root) {
  const hoverSel =
    ".nav a, .side-nav a, .learn-more, .db-label";
  root.querySelectorAll(hoverSel).forEach((el) => {
    el.addEventListener("mouseenter", () => scrambleNode(el, 0, 0.4));
  });
}

export function animateLafysUI(root = document) {
  // hero заголовок/подзаголовок теперь = lafys reveal (SplitText, в index.html) — их скрембл НЕ трогает.

  const sel =
    ".nav .txt, .learn-more," +
    ".goal-label, .goal-copy, .side-nav a, .db-label";

  const els = [...root.querySelectorAll(sel)].filter((e) => e.children.length === 0 && e.textContent.trim());
  els.sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    return ra.top - rb.top || ra.left - rb.left;
  });

  // strokes / lines draw in
  gsap.fromTo(
    root.querySelectorAll(".accent-tick, .top-divider"),
    { scaleX: 0 },
    { scaleX: 1, transformOrigin: "left center", duration: 1.1, ease: "expo.out", stagger: 0.05 },
  );

  // text cascades in
  els.forEach((el, i) => {
    const d = Math.min(i, 40) * 0.03; // no base delay — scramble starts at once
    el.style.opacity = "1";
    scramble(el, d, 0.6);
  });

  attachHoverScramble(root);
}
