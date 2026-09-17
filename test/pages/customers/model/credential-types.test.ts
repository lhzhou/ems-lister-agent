import { describe, expect, test } from "bun:test";
import {
  credentialConfiguredLabel,
  credentialInterfaceLabel,
  credentialProtocolNo,
  credentialStatusLabel,
} from "@/src/pages/customers/model/credential-types";

describe("credential labels", () => {
  test("maps credential status", () => {
    expect(credentialStatusLabel("active")).toBe("启用");
    expect(credentialStatusLabel("disabled")).toBe("停用");
  });

  test("groups testing and production protocol numbers", () => {
    expect(
      credentialProtocolNo(
        { test_protocol_no: "T-1", production_protocol_no: "P-1", postal_customer_no: "C-1" },
        "testing",
      ),
    ).toBe("T-1");
    expect(
      credentialProtocolNo(
        { test_protocol_no: "T-1", production_protocol_no: "P-1", postal_customer_no: "C-1" },
        "production",
      ),
    ).toBe("P-1");
    expect(credentialProtocolNo({ postal_customer_no: "C-1" }, "testing")).toBe("C-1");
    expect(credentialConfiguredLabel(true)).toBe("已配置");
    expect(credentialConfiguredLabel(false)).toBe("未配置");
  });

  test("joins enabled interfaces", () => {
    expect(
      credentialInterfaceLabel({
        id: 1,
        customer_id: 2,
        name: "协议",
        status: "active",
        supports_tracking_publish: true,
        supports_tracking_query: true,
      }),
    ).toBe("轨迹订阅、轨迹查询");
  });
});
