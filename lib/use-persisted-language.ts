"use client";

import { useEffect, useRef, useState } from "react";
import { LanguageCode, supportedLanguages } from "@/lib/types";

export const PERSISTED_LANGUAGE_STORAGE_KEY = "express-myself-language";
export const DAILY_ROTATION_SEED_STORAGE_KEY = "express-myself-daily-rotation-seed";

function isLanguageCode(value: string): value is LanguageCode {
  return supportedLanguages.includes(value as LanguageCode);
}

function createRotationSeed(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type ChromeStorageArea = {
  get: (keys: string[], callback?: (items: Record<string, unknown>) => void) => Promise<Record<string, unknown>> | void;
  set: (items: Record<string, unknown>, callback?: () => void) => Promise<void> | void;
};

function getChromeStorage(): ChromeStorageArea | null {
  return typeof window !== "undefined" ? window.chrome?.storage?.local ?? null : null;
}

async function readStoredString(key: string): Promise<string | null> {
  const chromeStorage = getChromeStorage();

  if (chromeStorage) {
    return new Promise((resolve) => {
      const maybePromise = chromeStorage.get([key], (items) => {
        const value = items?.[key];
        resolve(typeof value === "string" ? value : null);
      });

      if (maybePromise && typeof (maybePromise as Promise<Record<string, unknown>>).then === "function") {
        (maybePromise as Promise<Record<string, unknown>>).then((items) => {
          const value = items?.[key];
          resolve(typeof value === "string" ? value : null);
        });
      }
    });
  }

  return window.localStorage.getItem(key);
}

function writeStoredString(key: string, value: string) {
  const chromeStorage = getChromeStorage();

  if (chromeStorage) {
    void chromeStorage.set({ [key]: value });
    return;
  }

  window.localStorage.setItem(key, value);
}

export function usePersistedLanguage(initialLanguage: LanguageCode) {
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage);
  const [hasPersistedLanguage, setHasPersistedLanguage] = useState(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void readStoredString(PERSISTED_LANGUAGE_STORAGE_KEY).then((stored) => {
      if (!cancelled && stored && isLanguageCode(stored)) {
        setLanguage(stored);
        setHasPersistedLanguage(true);
      }

      hasHydrated.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) {
      return;
    }

    writeStoredString(PERSISTED_LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const setPersistedLanguage = (nextLanguage: LanguageCode) => {
    setHasPersistedLanguage(true);
    setLanguage(nextLanguage);
  };

  return [language, setPersistedLanguage, hasPersistedLanguage] as const;
}

export function useDailyRotationSeed(enabled: boolean) {
  const [rotationSeed, setRotationSeed] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setRotationSeed(null);
      return;
    }

    let cancelled = false;

    void readStoredString(DAILY_ROTATION_SEED_STORAGE_KEY).then((storedSeed) => {
      if (cancelled) {
        return;
      }

      if (storedSeed) {
        setRotationSeed(storedSeed);
        return;
      }

      const nextSeed = createRotationSeed();
      writeStoredString(DAILY_ROTATION_SEED_STORAGE_KEY, nextSeed);
      setRotationSeed(nextSeed);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return rotationSeed;
}
