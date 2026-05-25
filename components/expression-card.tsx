"use client";

import Link from "next/link";
import { languagesByCode } from "@/lib/languages";
import { ExpressionEntry, LanguageCode } from "@/lib/types";
import { getTopicTagLabel, normalizeEntryTags } from "@/lib/topic-tags";
import { SaveExpressionButton } from "@/components/save-expression-button";
import styles from "./expression-card.module.css";

type ExpressionCardProps = {
  expression: ExpressionEntry;
  compact?: boolean;
  listPreview?: boolean;
  showSaveButton?: boolean;
  onNextExpression?: () => void;
};

const voiceConfigByLanguage: Record<
  LanguageCode,
  {
    lang: string;
    families: string[];
    preferredVoiceNames: string[];
  }
> = {
  en: {
    lang: "en-US",
    families: ["en"],
    preferredVoiceNames: [
      "Alex",
      "Google US English",
      "Google UK English Male",
      "Google UK English Female",
      "Daniel",
      "Microsoft Mark - English (United States)",
      "Microsoft David - English (United States)",
      "Microsoft Zira - English (United States)",
      "Ava",
      "Samantha"
    ]
  },
  es: {
    lang: "es-ES",
    families: ["es"],
    preferredVoiceNames: ["Monica", "Paulina", "Jorge", "Google español", "Google español de España"]
  },
  fr: {
    lang: "fr-FR",
    families: ["fr"],
    preferredVoiceNames: ["Thomas", "Amelie", "Google français"]
  },
  de: {
    lang: "de-DE",
    families: ["de"],
    preferredVoiceNames: ["Anna", "Petra", "Vicki", "Google Deutsch", "Google Deutsch (Deutschland)"]
  },
  pt: {
    lang: "pt-PT",
    families: ["pt"],
    preferredVoiceNames: ["Joana", "Luciana", "Google português"]
  },
  it: {
    lang: "it-IT",
    families: ["it"],
    preferredVoiceNames: ["Alice", "Luca", "Google italiano"]
  },
  nl: {
    lang: "nl-NL",
    families: ["nl"],
    preferredVoiceNames: ["Xander", "Claire", "Google Nederlands"]
  },
  sv: {
    lang: "sv-SE",
    families: ["sv"],
    preferredVoiceNames: ["Alva", "Oskar", "Google svenska"]
  },
  da: {
    lang: "da-DK",
    families: ["da"],
    preferredVoiceNames: ["Sara", "Magnus", "Google dansk"]
  },
  pl: {
    lang: "pl-PL",
    families: ["pl"],
    preferredVoiceNames: ["Zosia", "Krzysztof", "Google polski"]
  }
};

function selectVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  language: LanguageCode
): SpeechSynthesisVoice | null {
  const config = voiceConfigByLanguage[language];
  const matchingVoices = voices.filter((voice) => {
    const voiceLang = voice.lang.toLowerCase();
    return config.families.some((family) => voiceLang.startsWith(family.toLowerCase()));
  });

  if (matchingVoices.length === 0) {
    return null;
  }

  const preferredVoice = config.preferredVoiceNames
    .map((name) => matchingVoices.find((voice) => voice.name === name))
    .find(Boolean);

  if (preferredVoice) {
    return preferredVoice;
  }

  if (language === "en") {
    return null;
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
  listPreview = false,
  showSaveButton = false,
  onNextExpression
}: ExpressionCardProps) {
  const language = languagesByCode[expression.language];
  const visibleTags = normalizeEntryTags(expression);
  const hasExample = expression.exampleSentence.trim().length > 0;
  const hasExampleTranslation = expression.exampleTranslation.trim().length > 0;

  const speakExpression = () => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      return;
    }

    const config = voiceConfigByLanguage[expression.language];
    const speakWithVoice = (selectedVoice?: SpeechSynthesisVoice | null) => {
      const utterance = new SpeechSynthesisUtterance(expression.expression);
      utterance.lang = config.lang;
      utterance.rate = expression.language === "en" ? 1 : 0.84;
      utterance.pitch = 1;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      }

      const synth = window.speechSynthesis;
      synth.cancel();
      synth.resume?.();
      synth.speak(utterance);
    };

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const selectedVoice = selectVoiceForLanguage(voices, expression.language);

    // Speak immediately from the click event so embedded browsers do not treat it
    // as an async autoplay attempt if voices load late.
    speakWithVoice(selectedVoice);

    if (voices.length > 0 || selectedVoice) {
      return;
    }

    // Trigger voice enumeration for later clicks on browsers that populate lazily.
    synth.getVoices();
  };

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
