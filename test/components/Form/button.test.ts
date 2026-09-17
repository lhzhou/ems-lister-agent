import { describe, expect, test } from "bun:test";
import { BUTTON_TYPE_PRESETS } from "@/src/components/Form";

describe("Form Button presets", () => {
  test("maps semantic types to ant colors", () => {
    expect(BUTTON_TYPE_PRESETS.create.antdType).toBe("primary");
    expect(BUTTON_TYPE_PRESETS.edit.antdType).toBe("link");
    expect(BUTTON_TYPE_PRESETS.delete.danger).toBe(true);
    expect(BUTTON_TYPE_PRESETS.cancel.antdType).toBe("default");
    expect(BUTTON_TYPE_PRESETS.view.antdType).toBe("link");
    expect(BUTTON_TYPE_PRESETS.refresh.antdType).toBe("default");
    expect(BUTTON_TYPE_PRESETS.reset.antdType).toBe("default");
  });
});
