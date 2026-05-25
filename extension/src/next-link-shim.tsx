import React from "react";

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

const WEB_APP_BASE_URL = "http://localhost:3000";

function mapHref(href: string): string {
  const url = new URL(WEB_APP_BASE_URL);

  if (href === "/") {
    return url.toString();
  }

  if (href === "/library") {
    url.pathname = "/library";
    return url.toString();
  }

  if (href === "/saved") {
    url.pathname = "/saved";
    return url.toString();
  }

  if (href.startsWith("/expression/")) {
    url.pathname = href;
    return url.toString();
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
