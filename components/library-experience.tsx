"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ExpressionCard } from "@/components/expression-card";
import { fetchExpressionsForLanguage } from "@/lib/client-expression-api";
import { filterExpressionsInEntries, getAvailableTagsFromEntries } from "@/lib/expressions";
import { getTopicTagLabel } from "@/lib/topic-tags";
import { ExpressionEntry, LanguageCode } from "@/lib/types";
import { usePersistedContentTypes } from "@/lib/use-persisted-content-types";
import { usePersistedLanguage } from "@/lib/use-persisted-language";
import styles from "./library-experience.module.css";

type LibraryExperienceProps = {
  initialExpressions: ExpressionEntry[];
  loadExpressions?: (language: LanguageCode) => Promise<ExpressionEntry[]>;
};

export function LibraryExperience({
  initialExpressions,
  loadExpressions = fetchExpressionsForLanguage
}: LibraryExperienceProps) {
  const [language, setLanguage] = usePersistedLanguage("en");
  const [selectedContentTypes, toggleContentType] = usePersistedContentTypes();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");
  const [entries, setEntries] = useState(initialExpressions);
  const hasSkippedInitialLoad = useRef(false);

  useEffect(() => {
    if (!hasSkippedInitialLoad.current && language === "en") {
      hasSkippedInitialLoad.current = true;
      return;
    }

    let cancelled = false;

    loadExpressions(language)
      .then((nextEntries) => {
        if (!cancelled) {
          setEntries(nextEntries);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEntries([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [language, loadExpressions]);

  const tags = useMemo(() => getAvailableTagsFromEntries(entries), [entries]);
  const filtered = useMemo(
    () =>
      filterExpressionsInEntries(entries, {
        language,
        query,
        tag: tag === "all" ? undefined : tag,
        contentTypes: selectedContentTypes
      }),
    [entries, language, query, selectedContentTypes, tag]
  );

  return (
    <main className={styles.page}>
      <AppHeader
        language={language}
        onLanguageChange={(nextLanguage) => {
          setLanguage(nextLanguage);
          setTag("all");
        }}
        selectedContentTypes={selectedContentTypes}
        onToggleContentType={toggleContentType}
        phraseCount={filtered.length}
      />

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Library</p>
          <h1>Browse practical expressions.</h1>
          <p>
            Search the curated phrase set by language, topic, or expression text.
          </p>
        </div>
      </header>

      <section className={styles.toolbar}>
        <label className={styles.searchField}>
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “break a leg” or “daily-life”"
          />
        </label>

        <label className={styles.searchField}>
          <span>Topic</span>
          <select value={tag} onChange={(event) => setTag(event.target.value)}>
            <option value="all">All topics</option>
            {tags.map((item) => (
              <option key={item} value={item}>
                {getTopicTagLabel(item)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className={styles.summary}>
        <p>
          Showing {filtered.length} of {entries.length} expressions.
        </p>
      </section>

      {filtered.length > 0 ? (
        <section className={styles.grid}>
          {filtered.map((expression) => (
            <ExpressionCard key={expression.id} expression={expression} listPreview />
          ))}
        </section>
      ) : (
        <section className={styles.emptyState}>
          <h2>No matches yet</h2>
          <p>Try a different search or switch back to all topics.</p>
        </section>
      )}
    </main>
  );
}
