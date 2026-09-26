// Content script injected on the ExpressMyself website. It bridges the
// extension's chrome.storage.local and the page's localStorage so a saved
// phrase (or language choice) made in the popup shows up on the website and
// vice versa. Runs in the isolated content-script world, so it can touch both
// chrome.storage (extension) and the page's localStorage.
//
// Bundled to a classic IIFE (dist/bridge.js) by extension/vite.bridge.config.mjs
// because declarative content scripts cannot be ES modules.

import {
  BRIDGE_INITIALIZED_KEY,
  DAILY_ROTATION_SEED_KEY,
  LANGUAGE_KEY,
  SAVED_IDS_KEY,
  StoreSnapshot,
  planReconcile
} from "../../lib/storage-bridge";

type ChromeStorageArea = {
  get: (
    keys: string[],
    callback?: (items: Record<string, unknown>) => void
  ) => Promise<Record<string, unknown>> | void;
  set: (values: Record<string, unknown>, callback?: () => void) => Promise<void> | void;
};

type ChromeLike = {
  storage?: {
    local?: ChromeStorageArea;
    onChanged?: {
      addListener: (
        callback: (changes: Record<string, { newValue?: unknown }>, areaName: string) => void
      ) => void;
    };
  };
};

const SAVED_EVENT = "express-myself-saved-updated";
const SYNCED_KEYS = [SAVED_IDS_KEY, LANGUAGE_KEY, DAILY_ROTATION_SEED_KEY];
const chromeRuntime = (globalThis as typeof globalThis & { chrome?: ChromeLike }).chrome;
const storage = chromeRuntime?.storage?.local;

// True while we are copying extension values into the page, so the SAVED_EVENT
// we dispatch for the web app does not bounce straight back to the extension.
let applyingFromExtension = false;

function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string | null): void {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage failures (private mode, quota) and keep the page usable.
  }
}

function getExtension(keys: string[]): Promise<Record<string, unknown>> {
  if (!storage) {
    return Promise.resolve({});
  }

  return new Promise((resolve) => {
    const maybePromise = storage.get(keys, (items) => resolve(items ?? {}));

    if (maybePromise && typeof (maybePromise as Promise<Record<string, unknown>>).then === "function") {
      (maybePromise as Promise<Record<string, unknown>>).then((items) => resolve(items ?? {}));
    }
  });
}

function setExtension(values: Record<string, unknown>): Promise<void> {
  if (!storage || Object.keys(values).length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const maybePromise = storage.set(values, () => resolve());

    if (maybePromise && typeof (maybePromise as Promise<void>).then === "function") {
      (maybePromise as Promise<void>).then(() => resolve());
    }
  });
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function snapshotFromExtension(items: Record<string, unknown>): StoreSnapshot {
  return {
    savedIds: asString(items[SAVED_IDS_KEY]),
    language: asString(items[LANGUAGE_KEY]),
    seed: asString(items[DAILY_ROTATION_SEED_KEY])
  };
}

function snapshotFromPage(): StoreSnapshot {
  return {
    savedIds: readLocal(SAVED_IDS_KEY),
    language: readLocal(LANGUAGE_KEY),
    seed: readLocal(DAILY_ROTATION_SEED_KEY)
  };
}

async function reconcile(): Promise<void> {
  const items = await getExtension([...SYNCED_KEYS, BRIDGE_INITIALIZED_KEY]);
  const initialized = items[BRIDGE_INITIALIZED_KEY] === true;
  const plan = planReconcile(snapshotFromExtension(items), snapshotFromPage(), initialized);

  applyingFromExtension = true;
  for (const [key, value] of Object.entries(plan.toPage)) {
    writeLocal(key, value);
  }
  applyingFromExtension = false;

  await setExtension({ ...plan.toExtension, [BRIDGE_INITIALIZED_KEY]: true });

  if (plan.savedIdsChangedOnPage) {
    window.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Push whatever the page currently holds into the extension. Used when the web
// app signals a change (a save toggle) and as a catch-all on tab focus/hide for
// changes that emit no event (e.g. a language switch).
async function pushPageToExtension(): Promise<void> {
  if (applyingFromExtension) {
    return;
  }

  const items = await getExtension(SYNCED_KEYS);
  const update: Record<string, unknown> = {};

  for (const key of SYNCED_KEYS) {
    const pageValue = readLocal(key);
    if (pageValue !== null && pageValue !== items[key]) {
      update[key] = pageValue;
    }
  }

  await setExtension(update);
}

function start(): void {
  if (!storage) {
    return;
  }

  // Extension -> page: mirror changes made in the popup or options page.
  chromeRuntime?.storage?.onChanged?.addListener((changes, areaName) => {
    if (areaName !== "local") {
      return;
    }

    let savedChanged = false;
    applyingFromExtension = true;
    for (const key of SYNCED_KEYS) {
      if (!(key in changes)) {
        continue;
      }

      writeLocal(key, asString(changes[key].newValue));
      if (key === SAVED_IDS_KEY) {
        savedChanged = true;
      }
    }
    applyingFromExtension = false;

    if (savedChanged) {
      window.dispatchEvent(new Event(SAVED_EVENT));
    }
  });

  // Page -> extension: the web app fires this when a phrase is saved/unsaved.
  window.addEventListener(SAVED_EVENT, () => {
    void pushPageToExtension();
  });

  // Catch changes that emit no event (language, seed) when the tab regains or
  // loses focus.
  window.addEventListener("visibilitychange", () => {
    void pushPageToExtension();
  });
  window.addEventListener("pagehide", () => {
    void pushPageToExtension();
  });

  void reconcile();
}

start();
