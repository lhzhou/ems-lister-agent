import { describe, expect, test } from "bun:test";
import {
  formatHourTick,
  formatTrendTick,
  hourlyTicks,
  parseTrendTime,
  toTrendSeriesRows,
  trendDayBounds,
} from "@/src/pages/dashboard/model/trend";

describe("parseTrendTime", () => {
  test("parses HH:mm against the stat date", () => {
    const date = parseTrendTime("09:00", "2026-09-16");
    expect(formatTrendTick(date)).toBe("09:00");
  });

  test("parses a full hour stamp", () => {
    const date = parseTrendTime("2026-09-16 21:20:00", "2026-09-16");
    expect(formatTrendTick(date)).toBe("21:20");
  });
});

describe("formatHourTick", () => {
  test("uses 00:00 then 1:00 style labels", () => {
    const start = trendDayBounds("2026-09-16").start;
    expect(hourlyTicks(start).map(formatHourTick)).toEqual([
      "00:00",
      "1:00",
      "2:00",
      "3:00",
      "4:00",
      "5:00",
      "6:00",
      "7:00",
      "8:00",
      "9:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
    ]);
  });
});

describe("toTrendSeriesRows", () => {
  test("expands four series without overlapping labels", () => {
    const rows = toTrendSeriesRows(
      [
        { time: "00:00", orderCount: 1, exceptionCount: 0, subscribeCount: 2, stagnantCount: 3 },
        { time: "12:00", orderCount: 4, exceptionCount: 1, subscribeCount: 5, stagnantCount: 6 },
      ],
      "2026-09-16",
    );
    expect(rows).toHaveLength(8);
    expect(new Set(rows.map((row) => row.timeLabel))).toEqual(new Set(["00:00", "12:00"]));
    expect(rows.filter((row) => row.series === "今日订阅次数").every((row) => row.dashed)).toBe(
      true,
    );
  });
});
