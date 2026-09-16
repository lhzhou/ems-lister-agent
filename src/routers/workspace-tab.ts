import { HOME_TAB, ORDERS_TAB } from "@/src/constants/workspace";
import { portalTabFromRoute } from "@/src/lib/portal-menu";
import type { AppTab, TabColorTheme, TabType } from "@/src/types/tabs";
import type { WorkspaceTab } from "@/types/workspace";
import { getRegisteredRoute } from "./route-registry";
import { normalizeTabLocation } from "./tab-id";

export function workspaceTabFromHref(href: string): WorkspaceTab | null {
  const id = normalizeTabLocation(href);
  const path = id.split("?")[0];
  const registered = getRegisteredRoute(path);
  if (!registered) return null;
  const tab = portalTabFromRoute(path);
  if (tab === "orders") return { ...ORDERS_TAB, id, href: id };
  if (tab === "dashboard") return { ...HOME_TAB, id, href: id };
  return {
    id,
    href: id,
    title: registered.meta.title,
    closable: registered.meta.tab?.closable !== false,
    keepAlive: Boolean(registered.meta.tab?.keepAlive),
  };
}

export function appTabFromWorkspace(tab: WorkspaceTab): AppTab {
  const type = (portalTabFromRoute(tab.href) ?? "dashboard") as TabType;
  const colorTheme: TabColorTheme = type === "orders" ? "blue" : "emerald";
  return {
    id: tab.id,
    title: tab.title,
    tabType: type,
    closable: tab.closable,
    colorTheme,
  };
}
