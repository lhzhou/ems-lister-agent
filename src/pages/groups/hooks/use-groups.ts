import { useEffect, useMemo, useState } from "react";
import { groupsApi } from "@/src/api";
import type { GroupRecord } from "../model/types";

export function useGroups() {
  const [page, setPageState] = useState(1);
  const [size, setSizeState] = useState(20);
  const [keyword, setKeywordState] = useState("");
  const [enabled, setEnabledState] = useState("");
  const [items, setItems] = useState<GroupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void groupsApi
      .list({ page: 1, size: 100 })
      .then((payload) => {
        if (cancelled) return;
        setItems(payload.items ?? []);
        setError("");
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setItems([]);
        setError(cause instanceof Error ? cause.message : "客服组列表加载失败");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filteredItems = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    return items.filter((item) => {
      if (enabled === "true" && !item.enabled) return false;
      if (enabled === "false" && item.enabled) return false;
      if (!needle) return true;
      return item.name.toLowerCase().includes(needle) || item.code.toLowerCase().includes(needle);
    });
  }, [enabled, items, keyword]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * size;
    return filteredItems.slice(start, start + size);
  }, [filteredItems, page, size]);

  return {
    page,
    setPage: setPageState,
    size,
    setSize: (next: number) => {
      setSizeState(next);
      setPageState(1);
    },
    keyword,
    setKeyword: (value: string) => {
      setKeywordState(value);
      setPageState(1);
    },
    enabled,
    setEnabled: (value: string) => {
      setEnabledState(value);
      setPageState(1);
    },
    items: pagedItems,
    total: filteredItems.length,
    loading,
    error,
    reload: () => {
      setLoading(true);
      setReloadKey((current) => current + 1);
    },
    resetFilters: () => {
      setKeywordState("");
      setEnabledState("");
      setPageState(1);
    },
  };
}
