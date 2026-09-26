import { languagesByCode } from "../../lib/languages";
import { getTopicTagLabel, normalizeEntryTags } from "../../lib/topic-tags";
import { ExpressionEntry } from "../../lib/types";

function createButton(
  label: string,
  className: string,
  onClick: () => void,
  title?: string
) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  if (title) {
    button.title = title;
    button.setAttribute("aria-label", title);
  }
  button.addEventListener("click", onClick);
  return button;
}

export function renderExpressionCard(options: {
  expression: ExpressionEntry;
  compact?: boolean;
  showTags?: boolean;
  saved: boolean;
  revealed?: boolean;
  onToggleSaved: (id: string) => void;
  onSpeak: (expression: ExpressionEntry) => void;
  onReveal?: () => void;
  onCopy?: (expression: ExpressionEntry) => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const {
    expression,
    compact = false,
    showTags = true,
    saved,
    revealed = true,
    onToggleSaved,
    onSpeak,
    onReveal,
    onCopy,
    onPrev,
    onNext
  } = options;
  const card = document.createElement("article");
  card.className = `card${compact ? " popup-card" : ""}`;

  const language = languagesByCode[expression.language];

  const top = document.createElement("div");
  top.className = "card-top";

  const meta = document.createElement("div");
  meta.className = "stack";
  const metaLabel = document.createElement("span");
  metaLabel.className = "eyebrow";
  metaLabel.textContent = language.nativeLabel;
  meta.append(metaLabel);

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(
    createButton("🔊", "button button-secondary", () => onSpeak(expression), "Listen")
  );

  if (onCopy) {
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "button button-secondary";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", () => {
      onCopy(expression);
      copyButton.textContent = "Copied";
      window.setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 1200);
    });
    actions.append(copyButton);
  }

  actions.append(
    createButton(saved ? "Saved" : "Save", "button button-secondary", () =>
      onToggleSaved(expression.id)
    )
  );

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

  card.append(top, title);

  // Self-test: keep the meaning hidden until the reader chooses to reveal it,
  // so each phrase is a quick recall check rather than a passive read.
  if (onReveal && !revealed) {
    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.className = "reveal-zone";
    reveal.setAttribute("aria-expanded", "false");
    const prompt = document.createElement("span");
    prompt.className = "reveal-prompt";
    prompt.textContent = "Tap to reveal meaning";
    reveal.append(prompt);
    reveal.addEventListener("click", onReveal);
    card.append(reveal);
  } else {
    card.append(meaning, detailGrid);
  }

  if (onPrev || onNext) {
    const nav = document.createElement("div");
    nav.className = "button-row popup-nav";
    if (onPrev) {
      nav.append(createButton("‹ Prev", "button button-secondary", onPrev, "Previous expression"));
    }
    if (onNext) {
      nav.append(createButton("Next ›", "button button-primary", onNext, "Next expression"));
    }
    card.append(nav);
  }

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
