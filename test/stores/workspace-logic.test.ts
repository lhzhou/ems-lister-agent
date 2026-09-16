import { describe, expect, test } from "bun:test";
import type { WorkspaceTab } from "@/types/workspace";
import {
  closeOtherTabs,
  closeRightTabs,
  closeTab,
  getNextTabIdAfterClose,
  openTab,
} from "@/src/stores/workspace-logic";

const home: WorkspaceTab = {
  id: "/dashboard",
  href: "/dashboard",
  title: "看板",
  closable: false,
  keepAlive: false,
};
const orders: WorkspaceTab = {
  id: "/orders",
  href: "/orders",
  title: "订单管理",
  closable: true,
  keepAlive: false,
};
const extra: WorkspaceTab = {
  id: "/orders?status=in_transit",
  href: "/orders?status=in_transit",
  title: "订单管理",
  closable: true,
  keepAlive: false,
};

describe("workspace logic", () => {
  test("deduplicates a tab by normalized id", () => {
    expect(openTab([home, orders], orders)).toEqual([home, orders]);
  });

  test("activates the right tab, then the left tab after close", () => {
    expect(getNextTabIdAfterClose([home, orders, extra], orders.id)).toBe(extra.id);
    expect(getNextTabIdAfterClose([home, orders], orders.id)).toBe(home.id);
  });

  test("never closes a fixed home tab", () => {
    expect(closeTab([home, orders], home.id)).toEqual([home, orders]);
  });

  test("keeps fixed tabs when closing other or right tabs", () => {
    expect(closeOtherTabs([home, orders, extra], orders.id)).toEqual([home, orders]);
    expect(closeRightTabs([home, orders, extra], orders.id)).toEqual([home, orders]);
  });
});
