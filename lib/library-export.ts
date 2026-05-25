import { ExpressionEntry, LanguageCode } from "@/lib/types";
import { languagesByCode } from "@/lib/languages";

export type LibraryExportFormat = "csv" | "tsv" | "markdown" | "json";

const libraryExportFormats: LibraryExportFormat[] = ["csv", "tsv", "markdown", "json"];

type BasicExportEntry = {
  language: LanguageCode;
  expression: string;
  meaning: string;
};

function escapeCell(value: string, delimiter: string): string {
  const needsQuotes =
    value.includes('"') || value.includes("\n") || value.includes("\r") || value.includes(delimiter);

  if (!needsQuotes) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

function buildDelimitedExport(entries: BasicExportEntry[], delimiter: string): string {
  const header = ["language", "expression", "meaning"].join(delimiter);

  const rows = entries.map((entry) =>
    [entry.language, entry.expression, entry.meaning]
      .map((value) => escapeCell(value, delimiter))
      .join(delimiter)
  );

  return [header, ...rows].join("\n");
}

function buildMarkdownExport(entries: BasicExportEntry[]): string {
  const header = [
    "| Language | Expression | Meaning |",
    "| --- | --- | --- |"
  ];

  const rows = entries.map((entry) => {
    const cells = [entry.language, entry.expression, entry.meaning].map((value) =>
      value.replaceAll("|", "\\|").replaceAll("\n", " ")
    );

    return `| ${cells.join(" | ")} |`;
  });

  return [...header, ...rows].join("\n");
}

function buildJsonExport(entries: BasicExportEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function getLibraryExportFilename(
  language: LanguageCode,
  format: LibraryExportFormat
): string {
  const languageLabel = languagesByCode[language]?.label.toLowerCase().replaceAll(" ", "-") ?? language;
  return `express-myself-${languageLabel}-library.${format === "markdown" ? "md" : format}`;
}

export function getSavedShelfExportFilename(
  language: LanguageCode,
  format: LibraryExportFormat
): string {
  const languageLabel = languagesByCode[language]?.label.toLowerCase().replaceAll(" ", "-") ?? language;
  return `express-myself-${languageLabel}-saved.${format === "markdown" ? "md" : format}`;
}

export function serializeLibraryEntries(
  entries: BasicExportEntry[],
  format: LibraryExportFormat
): string {
  switch (format) {
    case "csv":
      return buildDelimitedExport(entries, ",");
    case "tsv":
      return buildDelimitedExport(entries, "\t");
    case "markdown":
      return buildMarkdownExport(entries);
    case "json":
      return buildJsonExport(entries);
  }
}

export function getLibraryExportFormats(): LibraryExportFormat[] {
  return libraryExportFormats;
}
