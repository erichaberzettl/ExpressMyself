---
name: pull-expressions
description: Extract idioms, colloquialisms, words, proverbs, and everyday expressions in any language from a specified website, then aggregate them into high-quality app or browser-extension content entries. Use when Codex needs to scrape or research language expressions from web pages, APIs, dictionaries, forums, glossaries, language-learning sites, or other source URLs; normalize source material into factual entries with meanings, literal translations, usage insight, examples, tags, provenance, and quality review suitable for ExpressMyself-style apps or extensions.
---

# Pull Expressions

## Outcome

Produce vetted expression entries that are factual, culturally useful, and ready to display in an app or extension. Prefer fewer high-quality entries over large weak imports.

For ExpressMyself, map accepted entries to `ExpressionEntry` from `lib/types.ts`. If the requested language is not yet in `supportedLanguages`, note that app language support must be added before TypeScript compilation will accept the entries.

## Workflow

1. Inspect the target website before extracting at scale.
   - Identify language, content type, pagination, source authority, licensing or terms signals, and whether the pages expose structured data or APIs.
   - Prefer official APIs, embedded JSON, semantic HTML, sitemaps, category pages, or glossary indexes before brittle selectors.
   - Respect robots/terms signals and avoid high-rate scraping. Cache raw or normalized source data when repeated runs are likely.

2. Extract candidate expressions with provenance.
   - Capture source URL, page title, source language label, source definition, source example, and any visible usage labels such as slang, informal, archaic, regional, vulgar, proverb, or idiom.
   - Keep source snippets short and paraphrase app-facing text unless the source license explicitly permits reuse.
   - Preserve accents, casing, apostrophes, particles, and grammatical markers that are part of the expression.

3. Filter aggressively.
   - Keep expressions that a learner could realistically encounter or use.
   - Reject broken markup, category labels, one-off proper nouns, pure translations with no idiomatic value, duplicate variants without a usage distinction, and entries whose meaning cannot be verified.
   - Treat single words as `word` only when they are culturally useful, colloquial, idiomatic, or hard to infer from dictionaries.

4. Enrich each accepted entry.
   - Write the meaning in plain English, not as a circular restatement.
   - Include `literalTranslation` when it reveals imagery or helps memorability; omit it when misleading or unavailable.
   - Write `usageNote` as genuine advice: register, tone, context, constraints, common construction, or when not to use it.
   - Create a natural example in the source language only when it is supported by the source meaning and usage. Do not invent culturally specific claims.
   - Translate the example into natural English, preserving pragmatic meaning over word-for-word phrasing.
   - Add tags that help browsing and QA, such as `idiom`, `colloquial`, `proverb`, `regional`, `informal`, `reviewed`, and the source name.

5. Validate and review.
   - Run `scripts/validate_expression_entries.mjs` on generated JSON arrays before merging them into app content.
   - Spot-check a sample against source pages. For small batches, review every entry; for larger batches, review all unusual or low-confidence entries plus a random sample.
   - Mark only human- or model-reviewed entries with `reviewed`; mark imported but unreviewed entries with `imported`.

## App Entry Shape

Use this target shape for ExpressMyself-style entries:

```ts
{
  id: string;
  language: string;
  expression: string;
  literalTranslation?: string;
  meaning: string;
  usageNote: string;
  exampleSentence: string;
  exampleTranslation: string;
  difficulty: "basic" | "intermediate";
  tags: string[];
  contentType?: "idiom" | "colloquialism" | "word";
}
```

Create stable IDs as `<language>-<slug>-<index>` when importing from lists. Keep IDs ASCII when possible, but preserve the original expression text.

## Quality Bar

An entry is ready only when all of these are true:

- The expression text is attested by the source URL or another cited source.
- The meaning is specific enough to teach real use.
- The usage note adds insight beyond the meaning.
- The example sentence sounds natural for the target language and matches the meaning.
- The English example translation is idiomatic English, not a mechanical gloss.
- Tags and `contentType` reflect actual use, not just the scraper path.
- Any regional, offensive, archaic, vulgar, or highly informal status is surfaced in `usageNote` and tags.

## Useful Resources

- Read `references/expression-entry-guidelines.md` when writing or reviewing entries.
- Read `references/source-strategy.md` when choosing how to pull from a new website.
- Run `scripts/validate_expression_entries.mjs <path...>` on JSON arrays of entries.
