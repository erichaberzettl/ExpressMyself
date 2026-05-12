import { notFound } from "next/navigation";
import { ExpressionCard } from "@/components/expression-card";
import { PersistentAppHeader } from "@/components/persistent-app-header";
import { getExpressionById, getRelatedExpressions } from "@/lib/expressions";
import { languagesByCode } from "@/lib/languages";
import styles from "./page.module.css";

type ExpressionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExpressionPage({ params }: ExpressionPageProps) {
  const { id } = await params;
  const expression = getExpressionById(id);

  if (!expression) {
    notFound();
  }

  const related = getRelatedExpressions(expression, 3);
  const language = languagesByCode[expression.language];

  return (
    <main className={styles.page}>
      <PersistentAppHeader />

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{language.label}</p>
          <h1>{expression.expression}</h1>
          <p className={styles.intro}>
            A quick, practical breakdown of when people actually use this expression.
          </p>
        </div>
      </section>

      <ExpressionCard expression={expression} compact={false} showSaveButton />

      {related.length > 0 ? (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeading}>
            <h2>Related expressions</h2>
            <p>More phrases from the same language and context.</p>
          </div>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <ExpressionCard key={item.id} expression={item} listPreview />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
