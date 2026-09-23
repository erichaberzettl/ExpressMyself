// Pure reconcile logic shared by the extension's content-script bridge, which
// keeps chrome.storage.local (extension) and localStorage (the website on
// expressmyself.vercel.app) in sync for saved phrases and language.
//
// The two live on different origins, so state can only be shared by an explicit
// bridge. This module contains just the merge decisions (no chrome/DOM access)
// so they can be unit tested; extension/src/bridge.ts wires them to real IO.

export const SAVED_IDS_KEY = "express-myself-saved-ids";
export const LANGUAGE_KEY = "express-myself-language";
export const DAILY_ROTATION_SEED_KEY = "express-myself-daily-rotation-seed";
// Marks that the two stores have been merged once, so later reconciles mirror
// the extension store (letting deletions propagate) instead of re-unioning
// (which would resurrect anything deleted while a surface was offline).
export const BRIDGE_INITIALIZED_KEY = "express-myself-bridge-initialized";

export type StoreSnapshot = {
  savedIds: string | null;
  language: string | null;
  seed: string | null;
};

export type BridgePlan = {
  // Values to write into the page's localStorage.
  toPage: Record<string, string>;
  // Values to write into the extension's chrome.storage.local.
  toExtension: Record<string, string>;
  // Whether the page's saved-ids ended up changing (so the bridge should tell
  // the web app to re-read them).
  savedIdsChangedOnPage: boolean;
};

export function parseSavedIds(raw: string | null | undefined): string[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function unionSavedIds(first: string[], second: string[]): string[] {
  return Array.from(new Set([...first, ...second]));
}

function pickScalar(extValue: string | null, pageValue: string | null): string | null {
  // The extension store is the shared cross-surface source of truth; fall back
  // to the page value when the extension has nothing yet (first-run adoption).
  return extValue && extValue.length > 0 ? extValue : pageValue;
}

/**
 * Decide what to write where when the bridge (re)connects on a page load.
 *
 * @param ext   snapshot of the extension's chrome.storage.local
 * @param page  snapshot of the page's localStorage
 * @param initialized  whether the stores have already been merged once
 */
export function planReconcile(ext: StoreSnapshot, page: StoreSnapshot, initialized: boolean): BridgePlan {
  const extIds = parseSavedIds(ext.savedIds);
  const pageIds = parseSavedIds(page.savedIds);

  // First contact: union so no pre-existing saves are lost. After that, the
  // extension store is authoritative so deletions actually stick.
  const mergedIds = initialized ? extIds : unionSavedIds(extIds, pageIds);
  const mergedIdsRaw = JSON.stringify(mergedIds);

  const language = pickScalar(ext.language, page.language);
  const seed = pickScalar(ext.seed, page.seed);

  const toPage: Record<string, string> = {};
  const toExtension: Record<string, string> = {};

  const pageIdsRaw = JSON.stringify(pageIds);
  if (mergedIdsRaw !== pageIdsRaw) {
    toPage[SAVED_IDS_KEY] = mergedIdsRaw;
  }
  if (mergedIdsRaw !== (ext.savedIds ?? "")) {
    toExtension[SAVED_IDS_KEY] = mergedIdsRaw;
  }

  if (language) {
    if (language !== page.language) {
      toPage[LANGUAGE_KEY] = language;
    }
    if (language !== ext.language) {
      toExtension[LANGUAGE_KEY] = language;
    }
  }

  if (seed) {
    if (seed !== page.seed) {
      toPage[DAILY_ROTATION_SEED_KEY] = seed;
    }
    if (seed !== ext.seed) {
      toExtension[DAILY_ROTATION_SEED_KEY] = seed;
    }
  }

  return {
    toPage,
    toExtension,
    savedIdsChangedOnPage: mergedIdsRaw !== pageIdsRaw
  };
}
