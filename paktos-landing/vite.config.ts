import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// SINGLEFILE=1 produces a fully self-contained bundle (all assets as data
// URIs, dynamic chunks merged) for single-file preview deployments. The
// default production build code-splits so the 3D runtime loads lazily.
const singleFile = process.env.SINGLEFILE === "1";

export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: singleFile ? 4000000 : 8192,
    chunkSizeWarningLimit: 5000,
    rollupOptions: singleFile
      ? { output: { inlineDynamicImports: true } }
      : undefined,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
