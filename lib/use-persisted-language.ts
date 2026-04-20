"use client";

import { useEffect, useState } from "react";
import { LanguageCode, supportedLanguages } from "@/lib/types";

const STORAGE_KEY = "express-myself-language";

function isLanguageCode(value: string): value is LanguageCode {
  return supportedLanguages.includes(value as LanguageCode);
}

export function usePersistedLanguage(initialLanguage: LanguageCode) {
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored && isLanguageCode(stored)) {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  return [language, setLanguage] as const;
}

