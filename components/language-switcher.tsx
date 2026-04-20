"use client";

import { LanguageCode } from "@/lib/types";
import { languages } from "@/lib/languages";
import styles from "./language-switcher.module.css";

type LanguageSwitcherProps = {
  value: LanguageCode;
  onChange: (language: LanguageCode) => void;
};

export function LanguageSwitcher({ value, onChange }: LanguageSwitcherProps) {
  return (
    <label className={styles.field} aria-label="Choose language">
      <span className={styles.icon} aria-hidden="true">
        🌐
      </span>
      <span className={styles.code}>{value.toUpperCase()}</span>
      <select
        aria-label="Language"
        value={value}
        onChange={(event) => onChange(event.target.value as LanguageCode)}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
