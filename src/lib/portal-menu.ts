export type PortalMenu = {
  id: number;
  parent_id?: number | null;
  code: string;
  name: string;
  icon?: string;
  type?: string;
  route_path: string;
  sort_order?: number;
};

import { getRegisteredRoute } from "@/src/routers/route-registry";

export type PortalTab = "dashboard" | "orders" | "accounts" | "groups";

export function portalTabFromRoute(path: string): PortalTab | null {
  const route = path.split("?")[0].replace(/\/+$/, "") || "/";
  if (!getRegisteredRoute(route)) return null;
  if (route === "/" || route === "/dashboard") return "dashboard";
  if (route === "/orders" || route === "/tracking") return "orders";
  if (route === "/accounts") return "accounts";
  if (route === "/groups") return "groups";
  return null;
}

export function visiblePortalMenus(items: PortalMenu[]): PortalMenu[] {
  return items
    .filter((item) => item.route_path && portalTabFromRoute(item.route_path) != null)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
}
