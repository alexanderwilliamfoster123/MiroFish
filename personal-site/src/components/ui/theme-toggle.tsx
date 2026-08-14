// sun / moon, bare icons in the corner — no box, no border.
// dark is the site's native state; light remaps the tokens in index.css.

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark"),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.style.background =
      theme === "light" ? "#fafafa" : "#000000";
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="fixed top-4 right-5 z-[80] flex items-center gap-2.5">
      <button
        type="button"
        aria-label="light mode"
        onClick={() => setTheme("light")}
        className={
          "cursor-pointer transition-colors duration-300 " +
          (theme === "light"
            ? "text-foreground"
            : "text-faint hover:text-foreground")
        }
      >
        <Sun size={14} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="dark mode"
        onClick={() => setTheme("dark")}
        className={
          "cursor-pointer transition-colors duration-300 " +
          (theme === "dark"
            ? "text-foreground"
            : "text-faint hover:text-foreground")
        }
      >
        <Moon size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}
