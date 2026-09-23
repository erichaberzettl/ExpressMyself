import { languages } from "../../lib/languages";
import { getDailyExpressionAtOffsetFromEntries, getExpressionsForLanguage } from "../../lib/expressions";
import { ExpressionEntry, LanguageCode } from "../../lib/types";
import { renderExpressionCard } from "./render";
import { speakExpression } from "../../lib/speech";
import {
  DAILY_OFFSET_KEY,
  DAILY_ROTATION_SEED_KEY,
  getStoredString,
  getStoredStringArray,
  LANGUAGE_KEY,
  SAVED_IDS_KEY,
  setStoredString,
  setStoredStringArray,
  watchStoredKey
} from "./storage";

type PopupState = {
  language: LanguageCode;
  savedIds: string[];
  offset: number;
  hasLanguagePreset: boolean;
  rotationSeed: string | null;
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
  rotationSeed: null
};

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
  brandEyebrow.className = "eyebrow";
  brandEyebrow.textContent = "ExpressMyself";

  const brandName = document.createElement("span");
  brandName.className = "popup-brand-name";
  brandName.textContent = "Daily";

  brand.append(brandEyebrow, brandName);

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
    await setStoredString(LANGUAGE_KEY, state.language);
    await setStoredString(DAILY_OFFSET_KEY, "0");

    if (!state.rotationSeed) {
      state.rotationSeed = createRotationSeed();
      await setStoredString(DAILY_ROTATION_SEED_KEY, state.rotationSeed);
    }

    rerender();
  });
  languageField.append(languageSelect);

  const libraryLink = createExtensionPageLink("Library", "library", "link-button link-button-primary");
  const savedLink = createExtensionPageLink("Saved", "saved", "link-button link-button-secondary");

  const actions = document.createElement("div");
  actions.className = "popup-topbar-actions";
  actions.append(languageField, libraryLink, savedLink);

  topBar.append(brand, actions);
  page.append(topBar);

  if (currentExpression) {
    const card = renderExpressionCard({
      expression: currentExpression,
      showTags: false,
      saved: state.savedIds.includes(currentExpression.id),
      onSpeak: (entry: ExpressionEntry) => speakExpression(entry.expression, entry.language),
      onToggleSaved: async (id: string) => {
        state.savedIds = state.savedIds.includes(id)
          ? state.savedIds.filter((item) => item !== id)
          : [...state.savedIds, id];
        await setStoredStringArray(SAVED_IDS_KEY, state.savedIds);
        rerender();
      },
      onNext: async () => {
        state.offset += 1;
        await setStoredString(DAILY_OFFSET_KEY, String(state.offset));
        rerender();
      }
    });
    card.classList.add("popup-focus-card");
    page.append(card);
  }

  root.append(page);
};

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
