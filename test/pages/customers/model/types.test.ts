import { describe, expect, test } from "bun:test";
import { customerLoginRoleLabel, customerStatusLabel } from "@/src/pages/customers/model/types";

describe("customer labels", () => {
  test("maps status and login roles", () => {
    expect(customerStatusLabel("normal")).toBe("正常");
    expect(customerStatusLabel("frozen")).toBe("冻结");
    expect(customerLoginRoleLabel("customer_admin")).toBe("客户管理员");
    expect(customerLoginRoleLabel("customer_member")).toBe("客户成员");
    expect(customerLoginRoleLabel()).toBe("未绑定");
  });
});
