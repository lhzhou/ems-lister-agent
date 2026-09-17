import { describe, expect, test } from "bun:test";
import { formatDuration, formatDurationFromTime } from "@/src/lib/duration";

describe("formatDuration", () => {
  test("returns dash for missing values", () => {
    expect(formatDuration(undefined)).toBe("-");
    expect(formatDuration(null)).toBe("-");
    expect(formatDuration(-1)).toBe("-");
  });

  test("hours style always returns x小时", () => {
    expect(formatDuration(5, "hours")).toBe("5小时");
    expect(formatDuration(52, "hours")).toBe("52小时");
    expect(formatDuration(48, "hours")).toBe("48小时");
  });

  test("auto style uses hours, then days, then years", () => {
    expect(formatDuration(5)).toBe("5小时");
    expect(formatDuration(52)).toBe("2天4小时");
    expect(formatDuration(48)).toBe("2天");
    expect(formatDuration(365 * 24)).toBe("1年");
    expect(formatDuration(365 * 24 + 3 * 24 + 8)).toBe("1年3天8小时");
  });
});

describe("formatDurationFromTime", () => {
  test("uses the same auto style as current elapsed hours", () => {
    expect(formatDurationFromTime(undefined, 25)).toBe("1天1小时");
    expect(formatDurationFromTime(undefined, 43)).toBe("1天19小时");
    expect(formatDurationFromTime(undefined, 24)).toBe("1天");
  });
});
