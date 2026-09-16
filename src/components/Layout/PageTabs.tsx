import type { AppTab } from "@/src/types/tabs";
import { MultiTabBar } from "./MultiTabBar";

export function PageTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onCloseRightTabs,
  onRefreshTab,
}: {
  tabs: AppTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCloseOtherTabs: (tabId: string) => void;
  onCloseAllTabs: () => void;
  onCloseRightTabs: (tabId: string) => void;
  onRefreshTab: (tabId: string) => void;
}) {
  return (
    <div className="min-h-10">
      <MultiTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
        onCloseOtherTabs={onCloseOtherTabs}
        onCloseAllTabs={onCloseAllTabs}
        onCloseRightTabs={onCloseRightTabs}
        onRefreshTab={onRefreshTab}
      />
    </div>
  );
}
