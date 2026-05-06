import { languages } from "../../lib/languages";
import { expressionContentTypes, getExpressionContentTypeLabel } from "../../lib/expression-content";
import {
  filterExpressionsInEntries,
  getAvailableTagsFromEntries,
  getDailyExpressionAtOffsetFromEntries,
  getExpressionsByIdsFromEntries,
  getExpressionsForLanguage
} from "../../lib/expressions";
import { getTopicTagLabel } from "../../lib/topic-tags";
import {
  ExpressionContentType,
  ExpressionEntry,
  LanguageCode
} from "../../lib/types";
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

type ViewMode = "daily" | "library" | "saved";

type AppState = {
  language: LanguageCode;
  savedIds: string[];
  query: string;
  tag: string;
  contentTypes: ExpressionContentType[];
  view: ViewMode;
  offset: number;
  hasLanguagePreset: boolean;
  rotationSeed: string | null;
};

type AppOverrides = {
  language?: LanguageCode;
  savedIds?: string[];
  query?: string;
  tag?: string;
  view?: ViewMode;
  offset?: number;
  contentTypes?: ExpressionContentType[];
};

function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }

  return element;
}

const root = getRequiredElement("app-root");

const allEntries = languages.flatMap((language) => getExpressionsForLanguage(language.code));
const entriesByLanguage = new Map(
  languages.map((language) => [language.code, getExpressionsForLanguage(language.code)])
);

const state: AppState = {
  language: "en",
  savedIds: [],
  query: "",
  tag: "all",
  contentTypes: [...expressionContentTypes],
  view: "daily",
  offset: 0,
  hasLanguagePreset: false,
  rotationSeed: null
};

function createRotationSeed(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readAppOverrides(): AppOverrides {
  const params = new URLSearchParams(window.location.search);
  const language = params.get("language");
  const saved = params.get("saved");
  const query = params.get("query");
  const tag = params.get("tag");
  const view = params.get("view");
  const offset = params.get("offset");
  const contentTypes = params.get("contentTypes");

  const parsedContentTypes = contentTypes
    ? contentTypes
        .split(",")
        .map((item) => item.trim())
        .filter((item): item is ExpressionContentType =>
          expressionContentTypes.includes(item as ExpressionContentType)
        )
    : undefined;

  return {
    language: languages.some((item) => item.code === language) ? (language as LanguageCode) : undefined,
    savedIds: saved
      ? saved
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined,
    query: query ?? undefined,
    tag: tag ?? undefined,
    view:
      view === "daily" || view === "library" || view === "saved"
        ? (view as ViewMode)
        : undefined,
    offset: offset ? Number.parseInt(offset, 10) || 0 : undefined,
    contentTypes: parsedContentTypes?.length ? parsedContentTypes : undefined
  };
}

function toggleSaved(id: string) {
  state.savedIds = state.savedIds.includes(id)
    ? state.savedIds.filter((item) => item !== id)
    : [...state.savedIds, id];

  return setStoredStringArray(SAVED_IDS_KEY, state.savedIds);
}

function toggleContentType(contentType: ExpressionContentType) {
  if (state.contentTypes.includes(contentType)) {
    if (state.contentTypes.length === 1) {
      return;
    }

    state.contentTypes = state.contentTypes.filter((item) => item !== contentType);
    return;
  }

  state.contentTypes = [...state.contentTypes, contentType];
}

function setView(view: ViewMode) {
  state.view = view;
  rerender();
}

function createViewLink(label: string, view: ViewMode, className: string) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", () => setView(view));
  return button;
}

function createLanguageSelect(resetTag = false) {
  const languageField = document.createElement("label");
  languageField.className = "field";
  languageField.innerHTML = "<span>Language</span>";
  const languageSelect = document.createElement("select");
  for (const language of languages) {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = `${language.label} · ${language.nativeLabel}`;
    option.selected = language.code === state.language;
    languageSelect.append(option);
  }
  languageSelect.addEventListener("change", async () => {
    state.language = languageSelect.value as LanguageCode;
    state.hasLanguagePreset = true;
    if (resetTag) {
      state.tag = "all";
    }
    state.offset = 0;
    await setStoredString(LANGUAGE_KEY, state.language);

    if (!state.rotationSeed) {
      state.rotationSeed = createRotationSeed();
      await setStoredString(DAILY_ROTATION_SEED_KEY, state.rotationSeed);
    }

    rerender();
  });
  languageField.append(languageSelect);
  return languageField;
}

