// Site control panel, styled after the user's "Write to me" reference:
// serif title, a to/from/body mail panel with SEND, and a flat outlined
// keyboard below. Text is entered by physical typing OR by playing the
// on-screen keys. SEND opens a prefilled email to the site owner; a body
// that starts with "/" runs a command instead (navigation, theme, …), which
// makes the panel the command surface for the whole site.
//
//   const panel = createControlPanel({
//     to: "you@example.com",
//     commands: { "/library": () => ..., "/dark": () => ... }
//   });
//   mount.appendChild(panel.el);
//   window.addEventListener("keydown", (e) => {
//     if (panelIsActive && panel.handleKey(e)) e.preventDefault();
//   });
//
// Styles are scoped under .cp (see styles.css) and follow the site's theme
// variables, so the component drops into any page of the design system.

const ROWS = [
  [
    ["~", "`"], ["!", "1"], ["@", "2"], ["#", "3"], ["$", "4"], ["%", "5"],
    ["^", "6"], ["&", "7"], ["*", "8"], ["(", "9"], [")", "0"], ["_", "-"],
    ["+", "="], { type: "backspace", label: "⌫", w: 2 }
  ],
  [
    { type: "tab", label: "Tab", w: 1.7 },
    "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
    ["{", "["], ["}", "]"], ["|", "\\"]
  ],
  [
    { type: "caps", label: "Caps", w: 2 },
    "a", "s", "d", "f", "g", "h", "j", "k", "l",
    [":", ";"], ["\"", "'"],
    { type: "enter", label: "Enter", w: 2.3 }
  ],
  [
    { type: "shift", label: "Shift", w: 2.6 },
    "z", "x", "c", "v", "b", "n", "m",
    [",", "<"], [".", ">"], ["/", "?"],
    { type: "shift", label: "Shift", w: 2.6 }
  ],
  [
    { type: "noop", label: "Ctrl", w: 1.7 },
    { type: "noop", label: "⊞" },
    { type: "noop", label: "Alt", w: 1.7 },
    { type: "space", label: "", w: 7.2 },
    { type: "noop", label: "Alt", w: 1.7 },
    { type: "noop", label: "≡" },
    { type: "noop", label: "Ctrl", w: 1.7 }
  ]
];

