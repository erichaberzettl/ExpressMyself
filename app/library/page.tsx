import { getExpressionsForLanguage } from "@/lib/expressions";
import { LibraryExperience } from "@/components/library-experience";
import { LanguageCode, supportedLanguages } from "@/lib/types";

function isLanguageCode(value: string): value is LanguageCode {
  return supportedLanguages.includes(value as LanguageCode);
}

type LibraryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const languageParam = resolvedSearchParams.language;
  const initialLanguage =
    typeof languageParam === "string" && isLanguageCode(languageParam) ? languageParam : "en";
  const initialExpressions = getExpressionsForLanguage(initialLanguage);

  return <LibraryExperience initialExpressions={initialExpressions} initialLanguage={initialLanguage} />;
}
