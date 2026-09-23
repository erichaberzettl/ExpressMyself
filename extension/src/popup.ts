import { languages } from "../../lib/languages";
import { getDailyExpressionAtOffsetFromEntries, getExpressionsForLanguage } from "../../lib/expressions";
import { ExpressionEntry, LanguageCode } from "../../lib/types";
import { renderExpressionCard } from "./render";
import { speakExpression } from "../../lib/speech";
import { localDateKey, registerActiveDay, StreakRecord } from "../../lib/streak";
import {
  DAILY_OFFSET_KEY,
  DAILY_ROTATION_SEED_KEY,
  getStoredString,
  getStoredStringArray,
  HIDE_MEANING_KEY,
  LANGUAGE_KEY,
  LAST_SEEN_DAILY_KEY,
  SAVED_IDS_KEY,
  setStoredString,
  setStoredStringArray,
  STREAK_KEY,
  watchStoredKey
} from "./storage";

const SETTINGS_URL = "app.html?view=settings";

function utcDateKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type PopupState = {
  language: LanguageCode;
  savedIds: string[];
  offset: number;
  hasLanguagePreset: boolean;
  rotationSeed: string | null;
  revealed: boolean;
  currentExpression: ExpressionEntry | null;
  streak: number;
  hideMeaning: boolean;
};

type PopupOverrides = {
  language?: LanguageCode;
  offset?: number;
  savedIds?: string[];
};

function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }

  return element;
}

const root = getRequiredElement("popup-root");

// Compute (and cache) the ordered expression list only for the language the
// popup actually shows, instead of eagerly building all languages on open.
const entriesByLanguageCache = new Map<LanguageCode, ExpressionEntry[]>();

function getEntriesForLanguage(language: LanguageCode): ExpressionEntry[] {
  const cached = entriesByLanguageCache.get(language);

  if (cached) {
    return cached;
  }

  const entries = getExpressionsForLanguage(language);
  entriesByLanguageCache.set(language, entries);
  return entries;
}

const state: PopupState = {
  language: "en",
  savedIds: [],
  offset: 0,
  hasLanguagePreset: false,
  rotationSeed: null,
  revealed: true,
  currentExpression: null,
  streak: 0,
  hideMeaning: false
};

async function persistOffset() {
  await setStoredString(DAILY_OFFSET_KEY, String(state.offset));
}

async function copyExpression(entry: ExpressionEntry) {
  try {
    await navigator.clipboard?.writeText(entry.expression);
  } catch {
    // Clipboard can be unavailable or blocked; ignore and keep the UI usable.
  }
}

function clearToolbarBadge() {
  try {
    window.chrome?.action?.setBadgeText?.({ text: "" });
  } catch {
    // The badge is a nicety; ignore if the action API is unavailable.
  }
}

async function registerDailyVisit() {
  // Mark today's daily as seen (clears the "fresh phrase" toolbar badge) and
  // fold today into the practice streak.
  await setStoredString(LAST_SEEN_DAILY_KEY, utcDateKey());
  clearToolbarBadge();

  const rawStreak = await getStoredString(STREAK_KEY);
  let record: StreakRecord | null = null;

  if (rawStreak) {
    try {
      record = JSON.parse(rawStreak) as StreakRecord;
    } catch {
      record = null;
    }
  }

  const next = registerActiveDay(record, localDateKey());
  if (JSON.stringify(next) !== rawStreak) {
    await setStoredString(STREAK_KEY, JSON.stringify(next));
  }

  state.streak = next.count;
}

function renderStartupError(message: string) {
  root.innerHTML = "";

  const section = document.createElement("section");
  section.className = "panel panel-error";

  const stack = document.createElement("div");
  stack.className = "stack";

  const eyebrow = document.createElement("span");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Popup error";

  const heading = document.createElement("h2");
  heading.textContent = "ExpressMyself could not load";

  const summary = document.createElement("p");
  summary.className = "summary";
  summary.textContent = message;

  stack.append(eyebrow, heading, summary);
  section.append(stack);
  root.append(section);
}

