import { describe, expect, test } from "bun:test";
import { normalizeTabLocation } from "@/src/routers/tab-id";

describe("normalizeTabLocation", () => {
  test("drops tracking parameters and trailing slash", () => {
    expect(normalizeTabLocation("/orders/", "?status=in_transit&utm_source=nav&_reload=1")).toBe(
      "/orders?status=in_transit",
    );
  });

  test("normalizes home path", () => {
    expect(normalizeTabLocation("/")).toBe("/dashboard");
  });
});
