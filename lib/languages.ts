import { LanguageCode } from "@/lib/types";

export type LanguageMeta = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
};

export const languages: LanguageMeta[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "de", label: "German", nativeLabel: "Deutsch" }
];

export const languagesByCode: Record<LanguageCode, LanguageMeta> = Object.fromEntries(
  languages.map((language) => [language.code, language])
) as Record<LanguageCode, LanguageMeta>;

