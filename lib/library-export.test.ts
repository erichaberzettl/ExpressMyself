import { describe, expect, it } from "vitest";
import { getExpressionsForLanguage } from "@/lib/expressions";
import { getSavedShelfExportFilename, serializeLibraryEntries } from "@/lib/library-export";

describe("saved export helpers", () => {
  it("serializes entries as CSV, TSV, Markdown, and JSON", () => {
    const entries = getExpressionsForLanguage("en").slice(0, 1).map((entry) => ({
      language: entry.language,
      expression: entry.expression,
      meaning: entry.meaning
    }));

    expect(serializeLibraryEntries(entries, "csv")).toContain("language,expression,meaning");
    expect(serializeLibraryEntries(entries, "tsv")).toContain("language\texpression\tmeaning");
    expect(serializeLibraryEntries(entries, "markdown")).toContain("| Language | Expression | Meaning |");
    expect(JSON.parse(serializeLibraryEntries(entries, "json"))).toHaveLength(1);
  });

  it("builds a language-aware filename", () => {
    expect(getSavedShelfExportFilename("en", "csv")).toBe("express-myself-english-saved.csv");
    expect(getSavedShelfExportFilename("sv", "markdown")).toBe("express-myself-swedish-saved.md");
  });
});
