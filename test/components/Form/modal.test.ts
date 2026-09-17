import { describe, expect, test } from "bun:test";
import { MODAL_SIZE_WIDTH } from "@/src/components/Form";

describe("Form Modal sizes", () => {
  test("defaults medium and maps small/medium/large/xlarge widths", () => {
    expect(MODAL_SIZE_WIDTH.small).toBe(416);
    expect(MODAL_SIZE_WIDTH.medium).toBe(640);
    expect(MODAL_SIZE_WIDTH.large).toBe(880);
    expect(MODAL_SIZE_WIDTH.xlarge).toBe(1200);
  });
});
