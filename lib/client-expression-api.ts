import { ExpressionEntry, LanguageCode } from "@/lib/types";

export async function fetchExpressionsForLanguage(language: LanguageCode): Promise<ExpressionEntry[]> {
  const response = await fetch(`/api/expressions?language=${language}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to load expressions for ${language}`);
  }

  const payload = await response.json();
  return payload.expressions as ExpressionEntry[];
}

export async function fetchExpressionsByIds(ids: string[]): Promise<ExpressionEntry[]> {
  if (ids.length === 0) {
    return [];
  }

  const response = await fetch(`/api/expressions?ids=${encodeURIComponent(ids.join(","))}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load saved expressions");
  }

  const payload = await response.json();
  return payload.expressions as ExpressionEntry[];
}
