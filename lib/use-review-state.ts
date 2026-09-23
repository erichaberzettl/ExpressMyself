"use client";

import { useEffect, useRef, useState } from "react";
import { ReviewRecord, ReviewState } from "@/lib/spaced-repetition";

const STORAGE_KEY = "express-myself-review-state";
const STORAGE_EVENT = "express-myself-review-updated";

type ChromeStorageArea = {
  get: (keys: string[], callback?: (items: Record<string, unknown>) => void) => Promise<Record<string, unknown>> | void;
  set: (items: Record<string, unknown>, callback?: () => void) => Promise<void> | void;
};

function getChromeStorage(): ChromeStorageArea | null {
  return typeof window !== "undefined" ? window.chrome?.storage?.local ?? null : null;
}

function parseState(raw: string | null): ReviewState {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as ReviewState) : {};
  } catch {
    return {};
  }
}

function readStateSync(): ReviewState {
  if (typeof window === "undefined" || getChromeStorage()) {
    return {};
  }

  return parseState(window.localStorage.getItem(STORAGE_KEY));
}

async function readState(): Promise<ReviewState> {
  if (typeof window === "undefined") {
    return {};
  }

  const chromeStorage = getChromeStorage();

  if (!chromeStorage) {
    return parseState(window.localStorage.getItem(STORAGE_KEY));
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

  return parseState(stored);
}

export function useReviewState() {
  const [reviewState, setReviewState] = useState<ReviewState>({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const stateRef = useRef<ReviewState>({});

  useEffect(() => {
    stateRef.current = reviewState;
  }, [reviewState]);

  useEffect(() => {
    let cancelled = false;

    const applyState = (next: ReviewState) => {
      if (cancelled) {
        return;
      }

      stateRef.current = next;
      setReviewState(next);
    };

    const syncState = async () => {
      applyState(await readState());
    };

    if (getChromeStorage()) {
      void readState().then((next) => {
        applyState(next);
        if (!cancelled) {
          setHasLoaded(true);
        }
      });
    } else {
      applyState(readStateSync());
      setHasLoaded(true);
    }

    window.addEventListener(STORAGE_EVENT, syncState as EventListener);
    window.chrome?.storage?.onChanged?.addListener(syncState);

    return () => {
      cancelled = true;
      window.removeEventListener(STORAGE_EVENT, syncState as EventListener);
      window.chrome?.storage?.onChanged?.removeListener(syncState);
    };
  }, []);

  const saveRecord = (id: string, record: ReviewRecord) => {
    const next = { ...stateRef.current, [id]: record };
    stateRef.current = next;
    setReviewState(next);

    const serialized = JSON.stringify(next);
    const chromeStorage = getChromeStorage();
    if (chromeStorage) {
      void chromeStorage.set({ [STORAGE_KEY]: serialized });
    } else if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(STORAGE_EVENT));
    }
  };

  return { reviewState, hasLoaded, saveRecord };
}
