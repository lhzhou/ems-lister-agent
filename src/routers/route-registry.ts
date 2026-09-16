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

export const routeRegistry: readonly RegisteredRoute[] = [
  { pathname: "/", meta: { title: "看板", tab: { closable: false } } },
  { pathname: "/dashboard", meta: { title: "看板", tab: { closable: false } } },
  { pathname: "/orders", meta: { title: "订单管理" } },
  { pathname: "/tracking", meta: { title: "订单管理" } },
];

export function getRegisteredRoute(pathname: string): RegisteredRoute | undefined {
  return routeRegistry.find((route) => route.pathname === pathname);
}
