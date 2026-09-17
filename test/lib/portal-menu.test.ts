import { describe, expect, test } from "bun:test";
import { portalMenuTree, portalTabFromRoute, visiblePortalMenus } from "@/src/lib/portal-menu";

describe("portalTabFromRoute", () => {
  test("maps dashboard, orders and customer submenu routes", () => {
    expect(portalTabFromRoute("/dashboard")).toBe("dashboard");
    expect(portalTabFromRoute("/orders")).toBe("orders");
    expect(portalTabFromRoute("/customers")).toBe("customers");
    expect(portalTabFromRoute("/customers/enterprises")).toBe("enterprises");
    expect(portalTabFromRoute("/customers/credentials")).toBe("credentials");
  });
});

describe("visiblePortalMenus", () => {
  test("keeps registered routes in sort order", () => {
    const items = visiblePortalMenus([
      { id: 2, code: "portal.orders", name: "订单管理", route_path: "/orders", sort_order: 20 },
      { id: 1, code: "portal.dashboard", name: "看板", route_path: "/dashboard", sort_order: 10 },
    ]);
    expect(items.map((item) => item.route_path)).toEqual(["/dashboard", "/orders"]);
  });

  test("keeps customer directory when children are registered", () => {
    const items = visiblePortalMenus([
      {
        id: 53,
        parent_id: null,
        code: "portal.customers",
        name: "客户管理",
        type: "directory",
        route_path: "",
        sort_order: 50,
      },
      {
        id: 54,
        parent_id: 53,
        code: "portal.customers.enterprises",
        name: "企业管理",
        route_path: "/customers/enterprises",
        sort_order: 51,
      },
      {
        id: 55,
        parent_id: 53,
        code: "portal.customers.accounts",
        name: "客户管理",
        route_path: "/customers",
        sort_order: 52,
      },
    ]);
    expect(items.map((item) => item.code)).toEqual([
      "portal.customers",
      "portal.customers.enterprises",
      "portal.customers.accounts",
    ]);
  });
});

describe("portalMenuTree", () => {
  test("nests customer children under the directory", () => {
    const tree = portalMenuTree([
      { id: 49, code: "portal.dashboard", name: "看板", route_path: "/dashboard", sort_order: 10 },
      {
        id: 53,
        parent_id: null,
        code: "portal.customers",
        name: "客户管理",
        type: "directory",
        route_path: "",
        sort_order: 50,
      },
      {
        id: 54,
        parent_id: 53,
        code: "portal.customers.enterprises",
        name: "企业管理",
        route_path: "/customers/enterprises",
        sort_order: 51,
      },
      {
        id: 55,
        parent_id: 53,
        code: "portal.customers.accounts",
        name: "客户管理",
        route_path: "/customers",
        sort_order: 52,
      },
    ]);
    expect(tree.map((item) => item.code)).toEqual(["portal.dashboard", "portal.customers"]);
    expect(tree[1]?.children.map((item) => item.name)).toEqual(["企业管理", "客户管理"]);
  });
});
