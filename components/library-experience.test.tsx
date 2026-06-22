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

  it("filters results by topic", async () => {
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
        tags: ["performance"]
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
        tags: ["humor"]
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
        tags: ["personality"]
      }
    ];

    render(<LibraryExperience initialExpressions={entries} loadExpressions={async () => entries} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Topic" }), "performance");

    expect(screen.getByText("Break a leg")).toBeInTheDocument();
    expect(screen.queryByText("No worries")).not.toBeInTheDocument();
    expect(screen.queryByText("Airheaded")).not.toBeInTheDocument();
  });

  it("shows a locked full-library download menu", async () => {
    const user = userEvent.setup();
    const previousPurchaseUrl = process.env.NEXT_PUBLIC_LIBRARY_DOWNLOAD_PURCHASE_URL;
    process.env.NEXT_PUBLIC_LIBRARY_DOWNLOAD_PURCHASE_URL = "https://buy.stripe.com/test";
    const englishExpressions = getExpressionsForLanguage("en");

    render(
      <LibraryExperience
        initialExpressions={englishExpressions}
        loadExpressions={async () => englishExpressions}
      />
    );

    await user.click(screen.getByRole("button", { name: /full library download/i }));

    expect(screen.getByRole("menu", { name: "Locked library download" })).toBeInTheDocument();
    expect(screen.queryByText("The full database export stays behind the upgrade wall.")).toBeNull();
    expect(screen.getByRole("link", { name: "Unlock with Stripe Payment Links" })).toHaveAttribute(
      "href",
      "https://buy.stripe.com/test"
    );

    process.env.NEXT_PUBLIC_LIBRARY_DOWNLOAD_PURCHASE_URL = previousPurchaseUrl;
  });
});
