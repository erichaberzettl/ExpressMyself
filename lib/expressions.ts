import { expressions } from "./content";
import { ExpressionEntry, ExpressionFilter, LanguageCode } from "./types";
import { CanonicalTopicTag, getVisibleTopicTags, normalizeEntryTags } from "./topic-tags";

export function getExpressionsForLanguage(language: LanguageCode): ExpressionEntry[] {
  return getStableExpressionOrder(expressions.filter((entry) => entry.language === language));
}

export function getExpressionById(id: string): ExpressionEntry | undefined {
  return expressions.find((entry) => entry.id === id);
}

export function getExpressionsByIds(ids: string[]): ExpressionEntry[] {
  return getExpressionsByIdsFromEntries(expressions, ids);
}

export function getExpressionsByIdsFromEntries(
  entries: ExpressionEntry[],
  ids: string[]
): ExpressionEntry[] {
  const expressionsById = new Map(entries.map((entry) => [entry.id, entry]));
  return ids
    .map((id) => expressionsById.get(id))
    .filter((entry): entry is ExpressionEntry => Boolean(entry));
}

function getDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function hashString(value: string): number {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) % 2147483647;
  }

  return hash;
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function getEntryInitial(expression: string): string {
  return expression
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .charAt(0)
    .toLowerCase();
}

function isImportedEntry(entry: ExpressionEntry): boolean {
  return entry.tags.includes("imported");
}

function getStableRandomizedBucketOrder(entries: ExpressionEntry[]): ExpressionEntry[] {
  const groupedEntries = new Map<string, ExpressionEntry[]>();

  for (const entry of entries) {
    const initial = getEntryInitial(entry.expression) || "#";
    const bucket = groupedEntries.get(initial);

    if (bucket) {
      bucket.push(entry);
    } else {
      groupedEntries.set(initial, [entry]);
    }
  }

  const groupKeys = [...groupedEntries.keys()];
  const groupRandom = createSeededRandom(hashString(groupKeys.join("|")));

  for (let index = groupKeys.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(groupRandom() * (index + 1));
    [groupKeys[index], groupKeys[swapIndex]] = [groupKeys[swapIndex], groupKeys[index]];
  }

  const shuffledGroups = groupKeys.map((key) => {
    const bucket = [...(groupedEntries.get(key) ?? [])];
    const bucketRandom = createSeededRandom(
      hashString(`${key}:${bucket.map((entry) => entry.id).join("|")}`)
    );

    for (let index = bucket.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(bucketRandom() * (index + 1));
      [bucket[index], bucket[swapIndex]] = [bucket[swapIndex], bucket[index]];
    }

    return bucket;
  });

  const ordered: ExpressionEntry[] = [];
  let addedEntry = true;

  while (addedEntry) {
    addedEntry = false;

    for (const bucket of shuffledGroups) {
      const nextEntry = bucket.shift();

      if (!nextEntry) {
        continue;
      }

      ordered.push(nextEntry);
      addedEntry = true;
    }
  }

  return ordered;
}

export function getStableExpressionOrder(entries: ExpressionEntry[]): ExpressionEntry[] {
  const curatedEntries = entries.filter((entry) => !isImportedEntry(entry));
  const importedEntries = entries.filter(isImportedEntry);

  return [
    ...getStableRandomizedBucketOrder(curatedEntries),
    ...getStableRandomizedBucketOrder(importedEntries)
  ];
}

function getFeaturedExpressionPool(entries: ExpressionEntry[]): ExpressionEntry[] {
  const curatedEntries = entries.filter((entry) => !isImportedEntry(entry));
  return curatedEntries.length > 0 ? curatedEntries : entries;
}

export function getDailyExpression(language: LanguageCode, date = new Date()): ExpressionEntry {
  const languageEntries = getExpressionsForLanguage(language);

  return getDailyExpressionFromEntries(languageEntries, language, date);
}

export function getDailyExpressionFromEntries(
  languageEntries: ExpressionEntry[],
  language: LanguageCode,
  date = new Date(),
  rotationSeed?: string
): ExpressionEntry {
  const featuredEntries = getFeaturedExpressionPool(languageEntries);

  if (featuredEntries.length === 0) {
    throw new Error(`No expressions configured for language: ${language}`);
  }

  const index =
    hashString(
      rotationSeed
        ? `${language}:${rotationSeed}:${getDateKey(date)}`
        : `${language}:${getDateKey(date)}`
    ) % featuredEntries.length;
  return featuredEntries[index];
}

export function getDailyExpressionAtOffset(
  language: LanguageCode,
  offset = 0,
  date = new Date()
): ExpressionEntry {
  const languageEntries = getExpressionsForLanguage(language);

  return getDailyExpressionAtOffsetFromEntries(languageEntries, language, offset, date);
}

export function getDailyExpressionAtOffsetFromEntries(
  languageEntries: ExpressionEntry[],
  language: LanguageCode,
  offset = 0,
  date = new Date(),
  rotationSeed?: string
): ExpressionEntry {
  const featuredEntries = getFeaturedExpressionPool(languageEntries);

  if (featuredEntries.length === 0) {
    throw new Error(`No expressions configured for language: ${language}`);
  }

  const baseIndex =
    hashString(
      rotationSeed
        ? `${language}:${rotationSeed}:${getDateKey(date)}`
        : `${language}:${getDateKey(date)}`
    ) % featuredEntries.length;
  const nextIndex = (baseIndex + offset) % featuredEntries.length;
  return featuredEntries[nextIndex];
}

export function filterExpressions({
  language,
  query,
  tag,
}: ExpressionFilter): ExpressionEntry[] {
  return filterExpressionsInEntries(getExpressionsForLanguage(language), {
    language,
    query,
    tag
  });
}

export function filterExpressionsInEntries(
  entries: ExpressionEntry[],
  { language, query, tag }: ExpressionFilter
): ExpressionEntry[] {
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedTag = tag?.trim().toLowerCase();

  return entries.filter((entry) => {
    const visibleTags = normalizeEntryTags(entry);
    const matchesTag = normalizedTag ? visibleTags.some((item) => item === normalizedTag) : true;
    const matchesQuery = normalizedQuery
      ? [
          entry.expression,
          entry.meaning,
          entry.usageNote,
          entry.exampleSentence,
          visibleTags.join(" ")
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;

    return matchesTag && matchesQuery;
  });
}

export function getAvailableTags(language: LanguageCode): CanonicalTopicTag[] {
  return getAvailableTagsFromEntries(getExpressionsForLanguage(language));
}

export function getAvailableTagsFromEntries(entries: ExpressionEntry[]): CanonicalTopicTag[] {
  return getVisibleTopicTags(entries);
}

export function getRelatedExpressions(expression: ExpressionEntry, limit = 3): ExpressionEntry[] {
  return getExpressionsForLanguage(expression.language)
    .filter((entry) => entry.id !== expression.id)
    .sort((left, right) => {
      const leftOverlap = left.tags.filter((tag) => expression.tags.includes(tag)).length;
      const rightOverlap = right.tags.filter((tag) => expression.tags.includes(tag)).length;
      return rightOverlap - leftOverlap;
    })
    .slice(0, limit);
}
