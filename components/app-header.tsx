"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LanguageCode } from "@/lib/types";
import styles from "./app-header.module.css";

type AppHeaderProps = {
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  phraseCount?: number;
  bannerActionId?: string;
  bannerActionLabel?: string;
  bannerActionExpanded?: boolean;
  bannerActionMenu?: ReactNode;
  onBannerActionClick?: () => void;
};

const navigationItems = [
  { href: "/saved", label: "Saved" },
  { href: "/library", label: "Browse library" }
];

export function AppHeader({
  language,
  onLanguageChange,
  phraseCount,
  bannerActionId,
  bannerActionLabel,
  bannerActionExpanded,
  bannerActionMenu,
  onBannerActionClick
}: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <section className={styles.shell}>
      <div className={styles.banner}>
        <Link className={styles.brand} href="/" aria-label="Go to the ExpressMyself home page">
          <span className={styles.bannerEyebrow}>Phrase deck</span>
          <strong className={styles.bannerTitle}>ExpressMyself</strong>
        </Link>

        <div className={styles.controls}>
          <div className={styles.controlCluster}>
            <LanguageSwitcher value={language} onChange={onLanguageChange} />
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

          {bannerActionLabel && onBannerActionClick ? (
            <div className={styles.bannerAction} id={bannerActionId}>
              <button
                aria-expanded={bannerActionExpanded}
                aria-haspopup={bannerActionMenu ? "menu" : undefined}
                className={`${styles.navLink} ${bannerActionExpanded ? styles.navLinkActive : ""}`}
                onClick={onBannerActionClick}
                type="button"
              >
                {bannerActionLabel}
              </button>
              {bannerActionMenu ? (
                <div className={styles.bannerActionMenu}>{bannerActionMenu}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <aside className={styles.extensionPromo} aria-label="Chrome extension">
        <span className={styles.promoEyebrow}>Chrome extension</span>
        <strong>Practice from your toolbar.</strong>
        <p>Daily phrases, pronunciation, and saved expressions in one quick browser popup.</p>
        <a
          className={styles.extensionCta}
          href="https://chromewebstore.google.com/detail/expressmyself/gieddoeddmehjjhohopfoechkhdpipjo"
          rel="noreferrer"
          target="_blank"
        >
          Get the extension
        </a>
      </aside>
    </section>
  );
}
