import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

/*
 * Renders the Windscribe-inspired Chrome Web Store promo shots from
 * assets-src/store-promos/promos.html using the system Google Chrome in
 * headless mode (same approach as capture-extension-screenshots.mjs).
 * Each poster is captured at its exact pixel size (DPR 1) via ?only=<name>.
 *
 *   node ./scripts/generate-store-promos.mjs
 */

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const chromeBinary = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sourceHtml = path.join(projectRoot, "assets-src", "store-promos", "promos.html");
const storeDir = path.join(projectRoot, "extension", "store-assets");
const profileDir = path.join(projectRoot, ".tmp", "chrome-promo-screenshots");

// name → output file + exact dimensions (must match the .poster in promos.html)
const posters = [
  { name: "1-daily", w: 1280, h: 800 },
  { name: "2-languages", w: 1280, h: 800 },
  { name: "3-library", w: 1280, h: 800 },
  { name: "4-listen", w: 1280, h: 800 },
  { name: "5-streak", w: 1280, h: 800 },
  { name: "marquee", w: 1400, h: 560 },
  { name: "small-tile", w: 440, h: 280 }
];

// Two visual variants of the set:
//   v1 — dark near-black canvas, sans wordmark (extension/store-assets/promos)
//   v2 — lighter "mocha" canvas, serif brand wordmark (…/promos-v2)
const variants = [
  { id: "v1", query: "", dir: path.join(storeDir, "promos") },
  { id: "v2", query: "&v=2", dir: path.join(storeDir, "promos-v2") }
];

// Optional CLI filter: `node scripts/generate-store-promos.mjs v2` renders only v2.
const wanted = process.argv.slice(2);
const selectedVariants = wanted.length
  ? variants.filter((v) => wanted.includes(v.id))
  : variants;

async function capture({ name, w, h }, variant) {
  const url = new URL(`file://${sourceHtml}`);
  url.search = `?only=${name}${variant.query}`;
  await execFileAsync(
    chromeBinary,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--force-device-scale-factor=1",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=6000",
      "--default-background-color=00000000",
      `--user-data-dir=${profileDir}`,
      "--hide-scrollbars",
      `--window-size=${w},${h}`,
      `--screenshot=${path.join(variant.dir, `${name}.png`)}`,
      url.toString()
    ],
    { timeout: 30000 }
  );
  console.log(`  ✓ ${variant.id}/${name}.png (${w}×${h})`);
}

await mkdir(profileDir, { recursive: true });

for (const variant of selectedVariants) {
  await mkdir(variant.dir, { recursive: true });
  console.log(`Rendering ${variant.id} → ${path.relative(projectRoot, variant.dir)}`);
  for (const poster of posters) {
    await capture(poster, variant);
  }
}
console.log("Done.");
