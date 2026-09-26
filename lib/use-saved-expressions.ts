"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "express-myself-saved-ids";
const STORAGE_EVENT = "express-myself-saved-updated";

type ChromeStorageArea = {
  get: (keys: string[], callback?: (items: Record<string, unknown>) => void) => Promise<Record<string, unknown>> | void;
  set: (items: Record<string, unknown>, callback?: () => void) => Promise<void> | void;
};

function getChromeStorage(): ChromeStorageArea | null {
  return typeof window !== "undefined" ? window.chrome?.storage?.local ?? null : null;
}

function parseSavedIds(stored: string | null): string[] {
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

// Synchronous read for the localStorage path (web app). Returns [] when only
// chrome.storage is available, since that store can only be read async.
function readSavedIdsSync(): string[] {
  if (typeof window === "undefined" || getChromeStorage()) {
    return [];
  }

  return parseSavedIds(window.localStorage.getItem(STORAGE_KEY));
}

async function readSavedIds(): Promise<string[]> {
  if (typeof window === "undefined") {
    return [];
  }

  const chromeStorage = getChromeStorage();

  if (!chromeStorage) {
    return parseSavedIds(window.localStorage.getItem(STORAGE_KEY));
  }

  const stored = await new Promise<string | null>((resolve) => {
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
  });

  return parseSavedIds(stored);
}

export function useSavedExpressions() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  // The serialized value we last read from or wrote to storage. Guards against
  // re-persisting unchanged data and against reacting to the storage-change
  // events our own writes emit (which would otherwise loop write -> onChanged
  // -> read -> setState -> write).
  const lastPersistedRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const syncSavedIds = async () => {
      const nextSavedIds = await readSavedIds();
      if (cancelled) {
        return;
      }

      const serialized = JSON.stringify(nextSavedIds);
      if (serialized === lastPersistedRef.current) {
        return;
      }

      lastPersistedRef.current = serialized;
      setSavedIds(nextSavedIds);
    };

    if (getChromeStorage()) {
      void readSavedIds().then((nextSavedIds) => {
        if (cancelled) {
          return;
        }

        lastPersistedRef.current = JSON.stringify(nextSavedIds);
        setSavedIds(nextSavedIds);
        setHasLoaded(true);
      });
    } else {
      // Read localStorage synchronously so the initial value is applied in the
      // same commit (no post-mount async setState, no extra render).
      const nextSavedIds = readSavedIdsSync();
      lastPersistedRef.current = JSON.stringify(nextSavedIds);
      setSavedIds(nextSavedIds);
      setHasLoaded(true);
    }

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
    if (serialized === lastPersistedRef.current) {
      return;
    }

    lastPersistedRef.current = serialized;

    const chromeStorage = getChromeStorage();
    if (chromeStorage) {
      void chromeStorage.set({ [STORAGE_KEY]: serialized });
    } else {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    }

    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, [hasLoaded, savedIds]);

  const toggleSaved = (expressionId: string) => {
    setSavedIds((current) =>
      current.includes(expressionId)
        ? current.filter((item) => item !== expressionId)
        : [...current, expressionId]
    );
  };

  return {
    savedIds,
    hasLoaded,
    isSaved: (expressionId: string) => savedIds.includes(expressionId),
    toggleSaved
  };
}
