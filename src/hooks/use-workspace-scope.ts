import { useEffect } from "react";
import { HOME_TAB } from "@/src/constants/workspace";
import { useWorkspaceStore } from "@/src/stores/workspace-store";

export function useWorkspaceScope(scope: string | null) {
  useEffect(() => {
    const apply = () => useWorkspaceStore.getState().resetForScope(scope, HOME_TAB);
    const persistApi = useWorkspaceStore.persist;
    if (persistApi.hasHydrated()) {
      apply();
      return;
    }
    return persistApi.onFinishHydration(apply);
  }, [scope]);
}
