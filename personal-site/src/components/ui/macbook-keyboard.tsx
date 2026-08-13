// MacBook-style keyboard in the kaif-ui aesthetic (dark deck, bezeled keys,
// faint white glow, tiny labels) rebuilt data-driven and interactive: every
// key presses, physical keystrokes light their key, and onKey reports the
// resolved character (honoring shift / caps).

import {
  FastForward,
  LayoutGrid,
  Mic,
  Moon,
  Play,
  Rewind,
  Search,
  Sun,
  SunMedium,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const INNER_SHADOW =
  "rgb(13, 13, 15) 0px -0.5px 2px 0px inset, rgb(13, 13, 15) -0.5px 0px 2px 0px inset";

interface KeyDef {
  id: string; // matches e.key (lowercase)
  out?: string; // character produced (default: id)
  shiftOut?: string; // character with shift held
  label?: React.ReactNode;
  width?: string; // tailwind width class, default w-6
  align?: "start" | "end" | "center";
  modifier?: "shift" | "caps" | "none"; // non-typing keys
}

function keyRow(defs: KeyDef[]): KeyDef[] {
  return defs;
}

const ROW_NUM = keyRow([
  { id: "`", shiftOut: "~", label: <Dual top="~" bottom="`" /> },
  { id: "1", shiftOut: "!", label: <Dual top="!" bottom="1" /> },
  { id: "2", shiftOut: "@", label: <Dual top="@" bottom="2" /> },
  { id: "3", shiftOut: "#", label: <Dual top="#" bottom="3" /> },
  { id: "4", shiftOut: "$", label: <Dual top="$" bottom="4" /> },
  { id: "5", shiftOut: "%", label: <Dual top="%" bottom="5" /> },
  { id: "6", shiftOut: "^", label: <Dual top="^" bottom="6" /> },
  { id: "7", shiftOut: "&", label: <Dual top="&" bottom="7" /> },
  { id: "8", shiftOut: "*", label: <Dual top="*" bottom="8" /> },
  { id: "9", shiftOut: "(", label: <Dual top="(" bottom="9" /> },
  { id: "0", shiftOut: ")", label: <Dual top=")" bottom="0" /> },
  { id: "-", shiftOut: "_", label: <Dual top="—" bottom="_" /> },
  { id: "=", shiftOut: "+", label: <Dual top="+" bottom="=" /> },
  { id: "backspace", out: "", label: "delete", width: "w-10", align: "end", modifier: "none" },
]);

const ROW_TOP = keyRow([
  { id: "tab", out: "", label: "tab", width: "w-10", align: "start", modifier: "none" },
  ...Array.from("qwertyuiop", (c) => ({ id: c, label: c.toUpperCase() })),
  { id: "[", shiftOut: "{", label: <Dual top="{" bottom="[" /> },
  { id: "]", shiftOut: "}", label: <Dual top="}" bottom="]" /> },
  { id: "\\", shiftOut: "|", label: <Dual top="|" bottom="\\" /> },
]);

const ROW_MID = keyRow([
  { id: "capslock", label: "caps lock", width: "w-[2.8rem]", align: "start", modifier: "caps" },
  ...Array.from("asdfghjkl", (c) => ({ id: c, label: c.toUpperCase() })),
  { id: ";", shiftOut: ":", label: <Dual top=":" bottom=";" /> },
  { id: "'", shiftOut: '"', label: <Dual top='"' bottom="'" /> },
  { id: "enter", out: "", label: "return", width: "w-[2.85rem]", align: "end", modifier: "none" },
]);

const ROW_BOT = keyRow([
  { id: "shift", label: "shift", width: "w-[3.65rem]", align: "start", modifier: "shift" },
  ...Array.from("zxcvbnm", (c) => ({ id: c, label: c.toUpperCase() })),
  { id: ",", shiftOut: "<", label: <Dual top="<" bottom="," /> },
  { id: ".", shiftOut: ">", label: <Dual top=">" bottom="." /> },
  { id: "/", shiftOut: "?", label: <Dual top="?" bottom="/" /> },
  { id: "shift-r", out: "", label: "shift", width: "w-[3.65rem]", align: "end", modifier: "shift" },
]);

function Dual({ top, bottom }: { top: string; bottom: string }) {
  return (
    <span className="flex flex-col items-center leading-[1.2]">
      <span className="block">{top}</span>
      <span className="block">{bottom}</span>
    </span>
  );
}

const F_ICONS = [Sun, SunMedium, LayoutGrid, Search, Mic, Moon, Rewind, Play, FastForward, VolumeX, Volume1, Volume2];

interface MacBookKeyboardProps {
  onKey?: (key: string, resolved: string) => void;
  pressedKey?: string | null; // externally-driven highlight (physical keys)
}

export function MacBookKeyboard({ onKey, pressedKey }: MacBookKeyboardProps) {
  const [shift, setShift] = useState(false);
  const [caps, setCaps] = useState(false);
  const [clicked, setClicked] = useState<string | null>(null);
  const [physical, setPhysical] = useState<string | null>(null);

  // light up keys from the physical keyboard too
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      setPhysical(e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase());
    };
    const up = () => setPhysical(null);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const isPressed = (def: KeyDef) => {
    const active = clicked ?? pressedKey ?? physical;
    if (!active) return false;
    if (def.id === "shift-r") return active === "shift";
    return active === def.id || (def.shiftOut && active === def.shiftOut);
  };

  const press = (def: KeyDef) => {
    setClicked(def.id);
    setTimeout(() => setClicked(null), 140);

    if (def.modifier === "shift") {
      setShift((s) => !s);
      onKey?.("Shift", "Shift");
      return;
    }
    if (def.modifier === "caps") {
      setCaps((c) => !c);
      onKey?.("CapsLock", "CapsLock");
      return;
    }
    if (def.id === "backspace") {
      onKey?.("Backspace", "Backspace");
      return;
    }
    if (def.id === "enter") {
      onKey?.("Enter", "Enter");
      return;
    }
    if (def.id === "tab") {
      onKey?.("Tab", "Tab");
      return;
    }
    if (def.id === "space") {
      onKey?.(" ", " ");
      return;
    }
    let resolved = def.out ?? def.id;
    if (/^[a-z]$/.test(def.id)) {
      resolved = shift !== caps ? def.id.toUpperCase() : def.id;
    } else if (shift && def.shiftOut) {
      resolved = def.shiftOut;
    }
    if (shift) setShift(false);
    onKey?.(def.id, resolved);
  };

  const keyShell = (def: KeyDef, content: React.ReactNode) => {
    const pressed =
      isPressed(def) ||
      (def.modifier === "shift" && shift) ||
      (def.modifier === "caps" && caps);
    return (
      <button
        type="button"
        key={def.id}
        onClick={() => press(def)}
        aria-label={def.id}
        className={
          "p-[0.5px] rounded-[4px] bg-white/[0.2] cursor-pointer transition duration-100 " +
          (pressed
            ? "shadow-none scale-[0.94]"
            : "shadow-md shadow-white/50 hover:shadow-none hover:scale-[0.98]")
        }
      >
        <div
          className={`h-6 ${def.width ?? "w-6"} bg-[#0A090D] rounded-[3.5px] flex ${
            def.align === "start"
              ? "items-end justify-start pl-[4px] pb-[2px]"
              : def.align === "end"
                ? "items-end justify-end pr-[4px] pb-[2px]"
                : "items-center justify-center"
          }`}
          style={{ boxShadow: INNER_SHADOW }}
        >
          <div className="text-[5px] text-white">{content}</div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-row items-center justify-center">
      <div className="rounded-md bg-zinc-800 p-1 w-fit h-fit mx-auto">
        {/* function row */}
        <div className="flex gap-[2px] mb-[2px]">
          {keyShell({ id: "escape", modifier: "none", out: "", width: "w-10", align: "start" }, "esc")}
          {F_ICONS.map((Icon, i) => (
            <div
              key={`f${i + 1}`}
              className="p-[0.5px] rounded-[4px] bg-white/[0.2] shadow-md shadow-white/50 hover:shadow-none hover:scale-[0.98] cursor-pointer transition duration-100"
            >
              <div
                className="h-6 w-6 bg-[#0A090D] rounded-[3.5px] flex items-center justify-center"
                style={{ boxShadow: INNER_SHADOW }}
              >
                <div className="text-[5px] text-white flex flex-col items-center">
                  <Icon className="h-[6px] w-[6px]" strokeWidth={2} />
                  <span className="mt-1 block">F{i + 1}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="p-[0.5px] rounded-[4px] bg-white/[0.2] shadow-md shadow-white/50 cursor-pointer transition duration-100">
            <div
              className="h-6 w-6 bg-[#0A090D] rounded-[3.5px] flex items-center justify-center"
              style={{ boxShadow: INNER_SHADOW }}
            >
              <div className="h-4 w-4 rounded-full bg-gradient-to-b from-neutral-900 from-20% via-black via-50% to-neutral-900 to-95% p-px">
                <div className="bg-black h-full w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {[ROW_NUM, ROW_TOP, ROW_MID, ROW_BOT].map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-[2px] mb-[2px]">
            {row.map((def) => keyShell(def, def.label))}
          </div>
        ))}

        {/* bottom row */}
        <div className="flex gap-[2px]">
          {keyShell({ id: "fn", modifier: "none", out: "" }, "fn")}
          {keyShell({ id: "control", modifier: "none", out: "" }, "control")}
          {keyShell({ id: "alt", modifier: "none", out: "" }, "option")}
          {keyShell({ id: "meta", modifier: "none", out: "", width: "w-8" }, "command")}
          {keyShell({ id: "space", out: " ", width: "w-[8.2rem]" }, "")}
          {keyShell({ id: "meta-r", modifier: "none", out: "", width: "w-8" }, "command")}
          {keyShell({ id: "alt-r", modifier: "none", out: "" }, "option")}
          {/* arrow cluster */}
          <div className="w-[4.9rem] h-6 flex flex-col justify-end items-center">
            <div className="p-[0.5px] rounded-[3px] bg-white/[0.2] shadow-md shadow-white/50">
              <div
                className="bg-[#0A090D] rounded-[2.5px] w-6 h-[11px] flex items-center justify-center text-white text-[6px]"
                style={{ boxShadow: INNER_SHADOW }}
              >
                ▲
              </div>
            </div>
            <div className="flex mt-[1px] gap-[1px]">
              {["◀", "▼", "▶"].map((arrow) => (
                <div key={arrow} className="p-[0.5px] rounded-[3px] bg-white/[0.2] shadow-md shadow-white/50">
                  <div
                    className="bg-[#0A090D] rounded-[2.5px] w-6 h-[11px] flex items-center justify-center text-white text-[6px]"
                    style={{ boxShadow: INNER_SHADOW }}
                  >
                    {arrow}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
