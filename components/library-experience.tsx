"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ExpressionCard } from "@/components/expression-card";
import { fetchExpressionsForLanguage } from "@/lib/client-expression-api";
import { filterExpressionsInEntries, getAvailableTagsFromEntries } from "@/lib/expressions";
import { getLibraryExportFormats } from "@/lib/library-export";
import { getTopicTagLabel } from "@/lib/topic-tags";
import { ExpressionEntry, LanguageCode } from "@/lib/types";
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
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");
  const [entries, setEntries] = useState(initialExpressions);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const hasSkippedInitialLoad = useRef(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const paymentLinkUrl = process.env.NEXT_PUBLIC_LIBRARY_DOWNLOAD_PURCHASE_URL ?? "";

  useEffect(() => {
    if (!isDownloadMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!downloadMenuRef.current?.contains(event.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDownloadMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDownloadMenuOpen]);

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
        tag: tag === "all" ? undefined : tag
      }),
    [entries, language, query, tag]
  );

  return (
    <main className={styles.page}>
      <AppHeader
        language={language}
        onLanguageChange={(nextLanguage) => {
          setLanguage(nextLanguage);
          setTag("all");
        }}
        phraseCount={filtered.length}
      />

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Library</p>
          <h1>Browse practical expressions.</h1>
          <p>Search the curated phrase set by language, topic, or expression text.</p>
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

        <div className={styles.downloadField} ref={downloadMenuRef}>
          <span>Download</span>
          <button
            aria-expanded={isDownloadMenuOpen}
            aria-haspopup="menu"
            className={styles.downloadButton}
            onClick={() => setIsDownloadMenuOpen((current) => !current)}
            type="button"
          >
            Full library download
            <span className={styles.lockBadge} aria-hidden="true">
              Locked
            </span>
          </button>

          {isDownloadMenuOpen ? (
            <div className={styles.downloadMenu} role="menu" aria-label="Locked library download">
              <p className={styles.downloadMenuNote}>
                The full database export stays behind the upgrade wall.
              </p>
              <div className={styles.downloadFormatList}>
                {getLibraryExportFormats().map((format) => (
                  <button key={format} className={styles.downloadMenuItem} disabled type="button">
                    {format === "markdown" ? "Markdown (.md)" : format.toUpperCase()}
                    <span>Locked</span>
                  </button>
                ))}
              </div>
              {paymentLinkUrl ? (
                <a
                  className={styles.unlockButton}
                  href={paymentLinkUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Unlock with Stripe Payment Links
                </a>
              ) : (
                <p className={styles.downloadMenuHint}>
                  Set <code>NEXT_PUBLIC_LIBRARY_DOWNLOAD_PURCHASE_URL</code> to connect a Stripe
                  Payment Link.
                </p>
              )}
            </div>
          ) : null}
        </div>

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
          <p>Try a different search or switch languages.</p>
        </section>
      )}
    </main>
  );
}
