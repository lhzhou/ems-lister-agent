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

export type PortalTab = "dashboard" | "orders";

export function portalTabFromRoute(path: string): PortalTab | null {
  const route = path.split("?")[0].replace(/\/+$/, "") || "/";
  if (route === "/" || route === "/dashboard") return "dashboard";
  if (route === "/orders" || route === "/tracking") return "orders";
  return null;
}

export function visiblePortalMenus(items: PortalMenu[]): PortalMenu[] {
  return items
    .filter((item) => item.route_path && portalTabFromRoute(item.route_path) != null)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
}
