import { PracticeExperience } from "@/components/practice-experience";
import { LanguageCode, supportedLanguages } from "@/lib/types";

function isLanguageCode(value: string): value is LanguageCode {
  return supportedLanguages.includes(value as LanguageCode);
}

type PracticePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const languageParam = resolvedSearchParams.language;
  const initialLanguage =
    typeof languageParam === "string" && isLanguageCode(languageParam) ? languageParam : "en";

  return <PracticeExperience initialLanguage={initialLanguage} />;
}
