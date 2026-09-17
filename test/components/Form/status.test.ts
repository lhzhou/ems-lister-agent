import { describe, expect, test } from "bun:test";
import {
  accountStatusTone,
  credentialStatusTone,
  customerStatusTone,
  enabledStatusTone,
  riskStatusTone,
  severityTone,
  waybillStatusTone,
} from "@/src/components/Form";

describe("Form Status tones", () => {
  test("maps waybill, severity and account statuses", () => {
    expect(waybillStatusTone("delivered")).toBe("success");
    expect(waybillStatusTone("in_transit")).toBe("processing");
    expect(waybillStatusTone("returned")).toBe("warning");
    expect(waybillStatusTone("cancelled")).toBe("error");
    expect(waybillStatusTone("pending_pickup")).toBe("default");
    expect(severityTone("P0")).toBe("error");
    expect(severityTone("P2")).toBe("warning");
    expect(severityTone("P3")).toBe("processing");
    expect(severityTone("NONE")).toBe("default");
    expect(accountStatusTone("active")).toBe("success");
    expect(accountStatusTone("locked")).toBe("error");
    expect(accountStatusTone("disabled")).toBe("default");
    expect(customerStatusTone("normal")).toBe("success");
    expect(customerStatusTone("frozen")).toBe("error");
    expect(credentialStatusTone("active")).toBe("success");
    expect(enabledStatusTone(false)).toBe("default");
    expect(riskStatusTone("高风险")).toBe("error");
  });
});
