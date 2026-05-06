import {
  canonicalTopicTags,
  getVisibleTopicTags,
  normalizeEntryTags
} from "@/lib/topic-tags";

describe("topic tag normalization", () => {
  it("strips metadata tags and infers canonical learner topics", () => {
    const tags = normalizeEntryTags({
      id: "en-example",
      language: "en",
      expression: "Break a leg",
      meaning: "A friendly way to wish someone good luck.",
      usageNote: "Use it before a performance when you want to sound supportive.",
      exampleSentence: "Break a leg tonight.",
      exampleTranslation: "Good luck tonight.",
      difficulty: "basic",
      tags: ["idiom", "imported", "wiktionary"]
    });

    expect(tags).not.toContain("idiom");
    expect(tags).not.toContain("imported");
    expect(tags).not.toContain("wiktionary");
    expect(tags).toContain("encouragement");
  });

  it("never returns more than three visible topic tags", () => {
    const tags = normalizeEntryTags({
      id: "en-example",
      language: "en",
      expression: "Project crunch",
      meaning: "A stressful deadline at work that forces hard choices.",
      usageNote:
        "Use it for high-pressure office situations that require quick decisions and extra effort.",
      exampleSentence: "The project crunch made the whole team anxious.",
      exampleTranslation: "The deadline pressure made the whole team anxious.",
      difficulty: "intermediate",
      tags: []
    });

    expect(tags.length).toBeLessThanOrEqual(3);
    expect(tags.every((tag) => canonicalTopicTags.includes(tag))).toBe(true);
  });

  it("returns only top canonical topics for filter menus", () => {
    const tags = getVisibleTopicTags([
      {
        id: "one",
        language: "en",
        expression: "Break a leg",
        meaning: "Good luck before a performance.",
        usageNote: "Before a show.",
        exampleSentence: "Break a leg tonight.",
        exampleTranslation: "Good luck tonight.",
        difficulty: "basic",
        tags: ["encouragement", "performance"]
      },
      {
        id: "two",
        language: "en",
        expression: "On the same page",
        meaning: "To agree or understand in the same way.",
        usageNote: "Useful in meetings.",
        exampleSentence: "Let's stay on the same page.",
        exampleTranslation: "Let's agree.",
        difficulty: "basic",
        tags: ["communication", "work"]
      }
    ]);

    expect(tags).toEqual(["work", "communication", "encouragement", "performance"]);
  });
});
