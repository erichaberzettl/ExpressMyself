import { languages } from "../../lib/languages";
import { getDailyExpressionAtOffsetFromEntries, getExpressionsForLanguage } from "../../lib/expressions";
import { ExpressionEntry, LanguageCode } from "../../lib/types";
import { renderExpressionCard } from "./render";
import { speakExpression } from "./speech";
import {
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

const WEB_APP_BASE_URL = "http://localhost:3000";

function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }

  return element;
}

const root = getRequiredElement("popup-root");

const entriesByLanguage = new Map(languages.map((language) => [language.code, getExpressionsForLanguage(language.code)]));

const state: PopupState = {
  language: "en",
  savedIds: [],
  offset: 0,
  hasLanguagePreset: false,
  rotationSeed: null
};

function renderStartupError(message: string) {
  root.innerHTML = `
    <section class="panel panel-error">
      <div class="stack">
        <span class="eyebrow">Popup error</span>
        <h2>ExpressMyself could not load</h2>
        <p class="summary">${message}</p>
      </div>
    </section>
  `;
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

function createWebAppLink(label: string, pathname: string, params: URLSearchParams, className: string) {
  const link = document.createElement("a");
  link.className = className;
  const url = new URL(pathname, WEB_APP_BASE_URL);
  url.search = params.toString();
  link.href = url.toString();
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = label;
  return link;
}

const rerender = () => {
  const entries = entriesByLanguage.get(state.language) ?? [];
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
  brand.innerHTML = `
    <span class="eyebrow">ExpressMyself</span>
    <span class="popup-brand-name">Daily</span>
  `;

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

    if (!state.rotationSeed) {
      state.rotationSeed = createRotationSeed();
      await setStoredString(DAILY_ROTATION_SEED_KEY, state.rotationSeed);
    }

    rerender();
  });
  languageField.append(languageSelect);

  const libraryLink = createWebAppLink(
    "Library",
    "/library",
    new URLSearchParams({ language: state.language }),
    "link-button link-button-primary"
  );
  const savedLink = createWebAppLink(
    "Saved",
    "/saved",
    new URLSearchParams(),
    "link-button link-button-secondary"
  );

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
      onNext: () => {
        state.offset += 1;
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
  if (overrides.language) {
    state.language = overrides.language;
  } else if (storedLanguage && languages.some((language) => language.code === storedLanguage)) {
    state.language = storedLanguage as LanguageCode;
    state.hasLanguagePreset = true;
  }

  state.offset = overrides.offset ?? 0;
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
