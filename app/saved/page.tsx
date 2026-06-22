import { SavedExperience } from "@/components/saved-experience";
import { LanguageCode, supportedLanguages } from "@/lib/types";

function isLanguageCode(value: string): value is LanguageCode {
  return supportedLanguages.includes(value as LanguageCode);
}

type SavedPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SavedPage({ searchParams }: SavedPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const languageParam = resolvedSearchParams.language;
  const initialLanguage =
    typeof languageParam === "string" && isLanguageCode(languageParam) ? languageParam : "en";

  return <SavedExperience initialLanguage={initialLanguage} />;
}
