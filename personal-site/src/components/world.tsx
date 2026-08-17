import Keyboard from "@/components/ui/magic-keyboard-component";
import { Mac } from "@/components/ui/mac";
import {
  AccessReceipt,
  ReceiptPrinter,
  type ReceiptStage,
} from "@/components/ui/receipt-printer";
import { LETTERS } from "@/lib/letters";
import {
  Apple,
  ArrowLeft,
  Camera,
  Feather,
  Folder,
  Instagram,
  Linkedin,
  Mail,
  Search,
  Send,
  Twitter,
  User,
  Wifi,
  Youtube,
} from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMAIL_KEY = "gate:email";
const NAME_KEY = "gate:name";
const ENTERED_KEY = "gate:entered";

const FOUNDED = ["vertus", "vanquish", "paktos", "tootski", "omera"];
// placeholder names — swap for the real portfolio
const INVESTED = ["aurora", "atlas", "solace", "ember", "northwind"];

// swap hrefs/handles for the real ones
const INSTAGRAMS = [
  { title: "the world", handle: "@alexanderfoster", href: "https://instagram.com/" },
  { title: "the mind", handle: "@alexanderfoster", href: "https://instagram.com/" },
  { title: "the soul", handle: "@alexanderfoster", href: "https://instagram.com/" },
];

const SOCIALS = [
  { title: "linkedin", icon: Linkedin, href: "https://linkedin.com/" },
  { title: "youtube", icon: Youtube, href: "https://youtube.com/" },
  { title: "x", icon: Twitter, href: "https://x.com/" },
];

type AppId = "companies" | "mail" | "letters" | "instagram" | "frames";

