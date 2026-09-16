import { describe, expect, test } from "bun:test";
import { formatElapsedHours } from "./elapsed-hours";

describe("formatElapsedHours", () => {
  test("keeps short durations in hours", () => {
    expect(formatElapsedHours(5)).toBe("5小时");
  });

  test("shows day breakdown after 24 hours", () => {
    expect(formatElapsedHours(52)).toBe("52小时 / 2天4小时");
    expect(formatElapsedHours(48)).toBe("48小时 / 2天");
  });

  test("shows month breakdown after 30 days", () => {
    expect(formatElapsedHours(800)).toBe("800小时 / 1月3天8小时");
  });
});
