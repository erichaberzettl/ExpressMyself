import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExpressMyself",
  description: "Learn useful expressions and everyday phrases across languages.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    apple: "/icon.png",
    shortcut: "/favicon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">{children}</div>
        <footer className="site-footer" aria-label="Site footer">
          <a className="site-footer-contact" href="mailto:expressmyselflabs@gmail.com">
            Contact
          </a>
        </footer>
      </body>
    </html>
  );
}
