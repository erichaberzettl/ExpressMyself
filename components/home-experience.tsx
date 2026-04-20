"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExpressionCard } from "@/components/expression-card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDailyExpressionAtOffset, getExpressionsForLanguage } from "@/lib/expressions";
import { usePersistedLanguage } from "@/lib/use-persisted-language";
import styles from "./home-experience.module.css";

export function HomeExperience() {
  const [language, setLanguage] = usePersistedLanguage("en");
  const [today] = useState(() => new Date());
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setOffset(0);
  }, [language]);

  const dailyExpression = useMemo(
    () => getDailyExpressionAtOffset(language, offset, today),
    [language, offset, today]
  );
  const languageExpressions = useMemo(() => getExpressionsForLanguage(language), [language]);

  return (
    <main className={styles.page}>
      <section className={styles.topBar}>
        <div className={styles.heroCopy}>
          <h1>ExpressMyself</h1>
          <p className={styles.lead}>
            Learn common expressions, idioms, and everyday phrases with quick, useful context.
          </p>
        </div>
        <div className={styles.controls}>
          <div className={styles.languageDock}>
            <LanguageSwitcher value={language} onChange={setLanguage} />
            <span className={styles.languageCount}>{languageExpressions.length} phrases</span>
          </div>
          <Link className={styles.subtleAction} href="/saved">
            Saved
          </Link>
          <Link className={styles.primaryAction} href="/library">
            Browse library
          </Link>
        </div>
      </section>

      <section className={styles.widgetShell}>
        <ExpressionCard
          expression={dailyExpression}
          showSaveButton
          onNextExpression={() => setOffset((current) => current + 1)}
        />
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
