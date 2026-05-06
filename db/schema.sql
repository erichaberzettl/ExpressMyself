CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  native_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expressions (
  id TEXT PRIMARY KEY,
  language_code TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  expression TEXT NOT NULL,
  literal_translation TEXT,
  meaning TEXT NOT NULL,
  usage_note TEXT NOT NULL,
  example_sentence TEXT NOT NULL,
  example_translation TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  source TEXT NOT NULL DEFAULT 'curated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expressions_language_code_idx ON expressions(language_code);
CREATE INDEX IF NOT EXISTS expressions_expression_idx ON expressions(expression);
