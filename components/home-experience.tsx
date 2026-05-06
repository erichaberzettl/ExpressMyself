"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ExpressionCard } from "@/components/expression-card";
import { fetchExpressionsForLanguage } from "@/lib/client-expression-api";
import { filterExpressionsInEntries, getDailyExpressionAtOffsetFromEntries } from "@/lib/expressions";
import { ExpressionEntry, LanguageCode } from "@/lib/types";
import { usePersistedContentTypes } from "@/lib/use-persisted-content-types";
import { useDailyRotationSeed, usePersistedLanguage } from "@/lib/use-persisted-language";
import styles from "./home-experience.module.css";

type HomeExperienceProps = {
  initialExpressions: ExpressionEntry[];
  loadExpressions?: (language: LanguageCode) => Promise<ExpressionEntry[]>;
};

export function HomeExperience({
  initialExpressions,
  loadExpressions = fetchExpressionsForLanguage
}: HomeExperienceProps) {
  const [language, setLanguage, hasPersistedLanguage] = usePersistedLanguage("en");
  const [selectedContentTypes, toggleContentType] = usePersistedContentTypes();
  const dailyRotationSeed = useDailyRotationSeed(hasPersistedLanguage);
  const [today] = useState(() => new Date());
  const [offset, setOffset] = useState(0);
  const [languageExpressions, setLanguageExpressions] = useState(initialExpressions);
  const hasSkippedInitialLoad = useRef(false);

  useEffect(() => {
    setOffset(0);
  }, [language, selectedContentTypes]);

  useEffect(() => {
    if (!hasSkippedInitialLoad.current && language === "en") {
      hasSkippedInitialLoad.current = true;
      return;
    }

    let cancelled = false;

    loadExpressions(language)
      .then((entries) => {
        if (!cancelled) {
          setLanguageExpressions(entries);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLanguageExpressions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [language, loadExpressions]);

  const filteredExpressions = useMemo(
    () =>
      filterExpressionsInEntries(languageExpressions, {
        language,
        contentTypes: selectedContentTypes
      }),
    [language, languageExpressions, selectedContentTypes]
  );

  const dailyExpression = useMemo(
    () =>
      filteredExpressions.length > 0
        ? getDailyExpressionAtOffsetFromEntries(
            filteredExpressions,
            language,
            offset,
            today,
            hasPersistedLanguage ? dailyRotationSeed ?? undefined : undefined
          )
        : null,
    [dailyRotationSeed, filteredExpressions, hasPersistedLanguage, language, offset, today]
  );

  return (
    <main className={styles.page}>
      <AppHeader
        language={language}
        onLanguageChange={setLanguage}
        selectedContentTypes={selectedContentTypes}
        onToggleContentType={toggleContentType}
        phraseCount={filteredExpressions.length}
      />

      <section className={styles.heroCopy}>
        <p className={styles.eyebrow}>Daily phrase</p>
        <h1>A clean home for practical language.</h1>
        <p className={styles.lead}>
          Learn common expressions, idioms, and everyday phrases with quick context you can save
          and revisit.
        </p>
      </section>

      <section className={styles.widgetShell}>
        {dailyExpression ? (
          <ExpressionCard
            expression={dailyExpression}
            showSaveButton
            onNextExpression={() => setOffset((current) => current + 1)}
          />
        ) : (
          <article className={styles.emptyCard}>
            <h3>No expressions in this selection</h3>
            <p>Turn one of the categories back on to keep browsing this language.</p>
          </article>
        )}
      </section>

      <section className={styles.bottomGrid}>
        <article className={styles.infoCard}>
          <h3>What you learn</h3>
          <p>
            Each entry gives you the expression, its real meaning, a literal translation when it
            helps, and an example that sounds natural.
          </p>
        </article>

        <article className={styles.infoCard}>
          <h3>Curated library</h3>
          <p>
            Browse idioms, common expressions, and everyday phrases without adding account or app
            clutter.
          </p>
        </article>
      </section>
    </main>
  );
}
