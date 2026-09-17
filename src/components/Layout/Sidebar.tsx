import React, { useMemo } from "react";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Truck,
  X,
  LayoutDashboard,
  CircleGauge,
  PackageSearch,
  Users,
  UsersRound,
  Building2,
  KeyRound,
} from "lucide-react";
import type { PortalMenu, PortalTab } from "@/src/lib/portal-menu";
import { portalMenuTree, portalTabFromRoute } from "@/src/lib/portal-menu";

export type SidebarTab = PortalTab;

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CircleGauge,
  LayoutDashboard,
  PackageSearch,
  Package,
  Users,
  UsersRound,
  Building2,
  KeyRound,
};

function iconFor(item: PortalMenu) {
  const Icon =
    ICONS[item.icon ?? ""] ??
    (portalTabFromRoute(item.route_path) === "orders" ? Package : LayoutDashboard);
  return <Icon className="h-4 w-4" aria-hidden="true" />;
}

function pathForTab(tab: SidebarTab) {
  if (tab === "orders") return "/orders";
  if (tab === "accounts") return "/accounts";
  if (tab === "groups") return "/groups";
  if (tab === "customers") return "/customers";
  if (tab === "enterprises") return "/customers/enterprises";
  if (tab === "credentials") return "/customers/credentials";
  return "/dashboard";
}

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  menus?: PortalMenu[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen = (_open: boolean) => {},
  menus = [],
}) => {
  const tree = useMemo(() => portalMenuTree(menus), [menus]);
  const selectedKeys = [pathForTab(activeTab)];
  const openKeys = useMemo(
    () =>
      tree
        .filter((item) =>
          item.children.some((child) => portalTabFromRoute(child.route_path) === activeTab),
        )
        .map((item) => "dir-" + item.id),
    [activeTab, tree],
  );

  const items: MenuProps["items"] = tree.map((item) => {
    if (item.children.length > 0) {
      return {
        key: "dir-" + item.id,
        icon: iconFor(item),
        label: item.name,
        children: item.children.map((child) => ({
          key: child.route_path,
          icon: iconFor(child),
          label: child.name,
        })),
      };
    }
    return {
      key: item.route_path,
      icon: iconFor(item),
      label: item.name,
    };
  });

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    const tab = portalTabFromRoute(String(key));
    if (!tab) return;
    onSelectTab(tab);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const brandMark = (
    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[6px] bg-primary text-on-primary">
      <Truck className="h-4 w-4" aria-hidden="true" />
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full select-none flex-col border-r border-outline bg-surface">
      <div
        className={`flex items-center border-b border-outline p-3.5 ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            {brandMark}
            <h2 className="truncate text-xs font-semibold text-on-surface">业务导航目录</h2>
          </div>
        ) : (
          <div title="业务导航目录">{brandMark}</div>
        )}
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="rounded-[6px] p-1.5 text-on-surface-disabled hover:bg-primary-light hover:text-on-surface md:hidden"
          aria-label="关闭侧边栏"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden rounded-[6px] p-1 text-on-surface-disabled transition-colors hover:bg-primary-light hover:text-on-surface md:flex"
          title={isCollapsed ? "展开菜单" : "收起菜单"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {menus.length === 0 ? (
          <p
            className={`px-3 py-2 text-xs text-on-surface-disabled ${isCollapsed ? "hidden" : ""}`}
          >
            暂无菜单
          </p>
        ) : (
          <Menu
            key={tree.map((item) => item.id).join("-")}
            mode="inline"
            inlineCollapsed={isCollapsed}
            selectedKeys={selectedKeys}
            defaultOpenKeys={isCollapsed ? [] : openKeys}
            items={items}
            onClick={handleClick}
            className="border-none bg-transparent text-xs [&_.ant-menu-item]:mb-1 [&_.ant-menu-item]:h-10 [&_.ant-menu-item]:leading-10 [&_.ant-menu-submenu-title]:h-10 [&_.ant-menu-submenu-title]:leading-10"
          />
        )}
      </nav>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden flex-shrink-0 transition-all duration-200 ease-in-out md:block ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div
          className={`fixed top-16 bottom-0 z-30 transition-all duration-200 ${isCollapsed ? "w-16" : "w-64"}`}
        >
          {sidebarContent}
        </div>
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/45" onClick={() => setIsMobileOpen(false)} />
          <div className="relative z-10 flex h-full w-72 max-w-[80vw] flex-col shadow-modal">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
