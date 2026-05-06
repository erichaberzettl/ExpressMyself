import {
  getPublicExpressions,
  isPublicExpressionEntry,
  sanitizePublicExpressionEntry
} from "@/lib/expression-content";
import { getExpressionsForLanguage } from "@/lib/expressions";

describe("expression content quality", () => {
  it("filters weak imported English entries from the public catalog", () => {
    expect(
      isPublicExpressionEntry({
        id: "en-airheaded-91",
        language: "en",
        expression: "airheaded",
        meaning: "Silly, foolish.",
        usageNote: "Commonly used as an idiomatic expression in English.",
        exampleSentence: 'People use "airheaded" as an expression in English.',
        exampleTranslation: "Silly, foolish.",
        difficulty: "intermediate",
        tags: ["idiom", "imported", "wiktionary"]
      })
    ).toBe(false);
  });

  it("keeps curated English expressions available publicly", () => {
    const englishExpressions = getPublicExpressions(getExpressionsForLanguage("en"));

    expect(englishExpressions.some((entry) => entry.id === "en-break-a-leg")).toBe(true);
    expect(englishExpressions.some((entry) => entry.id === "en-airheaded-91")).toBe(false);
  });

  it("replaces generic imported usage notes with learner-facing guidance", () => {
    const entry = sanitizePublicExpressionEntry({
      id: "es-a-buenas-horas",
      language: "es",
      expression: "a buenas horas",
      meaning: "About time.",
      usageNote: "Commonly used as an idiomatic expression in Spanish.",
      exampleSentence: 'People use "a buenas horas" as an expression in Spanish.',
      exampleTranslation: "About time.",
      difficulty: "intermediate",
      tags: ["idiom", "imported", "wiktionary"]
    });

    expect(entry.usageNote).toBe(
      "Use it when the situation fits this idea and you want to sound more natural, vivid, or culturally fluent than with a literal phrase."
    );
  });

  it("builds more specific usage notes for infinitive meanings", () => {
    const entry = sanitizePublicExpressionEntry({
      id: "en-add-fuel-to-the-fire",
      language: "en",
      expression: "Add fuel to the fire",
      meaning: "To worsen a conflict between people.",
      usageNote: "Commonly used as an idiomatic expression in English.",
      exampleSentence: 'People use "Add fuel to the fire" as an expression in English.',
      exampleTranslation: "To worsen a conflict between people.",
      difficulty: "intermediate",
      tags: ["idiom", "imported", "wiktionary"]
    });

    expect(entry.usageNote).toBe(
      "Use it when someone is about to worsen a conflict between people, has already done it, or when that is the clearest way to describe what is happening."
    );
  });

  it("drops broken example blocks when the imported example just repeats the meaning", () => {
    const entry = sanitizePublicExpressionEntry({
      id: "fr-ca-y-est",
      language: "fr",
      expression: "ça y est",
      meaning: "There it is.",
      usageNote: "Commonly used as an idiomatic expression in French.",
      exampleSentence: 'People use "ça y est" as an expression in French.',
      exampleTranslation: "There it is.",
      difficulty: "basic",
      tags: ["idiom", "imported", "wiktionary"]
    });

    expect(entry.exampleSentence).toBe("");
    expect(entry.exampleTranslation).toBe("");
  });

  it("deduplicates repeated expressions by keeping the stronger version", () => {
    const results = getPublicExpressions([
      {
        id: "de-duplicate-1",
        language: "de",
        expression: "Ende gut, alles gut",
        meaning: "If something ends well, the earlier trouble matters less.",
        usageNote: "Use it after a stressful situation finally turns out fine.",
        exampleSentence: "Ende gut, alles gut.",
        exampleTranslation: "All is well that ends well.",
        difficulty: "basic",
        tags: ["encouragement"]
      },
      {
        id: "de-duplicate-2",
        language: "de",
        expression: "Ende gut, alles gut",
        meaning: "good ending",
        usageNote: "Commonly used as an idiomatic expression in German.",
        exampleSentence: 'People use "Ende gut, alles gut" as an expression in German.',
        exampleTranslation: "good ending",
        difficulty: "intermediate",
        tags: ["idiom", "imported", "wiktionary"]
      }
    ]);

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("de-duplicate-1");
  });

  it("does not cap high-quality public entries per language", () => {
    const entries = Array.from({ length: 55 }, (_, index) => ({
      id: `fr-entry-${index}`,
      language: "fr" as const,
      expression: `Expression ${index}`,
      meaning: `Meaning ${index}`,
      usageNote: `Useful note ${index}`,
      exampleSentence: `Example sentence ${index}`,
      exampleTranslation: `Example translation ${index}`,
      difficulty: "basic" as const,
      tags: ["communication"]
    }));

    const results = getPublicExpressions(entries);
    expect(results).toHaveLength(55);
  });
});
