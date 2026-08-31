"use client";

import Link from "next/link";
import { languagesByCode } from "@/lib/languages";
import { ExpressionEntry } from "@/lib/types";
import { getTopicTagLabel, normalizeEntryTags } from "@/lib/topic-tags";
import { speakExpression as speakExpressionText } from "@/lib/speech";
import { SaveExpressionButton } from "@/components/save-expression-button";
import styles from "./expression-card.module.css";

type ExpressionCardProps = {
  expression: ExpressionEntry;
  compact?: boolean;
  listPreview?: boolean;
  showSaveButton?: boolean;
  onNextExpression?: () => void;
};

export function ExpressionCard({
  expression,
  compact = false,
  listPreview = false,
  showSaveButton = false,
  onNextExpression
}: ExpressionCardProps) {
  const language = languagesByCode[expression.language];
  const visibleTags = normalizeEntryTags(expression);
  const hasExample = expression.exampleSentence.trim().length > 0;
  const hasExampleTranslation = expression.exampleTranslation.trim().length > 0;

  const speakExpression = () => speakExpressionText(expression.expression, expression.language);

  if (listPreview) {
    return (
      <article className={`${styles.card} ${styles.listPreview}`}>
        <div className={styles.previewMeta}>
          <span className={styles.previewLanguage}>{language.label}</span>
        </div>
        <h2>{expression.expression}</h2>
        <p className={styles.previewTranslation}>
          {expression.literalTranslation ?? expression.meaning}
        </p>
        <div className={styles.footer}>
          <span className={styles.previewSpacer} />
          <Link className={styles.detailsLink} href={`/expression/${expression.id}`}>
            Details
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className={`${styles.card} ${compact ? styles.compact : ""}`}>
      <div className={styles.head}>
        <div className={styles.meta}>
          <span>{language.label}</span>
          <span>{expression.difficulty}</span>
        </div>
        <div className={styles.actions}>
          <button
            aria-label={`Listen to ${expression.expression}`}
            className={styles.audioButton}
            onClick={speakExpression}
            type="button"
          >
            🔊
          </button>
          {onNextExpression ? (
            <button className={styles.nextButton} onClick={onNextExpression} type="button">
              Next
            </button>
          ) : null}
          {showSaveButton ? <SaveExpressionButton compact expressionId={expression.id} /> : null}
        </div>
      </div>
      <h2>{expression.expression}</h2>
      <p className={styles.meaning}>{expression.meaning}</p>
      <dl className={styles.details}>
        {expression.literalTranslation ? (
          <>
            <dt>Literal</dt>
            <dd>{expression.literalTranslation}</dd>
          </>
        ) : null}
        <dt>Use it when</dt>
        <dd>{expression.usageNote}</dd>
        {hasExample ? (
          <>
            <dt>Example</dt>
            <dd>
              {expression.exampleSentence}
              {hasExampleTranslation ? (
                <span className={styles.translation}>{expression.exampleTranslation}</span>
              ) : null}
            </dd>
          </>
        ) : null}
      </dl>
      <div className={styles.footer}>
        <div className={styles.tags}>
          {visibleTags.map((tag) => (
            <span key={tag}>{getTopicTagLabel(tag)}</span>
          ))}
        </div>
        <Link className={styles.detailsLink} href={`/expression/${expression.id}`}>
          Details
        </Link>
      </div>
    </article>
  );
}
