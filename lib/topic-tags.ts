import { ExpressionEntry } from "./types";

export const canonicalTopicTags = [
  "work",
  "daily-life",
  "communication",
  "confidence",
  "confusion",
  "mistakes",
  "money",
  "encouragement",
  "health",
  "learning",
  "motivation",
  "personality",
  "study",
  "boundaries",
  "decision-making",
  "efficiency",
  "emotion",
  "humor",
  "performance",
  "secrets",
  "time"
] as const;

export type CanonicalTopicTag = (typeof canonicalTopicTags)[number];

const canonicalTopicTagSet = new Set<string>(canonicalTopicTags);
const tagPriority = new Map(canonicalTopicTags.map((tag, index) => [tag, index]));

const tagLabels: Record<CanonicalTopicTag, string> = {
  work: "Work",
  "daily-life": "Daily life",
  communication: "Communication",
  confidence: "Confidence",
  confusion: "Confusion",
  mistakes: "Mistakes",
  money: "Money",
  encouragement: "Encouragement",
  health: "Health",
  learning: "Learning",
  motivation: "Motivation",
  personality: "Personality",
  study: "Study",
  boundaries: "Boundaries",
  "decision-making": "Decision making",
  efficiency: "Efficiency",
  emotion: "Emotion",
  humor: "Humor",
  performance: "Performance",
  secrets: "Secrets",
  time: "Time"
};

const strippedMetadataTags = new Set([
  "idiom",
  "colloquialism",
  "word",
  "imported",
  "wiktionary"
]);

const topicInferenceRules: Array<{
  tag: CanonicalTopicTag;
  keywords: string[];
}> = [
  {
    tag: "work",
    keywords: [
      "job",
      "office",
      "meeting",
      "manager",
      "deadline",
      "client",
      "project",
      "career",
      "work"
    ]
  },
  {
    tag: "daily-life",
    keywords: [
      "home",
      "family",
      "routine",
      "everyday",
      "daily",
      "life",
      "day",
      "house",
      "social"
    ]
  },
  {
    tag: "communication",
    keywords: [
      "say",
      "speak",
      "talk",
      "explain",
      "tell",
      "conversation",
      "point",
      "comment",
      "message"
    ]
  },
  {
    tag: "confidence",
    keywords: ["easy", "certain", "sure", "control", "strong", "confident", "capable"]
  },
  {
    tag: "confusion",
    keywords: ["confusing", "confused", "unclear", "not understand", "understand nothing", "lost"]
  },
  {
    tag: "mistakes",
    keywords: ["mistake", "wrong", "problem", "trouble", "critic", "awkward", "failure"]
  },
  {
    tag: "money",
    keywords: ["money", "expensive", "cheap", "cost", "price", "fortune", "financial"]
  },
  {
    tag: "encouragement",
    keywords: ["good luck", "luck", "supportive", "wish someone luck", "cheer", "fingers crossed"]
  },
  {
    tag: "health",
    keywords: ["sick", "ill", "health", "tired", "exhausted", "energy", "unwell"]
  },
  {
    tag: "learning",
    keywords: ["learn", "practice", "skill", "understand", "figure out", "new to this"]
  },
  {
    tag: "motivation",
    keywords: ["effort", "push", "focus", "get moving", "motivated", "extra mile"]
  },
  {
    tag: "personality",
    keywords: ["personality", "direct", "stubborn", "character", "attitude", "type of person"]
  },
  {
    tag: "study",
    keywords: ["study", "exam", "test", "books", "school", "class", "interview"]
  },
  {
    tag: "boundaries",
    keywords: ["not my problem", "responsibility", "distance yourself", "leave me out", "boundary"]
  },
  {
    tag: "decision-making",
    keywords: ["decide", "choice", "choose", "judgment", "option"]
  },
  {
    tag: "efficiency",
    keywords: ["efficient", "two things", "solve two", "at once", "short cut", "practical"]
  },
  {
    tag: "emotion",
    keywords: ["emotion", "feel", "angry", "sad", "upset", "excited", "daydreaming"]
  },
  {
    tag: "humor",
    keywords: ["joke", "tease", "playful", "funny", "laugh", "humor"]
  },
  {
    tag: "performance",
    keywords: ["performance", "stage", "audition", "show", "present", "on stage"]
  },
  {
    tag: "secrets",
    keywords: ["secret", "surprise", "reveal", "spilled the beans", "hidden"]
  },
  {
    tag: "time",
    keywords: ["time", "late", "today", "schedule", "for now", "timing"]
  }
];

function uniquePreservingOrder(values: string[]) {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const value of values) {
    if (seen.has(value)) {
      continue;
    }

    seen.add(value);
    ordered.push(value);
  }

  return ordered;
}

export function isPublicTopicTag(tag: string): tag is CanonicalTopicTag {
  return canonicalTopicTagSet.has(tag);
}

export function getTopicTagLabel(tag: CanonicalTopicTag): string {
  return tagLabels[tag];
}

function inferTopicTags(entry: ExpressionEntry): CanonicalTopicTag[] {
  const searchableText = [
    entry.expression,
    entry.meaning,
    entry.usageNote,
    entry.exampleSentence,
    entry.exampleTranslation
  ]
    .join(" ")
    .toLowerCase();

  const scoredTopics = topicInferenceRules
    .map(({ tag, keywords }) => ({
      tag,
      score: keywords.reduce(
        (total, keyword) => total + (searchableText.includes(keyword.toLowerCase()) ? 1 : 0),
        0
      )
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return (tagPriority.get(left.tag) ?? 0) - (tagPriority.get(right.tag) ?? 0);
    })
    .map((item) => item.tag);

  return scoredTopics.slice(0, 3);
}

export function normalizeEntryTags(entry: ExpressionEntry): CanonicalTopicTag[] {
  const cleanedTags = uniquePreservingOrder(
    entry.tags
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .filter((tag) => !strippedMetadataTags.has(tag))
      .filter(isPublicTopicTag)
  );

  const combinedTags = cleanedTags.length > 0 ? cleanedTags : inferTopicTags(entry);

  return combinedTags.slice(0, 3) as CanonicalTopicTag[];
}

export function normalizeExpressionEntry(entry: ExpressionEntry): ExpressionEntry {
  return {
    ...entry,
    tags: normalizeEntryTags(entry)
  };
}

export function getVisibleTopicTags(entries: ExpressionEntry[], limit = 8): CanonicalTopicTag[] {
  const counts = new Map<CanonicalTopicTag, number>();

  for (const entry of entries) {
    for (const tag of normalizeEntryTags(entry)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return (tagPriority.get(left[0]) ?? 0) - (tagPriority.get(right[0]) ?? 0);
    })
    .slice(0, limit)
    .map(([tag]) => tag);
}
