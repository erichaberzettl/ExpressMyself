import { NextRequest, NextResponse } from "next/server";
import { getExpressionsByIdsDb, getExpressionsForLanguageDb } from "@/lib/expression-repository";
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
    expressions = await getExpressionsByIdsDb(allIds);
  } else if (language && isLanguageCode(language)) {
    expressions = await getExpressionsForLanguageDb(language);
  }

  return NextResponse.json({ expressions });
}
