import type { SidebarTab } from "@/src/components/Layout";

export type TabType = SidebarTab | "tracking";

export type TabColorTheme = "emerald" | "blue";

export interface AppTab {
  id: string;
  title: string;
  tabType: TabType;
  closable: boolean;
  colorTheme?: TabColorTheme;
}
