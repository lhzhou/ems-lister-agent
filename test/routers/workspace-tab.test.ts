import { describe, expect, test } from "bun:test";
import { appTabFromWorkspace, workspaceTabFromHref } from "@/src/routers/workspace-tab";

describe("workspaceTabFromHref", () => {
  test("opens registered dashboard and orders tabs", () => {
    expect(workspaceTabFromHref("/")).toMatchObject({
      id: "/dashboard",
      title: "看板",
      closable: false,
    });
    expect(workspaceTabFromHref("/dashboard")).toMatchObject({
      id: "/dashboard",
      title: "看板",
      closable: false,
    });
    expect(workspaceTabFromHref("/orders?status=in_transit")).toMatchObject({
      id: "/orders?status=in_transit",
      title: "订单管理",
      closable: true,
    });
  });

  test("rejects unregistered hrefs", () => {
    expect(workspaceTabFromHref("/unknown")).toBeNull();
  });
});

describe("appTabFromWorkspace", () => {
  test("maps workspace tabs to UI tabs without duplicating ids", () => {
    const tab = workspaceTabFromHref("/orders")!;
    expect(appTabFromWorkspace(tab)).toMatchObject({
      id: "/orders",
      tabType: "orders",
      closable: true,
    });
    expect(appTabFromWorkspace(tab)).not.toHaveProperty("colorTheme");
  });
});