function rerender() {
  const languageEntries = entriesByLanguage.get(state.language) ?? [];
  const tags = getAvailableTagsFromEntries(languageEntries);
  const filteredEntries = filterExpressionsInEntries(languageEntries, {
    language: state.language,
    query: state.query,
    tag: state.tag === "all" ? undefined : state.tag,
    contentTypes: state.contentTypes
  });
  const savedEntries = getExpressionsByIdsFromEntries(allEntries, state.savedIds);
  const dailyExpression =
    filteredEntries.length > 0
      ? getDailyExpressionAtOffsetFromEntries(
          filteredEntries,
          state.language,
          state.offset,
          new Date(),
          state.hasLanguagePreset ? state.rotationSeed ?? undefined : undefined
        )
      : null;

  root.innerHTML = "";

  if (state.view === "daily") {
    const page = document.createElement("main");
    page.className = "page app-page";

    const topBar = document.createElement("section");
    topBar.className = "app-topbar";
    topBar.innerHTML = `
      <div class="app-hero-copy">
        <h1>ExpressMyself</h1>
        <p class="app-lead">Learn common expressions, idioms, and everyday phrases with quick, useful context.</p>
      </div>
    `;

    const controls = document.createElement("div");
    controls.className = "app-controls";

    const languageDock = document.createElement("div");
    languageDock.className = "app-language-dock";
    languageDock.append(createLanguageSelect());

    const toggles = document.createElement("div");
    toggles.className = "toggle-row";
    for (const contentType of expressionContentTypes) {
      const label = document.createElement("label");
      label.className = "toggle-chip";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state.contentTypes.includes(contentType);
      checkbox.addEventListener("change", () => {
        toggleContentType(contentType);
        state.offset = 0;
        rerender();
      });
      const text = document.createElement("span");
      text.className = "toggle-label";
      text.textContent = getExpressionContentTypeLabel(contentType);
      label.append(checkbox, text);
      toggles.append(label);
    }
    languageDock.append(toggles);

    const count = document.createElement("span");
    count.className = "app-language-count";
    count.textContent = `${filteredEntries.length} phrases`;
    languageDock.append(count);

    const actionRow = document.createElement("div");
    actionRow.className = "app-action-row";
    actionRow.append(
      createViewLink("Saved", "saved", "link-button link-button-secondary"),
      createViewLink("Browse library", "library", "link-button link-button-primary")
    );

    controls.append(languageDock, actionRow);
    topBar.append(controls);
    page.append(topBar);

    const widgetShell = document.createElement("section");
    widgetShell.className = "app-widget-shell";
    if (dailyExpression) {
      widgetShell.append(
        renderExpressionCard({
          expression: dailyExpression,
          saved: state.savedIds.includes(dailyExpression.id),
          onToggleSaved: (id) => {
            void toggleSaved(id).then(rerender);
          },
          onSpeak: (entry: ExpressionEntry) => speakExpression(entry.expression, entry.language),
          onNext: () => {
            state.offset += 1;
            rerender();
          }
        })
      );
    } else {
      widgetShell.append(createEmptyState("No expressions in this selection yet."));
    }
    page.append(widgetShell);

    const bottomGrid = document.createElement("section");
    bottomGrid.className = "app-bottom-grid";
    bottomGrid.innerHTML = `
      <article class="app-info-card">
        <h3>What you learn</h3>
        <p>Each entry gives you the expression, its real meaning, a literal translation when it helps, and an example that sounds natural.</p>
      </article>
      <article class="app-info-card">
        <h3>Curated library</h3>
        <p>Browse idioms, common expressions, and everyday phrases without adding account or app clutter.</p>
      </article>
    `;
    page.append(bottomGrid);
    root.append(page);
  }

  if (state.view === "library") {
    const page = document.createElement("main");
    page.className = "page app-page";
    page.innerHTML = `
      <header class="app-header">
        <div>
          <p class="eyebrow">Library</p>
          <h1>Browse practical expressions.</h1>
          <p>Search the curated phrase set by language, topic, or expression text.</p>
        </div>
      </header>
    `;

    const header = page.querySelector(".app-header");
    const links = document.createElement("div");
    links.className = "app-links";
    links.append(
      createViewLink("Saved phrases", "saved", "app-text-link"),
      createViewLink("Back home", "daily", "app-text-link")
    );
    header?.append(links);

    const toolbar = document.createElement("section");
    toolbar.className = "app-toolbar";
    toolbar.append(createLanguageSelect(true));

    const queryField = document.createElement("label");
    queryField.className = "field";
    queryField.innerHTML = "<span>Search</span>";
    const queryInput = document.createElement("input");
    queryInput.placeholder = "Try “break a leg” or “daily-life”";
    queryInput.value = state.query;
    queryInput.addEventListener("input", () => {
      state.query = queryInput.value;
      state.offset = 0;
      rerender();
    });
    queryField.append(queryInput);

    const tagField = document.createElement("label");
    tagField.className = "field";
    tagField.innerHTML = "<span>Topic</span>";
    const tagSelect = document.createElement("select");
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All topics";
    tagSelect.append(allOption);
    for (const tag of tags) {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = getTopicTagLabel(tag);
      option.selected = tag === state.tag;
      tagSelect.append(option);
    }
    tagSelect.value = state.tag;
    tagSelect.addEventListener("change", () => {
      state.tag = tagSelect.value;
      state.offset = 0;
      rerender();
    });
    tagField.append(tagSelect);

    toolbar.append(queryField, tagField);

    const toggles = document.createElement("div");
    toggles.className = "toggle-row";
    for (const contentType of expressionContentTypes) {
      const label = document.createElement("label");
      label.className = "toggle-chip";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state.contentTypes.includes(contentType);
      checkbox.addEventListener("change", () => {
        toggleContentType(contentType);
        state.offset = 0;
        rerender();
      });
      const text = document.createElement("span");
      text.className = "toggle-label";
      text.textContent = getExpressionContentTypeLabel(contentType);
      label.append(checkbox, text);
      toggles.append(label);
    }
    toolbar.append(toggles);
    page.append(toolbar);

    const summary = document.createElement("section");
    summary.className = "app-summary";
    summary.innerHTML = `<p>Showing ${filteredEntries.length} of ${languageEntries.length} expressions.</p>`;
    page.append(summary);

    if (filteredEntries.length > 0) {
      const grid = document.createElement("div");
      grid.className = "grid";
      for (const entry of filteredEntries) {
        grid.append(
          renderExpressionCard({
            expression: entry,
            saved: state.savedIds.includes(entry.id),
            onToggleSaved: (id) => {
              void toggleSaved(id).then(rerender);
            },
            onSpeak: (item: ExpressionEntry) => speakExpression(item.expression, item.language)
          })
        );
      }
      page.append(grid);
    } else {
      page.append(createEmptyState("No matches yet. Try a broader query or switch back to all topics."));
    }
    root.append(page);
  }

  if (state.view === "saved") {
    const page = document.createElement("main");
    page.className = "page app-page";
    page.innerHTML = `
      <header class="app-header">
        <div>
          <p class="eyebrow">Saved</p>
          <h1>Your phrase shelf.</h1>
          <p>Keep the idioms and expressions you want to come back to without needing an account.</p>
        </div>
      </header>
    `;
    const header = page.querySelector(".app-header");
    const links = document.createElement("div");
    links.className = "app-links";
    links.append(
      createViewLink("Browse library", "library", "app-text-link"),
      createViewLink("Back home", "daily", "app-text-link")
    );
    header?.append(links);

    if (savedEntries.length > 0) {
      const summary = document.createElement("section");
      summary.className = "app-summary";
      summary.innerHTML = `<p>You have saved ${savedEntries.length} ${savedEntries.length === 1 ? "expression" : "expressions"}.</p>`;
      page.append(summary);
      const grid = document.createElement("div");
      grid.className = "grid";
      for (const entry of savedEntries) {
        grid.append(
          renderExpressionCard({
            expression: entry,
            saved: true,
            onToggleSaved: (id) => {
              void toggleSaved(id).then(rerender);
            },
            onSpeak: (item: ExpressionEntry) => speakExpression(item.expression, item.language)
          })
        );
      }
      page.append(grid);
    } else {
      const empty = createEmptyState("No saved phrases yet. Save expressions from the daily card or the library.");
      const browseButton = createViewLink("Start browsing", "library", "link-button link-button-primary");
      empty.append(browseButton);
      page.append(empty);
    }
    root.append(page);
  }
}

function createEmptyState(message: string) {
  const empty = document.createElement("div");
  empty.className = "empty";
  empty.textContent = message;
  return empty;
}

async function initialize() {
  const overrides = readAppOverrides();
  const storedLanguage = await getStoredString(LANGUAGE_KEY);
  const storedRotationSeed = await getStoredString(DAILY_ROTATION_SEED_KEY);
  if (overrides.language) {
    state.language = overrides.language;
  } else if (storedLanguage && languages.some((language) => language.code === storedLanguage)) {
    state.language = storedLanguage as LanguageCode;
    state.hasLanguagePreset = true;
  }

  state.savedIds = overrides.savedIds ?? (await getStoredStringArray(SAVED_IDS_KEY));
  state.query = overrides.query ?? "";
  state.tag = overrides.tag ?? "all";
  state.view = overrides.view ?? "daily";
  state.offset = overrides.offset ?? 0;
  state.contentTypes = overrides.contentTypes ?? [...expressionContentTypes];
  state.rotationSeed = storedRotationSeed;
  rerender();
}

watchStoredKey(SAVED_IDS_KEY, async () => {
  state.savedIds = await getStoredStringArray(SAVED_IDS_KEY);
  rerender();
});

void initialize();
