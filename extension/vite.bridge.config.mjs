import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundle the storage bridge content script into a single classic IIFE, since
// declarative MV3 content scripts cannot be ES modules.
export default defineConfig({
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: path.resolve(__dirname, "src/bridge.ts"),
      formats: ["iife"],
      name: "ExpressMyselfBridge",
      fileName: () => "bridge.js"
    }
  }
});
