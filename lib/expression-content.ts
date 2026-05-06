import { ExpressionContentType, ExpressionEntry } from "./types";

export const expressionContentTypes: ExpressionContentType[] = [
  "idiom",
  "colloquialism",
  "word"
];

const contentTypeLabels: Record<ExpressionContentType, string> = {
  idiom: "Idioms",
  colloquialism: "Colloquialisms",
  word: "Words"
};

export function getExpressionContentType(entry: ExpressionEntry): ExpressionContentType {
  if (entry.contentType) {
    return entry.contentType;
  }

  const normalizedTags = entry.tags.map((tag) => tag.toLowerCase());

  if (
    normalizedTags.some((tag) =>
      ["colloquial", "colloquialism", "slang", "informal", "spoken"].includes(tag)
    )
  ) {
    return "colloquialism";
  }

  if (!entry.expression.trim().includes(" ")) {
    return "word";
  }

  return "idiom";
}

export function getExpressionContentTypeLabel(contentType: ExpressionContentType): string {
  return contentTypeLabels[contentType];
}

function isImportedEntry(entry: ExpressionEntry): boolean {
  return entry.tags.includes("imported");
}

const blockedPublicExpressionIds = new Set([
  "en-about-to-3",
  "en-23-skidoo-street-10",
  "en-11-downing-street-14",
  "en-abbots-priory-15",
  "en-13th-reason-why-18",
  "en-ace-in-the-hole-21",
  "en-according-to-gunter-37",
  "en-above-ones-huckleberry-38",
  "en-act-ones-age-not-ones-shoe-size-56",
  "en-added-value-57",
  "en-addle-plot-59",
  "en-age-before-beauty-66",
  "en-after-the-lord-mayors-show-75",
  "en-albatross-round-ones-neck-93",
  "en-air-ones-dirty-linen-in-public-97"
]);

function hasMissingMeaning(entry: ExpressionEntry): boolean {
  const meaning = entry.meaning.trim();
  return meaning.length === 0 || /^[.,;:!?-]+$/.test(meaning);
}

function hasBrokenImportedMeaning(entry: ExpressionEntry): boolean {
  return /}}|<!--|\|/.test(entry.meaning) || /^,\s*/.test(entry.meaning);
}

function isSingleWordImportedEntry(entry: ExpressionEntry): boolean {
  return (
    isImportedEntry(entry) &&
    !entry.expression.includes(" ") &&
    !entry.expression.includes("-")
  );
}

function hasGenericImportedExample(entry: ExpressionEntry): boolean {
  return (
    isImportedEntry(entry) &&
    /^People use ["“].+["”] as an?(?: idiomatic)? expression in [A-Za-zÀ-ÿ' .-]+\.?$/i.test(
      entry.exampleSentence.trim()
    )
  );
}

function normalizeComparableText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[^a-z0-9\u00c0-\u024f]+/gi, " ")
    .trim();
}

