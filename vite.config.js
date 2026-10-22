import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

const single = process.env.PREVIEW === "1";

export default defineConfig({
  // relative base works on Vercel, Netlify and GitHub Pages sub-paths alike
  base: "./",
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: single ? { assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 20000 } : { chunkSizeWarningLimit: 1500 },
});
