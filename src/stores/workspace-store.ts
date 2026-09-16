import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkspaceTab } from "@/types/workspace";
import {
  closeOtherTabs,
  closeRightTabs,
  closeTab,
  getNextTabIdAfterClose,
  openTab,
} from "./workspace-logic";

const VERSION = 1;
const MAX_TABS = 20;

type WorkspaceState = {
  version: number;
  scope: string | null;
  tabs: WorkspaceTab[];
  activeId: string | null;
  refreshId: string | null;
  open: (tab: WorkspaceTab) => void;
  activate: (id: string) => void;
  close: (id: string) => string | null;
  closeOthers: (id: string) => void;
  closeRight: (id: string) => void;
  closeAll: () => void;
  refresh: (id: string) => void;
  resetForScope: (scope: string | null, home: WorkspaceTab) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      version: VERSION,
      scope: null,
      tabs: [],
      activeId: null,
      refreshId: null,
      open: (tab) =>
        set((state) => {
          const tabs = openTab(state.tabs, tab).slice(-MAX_TABS);
          return { tabs, activeId: tab.id };
        }),
      activate: (id) => set({ activeId: id }),
      close: (id) => {
        const state = get();
        const nextId = getNextTabIdAfterClose(state.tabs, id);
        set({
          tabs: closeTab(state.tabs, id),
          activeId: state.activeId === id ? nextId : state.activeId,
        });
        return nextId;
      },
      closeOthers: (id) => set((state) => ({ tabs: closeOtherTabs(state.tabs, id), activeId: id })),
      closeRight: (id) =>
        set((state) => {
          const tabs = closeRightTabs(state.tabs, id);
          return {
            tabs,
            activeId: tabs.some((tab) => tab.id === state.activeId) ? state.activeId : id,
          };
        }),
      closeAll: () =>
        set((state) => {
          const tabs = state.tabs.filter((tab) => !tab.closable);
          return { tabs, activeId: tabs[0]?.id ?? null };
        }),
      refresh: (id) => set({ refreshId: id }),
      resetForScope: (scope, home) =>
        set({ version: VERSION, scope, tabs: [home], activeId: home.id, refreshId: null }),
    }),
    {
      name: "workbench-workspace-v1",
      version: VERSION,
      partialize: (state) => ({
        version: state.version,
        scope: state.scope,
        tabs: state.tabs,
        activeId: state.activeId,
      }),
      migrate: () => ({ version: VERSION, scope: null, tabs: [], activeId: null }),
    },
  ),
);
