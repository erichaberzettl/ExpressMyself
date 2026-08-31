// Lightweight stand-in for next/navigation inside the extension bundle.
// The extension is a plain client-rendered SPA with no Next.js App Router, so
// pulling the real next/navigation (and its runtime) in is unnecessary weight
// and its hooks return null without a router context. We derive the current
// pathname from the app.html query params instead, so active-nav highlighting
// keeps working.
export function usePathname(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  const params = new URLSearchParams(window.location.search);
  const route = params.get("route");

  if (route) {
    return route;
  }

  const view = params.get("view");

  if (view === "library") {
    return "/library";
  }

  if (view === "saved") {
    return "/saved";
  }

  return "/";
}
