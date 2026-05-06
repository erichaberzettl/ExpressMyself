"use client";

import { AppHeader } from "@/components/app-header";
import { usePersistedContentTypes } from "@/lib/use-persisted-content-types";
import { usePersistedLanguage } from "@/lib/use-persisted-language";

export function PersistentAppHeader() {
  const [language, setLanguage] = usePersistedLanguage("en");
  const [selectedContentTypes, toggleContentType] = usePersistedContentTypes();

  return (
    <AppHeader
      language={language}
      onLanguageChange={setLanguage}
      selectedContentTypes={selectedContentTypes}
      onToggleContentType={toggleContentType}
    />
  );
}
