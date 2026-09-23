"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { fetchExpressionsByIds } from "@/lib/client-expression-api";
import { languagesByCode } from "@/lib/languages";
import {
  ReviewGrade,
  getDueIds,
  gradeRecord,
  toDateKey
} from "@/lib/spaced-repetition";
import { ExpressionEntry, LanguageCode } from "@/lib/types";
import { usePersistedLanguage } from "@/lib/use-persisted-language";
import { useReviewState } from "@/lib/use-review-state";
import { useSavedExpressions } from "@/lib/use-saved-expressions";
import styles from "./practice-experience.module.css";

type PracticeExperienceProps = {
  initialLanguage?: LanguageCode;
  loadExpressionsByIds?: (ids: string[]) => Promise<ExpressionEntry[]>;
};

const GRADES: { grade: ReviewGrade; label: string; className: keyof typeof styles }[] = [
  { grade: "again", label: "Forgot", className: "gradeAgain" },
  { grade: "good", label: "Got it", className: "gradeGood" },
  { grade: "easy", label: "Easy", className: "gradeEasy" }
];

export function PracticeExperience({
  initialLanguage = "en",
  loadExpressionsByIds = fetchExpressionsByIds
}: PracticeExperienceProps) {
  const [language, setLanguage] = usePersistedLanguage(initialLanguage, {
    skipHydrationRead: initialLanguage !== "en"
  });
  const { savedIds, hasLoaded: savedLoaded } = useSavedExpressions();
  const { reviewState, hasLoaded, saveRecord } = useReviewState();
  const [today] = useState(() => toDateKey(new Date()));

  const [expressions, setExpressions] = useState<ExpressionEntry[] | null>(null);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [mode, setMode] = useState<"due" | "all">("due");
  const [revealed, setRevealed] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!savedLoaded) {
      return;
    }

    if (savedIds.length === 0) {
      setExpressions([]);
      return;
    }

    let cancelled = false;

    loadExpressionsByIds(savedIds)
      .then((entries) => {
        if (!cancelled) {
          setExpressions(entries);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExpressions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [savedLoaded, savedIds, loadExpressionsByIds]);

  const expressionsById = useMemo(() => {
    const map = new Map<string, ExpressionEntry>();
    for (const entry of expressions ?? []) {
      map.set(entry.id, entry);
    }
    return map;
  }, [expressions]);

  // Build the review queue once, after both the saved phrases and the review
  // history have loaded.
  useEffect(() => {
    if (queue !== null || !hasLoaded || expressions === null) {
      return;
    }

    const ids = expressions.map((entry) => entry.id);
    setQueue(getDueIds(ids, reviewState, today));
    setMode("due");
  }, [queue, hasLoaded, expressions, reviewState, today]);

  const grade = (nextGrade: ReviewGrade) => {
    if (!queue || queue.length === 0) {
      return;
    }

    const [currentId, ...rest] = queue;
    saveRecord(currentId, gradeRecord(reviewState[currentId], nextGrade, today));
    setRevealed(false);

    if (nextGrade === "again") {
      // Show it again later in this session, but count it as unfinished.
      setQueue([...rest, currentId]);
    } else {
      setQueue(rest);
      setCompletedCount((count) => count + 1);
    }
  };

  const practiceAll = () => {
    setQueue((expressions ?? []).map((entry) => entry.id));
    setMode("all");
    setCompletedCount(0);
    setRevealed(false);
  };

  const totalSaved = expressions?.length ?? 0;
  const current = queue && queue.length > 0 ? expressionsById.get(queue[0]) : undefined;
  const remaining = queue?.length ?? 0;
  const progress = completedCount + remaining > 0 ? completedCount / (completedCount + remaining) : 0;

  return (
    <main className={styles.page}>
      <AppHeader language={language} onLanguageChange={setLanguage} />

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Practice</p>
          <h1>Review your saved phrases.</h1>
          <p>Recall the meaning, then grade yourself. We schedule each phrase for you.</p>
        </div>
      </header>

      {expressions === null ? (
        <section className={styles.status}>
          <p>Loading your practice deck…</p>
        </section>
      ) : totalSaved === 0 ? (
        <section className={styles.status}>
          <h2>No saved phrases yet</h2>
          <p>Save phrases from the daily card or the library, then come back to practice them.</p>
          <Link className={styles.link} href="/library">
            Browse the library
          </Link>
        </section>
      ) : current ? (
        <section className={styles.deck} aria-live="polite">
          <div className={styles.progressRow}>
            <span>
              {completedCount} reviewed · {remaining} left
            </span>
            <div className={styles.progressTrack} aria-hidden="true">
              <div className={styles.progressFill} style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>

          <article className={styles.card}>
            <span className={styles.cardLanguage}>{languagesByCode[current.language].label}</span>
            <h2 className={styles.cardExpression}>{current.expression}</h2>

            {revealed ? (
              <div className={styles.answer}>
                <p className={styles.meaning}>{current.meaning}</p>
                {current.literalTranslation ? (
                  <p className={styles.detail}>
                    <span className={styles.detailLabel}>Literal</span>
                    {current.literalTranslation}
                  </p>
                ) : null}
                <p className={styles.detail}>
                  <span className={styles.detailLabel}>Use it when</span>
                  {current.usageNote}
                </p>
                {current.exampleSentence.trim() ? (
                  <p className={styles.detail}>
                    <span className={styles.detailLabel}>Example</span>
                    {current.exampleSentence}
                    {current.exampleTranslation.trim() ? (
                      <span className={styles.example}>{current.exampleTranslation}</span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className={styles.prompt}>Do you remember what this means?</p>
            )}
          </article>

          {revealed ? (
            <div className={styles.grades}>
              {GRADES.map(({ grade: gradeValue, label, className }) => (
                <button
                  key={gradeValue}
                  className={`${styles.gradeButton} ${styles[className]}`}
                  onClick={() => grade(gradeValue)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <button className={styles.reveal} onClick={() => setRevealed(true)} type="button">
              Show answer
            </button>
          )}
        </section>
      ) : (
        <section className={styles.status}>
          <h2>{completedCount > 0 ? "Nice work" : "You're all caught up"}</h2>
          <p>
            {completedCount > 0
              ? `You reviewed ${completedCount} ${completedCount === 1 ? "phrase" : "phrases"}.`
              : "Nothing is due for review right now."}
          </p>
          {mode === "due" ? (
            <button className={styles.reveal} onClick={practiceAll} type="button">
              Practice all {totalSaved} saved
            </button>
          ) : (
            <Link className={styles.link} href="/saved">
              Back to your shelf
            </Link>
          )}
        </section>
      )}
    </main>
  );
}
