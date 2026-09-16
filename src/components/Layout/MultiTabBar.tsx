import React, { useRef, useEffect, useState } from "react";
import { AppTab } from "@/src/types/tabs";
import {
  LayoutDashboard,
  Package,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RotateCw,
  FolderMinus,
} from "lucide-react";

interface MultiTabBarProps {
  tabs: AppTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCloseOtherTabs: (tabId: string) => void;
  onCloseAllTabs: () => void;
  onCloseRightTabs: (tabId: string) => void;
  onRefreshTab: (tabId: string) => void;
}

export const MultiTabBar: React.FC<MultiTabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onCloseRightTabs,
  onRefreshTab,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    tabId: string;
  }>({ visible: false, x: 0, y: 0, tabId: "" });

  // Scroll active tab into view when activeTabId changes
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector(
      `[data-tab-id="${activeTabId}"]`,
    ) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeTabId]);

  // Handle global click to dismiss popups
  useEffect(() => {
    const handleGlobalClick = () => {
      setShowMoreActions(false);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // Horizontal scroll step
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -200 : 200;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Icon mapping for tabs
  const getTabIcon = (tab: AppTab) => {
    if (tab.tabType === "dashboard") return <LayoutDashboard className="w-3.5 h-3.5" />;
    return <Package className="w-3.5 h-3.5" />;
  };

  // Color theme styling matching image.png (soft colored borders and subtle tints)
  const getTabStyle = (tab: AppTab, isActive: boolean) => {
    if (isActive) {
      return "bg-white text-[#00703C] border-2 border-[#00703C] shadow-sm font-semibold z-10";
    }

    if (tab.colorTheme === "blue") {
      return "bg-blue-50/60 text-stone-700 border border-blue-200/80 hover:bg-blue-100/70 hover:border-blue-300";
    }
    return "bg-emerald-50/60 text-stone-700 border border-emerald-200/80 hover:bg-emerald-100/70 hover:border-emerald-300";
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: Math.min(e.clientX, window.innerWidth - 180),
      y: e.clientY + 5,
      tabId,
    });
  };

  return (
    <div className="w-full bg-[#f4f6f8] border-b border-stone-200 px-2 sm:px-4 py-1.5 flex items-center justify-between gap-1 select-none relative z-20">
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => handleScroll("left")}
        aria-label="向前滚动标签页"
        className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white border border-transparent hover:border-stone-200 transition-all shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Tabs Horizontal List */}
      <div
        ref={scrollContainerRef}
        role="tablist"
        aria-label="已打开页面"
        className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all duration-150 shrink-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00703C] ${getTabStyle(tab, isActive)}`}
              title={`${tab.title} (右键打开菜单)`}
            >
              <span
                className={`shrink-0 ${isActive ? "text-[#00703C]" : "text-stone-500 group-hover:text-stone-800"}`}
              >
                {getTabIcon(tab)}
              </span>

              <span className="font-medium whitespace-nowrap tracking-tight max-w-[150px] truncate">
                {tab.title}
              </span>

              {/* Close Tab Button */}
              {tab.closable ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  aria-label={`关闭 ${tab.title}`}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-100 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <span className="w-1.5"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => handleScroll("right")}
        aria-label="向后滚动标签页"
        className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white border border-transparent hover:border-stone-200 transition-all shrink-0"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Right Controls: Refresh & More Actions Menu */}
      <div className="flex items-center gap-1 shrink-0 pl-1">
        {/* Refresh active tab button */}
        <button
          type="button"
          onClick={() => onRefreshTab(activeTabId)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-500 hover:text-[#00703C] hover:bg-white border border-transparent hover:border-stone-200 transition-all"
          title="刷新当前窗口"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* More actions dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreActions(!showMoreActions);
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-white border border-transparent hover:border-stone-200 transition-all"
            title="窗口管理操作"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMoreActions && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 text-xs text-stone-700 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-3 py-1 text-[10px] text-stone-400 font-semibold border-b border-stone-100">
                已打开 {tabs.length} 个窗口
              </div>
              <button
                type="button"
                onClick={() => {
                  onRefreshTab(activeTabId);
                  setShowMoreActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-emerald-50 hover:text-[#00703C] text-left transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>刷新当前窗口</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onCloseTab(activeTabId);
                  setShowMoreActions(false);
                }}
                disabled={!tabs.find((t) => t.id === activeTabId)?.closable}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 hover:text-rose-700 text-left transition-colors disabled:opacity-40"
              >
                <X className="w-3.5 h-3.5" />
                <span>关闭当前窗口</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onCloseOtherTabs(activeTabId);
                  setShowMoreActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-stone-50 text-left transition-colors"
              >
                <FolderMinus className="w-3.5 h-3.5 text-stone-500" />
                <span>关闭其他窗口</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onCloseRightTabs(activeTabId);
                  setShowMoreActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-stone-50 text-left transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                <span>关闭右侧窗口</span>
              </button>
              <div className="border-t border-stone-100 my-1"></div>
              <button
                type="button"
                onClick={() => {
                  onCloseAllTabs();
                  setShowMoreActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-600 text-left transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>重置关闭所有</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right-click Context Menu */}
      {contextMenu.visible && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: "fixed", left: contextMenu.x, top: contextMenu.y }}
          className="w-40 bg-white rounded-xl shadow-2xl border border-stone-200 py-1.5 z-[100] text-xs text-stone-700 animate-in fade-in zoom-in-95 duration-75"
        >
          <button
            type="button"
            onClick={() => {
              onRefreshTab(contextMenu.tabId);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-emerald-50 hover:text-[#00703C] text-left transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>重新加载</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onCloseTab(contextMenu.tabId);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            disabled={!tabs.find((t) => t.id === contextMenu.tabId)?.closable}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 hover:text-rose-700 text-left transition-colors disabled:opacity-40"
          >
            <X className="w-3.5 h-3.5" />
            <span>关闭标签页</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onCloseOtherTabs(contextMenu.tabId);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-stone-50 text-left transition-colors"
          >
            <FolderMinus className="w-3.5 h-3.5 text-stone-500" />
            <span>关闭其他</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onCloseRightTabs(contextMenu.tabId);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-stone-50 text-left transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
            <span>关闭右侧</span>
          </button>
        </div>
      )}
    </div>
  );
};
