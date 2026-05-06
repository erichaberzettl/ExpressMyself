import { getExpressionById, getExpressionsByIds, getExpressionsForLanguage } from "../../lib/expressions";
import { ExpressionEntry, LanguageCode } from "../../lib/types";

export async function fetchExpressionsForLanguage(
  language: LanguageCode
): Promise<ExpressionEntry[]> {
  return getExpressionsForLanguage(language);
}

export async function fetchExpressionsByIds(ids: string[]): Promise<ExpressionEntry[]> {
  return getExpressionsByIds(ids);
}

export async function fetchExpressionById(id: string): Promise<ExpressionEntry | null> {
  return getExpressionById(id) ?? null;
}
