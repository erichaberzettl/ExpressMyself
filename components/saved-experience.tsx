"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ExpressionCard } from "@/components/expression-card";
import { getExpressionsByIds } from "@/lib/expressions";
import { useSavedExpressions } from "@/lib/use-saved-expressions";
import styles from "./saved-experience.module.css";

export function SavedExperience() {
  const { savedIds } = useSavedExpressions();
  const savedExpressions = useMemo(() => getExpressionsByIds(savedIds), [savedIds]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Saved</p>
          <h1>Your phrase shelf.</h1>
          <p>Keep the idioms and expressions you want to come back to without needing an account.</p>
        </div>
        <div className={styles.links}>
          <Link href="/library">Browse library</Link>
          <Link href="/">Back home</Link>
        </div>
      </header>

      {savedExpressions.length > 0 ? (
        <>
          <section className={styles.summary}>
            <p>
              You have saved {savedExpressions.length}{" "}
              {savedExpressions.length === 1 ? "expression" : "expressions"}.
            </p>
          </section>

          <section className={styles.grid}>
            {savedExpressions.map((expression) => (
              <ExpressionCard key={expression.id} expression={expression} compact />
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

