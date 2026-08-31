"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ExpressionCard } from "@/components/expression-card";
import { fetchExpressionsByIds } from "@/lib/client-expression-api";
import {
  getLibraryExportFormats,
  getSavedShelfExportFilename,
  serializeLibraryEntries,
  type LibraryExportFormat
} from "@/lib/library-export";
import { ExpressionEntry, LanguageCode } from "@/lib/types";
import { usePersistedLanguage } from "@/lib/use-persisted-language";
import { useSavedExpressions } from "@/lib/use-saved-expressions";
import styles from "./saved-experience.module.css";

type SavedExperienceProps = {
  initialLanguage?: LanguageCode;
  loadExpressionsByIds?: (ids: string[]) => Promise<ExpressionEntry[]>;
};

export function SavedExperience({
  initialLanguage = "en",
  loadExpressionsByIds = fetchExpressionsByIds
}: SavedExperienceProps) {
  const [language, setLanguage] = usePersistedLanguage(initialLanguage, {
    skipHydrationRead: initialLanguage !== "en"
  });
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const { savedIds } = useSavedExpressions();
  const [savedExpressions, setSavedExpressions] = useState<ExpressionEntry[]>([]);
  const exportMenuRootId = "saved-export-menu-root";

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

  useEffect(() => {
    if (!isExportMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const root = document.getElementById(exportMenuRootId);

      if (!root?.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExportMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExportMenuOpen]);

  const downloadExport = (format: LibraryExportFormat) => {
    const content = serializeLibraryEntries(
      savedExpressions.map((entry) => ({
        language: entry.language,
        expression: entry.expression,
        meaning: entry.meaning
      })),
      format
    );
    const blob = new Blob([content], {
      type:
        format === "csv"
          ? "text/csv;charset=utf-8"
          : format === "tsv"
            ? "text/tab-separated-values;charset=utf-8"
            : format === "markdown"
              ? "text/markdown;charset=utf-8"
              : "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getSavedShelfExportFilename(language, format);
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  return (
    <main className={styles.page}>
      <AppHeader
        language={language}
        onLanguageChange={setLanguage}
        phraseCount={savedExpressions.length}
        bannerActionId={exportMenuRootId}
        bannerActionLabel={savedExpressions.length > 0 ? "Export shelf" : undefined}
        bannerActionExpanded={isExportMenuOpen}
        bannerActionMenu={
          isExportMenuOpen ? (
            <div className={styles.exportMenu} role="menu" aria-label="Export saved format">
              {getLibraryExportFormats().map((format) => (
                <button
                  key={format}
                  className={styles.exportMenuItem}
                  onClick={() => downloadExport(format)}
                  role="menuitem"
                  type="button"
                >
                  {format === "markdown" ? "Markdown (.md)" : format.toUpperCase()}
                </button>
              ))}
            </div>
          ) : undefined
        }
        onBannerActionClick={() => setIsExportMenuOpen((current) => !current)}
      />

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Saved</p>
          <h1>Your phrase shelf.</h1>
          <p>Keep the expressions you want to come back to without needing an account.</p>
        </div>
      </header>

      {savedExpressions.length > 0 ? (
        <>
          <section className={styles.summary}>
            <p>
              {savedExpressions.length} saved{" "}
              {savedExpressions.length === 1 ? "expression" : "expressions"} on your shelf, across
              every language.
            </p>
          </section>

          <section className={styles.grid}>
            {savedExpressions.map((expression) => (
              <ExpressionCard key={expression.id} expression={expression} listPreview />
            ))}
          </section>
        </>
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
