import { languagesByCode } from "../../lib/languages";
import { getTopicTagLabel, normalizeEntryTags } from "../../lib/topic-tags";
import { ExpressionEntry } from "../../lib/types";

function createButton(label: string, className: string, onClick: () => void) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

export function renderExpressionCard(options: {
  expression: ExpressionEntry;
  compact?: boolean;
  showTags?: boolean;
  saved: boolean;
  onToggleSaved: (id: string) => void;
  onSpeak: (expression: ExpressionEntry) => void;
  onNext?: () => void;
}) {
  const {
    expression,
    compact = false,
    showTags = true,
    saved,
    onToggleSaved,
    onSpeak,
    onNext
  } = options;
  const card = document.createElement("article");
  card.className = `card${compact ? " popup-card" : ""}`;

  const language = languagesByCode[expression.language];

  const top = document.createElement("div");
  top.className = "card-top";

  const meta = document.createElement("div");
  meta.className = "stack";
  meta.innerHTML = `<span class="eyebrow">${language.nativeLabel}</span>`;

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(
    createButton("🔊", "button button-secondary", () => onSpeak(expression)),
    createButton(saved ? "Saved" : "Save", "button button-secondary", () =>
      onToggleSaved(expression.id)
    )
  );

  if (onNext) {
    actions.append(createButton("Next", "button button-primary", onNext));
  }

  top.append(meta, actions);

  const title = document.createElement("h3");
  title.textContent = expression.expression;

  const meaning = document.createElement("p");
  meaning.className = "meaning";
  meaning.textContent = expression.meaning;

  if (compact) {
    card.append(top, title, meaning);
    return card;
  }

  const detailGrid = document.createElement("div");
  detailGrid.className = "detail-grid";

  if (expression.literalTranslation) {
    detailGrid.append(createDetailRow("Literal", expression.literalTranslation, true));
  }

  detailGrid.append(createDetailRow("Use it when", expression.usageNote));

  if (expression.exampleSentence.trim()) {
    const example = expression.exampleTranslation.trim()
      ? `${expression.exampleSentence}\n${expression.exampleTranslation}`
      : expression.exampleSentence;
    detailGrid.append(createDetailRow("Example", example, true));
  }

  card.append(top, title, meaning, detailGrid);

  if (showTags) {
    const tagRow = document.createElement("div");
    tagRow.className = "tag-row";
    normalizeEntryTags(expression).forEach((tag) => {
      const element = document.createElement("span");
      element.className = "tag";
      element.textContent = getTopicTagLabel(tag);
      tagRow.append(element);
    });
    card.append(tagRow);
  }

  return card;
}

function createDetailRow(label: string, value: string, secondary = false) {
  const row = document.createElement("div");
  row.className = "detail-row";

  const title = document.createElement("div");
  title.className = "detail-label";
  title.textContent = label;

  const content = document.createElement("div");
  content.className = `detail-value${secondary ? " secondary" : ""}`;
  content.textContent = value;
  content.style.whiteSpace = "pre-line";

  row.append(title, content);
  return row;
}
