import { SidebarTab } from "../components/Sidebar";

export type TabType =
  | SidebarTab
  | "tracking"
  | "reminders"
  | "pod"
  | "vip"
  | "statistics"
  | "mail_detail"
  | "batch_query"
  | "new_package";

export type TabColorTheme = "emerald" | "blue" | "amber" | "teal" | "rose" | "purple" | "indigo";

export interface AppTab {
  id: string;
  title: string;
  tabType: TabType;
  iconName?: string;
  closable: boolean;
  colorTheme?: TabColorTheme;
  badge?: string;
  data?: {
    packageId?: string;
    mailNo?: string;
    filter?: string;
    [key: string]: any;
  };
}

export const DEFAULT_TABS: AppTab[] = [
  {
    id: "tab-dashboard",
    title: "看板",
    tabType: "dashboard",
    iconName: "LayoutDashboard",
    closable: false,
    colorTheme: "emerald",
  },
];
