# ExpressMyself

A small app to learn typical idioms and expressions in different languages.

ExpressMyself is a small `Next.js + TypeScript + React` language-learning app focused on common expressions, idioms, and practical everyday phrases. The first version is intentionally simple: curated content, no accounts, and a clean interface that can later feed a Chrome extension UI.

## What is in this version

- A widget-style home page with a deterministic daily expression
- A browseable library with language, topic, and text filtering
- Expression detail pages with related phrases
- A saved phrases page backed by browser `localStorage`
- Shared typed content and domain logic designed for later extension reuse

## Stack

- `Next.js` App Router
- `TypeScript`
- `React`
- `CSS Modules`
- `Vitest` + Testing Library

## Project structure

- [`/app`](/Users/eric/Desktop/ExpressMyself/app) route entrypoints and page shells
- [`/components`](/Users/eric/Desktop/ExpressMyself/components) reusable UI pieces
- [`/lib`](/Users/eric/Desktop/ExpressMyself/lib) typed content, language metadata, and core selection/filter logic

## Getting started

1. Use the project Node version:
   `nvm use`
2. Install dependencies locally in this repo:
   `npm install`
3. Start the dev server:
   `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Useful scripts

- `npm run dev` runs the local dev server
- `npm test` runs the test suite once
- `npm run build` creates a production build
- `npm start` serves the production build
- `npm run import:wiktapi -- --language=es` fetches candidate entries from Wiktapi into local cache files
- `npm run build:imported-content` compiles cached imported JSON into app-readable TypeScript

## Content model

Expressions are stored in [`lib/content.ts`](/Users/eric/Desktop/ExpressMyself/lib/content.ts) using the `ExpressionEntry` type from [`lib/types.ts`](/Users/eric/Desktop/ExpressMyself/lib/types.ts).

Each entry includes:

- `id`
- `language`
- `expression`
- `literalTranslation` when useful
- `meaning`
- `usageNote`
- `exampleSentence`
- `exampleTranslation`
- `difficulty`
- `tags`

## How to add a new expression

1. Open [`lib/content.ts`](/Users/eric/Desktop/ExpressMyself/lib/content.ts)
2. Add a new object to the `expressions` array
3. Make sure the `id` is unique and the `language` matches one of the supported codes
4. Include at least one useful example sentence and a few tags
5. Run `npm test` to confirm filtering and rendering still work

## Wiktapi import flow

This repo now supports a local import pipeline so the app can grow beyond hand-written content.

1. Review the expansion targets in [`content/import-targets.json`](/Users/eric/Desktop/ExpressMyself/content/import-targets.json)
2. Import one language or all targets:
   `npm run import:wiktapi -- --language=fr`
   or
   `npm run import:wiktapi`
3. Build the app-ready import bundle:
   `npm run build:imported-content`
4. Run `npm test` and `npm run build`

Imported files are written to:

- [`content/import-cache`](/Users/eric/Desktop/ExpressMyself/content/import-cache)
- [`lib/generated-imported-content.ts`](/Users/eric/Desktop/ExpressMyself/lib/generated-imported-content.ts)

The app still uses the curated content first. Imported entries are merged in automatically after they are compiled into `generated-imported-content.ts`.

## How to add a new language

1. Add the language metadata in [`lib/languages.ts`](/Users/eric/Desktop/ExpressMyself/lib/languages.ts)
2. Add the language code to `supportedLanguages` in [`lib/types.ts`](/Users/eric/Desktop/ExpressMyself/lib/types.ts)
3. Add expressions for that language in [`lib/content.ts`](/Users/eric/Desktop/ExpressMyself/lib/content.ts)
4. Run `npm test` and `npm run build`

## Extension-friendly notes

- Keep reusable logic in [`/lib`](/Users/eric/Desktop/ExpressMyself/lib) rather than inside route files
- Avoid browser-extension APIs in shared logic
- Build new UI pieces as reusable components when possible
- The daily expression logic is deterministic by date and language so it can be reused in a popup or side panel later
