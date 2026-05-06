import { expressions, rawExpressions } from "@/lib/content";
import { canonicalTopicTags, isPublicTopicTag, normalizeEntryTags } from "@/lib/topic-tags";

function countTags(entries: typeof rawExpressions) {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    for (const tag of entry.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

function main() {
  const rawTagCounts = countTags(rawExpressions);
  const normalizedTagCounts = countTags(expressions);
  const cardsWithNoTags = expressions.filter((entry) => entry.tags.length === 0);
  const cardsWithTooManyTags = expressions.filter((entry) => entry.tags.length > 3);
  const cardsWithNonCanonicalTags = expressions.filter((entry) =>
    entry.tags.some((tag) => !isPublicTopicTag(tag))
  );

  console.log("Raw visible tag counts:");
  console.log(rawTagCounts.map(([tag, count]) => `${count}\t${tag}`).join("\n") || "(none)");

  console.log("\nNormalized public tag counts:");
  console.log(normalizedTagCounts.map(([tag, count]) => `${count}\t${tag}`).join("\n") || "(none)");

  console.log("\nCards with no public topic tags:");
  console.log(cardsWithNoTags.map((entry) => `${entry.language}\t${entry.id}\t${entry.expression}`).join("\n") || "(none)");

  console.log("\nCards with too many public topic tags:");
  console.log(
    cardsWithTooManyTags.map((entry) => `${entry.language}\t${entry.id}\t${entry.expression}\t${entry.tags.join(", ")}`).join("\n") ||
      "(none)"
  );

  console.log("\nCards with non-canonical public tags:");
  console.log(
    cardsWithNonCanonicalTags
      .map((entry) => `${entry.language}\t${entry.id}\t${entry.expression}\t${entry.tags.join(", ")}`)
      .join("\n") || "(none)"
  );

  console.log("\nPer-language topic coverage:");
  for (const language of [...new Set(expressions.map((entry) => entry.language))]) {
    const languageEntries = expressions.filter((entry) => entry.language === language);
    const coverage = canonicalTopicTags
      .map((tag) => [tag, languageEntries.filter((entry) => normalizeEntryTags(entry).includes(tag)).length] as const)
      .filter(([, count]) => count > 0)
      .map(([tag, count]) => `${tag}:${count}`)
      .join(", ");

    console.log(`${language}\t${languageEntries.length}\t${coverage || "(no tags)"}`);
  }
}

main();
