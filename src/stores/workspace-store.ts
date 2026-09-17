import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HOME_TAB } from "@/src/constants/workspace";
import type { WorkspaceTab } from "@/types/workspace";
import {
  closeOtherTabs,
  closeRightTabs,
  closeTab,
  getNextTabIdAfterClose,
  openTab,
  tabPathname,
  uniqueTabs,
} from "./workspace-logic";

const VERSION = 3;
const MAX_TABS = 20;

type WorkspaceState = {
  version: number;
  scope: string | null;
  tabs: WorkspaceTab[];
  activeId: string | null;
  refreshId: string | null;
  lastHrefs: Record<string, string>;
  open: (tab: WorkspaceTab) => void;
  activate: (id: string) => void;
  close: (id: string) => string | null;
  closeOthers: (id: string) => void;
  closeRight: (id: string) => void;
  closeAll: () => void;
  refresh: (id: string) => void;
  lastHrefFor: (pathname: string) => string;
  resetForScope: (scope: string | null, home: WorkspaceTab) => void;
};

function rememberHref(lastHrefs: Record<string, string>, tab: WorkspaceTab) {
  return { ...lastHrefs, [tabPathname(tab.id)]: tab.href };
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      version: VERSION,
      scope: null,
      tabs: [],
      activeId: null,
      refreshId: null,
      lastHrefs: {},
      open: (tab) =>
        set((state) => {
          const tabs = uniqueTabs(openTab(state.tabs, tab)).slice(-MAX_TABS);
          return {
            tabs,
            activeId: tab.id,
            lastHrefs: rememberHref(state.lastHrefs, tab),
          };
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
      lastHrefFor: (pathname) => {
        const path = tabPathname(pathname);
        return get().lastHrefs[path] || path;
      },
      resetForScope: (scope, home) =>
        set((state) => {
          if (scope && state.scope === scope && state.tabs.length > 0) {
            return { version: VERSION, scope, refreshId: null };
          }
          const switchedUser = Boolean(scope && state.scope && scope !== state.scope);
          return {
            version: VERSION,
            scope,
            tabs: [home],
            activeId: home.id,
            refreshId: null,
            lastHrefs: switchedUser ? {} : state.lastHrefs,
          };
        }),
    }),
    {
      name: "workbench-workspace-v1",
      version: VERSION,
      partialize: (state) => ({
        version: state.version,
        scope: state.scope,
        tabs: state.tabs,
        activeId: state.activeId,
        lastHrefs: state.lastHrefs,
      }),
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<WorkspaceState>;
        const restored = uniqueTabs(Array.isArray(state.tabs) ? state.tabs : []);
        const tabs = restored.some((tab) => tabPathname(tab.id) === HOME_TAB.id)
          ? restored
          : [HOME_TAB, ...restored];
        const lastHrefs = { ...state.lastHrefs };
        for (const tab of tabs) lastHrefs[tabPathname(tab.id)] = tab.href;
        const activeId = tabs.some((tab) => tab.id === state.activeId)
          ? state.activeId
          : (tabs[0]?.id ?? null);
        return {
          version: VERSION,
          scope: state.scope ?? null,
          tabs,
          activeId,
          lastHrefs,
        };
      },
    },
  ),
);
