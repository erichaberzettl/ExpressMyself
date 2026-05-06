import { expressions } from "@/lib/content";
import { getPublicExpressions } from "@/lib/expression-content";
import { getStableExpressionOrder } from "@/lib/expressions";
import { canUseDatabase, db } from "@/lib/db";
import { languages } from "@/lib/languages";
import { normalizeExpressionEntry } from "@/lib/topic-tags";
import { ExpressionEntry, ExpressionFilter, LanguageCode, supportedLanguages } from "@/lib/types";

function mapDbExpression(entry: {
  id: string;
  language_code: string;
  expression: string;
  literal_translation: string | null;
  meaning: string;
  usage_note: string;
  example_sentence: string;
  example_translation: string;
  difficulty: string;
  tags: string[];
}): ExpressionEntry {
  const language = supportedLanguages.includes(entry.language_code as LanguageCode)
    ? (entry.language_code as LanguageCode)
    : "en";

  return {
    id: entry.id,
    language,
    expression: entry.expression,
    literalTranslation: entry.literal_translation ?? undefined,
    meaning: entry.meaning,
    usageNote: entry.usage_note,
    exampleSentence: entry.example_sentence,
    exampleTranslation: entry.example_translation,
    difficulty:
      entry.difficulty === "basic" || entry.difficulty === "intermediate"
        ? entry.difficulty
        : "intermediate",
    tags: entry.tags
  };
}

export async function listLanguages() {
  if (!(await canUseDatabase())) {
    return languages;
  }

  const result = await db.query(
    `SELECT code, label, native_label AS "nativeLabel"
     FROM languages
     ORDER BY label ASC`
  );

  return result.rows;
}

export async function getExpressionsForLanguageDb(
  language: LanguageCode
): Promise<ExpressionEntry[]> {
  if (!(await canUseDatabase())) {
    return getStableExpressionOrder(expressions.filter((entry) => entry.language === language));
  }

  const result = await db.query(
    `SELECT
       id,
       language_code,
       expression,
       literal_translation,
       meaning,
       usage_note,
       example_sentence,
       example_translation,
       difficulty,
       tags
     FROM expressions
     WHERE language_code = $1
     ORDER BY expression ASC`,
    [language]
  );

  return getStableExpressionOrder(
    getPublicExpressions(result.rows.map(mapDbExpression)).map(normalizeExpressionEntry)
  );
}

export async function getExpressionByIdDb(id: string): Promise<ExpressionEntry | undefined> {
  if (!(await canUseDatabase())) {
    return expressions.find((entry) => entry.id === id);
  }

  const result = await db.query(
    `SELECT
       id,
       language_code,
       expression,
       literal_translation,
       meaning,
       usage_note,
       example_sentence,
       example_translation,
       difficulty,
       tags
     FROM expressions
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  const mappedExpression = result.rows[0] ? mapDbExpression(result.rows[0]) : undefined;
  return mappedExpression && getPublicExpressions([mappedExpression]).length > 0
    ? normalizeExpressionEntry(mappedExpression)
    : undefined;
}

export async function getExpressionsByIdsDb(ids: string[]): Promise<ExpressionEntry[]> {
  if (!(await canUseDatabase())) {
    const expressionsById = new Map(expressions.map((entry) => [entry.id, entry]));
    return ids
      .map((id) => expressionsById.get(id))
      .filter((entry): entry is ExpressionEntry => Boolean(entry));
  }

  const result = await db.query(
    `SELECT
       id,
       language_code,
       expression,
       literal_translation,
       meaning,
       usage_note,
       example_sentence,
       example_translation,
       difficulty,
       tags
     FROM expressions
     WHERE id = ANY($1::text[])`,
    [ids]
  );

  const rowsById = new Map(result.rows.map((row) => [row.id, mapDbExpression(row)]));
  return ids
    .map((id) => rowsById.get(id))
    .filter((entry): entry is ExpressionEntry => Boolean(entry))
    .filter((entry) => getPublicExpressions([entry]).length > 0)
    .map(normalizeExpressionEntry);
}

export async function getRelatedExpressionsDb(
  expression: ExpressionEntry,
  limit = 3
): Promise<ExpressionEntry[]> {
  const sameLanguage = await getExpressionsForLanguageDb(expression.language);

  return sameLanguage
    .filter((entry) => entry.id !== expression.id)
    .sort((left, right) => {
      const leftOverlap = left.tags.filter((tag) => expression.tags.includes(tag)).length;
      const rightOverlap = right.tags.filter((tag) => expression.tags.includes(tag)).length;
      return rightOverlap - leftOverlap;
    })
    .slice(0, limit);
}

export async function filterExpressionsDb({
  language,
  query,
  tag
}: ExpressionFilter): Promise<ExpressionEntry[]> {
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedTag = tag?.trim().toLowerCase();
  const sameLanguage = await getExpressionsForLanguageDb(language);

  return sameLanguage.filter((entry) => {
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