function trimSentence(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function hasWeakUsageNote(entry: ExpressionEntry): boolean {
  const usageNote = entry.usageNote.trim();

  return (
    usageNote.length === 0 ||
    /^Commonly used as an?(?: idiomatic)? expression in [A-Za-zÀ-ÿ' .-]+\.?$/i.test(usageNote) ||
    /^Commonly used as an?(?: idiomatic)? colloquialism in [A-Za-zÀ-ÿ' .-]+\.?$/i.test(usageNote) ||
    normalizeComparableText(usageNote) === normalizeComparableText(entry.meaning)
  );
}

function hadWeakUsageNote(entry: ExpressionEntry): boolean {
  return hasWeakUsageNote(entry);
}

function buildUsageNote(entry: ExpressionEntry): string {
  const meaning = trimSentence(entry.meaning);
  const contentType = getExpressionContentType(entry);
  const lowerMeaning = meaning.toLowerCase().replace(/[.;:!?]+$/, "");

  const infinitiveMatch = meaning.match(/^To\s+(.+?)[.;:!?]?$/i);
  if (infinitiveMatch) {
    const action = infinitiveMatch[1];

    if (contentType === "colloquialism") {
      return `Use it in informal conversation when someone is about to ${action} or when you want to describe that kind of situation naturally.`;
    }

    return `Use it when someone is about to ${action}, has already done it, or when that is the clearest way to describe what is happening.`;
  }

  if (lowerMeaning.includes("very expensive") || lowerMeaning.includes("a fortune")) {
    return "Use it when the price feels excessive and you want to complain about how costly something is.";
  }

  if (
    lowerMeaning.includes("very rarely") ||
    lowerMeaning.includes("rarely") ||
    lowerMeaning.includes("infrequently")
  ) {
    return "Use it when something almost never happens and you want to emphasize how unusual it is.";
  }

  if (
    lowerMeaning.includes("good luck") ||
    lowerMeaning.includes("wish someone luck") ||
    lowerMeaning.includes("encourage")
  ) {
    return "Use it to encourage someone before a difficult moment, an important try, or a situation where support matters.";
  }

  if (
    lowerMeaning.includes("confusing") ||
    lowerMeaning.includes("confusion") ||
    lowerMeaning.includes("do not understand") ||
    lowerMeaning.includes("understand anything")
  ) {
    return "Use it when a situation feels confusing, unclear, or harder to follow than it should be.";
  }

  if (
    lowerMeaning.includes("secret") ||
    lowerMeaning.includes("reveal") ||
    lowerMeaning.includes("private")
  ) {
    return "Use it when information was supposed to stay private but comes out earlier or more openly than expected.";
  }

  if (
    lowerMeaning.includes("tired") ||
    lowerMeaning.includes("exhausted") ||
    lowerMeaning.includes("unwell") ||
    lowerMeaning.includes("sick")
  ) {
    return "Use it when talking about your own energy, health, or physical state in an everyday way.";
  }

  if (contentType === "colloquialism") {
    return `Use it in informal conversation when this mood, reaction, or social situation fits better than a literal description.`;
  }

  if (contentType === "word") {
    return "Use it when this short expression captures the idea more naturally than a longer explanation would.";
  }

  return "Use it when the situation fits this idea and you want to sound more natural, vivid, or culturally fluent than with a literal phrase.";
}

function hasUnhelpfulExampleSentence(entry: ExpressionEntry): boolean {
  const exampleSentence = trimSentence(entry.exampleSentence);

  return (
    exampleSentence.length === 0 ||
    hasGenericImportedExample(entry) ||
    normalizeComparableText(exampleSentence) === normalizeComparableText(entry.meaning)
  );
}

function hasRedundantExampleTranslation(
  entry: ExpressionEntry,
  cleanedExampleSentence: string
): boolean {
  const exampleTranslation = trimSentence(entry.exampleTranslation);

  if (exampleTranslation.length === 0) {
    return true;
  }

  const normalizedExampleTranslation = normalizeComparableText(exampleTranslation);

  return (
    normalizedExampleTranslation === normalizeComparableText(entry.meaning) ||
    normalizedExampleTranslation === normalizeComparableText(cleanedExampleSentence)
  );
}

export function sanitizePublicExpressionEntry(entry: ExpressionEntry): ExpressionEntry {
  const meaning = trimSentence(entry.meaning);
  const usageNote = hasWeakUsageNote(entry) ? buildUsageNote({ ...entry, meaning }) : trimSentence(entry.usageNote);
  const exampleSentence = hasUnhelpfulExampleSentence(entry) ? "" : trimSentence(entry.exampleSentence);
  const exampleTranslation = exampleSentence
    ? hasRedundantExampleTranslation(entry, exampleSentence)
      ? ""
      : trimSentence(entry.exampleTranslation)
    : "";

  return {
    ...entry,
    meaning,
    usageNote,
    exampleSentence,
    exampleTranslation
  };
}

function getNormalizedExpressionKey(entry: ExpressionEntry): string {
  return normalizeComparableText(entry.expression);
}

function isLikelyWeakImportedEntry(entry: ExpressionEntry): boolean {
  if (!isImportedEntry(entry)) {
    return false;
  }

  if (isSingleWordImportedEntry(entry)) {
    return true;
  }

  const meaning = trimSentence(entry.meaning);

  return (
    meaning.length < 8 ||
    normalizeComparableText(meaning) === getNormalizedExpressionKey(entry)
  );
}

function getEntryQualityScore(entry: ExpressionEntry): number {
  const sanitized = sanitizePublicExpressionEntry(entry);
  let score = 0;

  if (!isImportedEntry(entry)) {
    score += 1000;
  }

  score += sanitized.exampleSentence ? 80 : 0;
  score += sanitized.exampleTranslation ? 20 : 0;
  score += sanitized.literalTranslation ? 8 : 0;
  score += sanitized.tags.length * 3;
  score += Math.min(sanitized.meaning.length, 120) / 20;
  score += Math.min(sanitized.usageNote.length, 160) / 30;
  score -= isSingleWordImportedEntry(entry) ? 80 : 0;
  score -= hadWeakUsageNote(entry) ? 25 : 0;
  score -= hasGenericImportedExample(entry) ? 40 : 0;

  return score;
}

function dedupeExpressions(entries: ExpressionEntry[]): ExpressionEntry[] {
  const entriesByKey = new Map<string, ExpressionEntry>();

  for (const entry of entries) {
    const key = `${entry.language}:${getNormalizedExpressionKey(entry)}`;
    const existing = entriesByKey.get(key);

    if (!existing || getEntryQualityScore(entry) > getEntryQualityScore(existing)) {
      entriesByKey.set(key, entry);
    }
  }

  return [...entriesByKey.values()];
}

export function isPublicExpressionEntry(entry: ExpressionEntry): boolean {
  if (blockedPublicExpressionIds.has(entry.id)) {
    return false;
  }

  if (hasMissingMeaning(entry) || hasBrokenImportedMeaning(entry)) {
    return false;
  }

  if (entry.language === "en" && isSingleWordImportedEntry(entry)) {
    return false;
  }

  if (isLikelyWeakImportedEntry(entry)) {
    return false;
  }

  return true;
}

export function getPublicExpressions(entries: ExpressionEntry[]): ExpressionEntry[] {
  return dedupeExpressions(entries.filter(isPublicExpressionEntry).map(sanitizePublicExpressionEntry));
}
