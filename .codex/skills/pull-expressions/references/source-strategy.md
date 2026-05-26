# Source Strategy

## First pass

Before scraping, inspect the website manually or with a small request:

- Check whether expressions are loaded in HTML, JSON scripts, an API endpoint, or client-side requests.
- Find list pages, category pages, pagination, search endpoints, sitemaps, or RSS feeds.
- Identify source fields: expression, definition, literal gloss, example, translation, audio, tags, region, and difficulty.
- Record the source URL for each entry or at least each batch.

## Extraction choices

Prefer sources in this order:

1. Public API or documented structured endpoint.
2. Embedded JSON or schema data in page source.
3. Stable semantic HTML selectors.
4. Sitemaps or index pages plus page-level parsing.
5. Browser automation only when content cannot be obtained reliably otherwise.

## Aggregation pattern

For each source, create a normalizer that returns plain objects with source fields plus provenance. Then run a second pass that converts the source objects into app entries. Keep these concerns separate so quality review can inspect what came from the website versus what was enriched.

Suggested intermediate shape:

```ts
{
  sourceUrl: string;
  sourceName: string;
  sourceLanguage: string;
  expression: string;
  sourceMeaning?: string;
  sourceLiteral?: string;
  sourceExample?: string;
  sourceExampleTranslation?: string;
  sourceLabels?: string[];
}
```

## Licensing and attribution

Do not copy long definitions or examples into app-facing content unless reuse is clearly allowed. Prefer paraphrased meanings, newly written examples grounded in verified meaning, and source/provenance tags for auditability. If attribution is required, add an attribution plan before importing content into the product.