// one window at a time, centred on the desktop like a fresh app launch
function DesktopWindow({
  title,
  width,
  height,
  onClose,
  chromeRight,
  children,
}: {
  title: string;
  width: string;
  height: string;
  onClose: () => void;
  chromeRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="desk-window animate-fade-up absolute top-[47%] left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#141414] shadow-[0_24px_70px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.06)]"
      style={{ width, height, animationDuration: "0.35s" }}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
        <button
          type="button"
          onClick={onClose}
          aria-label="close window"
          className="h-2 w-2 cursor-pointer rounded-full bg-[#ff5f57] transition-transform hover:scale-110"
        />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="mx-auto text-[10px] text-neutral-500">{title}</span>
        {chromeRight ?? <span className="w-8" />}
      </div>
      <div className="relative flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

function DeskIcon({
  label,
  icon: IconComponent,
  onOpen,
}: {
  label: string;
  icon: typeof Folder;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-16 cursor-pointer flex-col items-center gap-1"
    >
      <IconComponent
        size={28}
        strokeWidth={1}
        className="desk-folder fill-white/10 text-white/25 transition-colors duration-300 group-hover:fill-white/20 group-hover:text-white/40"
      />
      <span className="max-w-full truncate text-[9px] font-medium text-neutral-300">
        {label}
      </span>
    </button>
  );
}

export function World() {
  const [name, setName] = useState<string | null>(() =>
    localStorage.getItem(NAME_KEY),
  );
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem(EMAIL_KEY),
  );
  const [entered, setEntered] = useState<boolean>(
    () => localStorage.getItem(ENTERED_KEY) === "1",
  );

  const [loginStep, setLoginStep] = useState<"name" | "email">("name");
  const [loginValue, setLoginValue] = useState("");
  const [loginError, setLoginError] = useState(false);

  // after signing up, the printer stamps an access receipt
  const [receipt, setReceipt] = useState<{ date: Date; ticketId: string } | null>(
    null,
  );
  const [receiptStage, setReceiptStage] = useState<ReceiptStage>("processing");

  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [companiesTab, setCompaniesTab] = useState<"founded" | "invested">(
    "founded",
  );
  const [letter, setLetter] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const loginInputRef = useRef<HTMLInputElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const [kbZoom, setKbZoom] = useState(0.72);

  // the keyboard tracks the display: always half its width, like the desk
  useEffect(() => {
    if (isMobile) return;
    const el = displayRef.current;
    if (!el) return;
    const compute = () => setKbZoom((el.clientWidth * 0.51) / 600);
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  // each answer is kept the moment it's given
  useEffect(() => {
    if (name) localStorage.setItem(NAME_KEY, name);
  }, [name]);
  useEffect(() => {
    if (email) localStorage.setItem(EMAIL_KEY, email);
  }, [email]);
  useEffect(() => {
    if (entered) localStorage.setItem(ENTERED_KEY, "1");
  }, [entered]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const submitLogin = () => {
    const trimmed = loginValue.trim();
    if (!trimmed) return;
    if (loginStep === "name") {
      setName(trimmed);
      setLoginValue("");
      setLoginError(false);
      setLoginStep("email");
      loginInputRef.current?.focus();
    } else {
      if (!EMAIL_PATTERN.test(trimmed)) {
        setLoginError(true);
        return;
      }
      setEmail(trimmed);
      const stamp = new Date();
      setReceipt({ date: stamp, ticketId: String(stamp.getTime()).slice(-10) });
      setReceiptStage("processing");
    }
  };

  // the printer works through its stages once the receipt exists
  useEffect(() => {
    if (!receipt || entered) return;
    const printTimer = window.setTimeout(() => setReceiptStage("printing"), 1000);
    const doneTimer = window.setTimeout(() => setReceiptStage("complete"), 2950);
    return () => {
      window.clearTimeout(printTimer);
      window.clearTimeout(doneTimer);
    };
  }, [receipt, entered]);

  const enterWorld = () => {
    setEntered(true);
    setReceipt(null);
  };

  const openApp = (app: AppId) => {
    setActiveApp(app);
    setLetter(null);
    setSent(false);
  };

  const closeApp = () => {
    setActiveApp(null);
    setLetter(null);
    setSent(false);
  };

  // signs out and walks the login again — the email capture, on demand
  const logOut = () => {
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(ENTERED_KEY);
    setName(null);
    setEmail(null);
    setEntered(false);
    setLoginStep("name");
    setLoginValue("");
    setLoginError(false);
    setReceipt(null);
    setActiveApp(null);
    setLetter(null);
    setSent(false);
    setMessage("");
  };

  const sendEmail = () => {
    if (!message.trim() || sent) return;
    const subject = name ? `hello from ${name}` : "hello";
    const body = `${message}\n\n— ${name ?? ""} (${email ?? ""})`;
    const gmail =
      "https://mail.google.com/mail/?view=cm&fs=1&to=alex@vertus.ai" +
      `&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailto =
      `mailto:alex@vertus.ai?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    // both attempts open in a separate tab; the site itself never navigates
    const opened = window.open(gmail, "_blank", "noopener,noreferrer");
    if (!opened) {
      const link = document.createElement("a");
      link.href = mailto;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    setSent(true);
    window.setTimeout(() => {
      setActiveApp(null);
      setMessage("");
      setSent(false);
    }, 2600);
  };

  // esc steps back: letter -> window -> desktop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setLetter((currentLetter) => {
        if (currentLetter !== null) return null;
        setActiveApp(null);
        return null;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // physical typing works anywhere on the machine, not only in the field
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!entered && receipt) {
        if (e.key === "Enter" && receiptStage === "complete") {
          e.preventDefault();
          enterWorld();
        }
      } else if (!entered) {
        if (e.key === "Backspace") {
          e.preventDefault();
          setLoginValue((current) => current.slice(0, -1));
          setLoginError(false);
        } else if (e.key === "Enter") {
          e.preventDefault();
          submitLogin();
        } else if (e.key.length === 1) {
          e.preventDefault();
          if (e.key === " " && loginStep === "email") return;
          setLoginValue((current) =>
            current.length < 64 ? current + e.key : current,
          );
          setLoginError(false);
        }
      } else if (activeApp === "mail" && !sent) {
        if (e.key === "Backspace") {
          e.preventDefault();
          setMessage((current) => current.slice(0, -1));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (e.shiftKey) setMessage((current) => current + "\n");
          else sendEmail();
        } else if (e.key.length === 1) {
          e.preventDefault();
          setMessage((current) => current + e.key);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered, loginStep, loginValue, activeApp, sent, message, receipt, receiptStage]);

  // the aluminium keyboard presses its keys as you type on your real one
  useEffect(() => {
    const labelFor = (key: string): string | null => {
      if (key === " ") return " ";
      if (key === "Backspace") return "delete";
      if (key === "Enter") return "return";
      if (key === "Shift") return "shift";
      if (key === "Tab") return "tab";
      if (key === "CapsLock") return "caps lock";
      if (key === "Escape") return "esc";
      if (key.length === 1) return key.toLowerCase();
      return null;
    };
    const keysFor = (label: string): HTMLElement[] => {
      const root = keyboardRef.current;
      if (!root) return [];
      const all = Array.from(root.querySelectorAll("div"));
      if (label === " ") {
        return all.filter((div) => div.className.includes("flex-[5]"));
      }
      return all.filter(
        (div) =>
          div.childElementCount === 0 &&
          (div.textContent ?? "").trim().toLowerCase() === label,
      );
    };
    const press = (e: KeyboardEvent) => {
      const label = labelFor(e.key);
      if (!label) return;
      keysFor(label).forEach((div) => div.classList.add("key-pressed"));
    };
    const release = (e: KeyboardEvent) => {
      const label = labelFor(e.key);
      if (!label) return;
      keysFor(label).forEach((div) => div.classList.remove("key-pressed"));
    };
    window.addEventListener("keydown", press);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", () => {
      keyboardRef.current
        ?.querySelectorAll(".key-pressed")
        .forEach((div) => div.classList.remove("key-pressed"));
    });
    return () => {
      window.removeEventListener("keydown", press);
      window.removeEventListener("keyup", release);
    };
  }, []);

  // the aluminium keyboard under the display is clickable too
  const onKeyboardClick = (event: MouseEvent<HTMLDivElement>) => {
    const keyDiv = (event.target as HTMLElement).closest("div");
    if (!keyDiv) return;
    const label = (keyDiv.textContent ?? "").trim();
    const append = (text: string) => {
      if (!entered) {
        setLoginValue((current) =>
          current.length < 64 ? current + text : current,
        );
        setLoginError(false);
      } else if (activeApp === "mail" && !sent) {
        setMessage((current) => current + text);
      }
    };
    if (label === "delete") {
      if (!entered) setLoginValue((current) => current.slice(0, -1));
      else if (activeApp === "mail" && !sent)
        setMessage((current) => current.slice(0, -1));
    } else if (label === "return") {
      if (!entered) submitLogin();
      else if (activeApp === "mail" && !sent) sendEmail();
    } else if (label === "" && keyDiv.className.includes("flex-[5]")) {
      if (!(!entered && loginStep === "email")) append(" ");
    } else if (/^[a-z0-9`\-=[\]\\;',./@]$/i.test(label)) {
      append(label.toLowerCase());
    }
  };

  const now = new Date();
  const menuApp = !entered
    ? "alexander foster"
    : activeApp === "mail"
      ? "mail"
      : "finder";

  // ------------------------------------------------------------------ screen
  const screen = (
    <div className="desk-screen relative flex h-full w-full flex-col overflow-hidden text-left text-neutral-200 normal-case lowercase">
      {/* menu bar */}
      <div className="flex h-[18px] shrink-0 items-center justify-between bg-white/[0.06] px-2.5 text-[9px] text-neutral-300 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Apple size={10} className="fill-neutral-200 text-neutral-200" />
          <span className="font-semibold text-neutral-100">{menuApp}</span>
          {["file", "edit", "view", "go", "window", "help"].map((menu) => (
            <span key={menu} className="hidden text-neutral-400 sm:inline">
              {menu}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <Wifi size={9} />
          <Search size={8} />
          <span className="text-neutral-300">
            {now
              .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
              .replace(",", "")}{" "}
            {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {entered && (
            <button
              type="button"
              onClick={logOut}
              className="cursor-pointer text-neutral-500 transition-colors duration-300 outline-none hover:text-neutral-200"
            >
              log out
            </button>
          )}
        </div>
      </div>

      {!entered ? (
        /* ------------------------------------------------ the login screen */
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10">
            <User size={20} strokeWidth={1.5} className="text-neutral-300" />
          </div>
          <div className="text-center">
            <p className="text-[12px] font-medium text-foreground">
              {loginStep === "name"
                ? "welcome to alexander’s world."
                : `hello, ${name}.`}
            </p>
            <p className="mt-1 text-[10px] text-neutral-500">
              {loginStep === "name" ? "sign in with your name" : "and your email"}
            </p>
          </div>
          <input
            ref={loginInputRef}
            key={loginStep}
            autoFocus
            value={loginValue}
            onChange={(event) => {
              const next =
                loginStep === "email"
                  ? event.target.value.replace(/\s/g, "")
                  : event.target.value;
              setLoginValue(next);
              setLoginError(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitLogin();
              }
            }}
            type={loginStep === "email" ? "email" : "text"}
            inputMode={loginStep === "email" ? "email" : "text"}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete={loginStep === "email" ? "email" : "name"}
            placeholder={loginStep === "name" ? "your name" : "you@somewhere.com"}
            aria-label={loginStep === "name" ? "your name" : "your email"}
            className={
              "h-7 w-48 rounded-full border bg-white/10 text-center text-[16px] text-foreground outline-none transition-colors duration-300 placeholder:text-neutral-600 sm:text-[11px] " +
              (loginError ? "border-white/60" : "border-white/15 focus:border-white/35")
            }
          />
          <p className="h-3 text-[9px] text-neutral-500" aria-live="polite">
            {loginError ? "that doesn’t look right." : ""}
          </p>
        </div>
      ) : (
        /* ----------------------------------------------------- the desktop */
        <div className="relative flex-1 overflow-hidden">
          {/* wallpaper quote */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-[12px] font-medium text-neutral-600">by design.</p>
          </div>

          {/* desktop icons */}
          <div className="absolute top-2.5 right-2 flex flex-col items-end gap-3">
            <DeskIcon label="founded" icon={Folder} onOpen={() => { setCompaniesTab("founded"); openApp("companies"); }} />
            <DeskIcon label="invested" icon={Folder} onOpen={() => { setCompaniesTab("invested"); openApp("companies"); }} />
            <DeskIcon label="letters" icon={Folder} onOpen={() => openApp("letters")} />
            <DeskIcon label="frames" icon={Camera} onOpen={() => openApp("frames")} />
          </div>

          {/* ------------------------------------------------- the windows */}
          {activeApp === "companies" && (
            <DesktopWindow
              title={companiesTab}
              width={isMobile ? "92%" : "62%"}
              height={isMobile ? "64%" : "70%"}
              onClose={closeApp}
            >
              <div className="flex h-full">
                <aside className="w-[88px] shrink-0 space-y-0.5 border-r border-white/[0.06] bg-white/[0.02] p-2">
                  <p className="px-1.5 pb-1 text-[8px] tracking-[0.14em] text-neutral-600">
                    favourites
                  </p>
                  {(["founded", "invested"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCompaniesTab(tab)}
                      className={
                        "flex w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] transition-colors duration-200 " +
                        (companiesTab === tab
                          ? "bg-white/10 text-foreground"
                          : "text-neutral-400 hover:bg-white/[0.05]")
                      }
                    >
                      <Folder size={10} strokeWidth={1.5} />
                      {tab}
                    </button>
                  ))}
                </aside>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {(companiesTab === "founded" ? FOUNDED : INVESTED).map(
                      (company, index) => (
                        <div
                          key={company}
                          className="flex cursor-default flex-col items-center gap-1.5 rounded-md p-2 transition-colors duration-200 hover:bg-white/[0.05]"
                        >
                          <Folder
                            size={30}
                            strokeWidth={1}
                            className="desk-folder fill-white/10 text-white/25"
                          />
                          <span className="text-[9.5px] font-medium text-neutral-300">
                            {company}
                          </span>
                          <span className="font-mono text-[7.5px] text-faint">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </DesktopWindow>
          )}

          {activeApp === "letters" && (
            <DesktopWindow
              title={letter === null ? "letters" : LETTERS[letter].title}
              width={isMobile ? "92%" : "58%"}
              height={isMobile ? "68%" : "76%"}
              onClose={closeApp}
            >
              {letter === null ? (
                <div className="h-full overflow-y-auto p-2">
                  {LETTERS.map((entry, index) => (
                    <button
                      key={entry.num}
                      type="button"
                      onClick={() => setLetter(index)}
                      className="flex w-full cursor-pointer items-baseline gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-200 hover:bg-white/[0.05]"
                    >
                      <span className="font-mono text-[8px] text-faint">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 truncate text-[10.5px] font-medium text-neutral-300">
                        {entry.title}
                      </span>
                      <span className="shrink-0 text-[8px] text-faint">
                        {entry.date}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-full overflow-y-auto px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setLetter(null)}
                    className="mb-2.5 flex cursor-pointer items-center gap-1 text-[9px] tracking-[0.14em] text-faint transition-colors duration-300 hover:text-foreground"
                  >
                    <ArrowLeft size={9} /> letters
                  </button>
                  <div className="space-y-2.5 text-[10.5px] leading-[1.8] text-neutral-400">
                    <p>
                      <span className="font-medium text-foreground">
                        {LETTERS[letter].title}.
                      </span>{" "}
                      {LETTERS[letter].paragraphs[0]}
                    </p>
                    {LETTERS[letter].paragraphs.slice(1).map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                  </div>
                  <p className="mt-4 font-serif text-[12px] italic text-neutral-500">
                    alexander
                  </p>
                  <p className="mt-0.5 pb-2 font-mono text-[8px] text-faint">
                    {LETTERS[letter].date}
                  </p>
                </div>
              )}
            </DesktopWindow>
          )}

          {activeApp === "instagram" && (
            <DesktopWindow
              title="instagram"
              width={isMobile ? "80%" : "34%"}
              height="52%"
              onClose={closeApp}
            >
              <div className="flex h-full flex-col justify-center gap-1 p-3">
                {INSTAGRAMS.map((account) => (
                  <button
                    key={account.title}
                    type="button"
                    onClick={() =>
                      window.open(account.href, "_blank", "noopener")
                    }
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-200 hover:bg-white/[0.05]"
                  >
                    <Instagram size={13} strokeWidth={1.5} className="text-neutral-300" />
                    <span className="flex-1 text-[10.5px] font-medium text-neutral-300">
                      {account.title}
                    </span>
                    <span className="font-mono text-[8px] text-faint">
                      {account.handle}
                    </span>
                  </button>
                ))}
              </div>
            </DesktopWindow>
          )}

          {activeApp === "frames" && (
            <DesktopWindow
              title="frames"
              width={isMobile ? "70%" : "30%"}
              height="34%"
              onClose={closeApp}
            >
              <div className="flex h-full flex-col items-center justify-center gap-1.5">
                <Camera size={16} strokeWidth={1.25} className="text-neutral-500" />
                <p className="text-[10px] text-neutral-500">
                  photographs &mdash; coming soon.
                </p>
              </div>
            </DesktopWindow>
          )}

          {activeApp === "mail" && (
            <DesktopWindow
              title="new message"
              width={isMobile ? "92%" : "54%"}
              height={isMobile ? "62%" : "72%"}
              onClose={closeApp}
              chromeRight={
                !sent ? (
                  <button
                    type="button"
                    onClick={sendEmail}
                    disabled={!message.trim()}
                    aria-label="send"
                    className="flex cursor-pointer items-center gap-1 text-[9.5px] text-neutral-400 transition-colors duration-300 hover:text-foreground disabled:cursor-default disabled:opacity-35"
                  >
                    <Send size={10} strokeWidth={1.75} /> send
                  </button>
                ) : (
                  <span className="w-8" />
                )
              }
            >
              {sent ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-[10.5px] text-neutral-500">
                    sent &mdash; thank you. i&rsquo;ll read it soon.
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-1.5 text-[10px]">
                    <span className="shrink-0 text-neutral-500">to:</span>
                    <span className="truncate whitespace-nowrap text-neutral-200">
                      alex@vertus.ai
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-1.5 text-[10px]">
                    <span className="shrink-0 text-neutral-500">subject:</span>
                    <span className="truncate whitespace-nowrap text-neutral-200">
                      hello from {name ?? "you"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-1.5 text-[10px]">
                    <span className="shrink-0 text-neutral-500">from:</span>
                    <span className="truncate whitespace-nowrap text-neutral-200">
                      {name ?? "you"} &ndash; {email ?? "your email"}
                    </span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendEmail();
                      }
                    }}
                    autoFocus={!isMobile}
                    placeholder="what&rsquo;s on your mind &mdash; press return to send"
                    className="w-full flex-1 resize-none bg-transparent px-3 py-2 text-[10.5px] leading-[1.7] text-neutral-200 outline-none placeholder:text-neutral-600"
                  />
                </div>
              )}
            </DesktopWindow>
          )}

          {/* ---------------------------------------------------- the dock */}
          <div className="absolute bottom-1 left-1/2 z-30 -translate-x-1/2">
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] px-1 py-[3px] backdrop-blur-md">
              {(
                [
                  { id: "mail" as const, title: "mail", icon: Mail },
                  { id: "companies" as const, title: "companies", icon: Folder },
                  { id: "letters" as const, title: "letters", icon: Feather },
                ] as Array<{ id: AppId; title: string; icon: typeof Mail }>
              ).map((app) => (
                <button
                  key={app.id}
                  type="button"
                  aria-label={app.title}
                  onClick={() =>
                    activeApp === app.id ? closeApp() : openApp(app.id)
                  }
                  className="group relative flex h-[22px] w-[22px] cursor-pointer flex-col items-center justify-center rounded-[5px] border border-white/10 bg-neutral-900 transition-transform duration-200 outline-none hover:-translate-y-0.5"
                >
                  <app.icon
                    size={11}
                    strokeWidth={1.5}
                    className={
                      activeApp === app.id
                        ? "text-foreground"
                        : "text-neutral-400"
                    }
                  />
                  <span className="pointer-events-none absolute -top-5 rounded border border-white/10 bg-neutral-900 px-1.5 py-0.5 text-[8px] whitespace-nowrap text-neutral-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {app.title}
                  </span>
                  {activeApp === app.id && (
                    <span className="absolute -bottom-[4px] h-[2.5px] w-[2.5px] rounded-full bg-neutral-400" />
                  )}
                </button>
              ))}
              <div className="mx-0.5 h-4 w-px bg-white/10" />
              <button
                type="button"
                aria-label="instagram"
                onClick={() =>
                  activeApp === "instagram" ? closeApp() : openApp("instagram")
                }
                className="group relative flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[5px] border border-white/10 bg-neutral-900 transition-transform duration-200 outline-none hover:-translate-y-0.5"
              >
                <Instagram
                  size={11}
                  strokeWidth={1.5}
                  className={
                    activeApp === "instagram"
                      ? "text-foreground"
                      : "text-neutral-400"
                  }
                />
                <span className="pointer-events-none absolute -top-5 rounded border border-white/10 bg-neutral-900 px-1.5 py-0.5 text-[8px] whitespace-nowrap text-neutral-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  instagram
                </span>
                {activeApp === "instagram" && (
                  <span className="absolute -bottom-[4px] h-[2.5px] w-[2.5px] rounded-full bg-neutral-400" />
                )}
              </button>
              {SOCIALS.map((social) => (
                <button
                  key={social.title}
                  type="button"
                  aria-label={social.title}
                  onClick={() => window.open(social.href, "_blank", "noopener")}
                  className="group relative flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[5px] border border-white/10 bg-neutral-900 transition-transform duration-200 outline-none hover:-translate-y-0.5"
                >
                  <social.icon
                    size={11}
                    strokeWidth={1.5}
                    className="text-neutral-400"
                  />
                  <span className="pointer-events-none absolute -top-5 rounded border border-white/10 bg-neutral-900 px-1.5 py-0.5 text-[8px] whitespace-nowrap text-neutral-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {social.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // after the login, the printer stamps the visit before the desktop opens
  if (!entered && receipt) {
    return (
      <main className="flex min-h-dvh w-full flex-col items-center justify-start gap-2 overflow-hidden px-4 pt-[12dvh] pb-10">
        <ReceiptPrinter stage={receiptStage}>
          <AccessReceipt
            name={name ?? ""}
            email={email ?? ""}
            date={receipt.date}
            ticketId={receipt.ticketId}
          />
        </ReceiptPrinter>
        <button
          type="button"
          onClick={enterWorld}
          disabled={receiptStage !== "complete"}
          className={
            "cursor-pointer text-[12px] font-medium text-neutral-400 transition-all duration-500 outline-none hover:text-foreground " +
            (receiptStage === "complete"
              ? "opacity-100"
              : "pointer-events-none opacity-0")
          }
        >
          enter &rarr;
        </button>
      </main>
    );
  }

  // ------------------------------------------------------------- the scene
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 px-2 py-3 sm:gap-5 sm:px-6">
      {isMobile ? (
        /* phones: the machine fills the hand */
        <div className="w-full rounded-2xl bg-linear-to-b from-[#e9e9e7] to-[#d4d4d1] p-[7px] shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
          <div
            className="relative overflow-hidden rounded-xl"
            style={{ height: "88dvh" }}
          >
            {screen}
          </div>
        </div>
      ) : (
        <>
          {/* the display — as large as the viewport allows */}
          <div
            ref={displayRef}
            className="animate-fade-up relative"
            style={{ width: "min(1040px, 94vw, calc((100dvh - 50px) / 1.08))" }}
          >
            <Mac className="desk-glass h-auto w-full text-[#050505]" />
            <div className="absolute top-[5%] left-[4.9%] h-[61%] w-[90.2%] overflow-hidden">
              {screen}
            </div>
          </div>

          {/* the keyboard — half as wide as the display, like the real desk */}
          <div
            ref={keyboardRef}
            className="animate-fade-up"
            style={{ animationDelay: "0.2s", zoom: kbZoom }}
            onClick={onKeyboardClick}
          >
            <Keyboard />
          </div>
        </>
      )}
    </main>
  );
}
