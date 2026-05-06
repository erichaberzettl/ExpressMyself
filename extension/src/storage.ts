export const SAVED_IDS_KEY = "express-myself-saved-ids";
export const LANGUAGE_KEY = "express-myself-language";
export const DAILY_ROTATION_SEED_KEY = "express-myself-daily-rotation-seed";

type StorageArea = {
  get: (
    keys: string[],
    callback?: (items: Record<string, unknown>) => void
  ) => Promise<Record<string, unknown>> | void;
  set: (
    values: Record<string, unknown>,
    callback?: () => void
  ) => Promise<void> | void;
};

type StorageNamespace = {
  local?: StorageArea;
  onChanged?: {
    addListener: (
      callback: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void
    ) => void;
    removeListener: (
      callback: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void
    ) => void;
  };
};

declare global {
  interface Window {
    chrome?: {
      runtime?: {
        lastError?: {
          message?: string;
        };
      };
      storage?: StorageNamespace;
    };
  }
}

function getChromeStorage(): StorageArea | null {
  return window.chrome?.storage?.local ?? null;
}

function getChromeStorageNamespace(): StorageNamespace | null {
  return window.chrome?.storage ?? null;
}

async function getChromeStoredItems(keys: string[]): Promise<Record<string, unknown>> {
  const chromeStorage = getChromeStorage();

  if (!chromeStorage) {
    return {};
  }

  const promiseResult = chromeStorage.get(keys);

  if (promiseResult && typeof (promiseResult as Promise<Record<string, unknown>>).then === "function") {
    return promiseResult as Promise<Record<string, unknown>>;
  }

  return new Promise((resolve, reject) => {
    chromeStorage.get(keys, (items) => {
      const errorMessage = window.chrome?.runtime?.lastError?.message;
      if (errorMessage) {
        reject(new Error(errorMessage));
        return;
      }

      resolve(items ?? {});
    });
  });
}

async function setChromeStoredItems(values: Record<string, unknown>): Promise<void> {
  const chromeStorage = getChromeStorage();

  if (!chromeStorage) {
    return;
  }

  const promiseResult = chromeStorage.set(values);

  if (promiseResult && typeof (promiseResult as Promise<void>).then === "function") {
    await promiseResult;
    return;
  }

  await new Promise<void>((resolve, reject) => {
    chromeStorage.set(values, () => {
      const errorMessage = window.chrome?.runtime?.lastError?.message;
      if (errorMessage) {
        reject(new Error(errorMessage));
        return;
      }

      resolve();
    });
  });
}

export async function getStoredString(key: string): Promise<string | null> {
  const chromeStorage = getChromeStorage();

  if (chromeStorage) {
    const result = await getChromeStoredItems([key]);
    const value = result[key];
    return typeof value === "string" ? value : null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setStoredString(key: string, value: string): Promise<void> {
  const chromeStorage = getChromeStorage();

  if (chromeStorage) {
    await setChromeStoredItems({ [key]: value });
    return;
  }

  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new CustomEvent("express-myself-storage-changed", { detail: { key } }));
  } catch {
    // Ignore localStorage failures in non-extension contexts and keep the UI usable.
  }
}

export async function getStoredStringArray(key: string): Promise<string[]> {
  const rawValue = await getStoredString(key);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function setStoredStringArray(key: string, values: string[]): Promise<void> {
  await setStoredString(key, JSON.stringify(values));
}

export function watchStoredKey(key: string, callback: () => void): () => void {
  const chromeStorage = getChromeStorageNamespace();

  if (chromeStorage?.onChanged) {
    const listener = (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => {
      if (key in changes) {
        callback();
      }
    };

    chromeStorage.onChanged.addListener(listener);
    return () => chromeStorage.onChanged?.removeListener(listener);
  }

  const listener = (event: Event) => {
    if (
      event instanceof StorageEvent ||
      (event instanceof CustomEvent && event.detail?.key === key)
    ) {
      callback();
    }
  };

  window.addEventListener("storage", listener);
  window.addEventListener("express-myself-storage-changed", listener as EventListener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("express-myself-storage-changed", listener as EventListener);
  };
}
