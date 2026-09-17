import { useEffect, useMemo, useState } from "react";
import { credentialsApi } from "@/src/api";
import type { CustomerCredentialRecord } from "../model/credential-types";

export function useCredentials() {
  const [keyword, setKeywordState] = useState("");
  const [items, setItems] = useState<CustomerCredentialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void credentialsApi
      .list()
      .then((payload) => {
        if (cancelled) return;
        setItems(payload.items ?? []);
        setError("");
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setItems([]);
        setError(cause instanceof Error ? cause.message : "密钥列表加载失败");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [item.name, item.postal_customer_no, item.sender_no, item.gateway_route_key]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [items, keyword]);

  return {
    keyword,
    setKeyword: setKeywordState,
    items: filtered,
    total: filtered.length,
    loading,
    error,
    reload: () => {
      setLoading(true);
      setReloadKey((current) => current + 1);
    },
    resetFilters: () => setKeywordState(""),
  };
}
