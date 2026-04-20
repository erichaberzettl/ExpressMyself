"use client";

import Link from "next/link";
import { languagesByCode } from "@/lib/languages";
import { ExpressionEntry, LanguageCode } from "@/lib/types";
import { SaveExpressionButton } from "@/components/save-expression-button";
import styles from "./expression-card.module.css";

type ExpressionCardProps = {
  expression: ExpressionEntry;
  compact?: boolean;
  showSaveButton?: boolean;
  onNextExpression?: () => void;
};

const voiceConfigByLanguage: Record<
  LanguageCode,
  {
    lang: string;
    family: string;
    preferredVoiceNames: string[];
  }
> = {
  en: {
    lang: "en-US",
    family: "en",
    preferredVoiceNames: [
      "Samantha",
      "Ava",
      "Allison",
      "Karen",
      "Moira",
      "Serena",
      "Google US English"
    ]
  },
  es: {
    lang: "es-ES",
    family: "es",
    preferredVoiceNames: ["Monica", "Paulina", "Jorge", "Google español", "Google español de España"]
  },
  de: {
    lang: "de-DE",
    family: "de",
    preferredVoiceNames: ["Anna", "Petra", "Vicki", "Google Deutsch", "Google Deutsch (Deutschland)"]
  }
};

function selectVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  language: LanguageCode
): SpeechSynthesisVoice | null {
  const config = voiceConfigByLanguage[language];
  const matchingVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(config.family.toLowerCase())
  );

  if (matchingVoices.length === 0) {
    return null;
  }

  const preferredVoice = config.preferredVoiceNames
    .map((name) => matchingVoices.find((voice) => voice.name === name))
    .find(Boolean);

  if (preferredVoice) {
    return preferredVoice;
  }

  return (
    matchingVoices.find((voice) => voice.default) ??
    matchingVoices.find((voice) => voice.localService) ??
    matchingVoices[0]
  );
}

export function ExpressionCard({
  expression,
  compact = false,
  showSaveButton = false,
  onNextExpression
}: ExpressionCardProps) {
  const language = languagesByCode[expression.language];

  const speakExpression = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const config = voiceConfigByLanguage[expression.language];
    const speakWithVoice = () => {
      const utterance = new SpeechSynthesisUtterance(expression.expression);
      utterance.lang = config.lang;
      utterance.rate = 0.84;
      utterance.pitch = 1;

      const selectedVoice = selectVoiceForLanguage(
        window.speechSynthesis.getVoices(),
        expression.language
      );

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      speakWithVoice();
      return;
    }

    const synth = window.speechSynthesis;
    const handleVoicesChanged = () => {
      synth.removeEventListener?.("voiceschanged", handleVoicesChanged);
      speakWithVoice();
    };

    synth.addEventListener?.("voiceschanged", handleVoicesChanged, { once: true });

    window.setTimeout(() => {
      synth.removeEventListener?.("voiceschanged", handleVoicesChanged);
      speakWithVoice();
    }, 250);
  };

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
        <dt>Example</dt>
        <dd>
          {expression.exampleSentence}
          <span className={styles.translation}>{expression.exampleTranslation}</span>
        </dd>
      </dl>
      <div className={styles.footer}>
        <div className={styles.tags}>
          {expression.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <Link className={styles.detailsLink} href={`/expression/${expression.id}`}>
          Details
        </Link>
      </div>
    </article>
  );
}
