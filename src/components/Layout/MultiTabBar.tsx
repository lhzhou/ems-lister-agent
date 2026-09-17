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

const iconBtn =
  "hidden h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-transparent text-on-surface-disabled transition-colors hover:border-outline hover:bg-surface hover:text-on-surface sm:flex";

const menuItem = "flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors";

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

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector(
      `[data-tab-id="${activeTabId}"]`,
    ) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeTabId]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setShowMoreActions(false);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -200 : 200;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const getTabIcon = (tab: AppTab) => {
    if (tab.tabType === "dashboard") return <LayoutDashboard className="h-3.5 w-3.5" />;
    return <Package className="h-3.5 w-3.5" />;
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
    <div className="relative z-20 flex h-10 w-full select-none items-center justify-between gap-1 border-b border-outline bg-surface-layout px-2 sm:px-4">
      <button
        type="button"
        onClick={() => handleScroll("left")}
        aria-label="向前滚动标签页"
        className={iconBtn}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={scrollContainerRef}
        role="tablist"
        aria-label="已打开页面"
        className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto scroll-smooth"
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
              className={`group flex shrink-0 cursor-pointer items-center gap-2 rounded-[6px] px-3 py-1 text-xs transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "z-10 border border-primary bg-surface font-semibold text-primary"
                  : "border border-primary-border bg-primary-light/70 text-on-surface hover:bg-primary-light"
              }`}
              title={`${tab.title} (右键打开菜单)`}
            >
              <span
                className={`shrink-0 ${isActive ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface"}`}
              >
                {getTabIcon(tab)}
              </span>

              <span className="max-w-[150px] truncate font-medium tracking-tight whitespace-nowrap">
                {tab.title}
              </span>

              {tab.closable ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  aria-label={`关闭 ${tab.title}`}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-on-surface-disabled transition-colors hover:bg-alert-error-bg hover:text-error"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <span className="w-1.5"></span>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => handleScroll("right")}
        aria-label="向后滚动标签页"
        className={iconBtn}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="flex shrink-0 items-center gap-1 pl-1">
        <button
          type="button"
          onClick={() => onRefreshTab(activeTabId)}
          className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-transparent text-on-surface-variant transition-colors hover:border-outline hover:bg-surface hover:text-primary"
          title="刷新当前窗口"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreActions(!showMoreActions);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-transparent text-on-surface-variant transition-colors hover:border-outline hover:bg-surface hover:text-on-surface"
            title="窗口管理操作"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showMoreActions && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full right-0 z-50 mt-1.5 w-44 rounded-xl border border-outline bg-surface py-1.5 text-xs text-on-surface shadow-popover"
            >
              <div className="border-b border-outline-variant px-3 py-1 text-[10px] font-semibold text-on-surface-disabled">
                已打开 {tabs.length} 个窗口
              </div>
              <button
                type="button"
                onClick={() => {
                  onRefreshTab(activeTabId);
                  setShowMoreActions(false);
                }}
                className={`${menuItem} hover:bg-primary-light hover:text-primary`}
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>刷新当前窗口</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onCloseTab(activeTabId);
                  setShowMoreActions(false);
                }}
                disabled={!tabs.find((t) => t.id === activeTabId)?.closable}
                className={`${menuItem} hover:bg-alert-error-bg hover:text-error disabled:opacity-40`}
              >
                <X className="h-3.5 w-3.5" />
                <span>关闭当前窗口</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onCloseOtherTabs(activeTabId);
                  setShowMoreActions(false);
                }}
                className={`${menuItem} hover:bg-surface-container`}
              >
                <FolderMinus className="h-3.5 w-3.5 text-on-surface-variant" />
                <span>关闭其他窗口</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onCloseRightTabs(activeTabId);
                  setShowMoreActions(false);
                }}
                className={`${menuItem} hover:bg-surface-container`}
              >
                <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant" />
                <span>关闭右侧窗口</span>
              </button>
              <div className="my-1 border-t border-outline-variant"></div>
              <button
                type="button"
                onClick={() => {
                  onCloseAllTabs();
                  setShowMoreActions(false);
                }}
                className={`${menuItem} text-error hover:bg-alert-error-bg`}
              >
                <X className="h-3.5 w-3.5" />
                <span>重置关闭所有</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {contextMenu.visible && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: "fixed", left: contextMenu.x, top: contextMenu.y }}
          className="z-[100] w-40 rounded-xl border border-outline bg-surface py-1.5 text-xs text-on-surface shadow-modal"
        >
          <button
            type="button"
            onClick={() => {
              onRefreshTab(contextMenu.tabId);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className={`${menuItem} hover:bg-primary-light hover:text-primary`}
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>重新加载</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onCloseTab(contextMenu.tabId);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            disabled={!tabs.find((t) => t.id === contextMenu.tabId)?.closable}
            className={`${menuItem} hover:bg-alert-error-bg hover:text-error disabled:opacity-40`}
          >
            <X className="h-3.5 w-3.5" />
            <span>关闭标签页</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onCloseOtherTabs(contextMenu.tabId);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className={`${menuItem} hover:bg-surface-container`}
          >
            <FolderMinus className="h-3.5 w-3.5 text-on-surface-variant" />
            <span>关闭其他</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onCloseRightTabs(contextMenu.tabId);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className={`${menuItem} hover:bg-surface-container`}
          >
            <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant" />
            <span>关闭右侧</span>
          </button>
        </div>
      )}
    </div>
  );
};
