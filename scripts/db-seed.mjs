import { Client } from "pg";
import importTargets from "../content/import-targets.json" with { type: "json" };
import { expressions } from "../lib/content.ts";
import { languages } from "../lib/languages.ts";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const client = new Client({ connectionString });

try {
  await client.connect();
  await client.query("BEGIN");

  const languageMap = new Map(languages.map((language) => [language.code, language]));

  for (const target of importTargets) {
    const language = languageMap.get(target.code) ?? {
      code: target.code,
      label: target.label,
      nativeLabel: target.nativeLabel
    };

    await client.query(
      `INSERT INTO languages (code, label, native_label)
       VALUES ($1, $2, $3)
       ON CONFLICT (code) DO UPDATE
       SET label = EXCLUDED.label,
           native_label = EXCLUDED.native_label,
           updated_at = NOW()`,
      [language.code, language.label, language.nativeLabel]
    );
  }

  for (const entry of expressions) {
    await client.query(
      `INSERT INTO expressions (
         id, language_code, expression, literal_translation, meaning, usage_note,
         example_sentence, example_translation, difficulty, tags
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE
       SET language_code = EXCLUDED.language_code,
           expression = EXCLUDED.expression,
           literal_translation = EXCLUDED.literal_translation,
           meaning = EXCLUDED.meaning,
           usage_note = EXCLUDED.usage_note,
           example_sentence = EXCLUDED.example_sentence,
           example_translation = EXCLUDED.example_translation,
           difficulty = EXCLUDED.difficulty,
           tags = EXCLUDED.tags,
           updated_at = NOW()`,
      [
        entry.id,
        entry.language,
        entry.expression,
        entry.literalTranslation ?? null,
        entry.meaning,
        entry.usageNote,
        entry.exampleSentence,
        entry.exampleTranslation,
        entry.difficulty,
        entry.tags
      ]
    );
  }

  await client.query("COMMIT");
  console.log(
    `[db:seed] upserted ${importTargets.length} languages and ${expressions.length} expressions`
  );
} catch (error) {
  await client.query("ROLLBACK");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end();
}
