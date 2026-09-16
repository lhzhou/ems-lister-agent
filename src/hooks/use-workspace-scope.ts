import { useEffect } from "react";
import { HOME_TAB } from "@/src/constants/workspace";
import { workspaceTabFromHref } from "@/src/routers/workspace-tab";
import { normalizeTabLocation } from "@/src/routers/tab-id";
import { useWorkspaceStore } from "@/src/stores/workspace-store";

function windowHref() {
  if (typeof window === "undefined") return HOME_TAB.href;
  return normalizeTabLocation(window.location.pathname, window.location.search);
}

export function useWorkspaceScope(scope: string | null) {
  useEffect(() => {
    const state = useWorkspaceStore.getState();
    if (state.scope === scope && state.tabs.length > 0) return;
    state.resetForScope(scope, HOME_TAB);
    const tab = workspaceTabFromHref(windowHref());
    if (tab) useWorkspaceStore.getState().open(tab);
  }, [scope]);
}
