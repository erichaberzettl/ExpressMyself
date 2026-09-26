// Generate all ExpressMyself icon PNGs from the committed SVG sources in
// assets-src/. This is the single source of truth for the app + extension logo.
//
//   npm run build:icons
//
// Outputs:
//   extension/assets/icon-{16,32,48,128,256}.png   (extension manifest icons)
//   extension/dist/assets/icon-*.png               (kept in sync if dist exists)
//   app/icon.png, app/favicon.png                  (website favicons)
//
// 16/32px use assets-src/icon-small.svg (bubble scaled up for legibility);
// 48/128/256px use assets-src/icon-master.svg. Rendering prefers the `sharp`
// package and falls back to a `rsvg-convert` binary on PATH.

import { cp, mkdir, readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const MASTER = path.join(root, "assets-src", "icon-master.svg");
const SMALL = path.join(root, "assets-src", "icon-small.svg");
const EXT_ASSETS = path.join(root, "extension", "assets");
const DIST_ASSETS = path.join(root, "extension", "dist", "assets");
const APP_DIR = path.join(root, "app");

// size -> source svg
const ICONS = [
  { size: 16, src: SMALL },
  { size: 32, src: SMALL },
  { size: 48, src: MASTER },
  { size: 128, src: MASTER },
  { size: 256, src: MASTER }
];

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Resolve a renderer once: sharp if importable, else rsvg-convert on PATH.
async function getRenderer() {
  try {
    const sharp = (await import("sharp")).default;
    return async (svgPath, size, outPath) => {
      const svg = await readFile(svgPath);
      // Render at high density then fit to size for clean anti-aliasing.
      await sharp(svg, { density: 512 })
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outPath);
    };
  } catch {
    // fall through to rsvg-convert
  }

  try {
    await execFileAsync("rsvg-convert", ["--version"]);
    return async (svgPath, size, outPath) => {
      await execFileAsync("rsvg-convert", [
        "-w", String(size),
        "-h", String(size),
        svgPath,
        "-o", outPath
      ]);
    };
  } catch {
    throw new Error(
      "No SVG renderer found. Install the `sharp` npm package (npm i -D sharp) " +
        "or a `rsvg-convert` binary on PATH."
    );
  }
}

async function main() {
  const render = await getRenderer();
  await mkdir(EXT_ASSETS, { recursive: true });

  for (const { size, src } of ICONS) {
    const out = path.join(EXT_ASSETS, `icon-${size}.png`);
    await render(src, size, out);
    console.log(`  extension/assets/icon-${size}.png`);
  }

  // Website favicons use the 256px master.
  const png256 = path.join(EXT_ASSETS, "icon-256.png");
  await cp(png256, path.join(APP_DIR, "icon.png"));
  await cp(png256, path.join(APP_DIR, "favicon.png"));
  console.log("  app/icon.png, app/favicon.png");

  // Keep a previously-built dist in sync so it reflects the new icons without
  // needing a full extension rebuild.
  if (await exists(DIST_ASSETS)) {
    for (const { size } of ICONS) {
      await cp(
        path.join(EXT_ASSETS, `icon-${size}.png`),
        path.join(DIST_ASSETS, `icon-${size}.png`)
      );
    }
    console.log("  extension/dist/assets/icon-*.png (synced)");
  }

  console.log("Icons generated from assets-src/*.svg");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
