import type { ComponentType } from "react";

export type RouteMeta = {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  permission?: string;
  tab?: { closable?: boolean; keepAlive?: boolean };
};

export type RegisteredRoute = {
  pathname: string;
  meta: RouteMeta;
};

/**
 * The first V2 registry. Pages are registered here before a navigation adapter
 * is allowed to expose them, so a menu value can never execute an arbitrary component.
 */
export const routeRegistry: readonly RegisteredRoute[] = [
  { pathname: "/", meta: { title: "看板", tab: { closable: false } } },
  { pathname: "/dashboard", meta: { title: "看板", tab: { closable: false } } },
  { pathname: "/orders", meta: { title: "订单管理" } },
  { pathname: "/tracking", meta: { title: "订单管理" } },
  { pathname: "/reminders", meta: { title: "签收提醒中心" } },
  { pathname: "/pod", meta: { title: "电子回单存根" } },
  { pathname: "/vip", meta: { title: "VIP保障专区" } },
  { pathname: "/statistics", meta: { title: "时效监控大屏" } },
];

export function getRegisteredRoute(pathname: string): RegisteredRoute | undefined {
  return routeRegistry.find((route) => route.pathname === pathname);
}
