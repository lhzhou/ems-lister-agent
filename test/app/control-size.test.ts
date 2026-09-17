import { describe, expect, test } from "bun:test";
import { parseControlSize } from "@/src/app/control-size";

describe("parseControlSize", () => {
  test("accepts small middle large", () => {
    expect(parseControlSize("small")).toBe("small");
    expect(parseControlSize("middle")).toBe("middle");
    expect(parseControlSize("LARGE")).toBe("large");
  });

  test("falls back to large", () => {
    expect(parseControlSize()).toBe("large");
    expect(parseControlSize("huge")).toBe("large");
    expect(parseControlSize("")).toBe("large");
  });
});
