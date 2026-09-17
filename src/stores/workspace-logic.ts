import type { WorkspaceTab } from "@/types/workspace";
import { canonicalizePathname } from "@/src/routers/tab-id";

export function tabPathname(id: string): string {
  return canonicalizePathname(id.split("?")[0] || "/");
}

export function uniqueTabs(tabs: WorkspaceTab[]): WorkspaceTab[] {
  const seen = new Map<string, WorkspaceTab>();
  for (const tab of tabs) {
    const path = tabPathname(tab.id);
    const searchIndex = tab.id.indexOf("?");
    const id = searchIndex >= 0 ? `${path}${tab.id.slice(searchIndex)}` : path;
    seen.set(path, { ...tab, id, href: id });
  }
  return [...seen.values()];
}

export function openTab(tabs: WorkspaceTab[], tab: WorkspaceTab): WorkspaceTab[] {
  const path = tabPathname(tab.id);
  const next = uniqueTabs(tabs);
  const index = next.findIndex((item) => tabPathname(item.id) === path);
  if (index < 0) return [...next, tab];
  next[index] = { ...next[index], ...tab };
  return next;
}

export function getNextTabIdAfterClose(tabs: WorkspaceTab[], id: string): string | null {
  const index = tabs.findIndex((tab) => tab.id === id);
  if (index < 0) return tabs[0]?.id ?? null;
  return tabs[index + 1]?.id ?? tabs[index - 1]?.id ?? null;
}

export function closeTab(tabs: WorkspaceTab[], id: string): WorkspaceTab[] {
  return tabs.filter((tab) => tab.id !== id || !tab.closable);
}

export function closeOtherTabs(tabs: WorkspaceTab[], id: string): WorkspaceTab[] {
  return tabs.filter((tab) => !tab.closable || tab.id === id);
}

export function closeRightTabs(tabs: WorkspaceTab[], id: string): WorkspaceTab[] {
  const index = tabs.findIndex((tab) => tab.id === id);
  return index < 0 ? tabs : tabs.filter((tab, current) => current <= index || !tab.closable);
}
