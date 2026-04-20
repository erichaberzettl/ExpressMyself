"use client";

import { useSavedExpressions } from "@/lib/use-saved-expressions";
import styles from "./save-expression-button.module.css";

type SaveExpressionButtonProps = {
  expressionId: string;
  compact?: boolean;
};

export function SaveExpressionButton({ expressionId, compact = false }: SaveExpressionButtonProps) {
  const { isSaved, toggleSaved } = useSavedExpressions();
  const saved = isSaved(expressionId);

  return (
    <button
      className={`${styles.button} ${compact ? styles.compact : ""}`}
      onClick={() => toggleSaved(expressionId)}
      type="button"
    >
      {saved ? "Saved" : "Save phrase"}
    </button>
  );
}
