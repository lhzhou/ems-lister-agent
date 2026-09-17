import { describe, expect, test } from "bun:test";
import {
  accountStatusLabel,
  accountTypeLabel,
  canManageAccount,
} from "@/src/pages/accounts/model/types";

describe("account labels", () => {
  test("maps company roles and statuses", () => {
    expect(accountTypeLabel("service_group_leader")).toBe("客服组长");
    expect(accountTypeLabel("customer_service")).toBe("客服成员");
    expect(accountStatusLabel("active")).toBe("启用");
    expect(canManageAccount("postal_admin")).toBe(false);
    expect(canManageAccount("customer_service")).toBe(true);
  });
});
