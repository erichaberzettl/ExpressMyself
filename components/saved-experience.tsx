"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ExpressionCard } from "@/components/expression-card";
import { fetchExpressionsByIds } from "@/lib/client-expression-api";
import { filterExpressionsInEntries } from "@/lib/expressions";
import { ExpressionEntry } from "@/lib/types";
import { usePersistedContentTypes } from "@/lib/use-persisted-content-types";
import { usePersistedLanguage } from "@/lib/use-persisted-language";
import { useSavedExpressions } from "@/lib/use-saved-expressions";
import styles from "./saved-experience.module.css";

type SavedExperienceProps = {
  loadExpressionsByIds?: (ids: string[]) => Promise<ExpressionEntry[]>;
};

export function SavedExperience({ loadExpressionsByIds = fetchExpressionsByIds }: SavedExperienceProps) {
  const [language, setLanguage] = usePersistedLanguage("en");
  const [selectedContentTypes, toggleContentType] = usePersistedContentTypes();
  const { savedIds } = useSavedExpressions();
  const [savedExpressions, setSavedExpressions] = useState<ExpressionEntry[]>([]);

  useEffect(() => {
    if (savedIds.length === 0) {
      setSavedExpressions([]);
      return;
    }

    let cancelled = false;

    loadExpressionsByIds(savedIds)
      .then((entries) => {
        if (!cancelled) {
          setSavedExpressions(entries);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSavedExpressions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [savedIds, loadExpressionsByIds]);

  const filteredSavedExpressions = useMemo(
    () =>
      filterExpressionsInEntries(savedExpressions, {
        language,
        contentTypes: selectedContentTypes
      }),
    [language, savedExpressions, selectedContentTypes]
  );

  return (
    <main className={styles.page}>
      <AppHeader
        language={language}
        onLanguageChange={setLanguage}
        selectedContentTypes={selectedContentTypes}
        onToggleContentType={toggleContentType}
        phraseCount={filteredSavedExpressions.length}
      />

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Saved</p>
          <h1>Your phrase shelf.</h1>
          <p>Keep the idioms and expressions you want to come back to without needing an account.</p>
        </div>
      </header>

      {savedExpressions.length > 0 && filteredSavedExpressions.length > 0 ? (
        <>
          <section className={styles.summary}>
            <p>
              Showing {filteredSavedExpressions.length} saved{" "}
              {filteredSavedExpressions.length === 1 ? "expression" : "expressions"} from your{" "}
              {savedExpressions.length}-item shelf.
            </p>
          </section>

          <section className={styles.grid}>
            {filteredSavedExpressions.map((expression) => (
              <ExpressionCard key={expression.id} expression={expression} listPreview />
            ))}
          </section>
        </>
      ) : savedExpressions.length > 0 ? (
        <section className={styles.emptyState}>
          <h2>No saved phrases in this view</h2>
          <p>Try another language or turn more categories back on to see your saved shelf again.</p>
        </section>
      ) : (
        <section className={styles.emptyState}>
          <h2>No saved phrases yet</h2>
          <p>
            Save expressions from the home card or library to build your own compact review list.
          </p>
          <Link href="/library">Start browsing</Link>
        </section>
      )}
    </main>
  );
}
