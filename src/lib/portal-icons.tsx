import {
  Building2,
  CircleGauge,
  KeyRound,
  LayoutDashboard,
  Package,
  PackageSearch,
  Settings,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { PortalMenu, PortalTab } from "./portal-menu";
import { portalTabFromRoute } from "./portal-menu";

const TAB_ICONS: Record<PortalTab, LucideIcon> = {
  dashboard: LayoutDashboard,
  orders: PackageSearch,
  accounts: Users,
  groups: UsersRound,
  customers: Users,
  enterprises: Building2,
  credentials: KeyRound,
};

const NAMED_ICONS: Record<string, LucideIcon> = {
  CircleGauge,
  LayoutDashboard,
  PackageSearch,
  Package,
  Users,
  UsersRound,
  Building2,
  KeyRound,
  Settings,
};

export function iconForTab(tab: PortalTab): LucideIcon {
  return TAB_ICONS[tab] ?? Package;
}

export function iconForMenu(item: PortalMenu): LucideIcon {
  if (item.icon && NAMED_ICONS[item.icon]) return NAMED_ICONS[item.icon];
  const tab = portalTabFromRoute(item.route_path);
  if (tab) return iconForTab(tab);
  return LayoutDashboard;
}
