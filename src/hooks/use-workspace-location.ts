import { useEffect } from "react";
import { workspaceTabFromHref } from "@/src/routers/workspace-tab";
import { normalizeTabLocation } from "@/src/routers/tab-id";
import { useWorkspaceStore } from "@/src/stores/workspace-store";

function windowHref() {
  if (typeof window === "undefined") return "/dashboard";
  return normalizeTabLocation(window.location.pathname, window.location.search);
}

export function replaceBrowserHref(href: string) {
  if (typeof window === "undefined") return;
  const next = normalizeTabLocation(href);
  const current = windowHref();
  if (current === next) return;
  window.history.replaceState(null, "", next);
}

export function syncWorkspaceFromWindow() {
  const tab = workspaceTabFromHref(windowHref());
  if (tab) useWorkspaceStore.getState().open(tab);
}

export function syncWindowFromWorkspace() {
  const state = useWorkspaceStore.getState();
  const tab = state.tabs.find((item) => item.id === state.activeId);
  replaceBrowserHref(tab?.href ?? "/dashboard");
}

export function useWorkspaceLocation(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const persistApi = useWorkspaceStore.persist;
    if (persistApi.hasHydrated()) {
      syncWorkspaceFromWindow();
      return;
    }
    return persistApi.onFinishHydration(() => syncWorkspaceFromWindow());
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onPopState = () => syncWorkspaceFromWindow();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [enabled]);
}
