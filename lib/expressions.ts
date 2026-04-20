import { expressions } from "@/lib/content";
import { ExpressionEntry, ExpressionFilter, LanguageCode } from "@/lib/types";

export function getExpressionsForLanguage(language: LanguageCode): ExpressionEntry[] {
  return expressions.filter((entry) => entry.language === language);
}

export function getExpressionById(id: string): ExpressionEntry | undefined {
  return expressions.find((entry) => entry.id === id);
}

export function getExpressionsByIds(ids: string[]): ExpressionEntry[] {
  const expressionsById = new Map(expressions.map((entry) => [entry.id, entry]));
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

function hashString(value: string): number {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) % 2147483647;
  }

  return hash;
}

export function getDailyExpression(language: LanguageCode, date = new Date()): ExpressionEntry {
  const languageEntries = getExpressionsForLanguage(language);

  if (languageEntries.length === 0) {
    throw new Error(`No expressions configured for language: ${language}`);
  }

  const index = hashString(`${language}:${getDateKey(date)}`) % languageEntries.length;
  return languageEntries[index];
}

export function getDailyExpressionAtOffset(
  language: LanguageCode,
  offset = 0,
  date = new Date()
): ExpressionEntry {
  const languageEntries = getExpressionsForLanguage(language);

  if (languageEntries.length === 0) {
    throw new Error(`No expressions configured for language: ${language}`);
  }

  const baseIndex = hashString(`${language}:${getDateKey(date)}`) % languageEntries.length;
  const nextIndex = (baseIndex + offset) % languageEntries.length;
  return languageEntries[nextIndex];
}

export function filterExpressions({ language, query, tag }: ExpressionFilter): ExpressionEntry[] {
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedTag = tag?.trim().toLowerCase();

  return getExpressionsForLanguage(language).filter((entry) => {
    const matchesTag = normalizedTag ? entry.tags.some((item) => item === normalizedTag) : true;
    const matchesQuery = normalizedQuery
      ? [
          entry.expression,
          entry.meaning,
          entry.usageNote,
          entry.exampleSentence,
          entry.tags.join(" ")
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;

    return matchesTag && matchesQuery;
  });
}

export function getAvailableTags(language: LanguageCode): string[] {
  return [...new Set(getExpressionsForLanguage(language).flatMap((entry) => entry.tags))].sort();
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