export function createControlPanel({ to = "", commands = {}, subject = "hello" } = {}) {
  const el = document.createElement("div");
  el.className = "cp";
  const cmdNames = Object.keys(commands);
  el.innerHTML = `
    <p class="cp-eyebrow">contact</p>
    <h2 class="cp-title">Write to me</h2>
    <div class="cp-panel">
      <div class="cp-head">
        <div class="cp-meta">
          <p class="cp-row"><span class="cp-label">to:</span><span class="cp-static"></span></p>
          <p class="cp-row cp-field" data-field="from"><span class="cp-label">from:</span><span class="cp-text" data-ph="your@email"></span><span class="cp-caret"></span></p>
        </div>
        <button class="cp-send" type="button">send&nbsp;↗</button>
      </div>
      <div class="cp-field cp-body" data-field="body"><span class="cp-text" data-ph="start typing, or play the keys below…"></span><span class="cp-caret"></span></div>
    </div>
    <p class="cp-hint"></p>
    <div class="cp-keys"></div>`;
  el.querySelector(".cp-static").textContent = to;

  const hintEl = el.querySelector(".cp-hint");
  const defaultHint = cmdNames.length ? `commands: ${cmdNames.join("  ")}` : "";
  hintEl.textContent = defaultHint;
  let hintTimer = 0;
  const flash = (msg) => {
    clearTimeout(hintTimer);
    hintEl.textContent = msg;
    hintEl.classList.add("ok");
    hintTimer = setTimeout(() => {
      hintEl.textContent = defaultHint;
      hintEl.classList.remove("ok");
    }, 2600);
  };

  const fields = { from: "", body: "" };
  const fieldEls = {
    from: el.querySelector('[data-field="from"]'),
    body: el.querySelector('[data-field="body"]')
  };
  let active = "from";

  const render = () => {
    for (const name of ["from", "body"]) {
      fieldEls[name].querySelector(".cp-text").textContent = fields[name];
      fieldEls[name].classList.toggle("active", name === active);
    }
  };
  render();

  for (const name of ["from", "body"]) {
    fieldEls[name].addEventListener("click", () => {
      active = name;
      render();
    });
  }

  const runCommand = (raw) => {
    const name = raw.trim().toLowerCase();
    if (commands[name]) {
      fields.body = "";
      render();
      flash(`→ ${name.slice(1)}`);
      commands[name]();
      return true;
    }
    flash(`unknown command · try ${cmdNames.join("  ")}`);
    return false;
  };

  const send = () => {
    if (fields.body.trim().startsWith("/")) {
      runCommand(fields.body);
      return;
    }
    if (!fields.body.trim() && !fields.from.trim()) {
      flash("write something first");
      return;
    }
    const body = fields.from.trim()
      ? `${fields.body}\n\n— ${fields.from.trim()}`
      : fields.body;
    const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    flash("opening your email app…");
    window.location.href = href;
  };
  el.querySelector(".cp-send").addEventListener("click", send);

  /* --------------------------------------------------- shared input path */
  const input = (ch) => {
    if (active === "from" && (ch === "\n" || fields.from.length > 64)) return;
    if (fields[active].length > 2000) return;
    fields[active] += ch;
    render();
  };
  const backspace = () => {
    fields[active] = fields[active].slice(0, -1);
    render();
  };
  const enterKey = () => {
    if (active === "from") {
      active = "body";
      render();
    } else if (fields.body.trim().startsWith("/")) {
      runCommand(fields.body);
    } else {
      input("\n");
    }
  };
  const tabKey = () => {
    active = active === "from" ? "body" : "from";
    render();
  };

  /* -------------------------------------------------- physical keyboard */
  const handleKey = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return false;
    if (e.key === "Backspace") { backspace(); return true; }
    if (e.key === "Enter") { enterKey(); return true; }
    if (e.key === "Tab") { tabKey(); return true; }
    if (e.key.length === 1) { input(e.key); return true; }
    return false;
  };

  /* -------------------------------------------------- on-screen keyboard */
  let shift = false;
  let caps = false;
  const shiftBtns = [];
  let capsBtn = null;
  const setShift = (v) => {
    shift = v;
    for (const b of shiftBtns) b.classList.toggle("cp-mod-active", shift);
  };

  const keysEl = el.querySelector(".cp-keys");
  for (const row of ROWS) {
    const rowEl = document.createElement("div");
    rowEl.className = "cp-krow";
    for (const def of row) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cp-key";
      let main = "";
      let small = "";
      let action = null;
      if (typeof def === "string") {
        main = def.toUpperCase();
        action = () => {
          input(shift !== caps ? def.toUpperCase() : def);
          if (shift) setShift(false);
        };
        btn.dataset.key = def;
      } else if (Array.isArray(def)) {
        const [primary, shifted] = def;
        main = primary;
        small = shifted;
        action = () => {
          input(shift ? shifted : primary);
          if (shift) setShift(false);
        };
        btn.dataset.key = primary;
      } else {
        main = def.label;
        btn.classList.add("cp-kwide");
        if (def.w) btn.style.minWidth = `${def.w * 52}px`;
        btn.dataset.key = def.type;
        if (def.type === "backspace") action = backspace;
        else if (def.type === "enter") action = enterKey;
        else if (def.type === "tab") action = tabKey;
        else if (def.type === "space") action = () => input(" ");
        else if (def.type === "shift") { action = () => setShift(!shift); shiftBtns.push(btn); }
        else if (def.type === "caps") {
          action = () => { caps = !caps; capsBtn.classList.toggle("cp-mod-active", caps); };
          capsBtn = btn;
        } else { action = () => {}; btn.classList.add("cp-knoop"); }
      }
      if (small) {
        const s = document.createElement("span");
        s.className = "cp-ksmall";
        s.textContent = small;
        btn.appendChild(s);
      }
      const m = document.createElement("span");
      m.className = "cp-kmain";
      m.textContent = main;
      btn.appendChild(m);
      btn.setAttribute("aria-label", btn.dataset.key);
      btn.addEventListener("click", () => {
        btn.classList.add("cp-pressed");
        setTimeout(() => btn.classList.remove("cp-pressed"), 130);
        action();
      });
      rowEl.appendChild(btn);
    }
    keysEl.appendChild(rowEl);
  }

  return {
    el,
    handleKey,
    focusBody: () => { active = "body"; render(); }
  };
}
