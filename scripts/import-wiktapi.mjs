import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const targetsPath = path.join(cwd, "content", "import-targets.json");
const cacheDir = path.join(cwd, "content", "import-cache");
const baseUrl = process.env.WIKTAPI_BASE_URL ?? "https://api.wiktapi.dev";

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, value = ""] = argument.replace(/^--/, "").split("=");
    return [key, value];
  })
);

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function pickMeaning(entry) {
  const senses = entry.senses ?? [];
  const glosses =
    senses.flatMap((sense) => sense.glosses ?? sense.raw_glosses ?? []).filter(Boolean) ?? [];
  return glosses[0] ?? `${entry.word} is a useful expression.`;
}

function pickExample(entry) {
  const senses = entry.senses ?? [];

  for (const sense of senses) {
    const examples = sense.examples ?? [];
    const firstExample = examples.find((example) => example.text);
    if (firstExample?.text) {
      return {
        sentence: firstExample.text,
        translation:
          firstExample.translation ?? firstExample.english ?? `Example usage of ${entry.word}.`
      };
    }
  }

  return {
    sentence: `People use "${entry.word}" in everyday conversation.`,
    translation: `People use "${entry.word}" in everyday conversation.`
  };
}

function pickLiteralTranslation(entry) {
  return entry.translations?.[0]?.word ?? undefined;
}

function toExpressionEntry(entry, languageCode, index) {
  const meaning = pickMeaning(entry);
  const example = pickExample(entry);
  const tags = ["imported", entry.pos ?? "expression", "wiktapi"];

  return {
    id: `${languageCode}-${slugify(entry.word)}-${index}`,
    language: languageCode,
    expression: entry.word,
    literalTranslation: pickLiteralTranslation(entry),
    meaning,
    usageNote: entry.etymology_text ?? `Commonly used in ${languageCode.toUpperCase()} conversation.`,
    exampleSentence: example.sentence,
    exampleTranslation: example.translation,
    difficulty: "intermediate",
    tags: [...new Set(tags)]
  };
}

async function searchEntries(languageCode, term) {
  const url = new URL(`${baseUrl}/v1/${encodeURIComponent(languageCode)}/search`);
  url.searchParams.set("q", term);
  url.searchParams.set("lang", languageCode);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wiktapi search failed for ${languageCode}:${term} (${response.status})`);
  }

  const payload = await response.json();
  return Array.isArray(payload.results) ? payload.results : [];
}

async function fetchDefinitions(languageCode, word) {
  const url = new URL(
    `${baseUrl}/v1/${encodeURIComponent(languageCode)}/word/${encodeURIComponent(word)}/definitions`
  );
  url.searchParams.set("lang", languageCode);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wiktapi definitions failed for ${languageCode}:${word} (${response.status})`);
  }

  const payload = await response.json();
  return Array.isArray(payload.definitions) ? payload.definitions : [];
}

async function main() {
  const allTargets = JSON.parse(await fs.readFile(targetsPath, "utf8"));
  const requestedLanguage = args.get("language");
  const selectedTargets = requestedLanguage
    ? allTargets.filter((target) => target.code === requestedLanguage)
    : allTargets;

  if (selectedTargets.length === 0) {
    throw new Error("No matching import targets found.");
  }

  await fs.mkdir(cacheDir, { recursive: true });

  for (const target of selectedTargets) {
    const candidates = new Map();

    for (const term of target.seedTerms) {
      try {
        const entries = await searchEntries(target.code, term);
        for (const entry of entries) {
          if (
            typeof entry.word === "string" &&
            entry.word.trim().length > 1 &&
            entry.lang_code === target.code
          ) {
            candidates.set(entry.word, entry);
          }
        }
      } catch (error) {
        console.warn(`[import:wiktapi] skipped ${target.code}:${term}`, error.message);
      }
    }

    const definitions = [];

    for (const word of [...candidates.keys()].slice(0, 140)) {
      try {
        const entries = await fetchDefinitions(target.code, word);
        for (const entry of entries) {
          definitions.push({ ...entry, word });
        }
      } catch (error) {
        console.warn(`[import:wiktapi] skipped definitions for ${target.code}:${word}`, error.message);
      }
    }

    const normalizedEntries = definitions
      .filter((entry) => typeof entry.word === "string" && entry.word.trim().length > 1)
      .slice(0, 120)
      .map((entry, index) => toExpressionEntry(entry, target.code, index));

    const outputPath = path.join(cacheDir, `${target.code}.json`);
    await fs.writeFile(outputPath, `${JSON.stringify(normalizedEntries, null, 2)}\n`, "utf8");
    console.log(`[import:wiktapi] wrote ${normalizedEntries.length} entries to ${outputPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
