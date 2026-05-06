"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "express-myself-saved-ids";
const STORAGE_EVENT = "express-myself-saved-updated";

type ChromeStorageArea = {
  get: (keys: string[], callback?: (items: Record<string, unknown>) => void) => Promise<Record<string, unknown>> | void;
  set: (items: Record<string, unknown>, callback?: () => void) => Promise<void> | void;
};

function getChromeStorage(): ChromeStorageArea | null {
  return typeof window !== "undefined" ? window.chrome?.storage?.local ?? null : null;
}

async function readSavedIds(): Promise<string[]> {
  if (typeof window === "undefined") {
    return [];
  }

  const chromeStorage = getChromeStorage();
  const stored =
    chromeStorage
      ? await new Promise<string | null>((resolve) => {
          const maybePromise = chromeStorage.get([STORAGE_KEY], (items) => {
            const value = items?.[STORAGE_KEY];
            resolve(typeof value === "string" ? value : null);
          });

          if (maybePromise && typeof (maybePromise as Promise<Record<string, unknown>>).then === "function") {
            (maybePromise as Promise<Record<string, unknown>>).then((items) => {
              const value = items?.[STORAGE_KEY];
              resolve(typeof value === "string" ? value : null);
            });
          }
        })
      : window.localStorage.getItem(STORAGE_KEY);

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
    let cancelled = false;

    const syncSavedIds = async () => {
      const nextSavedIds = await readSavedIds();
      if (!cancelled) {
        setSavedIds(nextSavedIds);
      }
    };

    void syncSavedIds().then(() => {
      if (!cancelled) {
        setHasLoaded(true);
      }
    });

    window.addEventListener("storage", syncSavedIds);
    window.addEventListener(STORAGE_EVENT, syncSavedIds as EventListener);
    window.chrome?.storage?.onChanged?.addListener(syncSavedIds);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", syncSavedIds);
      window.removeEventListener(STORAGE_EVENT, syncSavedIds as EventListener);
      window.chrome?.storage?.onChanged?.removeListener(syncSavedIds);
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    const serialized = JSON.stringify(savedIds);
    const chromeStorage = getChromeStorage();
    if (chromeStorage) {
      void chromeStorage.set({ [STORAGE_KEY]: serialized });
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, serialized);
  }, [hasLoaded, savedIds]);

  const toggleSaved = (expressionId: string) => {
    setSavedIds((current) => {
      const nextSavedIds = current.includes(expressionId)
        ? current.filter((item) => item !== expressionId)
        : [...current, expressionId];

      const serialized = JSON.stringify(nextSavedIds);
      const chromeStorage = getChromeStorage();
      if (chromeStorage) {
        void chromeStorage.set({ [STORAGE_KEY]: serialized });
      } else {
        window.localStorage.setItem(STORAGE_KEY, serialized);
      }
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
