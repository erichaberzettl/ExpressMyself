---
name: expression-quality-review
description: >-
  Review idiom / expression database entries for the ExpressMyself app and decide
  KEEP, FIX, or DISCARD against an objective quality rubric. Use whenever the user
  wants to audit, prune, quality-check, clean up, or "review harshly" the expression
  database (content/import-cache/*.json or the curatedExpressions array in
  lib/content.ts), or before refilling the database with new entries. The bar:
  an entry must be a genuine, correctly-formed idiom / proverb / set expression
  that is valuable to read and learn — not a scrape artifact, a bare grammatical
  fragment, a plain functional phrase, a duplicate, or broken data.
---

# Expression quality review

## What this skill is for

The ExpressMyself database teaches learners real, memorable idioms in 10 languages.
Much of the imported content was scraped from Wiktionary alphabetical indexes, so it
is polluted with artifacts: clusters of entries all starting with the same letter,
bare prepositional fragments that are not idioms, obscure/archaic phrases, place-name
definitions, numbers, and template-broken data. This skill defines an objective,
repeatable rubric for reviewing each entry and deciding whether it stays.

Read `references/data-model.md` for the exact `ExpressionEntry` shape, where entries
live, and how to apply verdicts to this repo.

## The one-line bar

> **Keep an entry only if it is a genuine idiom, proverb, or fixed figurative /
> cultural set expression that a learner would find valuable to read and learn —
> and its data is correct and complete.**

Everything else is `DISCARD`. If the *expression* is worth keeping but a *field* is
weak or wrong, the verdict is `FIX` (repair the field, don't discard the entry).

## Decision procedure

For each entry, run these gates **in order**. The first gate that fails decides the
verdict. Record the entry `id`, the verdict, and a one-line reason.

### Gate 1 — Data integrity (→ DISCARD if unfixable, else FIX)

- `meaning` is empty, punctuation-only, or contains template/markup junk
  (`}}`, `{{`, `|`, `<!--`, leading `,`) → **DISCARD**.
- `expression` is empty, mis-encoded (mojibake), or clearly truncated → **DISCARD**.
- `language` code does not match the actual language of the expression → **DISCARD**
  (wrong bucket; refill correctly instead).
- `exampleSentence` does not actually contain the expression (or a natural inflected
  form of it), OR `exampleTranslation`/`usageNote` is empty or a generic
  auto-filled stub ("People use X as an expression in <language>", "Commonly used
  as an expression in <language>") → **FIX** (the expression can stay; the field is
  repairable). Only escalate to DISCARD if the expression itself also fails a later
  gate.

### Gate 2 — Is it actually an expression? (→ DISCARD)

Discard if it is **not** an idiom / proverb / fixed figurative expression, i.e. it is:

- **A bare grammatical or prepositional fragment** whose meaning is literal and
  compositional: e.g. IT *"A dispetto di"* (in spite of), *"A colpi di"* (by means
  of), *"A capo"* (new line/paragraph), *"A cascata"* (in a cascade); PT *"A fio"*,
  *"A caminho"* (on the way); FR *"À plus tard"* (see you later). These are function
  words or plain descriptions, not figurative set phrases.
- **A plain functional/social phrase** anyone would produce literally with no
  figurative or cultural layer: greetings, farewells, "on the way", "at home".
  (A *fixed* toast like FR *"À votre santé"* / a genuine culturally-loaded set
  phrase can stay — the test is whether it is a recognised, non-compositional unit.)
- **A place-name or dictionary definition** masquerading as an idiom, unless the
  phrase is genuinely used figuratively (e.g. DA *"By i Rusland"* = "some
  insignificant nowhere place" IS a real figurative idiom and stays; a literal
  gazetteer entry does not).
- **A number/meta artifact** with no idiomatic standing (e.g. "11th commandment"
  used only as a list header). A number that is a real idiom stays
  (e.g. EN *"15 minutes of fame"*, *"800-pound gorilla"*).

Rule of thumb: if you can fully predict the meaning by translating the words
one-by-one, it is not an idiom → DISCARD. If the meaning is figurative,
non-compositional, or carries cultural weight → it passes this gate.

### Gate 3 — Scrape-artifact / notability (→ DISCARD)

- **Alphabetical-cluster tell**: if a language's entries are dominated by one
  starting letter (e.g. 15+ entries beginning "A "), treat that cluster as suspect
  and hold each to the idiom bar strictly — most will fail Gate 2. A real idiom that
  happens to start with A still stays.
- **Obscure / archaic / hyper-regional**: discard phrases a fluent native speaker
  would not recognise as current, living usage. When genuinely unsure whether a
  phrase is real and current, lean DISCARD — this is a harsh review and the database
  will be refilled with better entries.

### Gate 4 — Duplication (→ DISCARD the weaker copy)

If two entries are the same expression (after lowercasing, stripping accents and
punctuation) in the same language, keep the one with the richer, more correct data
(better example, literal translation, tags) and discard the other. Prefer a curated
entry over an imported one when they collide.

### Gate 5 — Learn-value (→ KEEP)

An entry that clears Gates 1–4 is a **KEEP**. Bonus signals of a strong entry
(not required, but note them): vivid imagery, cultural specificity, a useful literal
translation that reveals the metaphor, a natural example sentence.

## Verdict output format

Emit one JSON object per entry into a per-language verdicts file
(`content/review/<lang>.verdicts.json`), shape:

```json
{
  "id": "it-a-dispetto-di-9",
  "verdict": "DISCARD",            // KEEP | FIX | DISCARD
  "gate": 2,                        // which gate decided it (KEEP → 5)
  "reason": "Grammatical prepositional connector (= in spite of); needs a complement, not a figurative idiom.",
  "fix": null                       // for FIX: { "field": "usageNote", "value": "..." }
}
```

(Note the contrast: *a dispetto di* is a bare connector and goes; but a fixed
idiomatic adverbial like ES *a cal y canto* = "shut tight", whose meaning you
cannot get by translating the words, is a KEEP.)

Then apply verdicts with the process in `references/data-model.md`: discarded
entries move to `content/rejected/<lang>.json` (carrying their `reason`), are removed
from the active source, and the imported bundle is rebuilt.

## Calibration examples

| Expression (lang) | Verdict | Why |
|---|---|---|
| *Let the cat out of the bag* (en) | KEEP | Famous figurative idiom, high learn-value |
| *Nie mój cyrk, nie moje małpy* (pl) | KEEP | Vivid, well-known ("not my circus, not my monkeys") |
| *Coûter les yeux de la tête* (fr) | KEEP | Figurative, common ("cost an arm and a leg") |
| *A dispetto di* (it) | DISCARD | Grammatical fragment "in spite of", fully compositional |
| *À plus tard* (fr) | DISCARD | Plain farewell "see you later", no figurative layer |
| *A caminho* (pt) | DISCARD | Literal "on the way" |
| *11th commandment* (en) | DISCARD | List-header meta artifact, not a living idiom |
| *By i Rusland* (da) | KEEP | Genuinely figurative ("some insignificant nowhere") |
| meaning = `", {{...}}"` | DISCARD | Broken template data |
| Good idiom, example lacks the phrase | FIX | Repair the example; keep the entry |

## Principles

- **Harsh but fair.** The goal is a database where every entry earns its place. When
  in doubt about idiomaticity or currency, discard — refill is cheap, learner trust
  is not.
- **Judge in the source language**, not from the English gloss. A weak gloss can
  hide a strong idiom (→ FIX) and a clean gloss can dress up a non-idiom (→ DISCARD).
- **One reason per verdict.** Every discard must carry a short, concrete reason so
  the refill step and any human reviewer can audit the call.
- **Never silently delete.** Discards are quarantined with their reasons, never hard-
  deleted, so a wrong call is always recoverable.
