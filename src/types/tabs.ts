import { SidebarTab } from '../components/Sidebar';

export type TabType = SidebarTab | 'mail_detail' | 'batch_query' | 'new_package';

export type TabColorTheme = 'emerald' | 'blue' | 'amber' | 'teal' | 'rose' | 'purple' | 'indigo';

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
    id: 'tab-dashboard',
    title: '监控数据看板',
    tabType: 'dashboard',
    iconName: 'LayoutDashboard',
    closable: false,
    colorTheme: 'emerald',
    badge: '实时'
  },
  {
    id: 'tab-tracking',
    title: '重点快递查询',
    tabType: 'tracking',
    iconName: 'Package',
    closable: true,
    colorTheme: 'blue',
    badge: '轨迹'
  },
  {
    id: 'tab-reminders',
    title: '签收提醒中心',
    tabType: 'reminders',
    iconName: 'BellRing',
    closable: true,
    colorTheme: 'amber'
  },
  {
    id: 'tab-pod',
    title: '电子回单存根',
    tabType: 'pod',
    iconName: 'FileCheck',
    closable: true,
    colorTheme: 'teal'
  }
];
