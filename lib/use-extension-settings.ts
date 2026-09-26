"use client";

import { useEffect, useState } from "react";

export const HIDE_MEANING_KEY = "express-myself-hide-daily-meaning";
export const REMINDER_KEY = "express-myself-reminder";

export type ReminderSettings = { enabled: boolean; time: string };

const DEFAULT_REMINDER: ReminderSettings = { enabled: false, time: "09:00" };

type ChromeStorageArea = {
  get: (keys: string[], callback?: (items: Record<string, unknown>) => void) => Promise<Record<string, unknown>> | void;
  set: (items: Record<string, unknown>, callback?: () => void) => Promise<void> | void;
};

function getChromeStorage(): ChromeStorageArea | null {
  return typeof window !== "undefined" ? window.chrome?.storage?.local ?? null : null;
}

function parseReminder(raw: string | null): ReminderSettings {
  if (!raw) {
    return DEFAULT_REMINDER;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled: Boolean(parsed.enabled),
      time: typeof parsed.time === "string" ? parsed.time : "09:00"
    };
  } catch {
    return DEFAULT_REMINDER;
  }
}

async function readString(key: string): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const chromeStorage = getChromeStorage();

  if (!chromeStorage) {
    return window.localStorage.getItem(key);
  }

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

function writeString(key: string, value: string) {
  const chromeStorage = getChromeStorage();

  if (chromeStorage) {
    void chromeStorage.set({ [key]: value });
    return;
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, value);
  }
}

export function useExtensionSettings() {
  const [hideMeaning, setHideMeaningState] = useState(false);
  const [reminder, setReminderState] = useState<ReminderSettings>(DEFAULT_REMINDER);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([readString(HIDE_MEANING_KEY), readString(REMINDER_KEY)]).then(
      ([hideRaw, reminderRaw]) => {
        if (cancelled) {
          return;
        }

        setHideMeaningState(hideRaw === "true");
        setReminderState(parseReminder(reminderRaw));
        setHasLoaded(true);
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const setHideMeaning = (value: boolean) => {
    setHideMeaningState(value);
    writeString(HIDE_MEANING_KEY, value ? "true" : "false");
  };

  const setReminder = (value: ReminderSettings) => {
    setReminderState(value);
    writeString(REMINDER_KEY, JSON.stringify(value));
  };

  return { hideMeaning, setHideMeaning, reminder, setReminder, hasLoaded };
}
