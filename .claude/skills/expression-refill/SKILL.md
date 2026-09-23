---
name: expression-refill
description: >-
  Source and author NEW high-quality idiom / expression entries to grow the
  ExpressMyself database, one language at a time. Use whenever the user wants to
  add, refill, expand, top up, or generate new expressions for any language, or
  after a prune has left a language thin. Produces ExpressionEntry records that
  must pass the expression-quality-review bar: genuine, common, native-authentic
  idioms / proverbs / set expressions with correct, complete, learner-useful
  fields. Human-in-the-loop by default: propose a batch, get the user's flags,
  adapt the sourcing strategy, then apply.
---

# Expression refill (sourcing new entries)

This skill is the **generation** counterpart to `expression-quality-review` (the
acceptance gate). Every entry you author here must pass that skill's 5 gates.
Read `references/data-model.md` in the review skill for the `ExpressionEntry`
shape, where entries live, and how to apply. Read `references/authoring.md` here
for the field-by-field quality standard and the canonical tag list.

## The loop (never skip the check)

1. **Scope** — confirm the language(s) and how many to add per language. Pull the
   existing expressions for that language first and dedupe against them.
2. **Source** — assemble candidates using the sourcing strategy below.
3. **Author** — write every field to the standard in `references/authoring.md`.
4. **Show for flagging** — present the batch as a numbered review table (one row
   per candidate: expression · literal · meaning · register/theme). Do **not**
   write to the database yet. Ask the user to flag the unsuitable ones.
5. **Adapt** — drop the flagged entries, infer the *pattern* behind each flag
   (too obscure? too basic? wrong register? over-indexed theme?), state the
   adjusted strategy back to the user, and regenerate replacements under it.
6. **Gate** — run the candidates through `expression-quality-review` once the user
   is happy with the direction.
7. **Apply** — add survivors to the source (see Placement), rebuild, verify.

The user's flags are the training signal. After the first batch, always name what
you changed ("dropping animal idioms, adding more workplace + money") so the user
can confirm the direction before you scale to the remaining languages.

## Sourcing strategy

Aim for a batch a native speaker would call *"yes, people actually say these."*

- **Balance the two structural types.** This is a formal axis, independent of
  topic, and every batch should deliberately mix both:
  - **Idioms** (*Redewendung / Redensart*) — non-literal **phrases/fragments** you
    conjugate and slot into a sentence: *die Flinte ins Korn werfen*, *beat around
    the bush*, *get cold feet*.
  - **Proverbs / sayings** (*Sprichwort*; also adage, maxim) — **complete,
    self-contained sentences** stating a general truth, moral, or advice, quoted
    verbatim: *Was Hänschen nicht lernt, lernt Hans nimmermehr*, *If you can't
    stand the heat, get out of the kitchen*, *Actions speak louder than words*.
  Default to roughly a 60/40 idiom-to-proverb split unless the user asks otherwise;
  never let a batch be all one type. Proverbs may be traditional, rhyming, or
  slightly archaic in wording and still count as current if people still quote them.
- **Frequency first.** Prioritise everyday, high-currency expressions a learner
  will hear and can reuse. Iconic proverbs are welcome but should not crowd out
  living, spoken idioms — and vice versa.
- **Casual/slang register is welcome.** Colloquial, playful, and slangy idioms are
  in scope and valued (the user likes them); just tag the register in `usageNote`.
- **Spread across themes.** Cover a mix of the canonical topics — emotion, work,
  money, time, communication, relationships/daily-life, personality, decision-
  making, plus vivid imagery (food, animals, body, weather). Cap any single
  image family (e.g. animals) at ~1/4 of a batch so the set feels balanced.
- **Spread across register.** Mix neutral idioms, colloquial/spoken ones, and a
  few proverbs. Note the register in `usageNote` so learners don't misuse a
  casual one in a formal setting.
- **Difficulty mix.** Mostly `basic` and `intermediate`; skew toward what an
  upper-beginner to intermediate learner can actually deploy.
- **Native-authentic citation form.** Use the standard dictionary/reference form
  of the expression, with correct spelling, accents, ß, and articles.
- **Dedupe hard.** Exclude anything already in the DB (normalised expression key)
  *and* near-synonyms already present — don't add a second "make a mountain out of
  a molehill" or a third "cheers" for the same language.

### Exclude (these fail the review gate)

- Obscure, archaic, dead, or hyper-regional phrases a fluent speaker wouldn't use.
- Vulgar, slur-bearing, or demeaning expressions (an idiom that only works as an
  insult about a group is out, even if "genuine").
- Bare grammatical/prepositional fragments and plain literal phrases (see the
  review skill's Gate 2).
- Dictionary-only calques that no one says in speech.
- Anything you can't confidently vouch for as real, current usage — when unsure,
  leave it out rather than guess.

## Presentation format for the flagging step

Show one numbered table per language. Keep IDs short and stable (`G1…`, `E1…`)
for this round so the user can flag by code. Include enough to judge suitability
without scrolling: expression, literal gloss, meaning, and a short
register/theme tag. Offer to expand any row to its full entry (usage + example).

## Placement (apply step)

Hand-authored refill entries are curated-grade, so they should be eligible for the
daily featured rotation, which **excludes** anything tagged `imported`
(`getFeaturedExpressionPool` in `lib/expressions.ts`). Therefore:

- Add them **without** the `imported` tag.
- Preferred home: a dedicated curated source per batch — either append to
  `curatedExpressions` in `lib/content.ts`, or (cleaner for large batches) a new
  `content/import-cache/<lang>-curated.json`-style file **whose entries are not
  tagged `imported`** so they still count as curated. Confirm the placement with
  the user before writing.
- Use only canonical topic tags (see `references/authoring.md`).
- After writing: `node scripts/build-imported-content.mjs` (if using a cache
  file), then `npx tsc -p tsconfig.json --noEmit` and `npx vitest run`.
