import { describe, expect, test } from "bun:test";
import { portalTabFromRoute, visiblePortalMenus } from "@/src/lib/portal-menu";

describe("portalTabFromRoute", () => {
  test("maps dashboard and orders routes", () => {
    expect(portalTabFromRoute("/dashboard")).toBe("dashboard");
    expect(portalTabFromRoute("/orders")).toBe("orders");
    expect(portalTabFromRoute("/vip")).toBeNull();
  });
});

describe("visiblePortalMenus", () => {
  test("keeps registered routes in sort order", () => {
    const items = visiblePortalMenus([
      { id: 2, code: "portal.orders", name: "订单管理", route_path: "/orders", sort_order: 20 },
      { id: 1, code: "portal.dashboard", name: "看板", route_path: "/dashboard", sort_order: 10 },
      { id: 3, code: "portal.vip", name: "VIP", route_path: "/vip", sort_order: 30 },
    ]);
    expect(items.map((item) => item.code)).toEqual(["portal.dashboard", "portal.orders"]);
  });
});
