# ExpressMyself

A small app to learn typical idioms and expressions in different languages.

ExpressMyself is a small `Next.js + TypeScript + React` language-learning app focused on common expressions, idioms, and practical everyday phrases. The first version is intentionally simple: curated content, no accounts, and a clean interface that can later feed a Chrome extension UI.

The app is now set up to scale to 10 Latin-script languages with imported expression data, including Swedish.

## What is in this version

- A widget-style home page with a deterministic daily expression
- A browseable library with language, topic, and text filtering
- Expression detail pages with related phrases
- A saved phrases page backed by browser `localStorage`
- Shared typed content and domain logic designed for later extension reuse
- Import support for 10 languages with around 100 scraped expressions per language

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
- `npm run build:extension` builds a loadable Chrome extension into `extension/dist`
- `npm run build:extension-assets` generates extension icons and store screenshots
- `npm run package:extension` creates the Chrome Web Store upload ZIP in `artifacts`
- `npm start` serves the production build
- `npm run db:push` applies the SQL schema to PostgreSQL
- `npm run db:seed` seeds PostgreSQL from the current expression content
- `npm run import:wiktapi -- --language=es` fetches candidate entries from Wiktapi into local cache files
- `npm run scrape:idioms -- --count=100` scrapes idioms and common expressions from Wiktionary for the supported languages
- `npm run build:imported-content` compiles cached imported JSON into app-readable TypeScript

## PostgreSQL setup

This project now includes a direct PostgreSQL layer using plain SQL.

1. Copy [`.env.example`](/Users/eric/Desktop/ExpressMyself/.env.example) to `.env`
2. Set `DATABASE_URL` to your Postgres connection string
3. Push the schema:
   `npm run db:push`
4. Seed the database:
   `npm run db:seed`

The app keeps a safe fallback to local content if `DATABASE_URL` is missing or the database is unavailable, so setup can happen incrementally.

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

## Web scrape flow

This repo now supports a local scrape pipeline so the app can grow beyond hand-written content.

1. Review the scrape targets in [`content/scrape-targets.json`](/Users/eric/Desktop/ExpressMyself/content/scrape-targets.json)
2. Scrape one language or all targets:
   `npm run scrape:idioms -- --language=sv --count=100`
   or
   `npm run scrape:idioms -- --count=100`
3. Build the app-ready import bundle:
   `npm run build:imported-content`
4. Run `npm test` and `npm run build`

Imported files are written to:

- [`content/import-cache`](/Users/eric/Desktop/ExpressMyself/content/import-cache)
- [`lib/generated-imported-content.ts`](/Users/eric/Desktop/ExpressMyself/lib/generated-imported-content.ts)

The app still uses the curated content first. Imported entries are merged in automatically after they are compiled into `generated-imported-content.ts`.

## Supported languages

The current scaled target set is:

- English (`en`)
- Spanish (`es`)
- French (`fr`)
- German (`de`)
- Portuguese (`pt`)
- Italian (`it`)
- Dutch (`nl`)
- Swedish (`sv`)
- Danish (`da`)
- Polish (`pl`)

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

## Chrome extension

The repo now includes a Manifest V3 Chrome extension under [`/extension`](/Users/eric/Desktop/ExpressMyself/extension).

It includes:

- a popup with the daily phrase, language switcher, save action, and speech playback
- a fuller extension page with daily, library, and saved views
- shared phrase selection and filtering logic compiled directly from [`/lib`](/Users/eric/Desktop/ExpressMyself/lib)

To load it locally:

1. Run `npm run build:extension`
2. Open `chrome://extensions`
3. Enable Developer mode
4. Choose Load unpacked
5. Select [`extension/dist`](/Users/eric/Desktop/ExpressMyself/extension/dist)

## Chrome Web Store packaging

To prepare the extension for store submission:

1. Generate the extension icons and store screenshots:
   `npm run build:extension-assets`
2. Build the extension bundle:
   `npm run build:extension`
3. Package the upload ZIP:
   `npm run package:extension`

Submission-ready materials will be available in:

- [`artifacts/express-myself-chrome-extension.zip`](/Users/eric/Desktop/ExpressMyself/artifacts/express-myself-chrome-extension.zip)
- [`extension/store-assets`](/Users/eric/Desktop/ExpressMyself/extension/store-assets)
- [`extension/STORE_LISTING.md`](/Users/eric/Desktop/ExpressMyself/extension/STORE_LISTING.md)
- [`PRIVACY.md`](/Users/eric/Desktop/ExpressMyself/PRIVACY.md)
