"use client";

import { AppHeader } from "@/components/app-header";
import { LanguageCode } from "@/lib/types";
import { usePersistedLanguage } from "@/lib/use-persisted-language";
import { useExtensionSettings } from "@/lib/use-extension-settings";
import styles from "./settings-experience.module.css";

type SettingsExperienceProps = {
  initialLanguage?: LanguageCode;
};

export function SettingsExperience({ initialLanguage = "en" }: SettingsExperienceProps) {
  const [language, setLanguage] = usePersistedLanguage(initialLanguage, {
    skipHydrationRead: initialLanguage !== "en"
  });
  const { hideMeaning, setHideMeaning, reminder, setReminder, hasLoaded } = useExtensionSettings();

  return (
    <main className={styles.page}>
      <AppHeader language={language} onLanguageChange={setLanguage} />

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Settings</p>
          <h1>Make it yours.</h1>
          <p>These preferences apply to the ExpressMyself browser extension.</p>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.rowText}>
          <h2>Quiz the daily phrase</h2>
          <p>Hide the meaning on the daily card until you reveal it, so each open is a quick self-test.</p>
        </div>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={hideMeaning}
            disabled={!hasLoaded}
            onChange={(event) => setHideMeaning(event.target.checked)}
          />
          <span className={styles.slider} aria-hidden="true" />
          <span className={styles.switchLabel}>{hideMeaning ? "On" : "Off"}</span>
        </label>
      </section>

      <section className={styles.card}>
        <div className={styles.rowText}>
          <h2>Daily reminder</h2>
          <p>Get a notification each day so you don&apos;t break your streak.</p>
        </div>
        <div className={styles.reminderControls}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={reminder.enabled}
              disabled={!hasLoaded}
              onChange={(event) => setReminder({ ...reminder, enabled: event.target.checked })}
            />
            <span className={styles.slider} aria-hidden="true" />
            <span className={styles.switchLabel}>{reminder.enabled ? "On" : "Off"}</span>
          </label>
          {reminder.enabled ? (
            <label className={styles.timeField}>
              <span>Remind me at</span>
              <input
                type="time"
                value={reminder.time}
                onChange={(event) => setReminder({ ...reminder, time: event.target.value || "09:00" })}
              />
            </label>
          ) : null}
        </div>
      </section>
    </main>
  );
}
