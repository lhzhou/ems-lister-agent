import { describe, expect, test } from "bun:test";
import { formatDateTime, formatRelativeTime } from "@/src/components/Form";

describe("Form View helpers", () => {
  test("formatDateTime keeps empty as dash", () => {
    expect(formatDateTime()).toBe("—");
    expect(formatDateTime("2024-03-12 14:32:00")).toBe("2024-03-12 14:32");
  });

  test("formatRelativeTime uses just now for recent timestamps", () => {
    expect(formatRelativeTime()).toBe("—");
    expect(formatRelativeTime(new Date().toISOString())).toBe("刚刚");
  });
});
