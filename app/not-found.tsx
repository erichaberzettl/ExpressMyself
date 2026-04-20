import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Not found</p>
        <h1>That expression slipped away.</h1>
        <p>
          The page you opened does not match one of the curated expressions in this version of
          ExpressMyself.
        </p>
        <div className={styles.links}>
          <Link href="/">Go home</Link>
          <Link href="/library">Browse library</Link>
        </div>
      </div>
    </main>
  );
}

