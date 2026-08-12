import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Inline all brand assets (SVGs and the platinum card art) as data URIs
    // so the bundle stays self-contained
    assetsInlineLimit: 4000000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
