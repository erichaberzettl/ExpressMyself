import React from "react";

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

function mapHref(href: string): string {
  if (href === "/") {
    return "./app.html?route=/";
  }

  if (href === "/library") {
    return "./app.html?route=%2Flibrary";
  }

  if (href === "/saved") {
    return "./app.html?route=%2Fsaved";
  }

  if (href.startsWith("/expression/")) {
    return `./app.html?route=${encodeURIComponent(href)}`;
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
