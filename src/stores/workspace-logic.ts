import type { WorkspaceTab } from "@/types/workspace";

export function openTab(tabs: WorkspaceTab[], tab: WorkspaceTab): WorkspaceTab[] {
  return tabs.some((item) => item.id === tab.id) ? tabs : [...tabs, tab];
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
