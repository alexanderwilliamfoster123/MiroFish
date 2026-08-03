/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Tight"', "system-ui", "sans-serif"],
      },
      colors: {
        background: "#FFFFFF",
        foreground: "#05050C",
        primary: {
          DEFAULT: "#111111",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#ECECEA",
          foreground: "#05050C",
        },
        accent: {
          DEFAULT: "#F2F2F0",
          foreground: "#05050C",
        },
        muted: {
          DEFAULT: "#ECECEA",
          foreground: "rgba(0, 0, 0, 0.45)",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        input: "rgba(0, 0, 0, 0.12)",
        ring: "#A3B18A",
      },
    },
  },
  plugins: [],
};
