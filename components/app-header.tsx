"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContentTypeToggleGroup } from "@/components/content-type-toggle-group";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ExpressionContentType, LanguageCode } from "@/lib/types";
import styles from "./app-header.module.css";

type AppHeaderProps = {
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  selectedContentTypes: ExpressionContentType[];
  onToggleContentType: (contentType: ExpressionContentType) => void;
  phraseCount?: number;
};

const navigationItems = [
  { href: "/saved", label: "Saved" },
  { href: "/library", label: "Browse library" }
];

export function AppHeader({
  language,
  onLanguageChange,
  selectedContentTypes,
  onToggleContentType,
  phraseCount
}: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <section className={styles.banner}>
      <Link className={styles.brand} href="/" aria-label="Go to the ExpressMyself home page">
        <span className={styles.bannerEyebrow}>Phrase deck</span>
        <strong className={styles.bannerTitle}>ExpressMyself</strong>
      </Link>

      <div className={styles.controls}>
        <div className={styles.controlCluster}>
          <LanguageSwitcher value={language} onChange={onLanguageChange} />
          <ContentTypeToggleGroup
            compact
            selectedContentTypes={selectedContentTypes}
            onToggle={onToggleContentType}
          />
          {typeof phraseCount === "number" ? (
            <span className={styles.count}>{phraseCount} phrases</span>
          ) : null}
        </div>

        <nav className={styles.nav} aria-label="Primary">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/saved"
                ? pathname === "/saved"
                : pathname === "/library" || pathname?.startsWith("/library/");

            return (
              <Link
                key={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
