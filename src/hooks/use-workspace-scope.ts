import { useEffect } from "react";
import { HOME_TAB } from "@/src/constants/workspace";
import { useWorkspaceStore } from "@/src/stores/workspace-store";

export function useWorkspaceScope(scope: string | null) {
  useEffect(() => {
    const state = useWorkspaceStore.getState();
    if (state.scope === scope && state.tabs.length > 0) return;
    state.resetForScope(scope, HOME_TAB);
  }, [scope]);
}
