const TRACKING_PARAMETERS = new Set(["mailNo", "packageId", "filter"]);

/** Removes tracking and sensitive parameters before a location becomes a persisted tab. */
export function normalizeTabLocation(pathname: string, search = ""): string {
  const params = new URLSearchParams(search);
  for (const key of params.keys()) {
    if (!TRACKING_PARAMETERS.has(key)) params.delete(key);
  }
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const normalizedSearch = params.toString();
  return normalizedSearch ? `${normalizedPath}?${normalizedSearch}` : normalizedPath;
}
