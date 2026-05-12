import { NextRequest, NextResponse } from "next/server";
import { getExpressionsByIds, getExpressionsForLanguage } from "@/lib/expressions";
import { ExpressionEntry, LanguageCode, supportedLanguages } from "@/lib/types";

function isLanguageCode(value: string): value is LanguageCode {
  return supportedLanguages.includes(value as LanguageCode);
}

export async function GET(request: NextRequest) {
  const language = request.nextUrl.searchParams.get("language");
  const ids = request.nextUrl.searchParams.get("ids");

  let expressions: ExpressionEntry[] = [];

  if (ids) {
    const allIds = ids
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    expressions = getExpressionsByIds(allIds);
  } else if (language && isLanguageCode(language)) {
    expressions = getExpressionsForLanguage(language);
  }

  return NextResponse.json({ expressions });
}
