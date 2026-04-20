import { filterExpressions, getDailyExpression, getDailyExpressionAtOffset } from "@/lib/expressions";

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
});
