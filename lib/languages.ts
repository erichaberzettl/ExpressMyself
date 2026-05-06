import { LanguageCode } from "./types";

export type LanguageMeta = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  speechLang: string;
};

export const languages: LanguageMeta[] = [
  { code: "en", label: "English", nativeLabel: "English", speechLang: "en-US" },
  { code: "es", label: "Spanish", nativeLabel: "Español", speechLang: "es-ES" },
  { code: "fr", label: "French", nativeLabel: "Français", speechLang: "fr-FR" },
  { code: "de", label: "German", nativeLabel: "Deutsch", speechLang: "de-DE" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", speechLang: "pt-PT" },
  { code: "it", label: "Italian", nativeLabel: "Italiano", speechLang: "it-IT" },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands", speechLang: "nl-NL" },
  { code: "sv", label: "Swedish", nativeLabel: "Svenska", speechLang: "sv-SE" },
  { code: "da", label: "Danish", nativeLabel: "Dansk", speechLang: "da-DK" },
  { code: "pl", label: "Polish", nativeLabel: "Polski", speechLang: "pl-PL" }
];

export const languagesByCode: Record<LanguageCode, LanguageMeta> = Object.fromEntries(
  languages.map((language) => [language.code, language])
) as Record<LanguageCode, LanguageMeta>;