function createRotationSeed(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readPopupOverrides(): PopupOverrides {
  const params = new URLSearchParams(window.location.search);
  const language = params.get("language");
  const offset = params.get("offset");
  const savedIds = params.get("saved");

  return {
    language: languages.some((item) => item.code === language) ? (language as LanguageCode) : undefined,
    offset: offset ? Number.parseInt(offset, 10) || 0 : undefined,
    savedIds: savedIds
      ? savedIds
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined
  };
}

// Link to the extension's own bundled page (app.html) rather than the external
// website, so the saved shelf and language shown here stay in sync with the
// popup (both read chrome.storage.local; the website uses a separate origin).
function createExtensionPageLink(label: string, view: string, className: string) {
  const link = document.createElement("a");
  link.className = className;
  const params = new URLSearchParams({ view });
  link.href = `app.html?${params.toString()}`;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = label;
  return link;
}

const rerender = () => {
  const entries = getEntriesForLanguage(state.language);
  const currentExpression =
    entries.length > 0
      ? getDailyExpressionAtOffsetFromEntries(
          entries,
          state.language,
          state.offset,
          new Date(),
          state.hasLanguagePreset ? state.rotationSeed ?? undefined : undefined
        )
      : null;

  root.innerHTML = "";

  const page = document.createElement("section");
  page.className = "page";

  const topBar = document.createElement("section");
  topBar.className = "popup-topbar";

  const brand = document.createElement("div");
  brand.className = "popup-brand";

  const brandEyebrow = document.createElement("span");
  brandEyebrow.className = "eyebrow popup-wordmark";
  brandEyebrow.textContent = "ExpressMyself";

  brand.append(brandEyebrow);

  if (state.streak > 0) {
    const streakBadge = document.createElement("span");
    streakBadge.className = "popup-streak";
    streakBadge.textContent = `🔥 ${state.streak}`;
    streakBadge.title = `${state.streak}-day streak`;
    streakBadge.setAttribute("aria-label", `${state.streak}-day streak`);
    brand.append(streakBadge);
  }

  const languageField = document.createElement("label");
  languageField.className = "language-menu";
  languageField.setAttribute("aria-label", "Choose language");

  const languageSelect = document.createElement("select");
  languageSelect.className = "language-select";

  for (const language of languages) {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = language.nativeLabel;
    option.selected = language.code === state.language;
    languageSelect.append(option);
  }

  languageSelect.addEventListener("change", async () => {
    state.language = languageSelect.value as LanguageCode;
    state.hasLanguagePreset = true;
    state.offset = 0;
    state.revealed = !state.hideMeaning;
    await setStoredString(LANGUAGE_KEY, state.language);
    await setStoredString(DAILY_OFFSET_KEY, "0");

    if (!state.rotationSeed) {
      state.rotationSeed = createRotationSeed();
      await setStoredString(DAILY_ROTATION_SEED_KEY, state.rotationSeed);
    }

    rerender();
  });

  const languageEmoji = document.createElement("span");
  languageEmoji.className = "language-emoji";
  languageEmoji.textContent = "🌐";
  languageEmoji.setAttribute("aria-hidden", "true");
  languageField.append(languageEmoji, languageSelect);

  const libraryLink = createExtensionPageLink("Library", "library", "link-button link-button-primary");
  const savedLink = createExtensionPageLink("Saved", "saved", "link-button link-button-secondary");

  const settingsLink = document.createElement("a");
  settingsLink.className = "popup-settings-link";
  settingsLink.href = SETTINGS_URL;
  settingsLink.target = "_blank";
  settingsLink.rel = "noreferrer";
  settingsLink.textContent = "⚙";
  settingsLink.title = "Settings";
  settingsLink.setAttribute("aria-label", "Settings");

  const actions = document.createElement("div");
  actions.className = "popup-topbar-actions";
  actions.append(languageField, libraryLink, savedLink, settingsLink);

  topBar.append(brand, actions);
  page.append(topBar);

  state.currentExpression = currentExpression;

  if (currentExpression) {
    const card = renderExpressionCard({
      expression: currentExpression,
      showTags: false,
      saved: state.savedIds.includes(currentExpression.id),
      revealed: state.revealed,
      onSpeak: (entry: ExpressionEntry) => speakExpression(entry.expression, entry.language),
      onCopy: (entry: ExpressionEntry) => {
        void copyExpression(entry);
      },
      onReveal: state.hideMeaning ? revealCurrent : undefined,
      onToggleSaved: () => {
        void toggleSaveCurrent();
      },
      onPrev: () => {
        void goToOffset(-1);
      },
      onNext: () => {
        void goToOffset(1);
      }
    });
    card.classList.add("popup-focus-card");
    page.append(card);

    const hint = document.createElement("p");
    hint.className = "hint popup-kbd-hint";
    hint.textContent = state.hideMeaning
      ? "← → browse · R reveal · S save · Space listen"
      : "← → browse · S save · Space listen";
    page.append(hint);
  }

  root.append(page);
};

async function goToOffset(delta: number) {
  state.offset += delta;
  state.revealed = !state.hideMeaning;
  await persistOffset();
  rerender();
}

function revealCurrent() {
  if (!state.revealed && state.currentExpression) {
    state.revealed = true;
    rerender();
  }
}

async function toggleSaveCurrent() {
  const entry = state.currentExpression;

  if (!entry) {
    return;
  }

  state.savedIds = state.savedIds.includes(entry.id)
    ? state.savedIds.filter((item) => item !== entry.id)
    : [...state.savedIds, entry.id];
  await setStoredStringArray(SAVED_IDS_KEY, state.savedIds);
  rerender();
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

window.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  if (isTypingTarget(event.target)) {
    return;
  }

  const entry = state.currentExpression;

  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      void goToOffset(1);
      break;
    case "ArrowLeft":
      event.preventDefault();
      void goToOffset(-1);
      break;
    case "r":
    case "R":
    case "Enter":
      if (!state.revealed) {
        event.preventDefault();
        revealCurrent();
      }
      break;
    case "s":
    case "S":
      event.preventDefault();
      void toggleSaveCurrent();
      break;
    case " ":
    case "p":
    case "P":
      if (entry) {
        event.preventDefault();
        speakExpression(entry.expression, entry.language);
      }
      break;
    case "c":
    case "C":
      if (entry) {
        event.preventDefault();
        void copyExpression(entry);
      }
      break;
    default:
      break;
  }
});

