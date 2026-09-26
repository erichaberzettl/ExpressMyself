# Authoring standard for new entries

Write every field so the finished entry would pass `expression-quality-review`
without a FIX. Judge quality in the target language, not from the English gloss.

## Fields

- **`id`** — `"<lang>-<slugified-expression>"`, lowercase, hyphenated, ASCII-folded
  (ä→ae or a, ß→ss, accents stripped), e.g. `de-die-kirche-im-dorf-lassen`,
  `en-beat-around-the-bush`. Must be unique across the whole DB.
- **`language`** — the two-letter code; must match the actual language.
- **`expression`** — canonical citation form with correct orthography (accents, ß,
  capitalisation, articles). This is what the learner sees first.
- **`literalTranslation`** — faithful word-for-word English that exposes the
  metaphor (e.g. "to let the church stay in the village"). Required for non-English
  languages; omit for English entries (the words already are English).
- **`meaning`** — ONE clear English sentence giving the figurative sense. No
  markup, no trailing fragments.
- **`usageNote`** — when and how a learner would actually use it: the situation,
  and the register (neutral / casual / proverb / old-fashioned-but-alive). Do not
  just restate the meaning.
- **`exampleSentence`** — a natural, realistic sentence in the target language that
  genuinely uses the expression (inflected correctly). Not a definition.
- **`exampleTranslation`** — an idiomatic English translation of the example
  (convey it naturally; do not translate the idiom word-for-word).
- **`difficulty`** — `"basic"` (very common, easy to deploy) or `"intermediate"`.
- **`tags`** — 1–3 tags **only** from the canonical topic list below. Do NOT add
  `imported` (that would exclude the entry from the daily featured pool and mark it
  second-class). Metadata tags `idiom`/`colloquialism`/`word`/`wiktionary` are
  stripped at runtime, so don't rely on them.

## Canonical topic tags (the only allowed tag values)

```
work, daily-life, communication, confidence, confusion, mistakes, money,
encouragement, health, learning, motivation, personality, study, boundaries,
decision-making, efficiency, emotion, humor, performance, secrets, time
```

## Worked example (German)

```json
{
  "id": "de-die-kirche-im-dorf-lassen",
  "language": "de",
  "expression": "Die Kirche im Dorf lassen",
  "literalTranslation": "To leave the church in the village",
  "meaning": "To not exaggerate and keep things in proportion.",
  "usageNote": "Use it, fairly casually, to tell someone to calm down and stop blowing a situation out of proportion.",
  "exampleSentence": "Ein Tippfehler ist kein Drama, lass mal die Kirche im Dorf.",
  "exampleTranslation": "A typo is not a disaster, let us keep things in proportion.",
  "difficulty": "intermediate",
  "tags": ["communication", "emotion"]
}
```

## Self-check before showing a batch

- Is every expression one a native speaker uses today? (If not → cut it.)
- Does the example actually contain the expression, naturally inflected?
- Is the meaning figurative and non-obvious (not predictable word-by-word)?
- Are the tags all from the canonical list, and is `imported` absent?
- Is the batch balanced across theme, register, and difficulty?
- No collisions or near-synonym duplicates with the existing DB?
