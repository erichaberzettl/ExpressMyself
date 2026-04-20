import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExpressMyself",
  description: "Learn useful expressions, idioms, and everyday phrases across languages."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

