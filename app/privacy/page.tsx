export default function PrivacyPage() {
  return (
    <main>
      <section style={{ padding: "4rem 0 2rem" }}>
        <div style={{ maxWidth: "42rem" }}>
          <p
            style={{
              color: "var(--accent)",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              margin: "0 0 0.75rem",
              textTransform: "uppercase"
            }}
          >
            Privacy Policy
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 0.95, margin: 0 }}>
            ExpressMyself
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.6, margin: "1rem 0 0" }}>
            ExpressMyself is a lightweight language-learning app and Chrome extension for browsing
            idioms, expressions, and everyday phrases.
          </p>

          <div style={{ display: "grid", gap: "1.25rem", marginTop: "2rem" }}>
            <section>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
                What data the extension stores
              </h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                The Chrome extension stores only your selected language and the list of expressions
                you save for later review. This information is stored locally in your browser using
                Chrome extension storage.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
                What data the extension does not collect
              </h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                ExpressMyself does not collect account information, names, email addresses, payment
                information, browsing history, page contents, keystrokes, or location data.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
                Data sharing
              </h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                ExpressMyself does not sell, transfer, or share personal data with third parties.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
                Remote services
              </h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                The extension does not require a backend service to function and does not send
                saved-expression data to a remote server.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
                Contact
              </h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                For support, updates, and feedback, write to{" "}
                <a href="mailto:expressmyselflabs@gmail.com">expressmyselflabs@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
