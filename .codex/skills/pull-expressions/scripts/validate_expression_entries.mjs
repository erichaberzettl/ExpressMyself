#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const knownDifficulties = new Set(["basic", "intermediate"]);
const knownContentTypes = new Set(["idiom", "colloquialism", "word"]);
const requiredStringFields = [
  "id",
  "language",
  "expression",
  "meaning",
  "usageNote",
  "exampleSentence",
  "exampleTranslation",
  "difficulty"
];

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function isGenericExample(entry) {
  return /^people use ["“].+["”] (?:as an? )?(?:idiomatic )?expression/i.test(
    entry.exampleSentence.trim()
  );
}

function validateEntry(entry, index) {
  const errors = [];
  const label = entry?.id || `entry[${index}]`;

  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return [`${label}: entry must be an object`];
  }

  for (const field of requiredStringFields) {
    if (typeof entry[field] !== "string" || entry[field].trim().length === 0) {
      errors.push(`${label}: ${field} must be a non-empty string`);
    }
  }

  if (entry.literalTranslation !== undefined && typeof entry.literalTranslation !== "string") {
    errors.push(`${label}: literalTranslation must be a string when present`);
  }

  if (!knownDifficulties.has(entry.difficulty)) {
    errors.push(`${label}: difficulty must be basic or intermediate`);
  }

  if (entry.contentType !== undefined && !knownContentTypes.has(entry.contentType)) {
    errors.push(`${label}: contentType must be idiom, colloquialism, or word`);
  }

  if (!Array.isArray(entry.tags) || entry.tags.some((tag) => typeof tag !== "string" || !tag.trim())) {
    errors.push(`${label}: tags must be an array of non-empty strings`);
  }

  const meaning = entry.meaning?.trim?.() ?? "";
  const usageNote = entry.usageNote?.trim?.() ?? "";
  const exampleSentence = entry.exampleSentence?.trim?.() ?? "";
  const exampleTranslation = entry.exampleTranslation?.trim?.() ?? "";

  if (meaning.length < 12) {
    errors.push(`${label}: meaning is too short to be useful`);
  }

  if (usageNote.length < 24 || normalizeText(usageNote) === normalizeText(meaning)) {
    errors.push(`${label}: usageNote must add insight beyond the meaning`);
  }

  if (exampleSentence.length < 8 || isGenericExample(entry)) {
    errors.push(`${label}: exampleSentence is missing or generic`);
  }

  if (
    exampleTranslation.length < 8 ||
    normalizeText(exampleTranslation) === normalizeText(exampleSentence) ||
    normalizeText(exampleTranslation) === normalizeText(meaning)
  ) {
    errors.push(`${label}: exampleTranslation should be natural English, not a duplicate`);
  }

  if (/}}|<!--|\|/.test([meaning, usageNote, exampleSentence, exampleTranslation].join(" "))) {
    errors.push(`${label}: entry appears to contain leftover markup`);
  }

  return errors;
}

async function readJson(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  return JSON.parse(source);
}

async function main() {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.error("Usage: validate_expression_entries.mjs <entries.json...>");
    process.exitCode = 2;
    return;
  }

  let totalEntries = 0;
  const allErrors = [];

  for (const file of files) {
    const resolved = path.resolve(file);
    const payload = await readJson(resolved);

    if (!Array.isArray(payload)) {
      allErrors.push(`${file}: expected a JSON array`);
      continue;
    }

    totalEntries += payload.length;
    const seenIds = new Set();
    const seenExpressions = new Set();

    payload.forEach((entry, index) => {
      for (const error of validateEntry(entry, index)) {
        allErrors.push(`${file}: ${error}`);
      }

      if (entry?.id) {
        if (seenIds.has(entry.id)) {
          allErrors.push(`${file}: ${entry.id}: duplicate id`);
        }
        seenIds.add(entry.id);
      }

      if (entry?.language && entry?.expression) {
        const expressionKey = `${entry.language}:${normalizeText(entry.expression)}`;
        if (seenExpressions.has(expressionKey)) {
          allErrors.push(`${file}: ${entry.id || `entry[${index}]`}: duplicate expression`);
        }
        seenExpressions.add(expressionKey);
      }
    });
  }

  if (allErrors.length > 0) {
    console.error(`Found ${allErrors.length} issue(s) across ${totalEntries} entr${totalEntries === 1 ? "y" : "ies"}:`);
    for (const error of allErrors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${totalEntries} expression entr${totalEntries === 1 ? "y" : "ies"}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
