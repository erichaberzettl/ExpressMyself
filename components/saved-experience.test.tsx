import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaveExpressionButton } from "@/components/save-expression-button";
import { SavedExperience } from "@/components/saved-experience";
import { getExpressionsByIds } from "@/lib/expressions";

describe("SavedExperience", () => {
  it("shows the empty state when nothing is saved", () => {
    render(<SavedExperience loadExpressionsByIds={async (ids) => getExpressionsByIds(ids)} />);

    expect(screen.getByText("No saved phrases yet")).toBeInTheDocument();
  });

  it("renders saved expressions from local storage", async () => {
    window.localStorage.setItem("express-myself-saved-ids", JSON.stringify(["en-break-a-leg"]));

    render(<SavedExperience loadExpressionsByIds={async (ids) => getExpressionsByIds(ids)} />);

    await waitFor(() => {
      expect(screen.getByText("Break a leg")).toBeInTheDocument();
    });
  });

  it("keeps a newly saved phrase visible after navigating to the saved page", async () => {
    const user = userEvent.setup();
    render(<SaveExpressionButton expressionId="en-break-a-leg" />);

    await user.click(screen.getByRole("button", { name: "Save phrase" }));

    render(<SavedExperience loadExpressionsByIds={async (ids) => getExpressionsByIds(ids)} />);

    await waitFor(() => {
      expect(screen.getByText("Break a leg")).toBeInTheDocument();
    });
  });

  it("shows the export menu on the saved page", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("express-myself-saved-ids", JSON.stringify(["en-break-a-leg"]));

    render(<SavedExperience loadExpressionsByIds={async (ids) => getExpressionsByIds(ids)} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Export shelf" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Export shelf" }));

    expect(screen.getByRole("menu", { name: "Export saved format" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "CSV" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "TSV" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Markdown (.md)" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "JSON" })).toBeInTheDocument();
  });
});
