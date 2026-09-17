import { useEffect, useMemo, useState } from "react";
import { credentialsApi, customersApi } from "@/src/api";
import type { CustomerRecord } from "../model/types";
import type { CustomerCredentialRecord } from "../model/credential-types";

export function useCredentials() {
  const [keyword, setKeywordState] = useState("");
  const [status, setStatusState] = useState("");
  const [items, setItems] = useState<CustomerCredentialRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
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

  useEffect(() => {
    let cancelled = false;
    void customersApi
      .list({ page: 1, size: 200 })
      .then((payload) => {
        if (!cancelled) setCustomers(payload.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setCustomers([]);
      })
      .finally(() => {
        if (!cancelled) setCustomersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    return items.filter((item) => {
      if (status && item.status !== status) return false;
      if (!needle) return true;
      return [
        item.name,
        item.customer_name,
        item.postal_customer_no,
        item.test_protocol_no,
        item.production_protocol_no,
        item.sender_no,
        item.gateway_route_key,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [items, keyword, status]);

  return {
    keyword,
    setKeyword: setKeywordState,
    status,
    setStatus: setStatusState,
    items: filtered,
    total: filtered.length,
    customers,
    customersLoading,
    loading,
    error,
    reload: () => {
      setLoading(true);
      setReloadKey((current) => current + 1);
    },
    resetFilters: () => {
      setKeywordState("");
      setStatusState("");
    },
  };
}
