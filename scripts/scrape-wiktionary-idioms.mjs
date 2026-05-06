import fs from "node:fs/promises";
import path from "node:path";
import scrapeTargets from "../content/scrape-targets.json" with { type: "json" };

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, value = ""] = argument.replace(/^--/, "").split("=");
    return [key, value];
  })
);

const cwd = process.cwd();
const cacheDir = path.join(cwd, "content", "import-cache");
const defaultWiktionaryApiBase = "https://en.wiktionary.org/w/api.php";
const requestedLanguage = args.get("language");
const perLanguageTarget = Number(args.get("count") || 100);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(url, attempt = 0) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "ExpressMyself/0.1 (language expression importer)",
      accept: "application/json"
    }
  });

  if ((response.status === 429 || response.status >= 500) && attempt < 5) {
    await sleep(1000 * (attempt + 1));
    return fetchJsonWithRetry(url, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

function normalizeCategorySource(source, fallbackApiBase) {
  if (typeof source === "string") {
    return {
      title: source,
      apiBase: fallbackApiBase,
      languageLabel: null
    };
  }

  return {
    title: source.title,
    apiBase: source.apiBase || fallbackApiBase,
    languageLabel: source.languageLabel || null
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function stripWikiMarkup(value) {
  return value
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "")
    .replace(/<ref[^/>]*\/>/g, "")
    .replace(/\{\{lb\|[^}]+\}\}\s*/g, "")
    .replace(/\{\{gloss\|([^}]+)\}\}/g, "$1")
    .replace(/\{\{alt\|[^|]+\|([^|}]+)[^}]*\}\}/g, "$1")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/\[\d+\]/g, "")
    .replace(/'''/g, "")
    .replace(/''/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUsageNote(section, languageLabel) {
  const lowered = section.toLowerCase();
  if (lowered.includes("idiomatic")) {
    return `Commonly used as an idiomatic expression in ${languageLabel}.`;
  }
  if (lowered.includes("colloquial")) {
    return `Commonly used informally in ${languageLabel}.`;
  }
  return `Commonly used as an expression in ${languageLabel}.`;
}

function extractSection(content, languageLabel) {
  const escapedLabel = escapeRegExp(languageLabel);
  const patterns = [
    new RegExp(
      `==[^=\\n]*\\{\\{Sprache\\|${escapedLabel}\\}\\}[^=\\n]*==([\\s\\S]*?)(?:\\n==[^=]|$)`,
      "i"
    ),
    new RegExp(`==[^=\\n]*${escapedLabel}[^=\\n]*==([\\s\\S]*?)(?:\\n==[^=]|$)`, "i")
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function extractLabeledBlock(section, labels) {
  const lines = section.split("\n");
  const normalizedLabels = labels.map((label) => label.toLowerCase());
  const startIndex = lines.findIndex((line) => {
    const normalizedLine = line.trim().toLowerCase();
    return normalizedLabels.some(
      (label) =>
        normalizedLine === label ||
        normalizedLine === `${label}:` ||
        normalizedLine.includes(`{{${label}}}`)
    );
  });

  if (startIndex === -1) {
    return "";
  }

  const blockLines = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (/^===?[^=]/.test(trimmed)) {
      break;
    }

    if (
      blockLines.length > 0 &&
      (/^\{\{[^}]+\}\}$/.test(trimmed) || /^[A-ZÄÖÜa-zäöüß][^:]{0,40}:$/.test(trimmed))
    ) {
      break;
    }

    blockLines.push(line);
  }

  return blockLines.join("\n");
}

function extractMeaningAndExample(section, title, languageLabel) {
  const meaningLine = section
    .split("\n")
    .find((line) => line.startsWith("# ") && !line.startsWith("#*") && !line.startsWith("#:"));

  if (meaningLine) {
    const exampleLine = section.split("\n").find((line) => line.startsWith("#* "));
    const exampleTextMatch = exampleLine?.match(/\|text=([^|}]+)/);
    const exampleTranslationMatch = exampleLine?.match(/\|t=([^|}]+)/);

    return {
      meaning: stripWikiMarkup(meaningLine.replace(/^#\s*/, "")),
      exampleSentence: exampleTextMatch
        ? stripWikiMarkup(exampleTextMatch[1])
        : `People use "${title}" as an expression in ${languageLabel}.`,
      exampleTranslation: exampleTranslationMatch
        ? stripWikiMarkup(exampleTranslationMatch[1])
        : stripWikiMarkup(meaningLine.replace(/^#\s*/, ""))
    };
  }

  const meaningsBlock = extractLabeledBlock(section, ["Bedeutungen", "meanings"]);
  const meaningMatch = meaningsBlock.match(/:\[\d+\]\s*(.+)/);

  if (!meaningMatch) {
    return null;
  }

  const examplesBlock = extractLabeledBlock(section, ["Beispiele", "examples"]);
  const exampleMatch = examplesBlock.match(/:\[\d+\]\s*(.+)/);
  const meaning = stripWikiMarkup(meaningMatch[1]);
  const exampleSentence = exampleMatch
    ? stripWikiMarkup(exampleMatch[1])
        .replace(/^„|“|"/, "")
        .replace(/”$|"$|“$/g, "")
        .trim()
    : `People use "${title}" as an expression in ${languageLabel}.`;

  return {
    meaning,
    exampleSentence,
    exampleTranslation: meaning
  };
}

function parseWikitextEntry(content, title, languageLabel, languageCode) {
  const section = extractSection(content, languageLabel);
  if (!section) {
    return null;
  }

  const parsed = extractMeaningAndExample(section, title, languageLabel);
  if (!parsed) {
    return null;
  }

  const literalMatch = section.match(/Literally,\s+[“"]([^”"]+)[”"]/i);

  return {
    id: `${languageCode}-${slugify(title)}`,
    language: languageCode,
    expression: title,
    literalTranslation: literalMatch?.[1],
    meaning: parsed.meaning,
    usageNote: normalizeUsageNote(section, languageLabel),
    exampleSentence: parsed.exampleSentence,
    exampleTranslation: parsed.exampleTranslation,
    difficulty: "intermediate",
    tags: ["idiom", "imported", "wiktionary"]
  };
}

async function fetchCategoryMembers(apiBase, categoryTitle, targetCount) {
  const collected = [];
  let continuation = "";

  while (collected.length < targetCount * 6) {
    const url = new URL(apiBase);
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("list", "categorymembers");
    url.searchParams.set("cmtitle", categoryTitle);
    url.searchParams.set("cmlimit", "500");
    url.searchParams.set("cmtype", "page");

    if (continuation) {
      url.searchParams.set("cmcontinue", continuation);
    }

    const payload = await fetchJsonWithRetry(url);
    const members = payload.query?.categorymembers ?? [];

    for (const member of members) {
      const title = member.title;
      if (
        typeof title === "string" &&
        !title.startsWith("Appendix:") &&
        !title.startsWith("Category:")
      ) {
        collected.push(title);
      }
    }

    continuation = payload.continue?.cmcontinue ?? "";
    if (!continuation || members.length === 0) {
      break;
    }
  }

  return [...new Set(collected)];
}

async function fetchWikitextBatch(apiBase, titles) {
  const url = new URL(apiBase);
  url.searchParams.set("action", "query");
  url.searchParams.set("prop", "revisions");
  url.searchParams.set("rvprop", "content");
  url.searchParams.set("rvslots", "main");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("titles", titles.map((title) => title.replace(/ /g, "_")).join("|"));

  const payload = await fetchJsonWithRetry(url);
  return payload.query?.pages ?? [];
}

async function fetchEntriesFromTitles(target, apiBase, languageLabel, titles, targetCount) {
  const entries = [];

  for (let index = 0; index < titles.length; index += 20) {
    const batch = titles.slice(index, index + 20);
    const pages = await fetchWikitextBatch(apiBase, batch);

    for (const page of pages) {
      const content = page.revisions?.[0]?.slots?.main?.content;
      if (typeof content !== "string") {
        continue;
      }

      const parsed = parseWikitextEntry(
        content,
        page.title,
        languageLabel || target.label,
        target.code
      );
      if (parsed) {
        entries.push(parsed);
      }
    }

    if (entries.length >= targetCount) {
      break;
    }
  }

  return entries.slice(0, targetCount).map((entry, index) => ({
    ...entry,
    id: `${entry.id}-${index}`
  }));
}

async function main() {
  const targets = requestedLanguage
    ? scrapeTargets.filter((target) => target.code === requestedLanguage)
    : scrapeTargets;

  if (targets.length === 0) {
    throw new Error("No matching scrape targets found.");
  }

  await fs.mkdir(cacheDir, { recursive: true });

  for (const target of targets) {
    const sourcesByApiBase = new Map();
    const categorySources = (target.categoryTitles || []).map((source) =>
      normalizeCategorySource(source, target.apiBase || defaultWiktionaryApiBase)
    );

    for (const categorySource of categorySources) {
      console.log(
        `[scrape:idioms] collecting ${target.code} from ${categorySource.title} (${categorySource.apiBase})`
      );
      const titles = await fetchCategoryMembers(
        categorySource.apiBase,
        categorySource.title,
        perLanguageTarget
      );
      const sourceInfo = sourcesByApiBase.get(categorySource.apiBase) ?? {
        titleSet: new Set(),
        languageLabel: categorySource.languageLabel || target.label
      };
      for (const title of titles) {
        sourceInfo.titleSet.add(title);
      }
      sourcesByApiBase.set(categorySource.apiBase, sourceInfo);
    }

    const normalizedEntries = [];

    for (const [apiBase, sourceInfo] of sourcesByApiBase.entries()) {
      const remaining = perLanguageTarget - normalizedEntries.length;

      if (remaining <= 0) {
        break;
      }

      const candidateTitles = [...sourceInfo.titleSet].slice(0, Math.max(remaining * 5, 500));
      const entries = await fetchEntriesFromTitles(
        target,
        apiBase,
        sourceInfo.languageLabel,
        candidateTitles,
        remaining
      );
      normalizedEntries.push(...entries);
    }

    const outputPath = path.join(cacheDir, `${target.code}.json`);
    await fs.writeFile(outputPath, `${JSON.stringify(normalizedEntries, null, 2)}\n`, "utf8");
    console.log(`[scrape:idioms] wrote ${normalizedEntries.length} entries to ${outputPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
