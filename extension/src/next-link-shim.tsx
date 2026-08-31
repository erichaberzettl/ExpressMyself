import React from "react";

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

// Inside the extension, keep navigation on the bundled app.html page so the
// saved shelf and language preference stay in sync with the popup (both use
// chrome.storage.local). The external website is a separate origin with its
// own storage, so linking out there would show a different, unsynced shelf.
function mapHref(href: string): string {
  if (href === "/") {
    return "app.html?view=daily";
  }

  if (href === "/library") {
    return "app.html?view=library";
  }

  if (href === "/saved") {
    return "app.html?view=saved";
  }

  if (href.startsWith("/expression/")) {
    const params = new URLSearchParams({ route: href });
    return `app.html?${params.toString()}`;
  }

  return href;
}

export default function Link({ href, children, ...props }: LinkProps) {
  return (
    <a href={mapHref(href)} {...props}>
      {children}
    </a>
  );
}
