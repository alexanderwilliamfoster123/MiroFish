// Vanilla port of the supplied MacBookKeyboard React component: same deck,
// key-rim glow, inset caps, and layout, built data-driven instead of as
// 1000 lines of JSX. Clicking keys is the ONLY way to type — the physical
// keyboard is intentionally ignored by the contact view.
//
// createMacKeyboard({ onChar, onDelete, onReturn }) -> { el }
// Shift and caps are handled internally (shift auto-releases after a key).

const U = 34; // 1 key unit in px
const GAP = 3;

function kdef(opts) {
  return Object.assign({ w: 1, type: "noop", cls: "" }, opts);
}

const dual = (top, bottom, char, shiftChar) =>
  kdef({ top, bottom, char, shiftChar, type: "char" });
const letter = (ch) => kdef({ bottom: ch.toUpperCase(), char: ch, type: "letter" });

const ROWS = [
  [
    kdef({ bottom: "esc", w: 1.6, align: "bl" }),
    ...["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"]
      .map((f) => kdef({ bottom: f, cls: "kb-fn" })),
    kdef({ type: "power" })
  ],
  [
    dual("~", "`", "`", "~"),
    dual("!", "1", "1", "!"),
    dual("@", "2", "2", "@"),
    dual("#", "3", "3", "#"),
    dual("$", "4", "4", "$"),
    dual("%", "5", "5", "%"),
    dual("^", "6", "6", "^"),
    dual("&", "7", "7", "&"),
    dual("*", "8", "8", "*"),
    dual("(", "9", "9", "("),
    dual(")", "0", "0", ")"),
    dual("—", "_", "-", "_"),
    dual("+", "=", "=", "+"),
    kdef({ bottom: "delete", w: 1.6, align: "br", type: "delete" })
  ],
  [
    kdef({ bottom: "tab", w: 1.6, align: "bl" }),
    ...["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map(letter),
    dual("{", "[", "[", "{"),
    dual("}", "]", "]", "}"),
    dual("|", "\\", "\\", "|")
  ],
  [
    kdef({ bottom: "caps lock", w: 1.85, align: "bl", type: "caps" }),
    ...["a", "s", "d", "f", "g", "h", "j", "k", "l"].map(letter),
    dual(":", ";", ";", ":"),
    dual("”", "'", "'", "”"),
    kdef({ bottom: "return", w: 1.85, align: "br", type: "return" })
  ],
  [
    kdef({ bottom: "shift", w: 2.35, align: "bl", type: "shift" }),
    ...["z", "x", "c", "v", "b", "n", "m"].map(letter),
    dual("<", ",", ",", "<"),
    dual(">", ".", ".", ">"),
    dual("?", "/", "/", "?"),
    kdef({ bottom: "shift", w: 2.35, align: "br", type: "shift" })
  ],
  [
    kdef({ bottom: "fn" }),
    kdef({ bottom: "control" }),
    kdef({ bottom: "option" }),
    kdef({ bottom: "command", w: 1.25 }),
    kdef({ w: 5.05 }), // space
    kdef({ bottom: "command", w: 1.25 }),
    kdef({ bottom: "option" }),
    kdef({ type: "arrows", w: 3 })
  ]
];

export function createMacKeyboard({ onChar, onDelete, onReturn } = {}) {
  const el = document.createElement("div");
  el.className = "kb";
  let shift = false;
  let caps = false;
  const shiftKeys = [];
  let capsKey = null;

  const setShift = (v) => {
    shift = v;
    for (const k of shiftKeys) k.classList.toggle("kb-mod-active", shift);
  };

  const press = (btn, def) => {
    btn.classList.add("kb-pressed");
    setTimeout(() => btn.classList.remove("kb-pressed"), 120);
    switch (def.type) {
      case "char":
        onChar?.(shift ? def.shiftChar : def.char);
        if (shift) setShift(false);
        break;
      case "letter": {
        const upper = shift !== caps;
        onChar?.(upper ? def.char.toUpperCase() : def.char);
        if (shift) setShift(false);
        break;
      }
      case "delete":
        onDelete?.();
        break;
      case "return":
        onReturn?.();
        break;
      case "shift":
        setShift(!shift);
        break;
      case "caps":
        caps = !caps;
        capsKey.classList.toggle("kb-mod-active", caps);
        break;
      default:
        break; // decorative keys press but type nothing
    }
  };

  const makeKey = (def, height = U) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `kb-key ${def.cls || ""}`;
    const cap = document.createElement("div");
    cap.className = "kb-cap" + (def.align ? ` kb-${def.align}` : "");
    cap.style.width = `${def.w * U + (def.w > 1 ? Math.round((def.w - 1)) * GAP : 0)}px`;
    cap.style.height = `${height}px`;
    if (def.type === "power") {
      const dot = document.createElement("div");
      dot.className = "kb-power";
      cap.appendChild(dot);
    } else {
      if (def.top) {
        const t = document.createElement("span");
        t.textContent = def.top;
        cap.appendChild(t);
      }
      if (def.bottom) {
        const b = document.createElement("span");
        b.textContent = def.bottom;
        cap.appendChild(b);
      }
    }
    btn.appendChild(cap);
    const label = def.type === "char" || def.type === "letter"
      ? (def.char === " " ? "space" : def.char)
      : (def.type !== "noop" && def.type !== "power" ? def.type : def.bottom || "blank");
    btn.dataset.key = label;
    btn.setAttribute("aria-label", label);
    btn.addEventListener("click", () => press(btn, def));
    if (def.type === "shift") shiftKeys.push(btn);
    if (def.type === "caps") capsKey = btn;
    return btn;
  };

  for (const row of ROWS) {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    for (const def of row) {
      if (def.type === "arrows") {
        const cluster = document.createElement("div");
        cluster.className = "kb-arrows";
        const half = (glyph) => {
          const b = makeKey(kdef({ bottom: glyph }), (U - GAP) / 2);
          b.classList.add("kb-half");
          return b;
        };
        const top = document.createElement("div");
        top.className = "kb-arrow-row";
        top.appendChild(half("▴"));
        const bottom = document.createElement("div");
        bottom.className = "kb-arrow-row";
        bottom.append(half("◂"), half("▾"), half("▸"));
        cluster.append(top, bottom);
        rowEl.appendChild(cluster);
      } else {
        rowEl.appendChild(makeKey(def));
      }
    }
    el.appendChild(rowEl);
  }

  return { el };
}
