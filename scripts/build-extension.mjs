import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const extensionRoot = path.join(projectRoot, "extension");
const distRoot = path.join(extensionRoot, "dist");

await rm(distRoot, { recursive: true, force: true });
await mkdir(distRoot, { recursive: true });
await mkdir(path.join(distRoot, "assets"), { recursive: true });

const { execFile } = await import("node:child_process");
const { promisify } = await import("node:util");
const execFileAsync = promisify(execFile);

async function rewriteRelativeJsImports(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await rewriteRelativeJsImports(entryPath);
      continue;
    }

    if (!entry.isFile() || path.extname(entry.name) !== ".js") {
      continue;
    }

    const source = await readFile(entryPath, "utf8");
    const rewritten = source.replace(
      /(from\s+["'])(\.\.?\/[^"'?#]+)(["'])/g,
      (match, prefix, specifier, suffix) => {
        if (path.extname(specifier)) {
          return match;
        }

        return `${prefix}${specifier}.js${suffix}`;
      }
    );

    if (rewritten !== source) {
      await writeFile(entryPath, rewritten);
    }
  }
}

await execFileAsync(
  process.execPath,
  [
    path.join(projectRoot, "node_modules", "typescript", "bin", "tsc"),
    "-p",
    path.join(projectRoot, "tsconfig.extension.json")
  ],
  { cwd: projectRoot }
);

await rewriteRelativeJsImports(distRoot);

await execFileAsync(
  process.execPath,
  [
    path.join(projectRoot, "node_modules", "vite", "bin", "vite.js"),
    "build",
    "--config",
    path.join(projectRoot, "extension", "vite.app.config.mjs")
  ],
  { cwd: projectRoot }
);

const staticFiles = ["manifest.json", "popup.html", "styles.css"];

for (const fileName of staticFiles) {
  await cp(path.join(extensionRoot, fileName), path.join(distRoot, fileName));
}

await cp(path.join(extensionRoot, "assets"), path.join(distRoot, "assets"), {
  recursive: true
});
