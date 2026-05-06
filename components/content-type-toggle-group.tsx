"use client";

import { useEffect, useRef, useState } from "react";
import {
  expressionContentTypes,
  getExpressionContentTypeLabel
} from "@/lib/expression-content";
import { ExpressionContentType } from "@/lib/types";
import styles from "./content-type-toggle-group.module.css";

type ContentTypeToggleGroupProps = {
  selectedContentTypes: ExpressionContentType[];
  onToggle: (contentType: ExpressionContentType) => void;
  compact?: boolean;
};

export function ContentTypeToggleGroup({
  selectedContentTypes,
  onToggle,
  compact = false
}: ContentTypeToggleGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className={`${styles.group} ${compact ? styles.compact : ""}`}
      ref={containerRef}
    >
      {!compact ? <span className={styles.label}>Show</span> : null}
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Choose categories"
        className={styles.trigger}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className={styles.triggerIcon}>
          🗂️
        </span>
        {!compact ? <span className={styles.triggerText}>Categories</span> : null}
      </button>

      {isOpen ? (
        <div className={styles.menu} role="dialog" aria-label="Category settings">
          <p className={styles.menuTitle}>Show categories</p>
          <div className={styles.options}>
            {expressionContentTypes.map((contentType) => {
              const label = getExpressionContentTypeLabel(contentType);
              const isChecked = selectedContentTypes.includes(contentType);

              return (
                <label className={styles.option} key={contentType}>
                  <input
                    checked={isChecked}
                    onChange={() => onToggle(contentType)}
                    type="checkbox"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
