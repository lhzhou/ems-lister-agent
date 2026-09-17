import { describe, expect, test } from "bun:test";
import { credentialStatusLabel } from "@/src/pages/customers/model/credential-types";

describe("credential labels", () => {
  test("maps credential status", () => {
    expect(credentialStatusLabel("active")).toBe("启用");
    expect(credentialStatusLabel("disabled")).toBe("停用");
  });
});
