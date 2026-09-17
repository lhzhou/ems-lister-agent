export const CONTROL_SIZES = ["small", "middle", "large"] as const;

export type AppControlSize = (typeof CONTROL_SIZES)[number];

export function parseControlSize(value?: string): AppControlSize {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "small" || normalized === "middle" || normalized === "large") {
    return normalized;
  }
  return "large";
}

export const CONTROL_SIZE = parseControlSize(
  (import.meta as { env?: { VITE_FORM_CONTROL_SIZE?: string } }).env?.VITE_FORM_CONTROL_SIZE,
);
