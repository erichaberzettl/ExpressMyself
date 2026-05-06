import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryExperience } from "@/components/library-experience";
import { getExpressionsForLanguage } from "@/lib/expressions";
import { ExpressionEntry } from "@/lib/types";

describe("LibraryExperience", () => {
  it("filters results from the search input", async () => {
    const user = userEvent.setup();
    const englishExpressions = getExpressionsForLanguage("en");
    render(
      <LibraryExperience
        initialExpressions={englishExpressions}
        loadExpressions={async () => englishExpressions}
      />
    );

    const input = screen.getByPlaceholderText("Try “break a leg” or “daily-life”");
    await user.clear(input);
    await user.type(input, "under the weather");

    expect(screen.getByText("Under the weather")).toBeInTheDocument();
    expect(
      screen.getByText(`Showing 1 of ${englishExpressions.length} expressions.`)
    ).toBeInTheDocument();
  });

  it("lets users combine category toggles", async () => {
    const user = userEvent.setup();
    const entries: ExpressionEntry[] = [
      {
        id: "en-idiom",
        language: "en",
        expression: "Break a leg",
        meaning: "Good luck before a performance.",
        usageNote: "Say it before someone goes on stage.",
        exampleSentence: "Break a leg tonight.",
        exampleTranslation: "Good luck tonight.",
        difficulty: "basic",
        tags: ["performance"],
        contentType: "idiom"
      },
      {
        id: "en-colloquial",
        language: "en",
        expression: "No worries",
        meaning: "It is fine; do not worry about it.",
        usageNote: "Use it in casual speech.",
        exampleSentence: "No worries, I can handle it.",
        exampleTranslation: "It is fine, I can handle it.",
        difficulty: "basic",
        tags: ["informal"],
        contentType: "colloquialism"
      },
      {
        id: "en-word",
        language: "en",
        expression: "Airheaded",
        meaning: "Silly or absent-minded.",
        usageNote: "Use it for someone acting a bit foolish.",
        exampleSentence: "That comment sounded airheaded.",
        exampleTranslation: "That comment sounded silly.",
        difficulty: "intermediate",
        tags: ["personality"],
        contentType: "word"
      }
    ];

    render(<LibraryExperience initialExpressions={entries} loadExpressions={async () => entries} />);

    await user.click(screen.getByRole("button", { name: "Choose categories" }));
    await user.click(screen.getByRole("checkbox", { name: "Idioms" }));

    expect(screen.queryByText("Break a leg")).not.toBeInTheDocument();
    expect(screen.getByText("No worries")).toBeInTheDocument();
    expect(screen.getByText("Airheaded")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Idioms" }));

    expect(screen.getByText("Break a leg")).toBeInTheDocument();
    expect(screen.getByText("No worries")).toBeInTheDocument();
    expect(screen.getByText("Airheaded")).toBeInTheDocument();
  });
});
