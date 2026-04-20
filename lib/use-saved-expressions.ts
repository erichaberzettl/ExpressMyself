"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "express-myself-saved-ids";
const STORAGE_EVENT = "express-myself-saved-updated";

function readSavedIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function useSavedExpressions() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setSavedIds(readSavedIds());
    setHasLoaded(true);

    const syncSavedIds = () => {
      setSavedIds(readSavedIds());
    };

    window.addEventListener("storage", syncSavedIds);
    window.addEventListener(STORAGE_EVENT, syncSavedIds as EventListener);

    return () => {
      window.removeEventListener("storage", syncSavedIds);
      window.removeEventListener(STORAGE_EVENT, syncSavedIds as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
  }, [hasLoaded, savedIds]);

  const toggleSaved = (expressionId: string) => {
    setSavedIds((current) => {
      const nextSavedIds = current.includes(expressionId)
        ? current.filter((item) => item !== expressionId)
        : [...current, expressionId];

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSavedIds));
      window.dispatchEvent(new Event(STORAGE_EVENT));
      return nextSavedIds;
    });
  };

  return {
    savedIds,
    isSaved: (expressionId: string) => savedIds.includes(expressionId),
    toggleSaved
  };
}
