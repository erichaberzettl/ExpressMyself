import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      "@": projectRoot,
      "next/link": path.resolve(__dirname, "src/next-link-shim.tsx"),
      "@/lib/client-expression-api": path.resolve(__dirname, "src/extension-client-api.ts")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, "app.html")
    }
  }
});
