import React from "react";
import { createRoot } from "react-dom/client";
import { HomeExperience } from "../../components/home-experience";
import { LibraryExperience } from "../../components/library-experience";
import { SavedExperience } from "../../components/saved-experience";
import { ExpressionCard } from "../../components/expression-card";
import { SaveExpressionButton } from "../../components/save-expression-button";
import { fetchExpressionById, fetchExpressionsByIds, fetchExpressionsForLanguage } from "./extension-client-api";
import { getExpressionsForLanguage } from "../../lib/expressions";
import { ExpressionEntry } from "../../lib/types";
import { languagesByCode } from "../../lib/languages";
import "../../app/globals.css";
import detailStyles from "../../app/expression/[id]/page.module.css";

type RouteView =
  | { kind: "home" }
  | { kind: "library" }
  | { kind: "saved" }
  | { kind: "expression"; id: string };

function getRouteView(): RouteView {
  const params = new URLSearchParams(window.location.search);
  const explicitRoute = params.get("route");
  const view = params.get("view");

  const route =
    explicitRoute ??
    (view === "library" ? "/library" : view === "saved" ? "/saved" : view === "daily" ? "/" : "/");

  if (route.startsWith("/expression/")) {
    const id = route.slice("/expression/".length);
    return id ? { kind: "expression", id } : { kind: "home" };
  }

  if (route === "/library") {
    return { kind: "library" };
  }

  if (route === "/saved") {
    return { kind: "saved" };
  }

  return { kind: "home" };
}

function getRelatedExpressions(expression: ExpressionEntry, limit = 3): ExpressionEntry[] {
  const pool = getExpressionsForLanguage(expression.language).filter((entry) => entry.id !== expression.id);
  const sharedTagMatches = pool.filter((entry) =>
    entry.tags.some((tag) => expression.tags.includes(tag))
  );

  if (sharedTagMatches.length >= limit) {
    return sharedTagMatches.slice(0, limit);
  }

  const seenIds = new Set(sharedTagMatches.map((entry) => entry.id));
  const fallback = pool.filter((entry) => !seenIds.has(entry.id));
  return [...sharedTagMatches, ...fallback].slice(0, limit);
}

function ExpressionDetailView({ expressionId }: { expressionId: string }) {
  const [expression, setExpression] = React.useState<ExpressionEntry | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    fetchExpressionById(expressionId).then((entry) => {
      if (!cancelled) {
        setExpression(entry);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [expressionId]);

  if (!expression) {
    return (
      <main className={detailStyles.page}>
        <section className={detailStyles.hero}>
          <div>
            <p className={detailStyles.eyebrow}>Expression</p>
            <h1>Not found</h1>
            <p className={detailStyles.intro}>This expression is not available in the extension library.</p>
          </div>
        </section>
      </main>
    );
  }

  const related = getRelatedExpressions(expression);
  const language = languagesByCode[expression.language];

  return (
    <main className={detailStyles.page}>
      <section className={detailStyles.hero}>
        <div>
          <p className={detailStyles.eyebrow}>{language.label}</p>
          <h1>{expression.expression}</h1>
          <p className={detailStyles.intro}>
            A quick, practical breakdown of when people actually use this expression.
          </p>
        </div>
        <SaveExpressionButton expressionId={expression.id} />
      </section>

      <ExpressionCard expression={expression} />

      {related.length > 0 ? (
        <section className={detailStyles.relatedSection}>
          <div className={detailStyles.sectionHeading}>
            <h2>Related expressions</h2>
            <p>More phrases from the same language and context.</p>
          </div>
          <div className={detailStyles.relatedGrid}>
            {related.map((item) => (
              <ExpressionCard key={item.id} compact expression={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function AppRouter() {
  const routeView = getRouteView();
  const initialExpressions = getExpressionsForLanguage("en");

  if (routeView.kind === "library") {
    return (
      <LibraryExperience
        initialExpressions={initialExpressions}
        loadExpressions={fetchExpressionsForLanguage}
      />
    );
  }

  if (routeView.kind === "saved") {
    return <SavedExperience loadExpressionsByIds={fetchExpressionsByIds} />;
  }

  if (routeView.kind === "expression") {
    return <ExpressionDetailView expressionId={routeView.id} />;
  }

  return (
    <HomeExperience
      initialExpressions={initialExpressions}
      loadExpressions={fetchExpressionsForLanguage}
    />
  );
}

const container = document.getElementById("app-root");

if (!container) {
  throw new Error("Missing app-root container");
}

createRoot(container).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
