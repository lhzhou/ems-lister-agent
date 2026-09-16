export type NavigationItem = {
  id: string;
  title: string;
  href?: string;
  icon?: string;
  permission?: string;
  hidden?: boolean;
  children?: NavigationItem[];
};

export type NavigationAdapter = { getMenu: () => Promise<NavigationItem[]> };
