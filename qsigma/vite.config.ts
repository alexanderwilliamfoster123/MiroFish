import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { viteSingleFile } from "vite-plugin-singlefile";

// SINGLEFILE=1 produces a self-contained one-file build (used for site-preview.html)
export default defineConfig({
  plugins: [
    react(),
    ...(process.env.SINGLEFILE ? [viteSingleFile()] : []),
  ],
  build: process.env.SINGLEFILE ? { outDir: "dist-single" } : undefined,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
