"use client";

import { AppHeader } from "@/components/app-header";
import { usePersistedLanguage } from "@/lib/use-persisted-language";

export function PersistentAppHeader() {
  const [language, setLanguage] = usePersistedLanguage("en");

  return <AppHeader language={language} onLanguageChange={setLanguage} />;
}
