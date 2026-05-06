import {
  filterExpressions,
  getDailyExpression,
  getDailyExpressionAtOffsetFromEntries,
  getDailyExpressionAtOffset,
  getStableExpressionOrder
} from "@/lib/expressions";

describe("expression helpers", () => {
  it("returns a stable daily expression for the same date and language", () => {
    const date = new Date(Date.UTC(2026, 3, 19));

    expect(getDailyExpression("es", date).id).toBe(getDailyExpression("es", date).id);
  });

  it("filters by language, tag, and query together", () => {
    const result = filterExpressions({
      language: "en",
      tag: "work",
      query: "meeting"
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("en-on-the-same-page");
  });

  it("moves to the next expression when an offset is applied", () => {
    const date = new Date(Date.UTC(2026, 3, 19));
    const first = getDailyExpression("en", date);
    const next = getDailyExpressionAtOffset("en", 1, date);

    expect(next.id).not.toBe(first.id);
  });

  it("keeps the seeded daily expression stable for the same user on the same day", () => {
    const entries = [
      {
        id: "en-first",
        language: "en" as const,
        expression: "First",
        meaning: "First",
        usageNote: "First",
        exampleSentence: "First",
        exampleTranslation: "First",
        difficulty: "basic" as const,
        tags: ["work"]
      },
      {
        id: "en-second",
        language: "en" as const,
        expression: "Second",
        meaning: "Second",
        usageNote: "Second",
        exampleSentence: "Second",
        exampleTranslation: "Second",
        difficulty: "basic" as const,
        tags: ["work"]
      },
      {
        id: "en-third",
        language: "en" as const,
        expression: "Third",
        meaning: "Third",
        usageNote: "Third",
        exampleSentence: "Third",
        exampleTranslation: "Third",
        difficulty: "basic" as const,
        tags: ["work"]
      }
    ];
    const date = new Date(Date.UTC(2026, 3, 19));

    expect(getDailyExpressionAtOffsetFromEntries(entries, "en", 0, date, "user-a").id).toBe(
      getDailyExpressionAtOffsetFromEntries(entries, "en", 0, date, "user-a").id
    );
  });

  it("can rotate the daily expression differently for different saved-language users", () => {
    const entries = [
      {
        id: "en-first",
        language: "en" as const,
        expression: "First",
        meaning: "First",
        usageNote: "First",
        exampleSentence: "First",
        exampleTranslation: "First",
        difficulty: "basic" as const,
        tags: ["work"]
      },
      {
        id: "en-second",
        language: "en" as const,
        expression: "Second",
        meaning: "Second",
        usageNote: "Second",
        exampleSentence: "Second",
        exampleTranslation: "Second",
        difficulty: "basic" as const,
        tags: ["work"]
      },
      {
        id: "en-third",
        language: "en" as const,
        expression: "Third",
        meaning: "Third",
        usageNote: "Third",
        exampleSentence: "Third",
        exampleTranslation: "Third",
        difficulty: "basic" as const,
        tags: ["work"]
      }
    ];
    const date = new Date(Date.UTC(2026, 3, 19));
    const seededIds = new Set(
      ["user-a", "user-b", "user-c", "user-d", "user-e"].map((seed) =>
        getDailyExpressionAtOffsetFromEntries(entries, "en", 0, date, seed).id
      )
    );

    expect(seededIds.size).toBeGreaterThan(1);
  });

  it("keeps a fixed shuffled order instead of alphabetical order", () => {
    const entries = [
      {
        id: "en-zebra",
        language: "en" as const,
        expression: "Zebra",
        meaning: "Zebra",
        usageNote: "Zebra",
        exampleSentence: "Zebra",
        exampleTranslation: "Zebra",
        difficulty: "basic" as const,
        tags: []
      },
      {
        id: "en-apple",
        language: "en" as const,
        expression: "Apple",
        meaning: "Apple",
        usageNote: "Apple",
        exampleSentence: "Apple",
        exampleTranslation: "Apple",
        difficulty: "basic" as const,
        tags: []
      },
      {
        id: "en-middle",
        language: "en" as const,
        expression: "Middle",
        meaning: "Middle",
        usageNote: "Middle",
        exampleSentence: "Middle",
        exampleTranslation: "Middle",
        difficulty: "basic" as const,
        tags: []
      }
    ];

    const firstOrder = getStableExpressionOrder(entries).map((entry) => entry.id);
    const secondOrder = getStableExpressionOrder(entries).map((entry) => entry.id);

    expect(firstOrder).toEqual(secondOrder);
    expect(firstOrder).not.toEqual(["en-apple", "en-middle", "en-zebra"]);
  });

  it("places curated entries before imported entries while keeping a stable order", () => {
    const entries = [
      {
        id: "en-imported",
        language: "en" as const,
        expression: "Imported entry",
        meaning: "Imported entry",
        usageNote: "Imported entry",
        exampleSentence: "Imported entry",
        exampleTranslation: "Imported entry",
        difficulty: "basic" as const,
        tags: ["imported"]
      },
      {
        id: "en-curated",
        language: "en" as const,
        expression: "Curated entry",
        meaning: "Curated entry",
        usageNote: "Curated entry",
        exampleSentence: "Curated entry",
        exampleTranslation: "Curated entry",
        difficulty: "basic" as const,
        tags: ["work"]
      }
    ];

    const order = getStableExpressionOrder(entries).map((entry) => entry.id);
    expect(order).toEqual(["en-curated", "en-imported"]);
  });

  it("uses curated entries for the daily home rotation when they exist", () => {
    const date = new Date(Date.UTC(2026, 3, 19));
    const daily = getDailyExpressionAtOffsetFromEntries(
      [
        {
          id: "en-imported",
          language: "en" as const,
          expression: "Imported entry",
          meaning: "Imported entry",
          usageNote: "Imported entry",
          exampleSentence: "Imported entry",
          exampleTranslation: "Imported entry",
          difficulty: "basic" as const,
          tags: ["imported"]
        },
        {
          id: "en-curated",
          language: "en" as const,
          expression: "Curated entry",
          meaning: "Curated entry",
          usageNote: "Curated entry",
          exampleSentence: "Curated entry",
          exampleTranslation: "Curated entry",
          difficulty: "basic" as const,
          tags: ["work"]
        }
      ],
      "en",
      0,
      date
    );

    expect(daily.id).toBe("en-curated");
  });
});
