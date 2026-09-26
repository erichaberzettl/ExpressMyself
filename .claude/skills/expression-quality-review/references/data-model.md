# Data model & apply process

## The `ExpressionEntry` shape

Defined in `lib/types.ts`:

```ts
type ExpressionEntry = {
  id: string;                     // stable, unique, e.g. "es-a-cal-y-canto-1"
  language: LanguageCode;         // en es fr de pt it nl sv da pl
  expression: string;             // the idiom in its own language
  literalTranslation?: string;    // optional word-for-word gloss (reveals the metaphor)
  meaning: string;                // what it actually means, in English
  usageNote: string;              // when/how a learner would use it
  exampleSentence: string;        // natural sentence USING the expression
  exampleTranslation: string;     // English translation of the example
  difficulty: "basic" | "intermediate";
  tags: string[];                 // e.g. ["idiom","work"]; imported ones carry "imported"
};
```

## Where entries live (the "database")

- **Imported entries** — `content/import-cache/*.json` (arrays of `ExpressionEntry`).
  These are the scraped files, one or more per language (e.g. `es.json`,
  `sv-proverbs.json`). This is the *source of truth* for imported content.
- **Compiled imported bundle** — `lib/generated-imported-content.ts`, produced from
  the cache files by `node scripts/build-imported-content.mjs`. **Never edit by
  hand** — rebuild it.
- **Curated entries** — the `curatedExpressions` array literal in `lib/content.ts`
  (hand-authored, no `"imported"` tag).
- **Serving pipeline** — `lib/content.ts` merges curated + imported, dedupes, then
  `lib/expression-content.ts` (`getPublicExpressions`) applies runtime quality
  filters and sanitisation. This skill's review is an *authoring-time* prune of the
  source data; it complements, not replaces, that runtime filter.

## Applying verdicts

1. **Write verdicts** to `content/review/<lang>.verdicts.json` (see SKILL.md format).
2. **Quarantine discards**: append each `DISCARD` entry (full object) plus a
   `reason` field to `content/rejected/<lang>.json`.
3. **Remove discards from the active source**:
   - Imported: rewrite the relevant `content/import-cache/*.json` without the
     discarded ids.
   - Curated: remove the discarded object literals from `curatedExpressions` in
     `lib/content.ts` (match by `id`).
4. **Apply FIX edits** to the field named in each `FIX` verdict, in the source file.
5. **Rebuild** the imported bundle: `node scripts/build-imported-content.mjs`.
6. **Verify**: `npx tsc -p tsconfig.json --noEmit` and `npx vitest run` (the repo has
   `lib/expressions.test.ts` etc.). Confirm the app still lists expressions per
   language and no language is left empty.

## Idempotency & recovery

- Verdicts and rejected files are git-tracked; a wrong DISCARD is recovered by moving
  the entry from `content/rejected/<lang>.json` back into its import-cache file (or
  `curatedExpressions`) and rebuilding.
- Re-running the review over already-pruned data should produce only `KEEP` verdicts
  for the survivors.
