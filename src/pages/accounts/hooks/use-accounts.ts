import { useEffect, useState } from "react";
import { accountsApi } from "@/src/api";
import type { AccountRecord } from "../model/types";

export function useAccounts() {
  const [page, setPageState] = useState(1);
  const [size, setSizeState] = useState(20);
  const [keyword, setKeywordState] = useState("");
  const [type, setTypeState] = useState("");
  const [status, setStatusState] = useState("");
  const [items, setItems] = useState<AccountRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void accountsApi
      .list({
        page,
        size,
        keyword: keyword.trim() || undefined,
        type: type || undefined,
        status: status || undefined,
      })
      .then((payload) => {
        if (cancelled) return;
        setItems(payload.items ?? []);
        setTotal(Number(payload.total ?? 0));
        setError("");
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setError(cause instanceof Error ? cause.message : "账号列表加载失败");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, size, keyword, type, status, reloadKey]);

  return {
    page,
    setPage: (next: number) => {
      setLoading(true);
      setPageState(next);
    },
    size,
    setSize: (next: number) => {
      setLoading(true);
      setSizeState(next);
      setPageState(1);
    },
    keyword,
    setKeyword: (value: string) => {
      setLoading(true);
      setKeywordState(value);
      setPageState(1);
    },
    type,
    setType: (value: string) => {
      setLoading(true);
      setTypeState(value);
      setPageState(1);
    },
    status,
    setStatus: (value: string) => {
      setLoading(true);
      setStatusState(value);
      setPageState(1);
    },
    items,
    total,
    loading,
    error,
    reload: () => {
      setLoading(true);
      setReloadKey((current) => current + 1);
    },
    resetFilters: () => {
      setLoading(true);
      setKeywordState("");
      setTypeState("");
      setStatusState("");
      setPageState(1);
    },
  };
}
