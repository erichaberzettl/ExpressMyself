import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const chromeBinary = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const screenshotDir = path.join(projectRoot, "extension", "store-assets", "screenshots");
const distDir = path.join(projectRoot, "extension", "dist");
const profileDir = path.join(projectRoot, ".tmp", "chrome-extension-screenshots");

async function takeScreenshot({ output, page, width, height, search = "" }) {
  const fileUrl = new URL(`file://${path.join(distDir, page)}`);
  fileUrl.search = search;

  await execFileAsync(chromeBinary, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=8000",
    `--user-data-dir=${profileDir}`,
    "--hide-scrollbars",
    `--window-size=${width},${height}`,
    `--screenshot=${path.join(screenshotDir, output)}`,
    fileUrl.toString()
  ], {
    timeout: 30000
  });
}

await mkdir(screenshotDir, { recursive: true });
await rm(profileDir, { recursive: true, force: true });
await mkdir(profileDir, { recursive: true });

await takeScreenshot({
  output: "popup-daily.png",
  page: "popup.html",
  width: 430,
  height: 820,
  search: "?language=it&saved=it-in-bocca-al-lupo,it-il-gioco-non-vale-la-candela&offset=2"
});

await takeScreenshot({
  output: "library-view.png",
  page: "app.html",
  width: 1440,
  height: 1200,
  search:
    "?view=library&language=es&query=pan+comido&contentTypes=idiom,colloquialism,word&saved=es-pan-comido,es-meter-la-pata"
});

await takeScreenshot({
  output: "saved-view.png",
  page: "app.html",
  width: 1440,
  height: 1200,
  search:
    "?view=saved&language=en&saved=en-break-a-leg,en-on-the-same-page,es-pan-comido,it-in-bocca-al-lupo"
});
