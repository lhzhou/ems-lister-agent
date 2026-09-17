const TRACKING_PARAMETERS = new Set(["utm_source", "utm_medium", "utm_campaign", "_reload"]);

export function canonicalizePathname(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "/dashboard";
  if (path === "/tracking") return "/orders";
  return path;
}

/** Keeps pathname plus page-declared search; drops tracking/reload noise. */
export function normalizeTabLocation(pathname: string, search = ""): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  for (const key of TRACKING_PARAMETERS) params.delete(key);
  const normalizedPath = canonicalizePathname(pathname);
  const normalizedSearch = params.toString();
  return normalizedSearch ? `${normalizedPath}?${normalizedSearch}` : normalizedPath;
}
