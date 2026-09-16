import React from "react";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Truck,
  X,
  LayoutDashboard,
  CircleGauge,
  PackageSearch,
} from "lucide-react";
import type { PortalMenu, PortalTab } from "@/src/lib/portal-menu";
import { portalTabFromRoute } from "@/src/lib/portal-menu";

export type SidebarTab = PortalTab;

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CircleGauge,
  LayoutDashboard,
  PackageSearch,
  Package,
};

function iconFor(item: PortalMenu) {
  return (
    ICONS[item.icon ?? ""] ??
    (portalTabFromRoute(item.route_path) === "orders" ? Package : LayoutDashboard)
  );
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
  const handleItemClick = (id: SidebarTab) => {
    onSelectTab(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-stone-200 select-none">
      <div
        className={`p-3.5 border-b border-stone-200 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-[#00703C] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Truck className="w-4 h-4 text-emerald-100" />
            </div>
            <h2 className="text-xs font-bold text-stone-800 truncate">业务导航目录</h2>
          </div>
        ) : (
          <div
            className="w-7 h-7 rounded-lg bg-[#00703C] text-white flex items-center justify-center shadow-sm"
            title="业务导航目录"
          >
            <Truck className="w-4 h-4 text-emerald-100" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          aria-label="关闭侧边栏"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title={isCollapsed ? "展开菜单" : "收起菜单"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menus.length === 0 ? (
          <p className={`px-3 py-2 text-xs text-stone-400 ${isCollapsed ? "hidden" : ""}`}>
            暂无菜单
          </p>
        ) : (
          menus.map((item) => {
            const tab = portalTabFromRoute(item.route_path);
            if (!tab) return null;
            const Icon = iconFor(item);
            const isActive = activeTab === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(tab)}
                title={isCollapsed ? item.name : undefined}
                className={`w-full group flex items-center ${
                  isCollapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-3 py-2.5"
                } rounded-xl text-left transition-all ${
                  isActive
                    ? "bg-emerald-50 text-[#00703C] font-semibold shadow-xs border border-emerald-200/70"
                    : "text-stone-700 hover:text-stone-900 hover:bg-stone-50 border border-transparent"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${
                    isActive
                      ? "bg-[#00703C] text-white shadow-xs"
                      : "bg-stone-100 text-stone-500 group-hover:bg-white group-hover:text-stone-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!isCollapsed && <span className="text-xs font-medium truncate">{item.name}</span>}
              </button>
            );
          })
        )}
      </nav>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:block transition-all duration-200 ease-in-out flex-shrink-0 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div
          className={`fixed top-[64px] bottom-0 ${isCollapsed ? "w-16" : "w-64"} transition-all duration-200 z-30`}
        >
          {sidebarContent}
        </div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