async function initialize() {
  const overrides = readPopupOverrides();
  const storedLanguage = await getStoredString(LANGUAGE_KEY);
  const storedRotationSeed = await getStoredString(DAILY_ROTATION_SEED_KEY);
  const storedOffset = await getStoredString(DAILY_OFFSET_KEY);
  if (overrides.language) {
    state.language = overrides.language;
  } else if (storedLanguage && languages.some((language) => language.code === storedLanguage)) {
    state.language = storedLanguage as LanguageCode;
    state.hasLanguagePreset = true;
  }

  // Restore where the reader last navigated with "Next" instead of snapping
  // back to the daily expression each time the popup reopens.
  const restoredOffset = storedOffset !== null ? Number.parseInt(storedOffset, 10) : 0;
  state.offset = overrides.offset ?? (Number.isFinite(restoredOffset) ? restoredOffset : 0);
  state.savedIds = overrides.savedIds ?? (await getStoredStringArray(SAVED_IDS_KEY));
  state.rotationSeed = storedRotationSeed;
  state.hideMeaning = (await getStoredString(HIDE_MEANING_KEY)) === "true";
  state.revealed = !state.hideMeaning;
  await registerDailyVisit();
  rerender();
}

watchStoredKey(SAVED_IDS_KEY, async () => {
  try {
    state.savedIds = await getStoredStringArray(SAVED_IDS_KEY);
    rerender();
  } catch (error) {
    renderStartupError(error instanceof Error ? error.message : "Unknown storage error.");
  }
});

void initialize().catch((error) => {
  renderStartupError(error instanceof Error ? error.message : "Unknown startup error.");
});
