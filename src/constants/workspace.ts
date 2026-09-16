import type { WorkspaceTab } from "@/types/workspace";

export const HOME_TAB: WorkspaceTab = {
  id: "/dashboard",
  href: "/dashboard",
  title: "看板",
  closable: false,
  keepAlive: false,
};

export const ORDERS_TAB: WorkspaceTab = {
  id: "/orders",
  href: "/orders",
  title: "订单管理",
  closable: true,
  keepAlive: false,
};
