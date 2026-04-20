import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryExperience } from "@/components/library-experience";

describe("LibraryExperience", () => {
  it("filters results from the search input", async () => {
    const user = userEvent.setup();
    render(<LibraryExperience />);

    const input = screen.getByPlaceholderText("Try “break a leg” or “daily-life”");
    await user.clear(input);
    await user.type(input, "under the weather");

    expect(screen.getByText("Under the weather")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 12 expressions.")).toBeInTheDocument();
  });
});
