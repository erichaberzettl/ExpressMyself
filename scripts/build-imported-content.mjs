import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const cacheDir = path.join(cwd, "content", "import-cache");
const outputPath = path.join(cwd, "lib", "generated-imported-content.ts");

async function main() {
  let files = [];

  try {
    files = (await fs.readdir(cacheDir)).filter((file) => file.endsWith(".json"));
  } catch {
    files = [];
  }

  const allEntries = [];

  for (const file of files) {
    const filePath = path.join(cacheDir, file);
    const parsed = JSON.parse(await fs.readFile(filePath, "utf8"));
    if (Array.isArray(parsed)) {
      allEntries.push(...parsed);
    }
  }

  const source = `import { ExpressionEntry } from "@/lib/types";

export const importedExpressions: ExpressionEntry[] = ${JSON.stringify(allEntries, null, 2)};
`;

  await fs.writeFile(outputPath, `${source}\n`, "utf8");
  console.log(`[build:imported-content] wrote ${allEntries.length} imported expressions`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
