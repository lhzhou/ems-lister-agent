import { getRegisteredRoute } from "@/src/routers/route-registry";

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

export type PortalTab =
  | "dashboard"
  | "orders"
  | "accounts"
  | "groups"
  | "customers"
  | "enterprises"
  | "credentials";

export type PortalMenuNode = PortalMenu & { children: PortalMenuNode[] };

export function portalTabFromRoute(path: string): PortalTab | null {
  const route = path.split("?")[0].replace(new RegExp("\\/+$"), "") || "/";
  if (!getRegisteredRoute(route)) return null;
  if (route === "/" || route === "/dashboard") return "dashboard";
  if (route === "/orders" || route === "/tracking") return "orders";
  if (route === "/accounts") return "accounts";
  if (route === "/groups") return "groups";
  if (route === "/customers/enterprises") return "enterprises";
  if (route === "/customers/credentials") return "credentials";
  if (route === "/customers") return "customers";
  return null;
}

function isDirectory(item: PortalMenu) {
  return item.type === "directory" || !item.route_path;
}

function isVisibleLeaf(item: PortalMenu) {
  return Boolean(item.route_path) && portalTabFromRoute(item.route_path) != null;
}

export function visiblePortalMenus(items: PortalMenu[]): PortalMenu[] {
  const sorted = [...items].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id,
  );
  const leaves = sorted.filter(isVisibleLeaf);
  const leafParentIds = new Set(
    leaves.map((item) => item.parent_id).filter((id): id is number => Boolean(id)),
  );
  const directories = sorted.filter((item) => isDirectory(item) && leafParentIds.has(item.id));
  return [...directories, ...leaves].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id,
  );
}

export function portalMenuTree(items: PortalMenu[]): PortalMenuNode[] {
  const visible = visiblePortalMenus(items);
  const nodes = new Map<number, PortalMenuNode>();
  for (const item of visible) nodes.set(item.id, { ...item, children: [] });
  const roots: PortalMenuNode[] = [];
  for (const item of visible) {
    const node = nodes.get(item.id);
    if (!node) continue;
    const parent = item.parent_id ? nodes.get(item.parent_id) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}
