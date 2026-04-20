"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExpressionCard } from "@/components/expression-card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { filterExpressions, getAvailableTags, getExpressionsForLanguage } from "@/lib/expressions";
import { usePersistedLanguage } from "@/lib/use-persisted-language";
import styles from "./library-experience.module.css";

export function LibraryExperience() {
  const [language, setLanguage] = usePersistedLanguage("en");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");

  const entries = useMemo(() => getExpressionsForLanguage(language), [language]);
  const tags = useMemo(() => getAvailableTags(language), [language]);
  const filtered = useMemo(
    () => filterExpressions({ language, query, tag: tag === "all" ? undefined : tag }),
    [language, query, tag]
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Library</p>
          <h1>Browse practical expressions.</h1>
          <p>
            Search the curated phrase set by language, topic, or expression text.
          </p>
        </div>
        <div className={styles.links}>
          <Link href="/saved">Saved phrases</Link>
          <Link href="/">Back home</Link>
        </div>
      </header>

      <section className={styles.toolbar}>
        <LanguageSwitcher
          value={language}
          onChange={(nextLanguage) => {
            setLanguage(nextLanguage);
            setTag("all");
          }}
        />

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
                {item}
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
            <ExpressionCard key={expression.id} expression={expression} compact />
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
