import { describe, expect, test } from "bun:test";
import { copyText } from "@/src/lib/clipboard";

describe("copyText", () => {
  test("returns false for empty text", async () => {
    expect(await copyText("")).toBe(false);
    expect(await copyText("   ")).toBe(false);
  });
});
