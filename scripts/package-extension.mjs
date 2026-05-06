import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const artifactsDir = path.join(projectRoot, "artifacts");
const distDir = path.join(projectRoot, "extension", "dist");
const zipPath = path.join(artifactsDir, "express-myself-chrome-extension.zip");

await mkdir(artifactsDir, { recursive: true });
await rm(zipPath, { force: true });

await execFileAsync(
  "/usr/bin/zip",
  ["-r", zipPath, "."],
  { cwd: distDir }
);
