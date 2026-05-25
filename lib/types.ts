export const supportedLanguages = ["en", "es", "fr", "de", "pt", "it", "nl", "sv", "da", "pl"] as const;

export type LanguageCode = (typeof supportedLanguages)[number];

export type ExpressionDifficulty = "basic" | "intermediate";

export type ExpressionEntry = {
  id: string;
  language: LanguageCode;
  expression: string;
  literalTranslation?: string;
  meaning: string;
  usageNote: string;
  exampleSentence: string;
  exampleTranslation: string;
  difficulty: ExpressionDifficulty;
  tags: string[];
};

export type ExpressionFilter = {
  language: LanguageCode;
  query?: string;
  tag?: string;
};
