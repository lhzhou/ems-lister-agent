import { useEffect, useState } from "react";
import { waybillsApi } from "@/src/api";
import type { WaybillIndexItem } from "../model/types";

export function useOrders() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [waybillNo, setWaybillNo] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [items, setItems] = useState<WaybillIndexItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [detailId, setDetailId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void waybillsApi
      .list({
        page,
        size,
        waybill_no: waybillNo.trim() || undefined,
        status: status || undefined,
        severity: severity || undefined,
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
        setError(cause instanceof Error ? cause.message : "订单索引加载失败");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, size, waybillNo, status, severity, reloadKey]);

  return {
    page,
    setPage,
    size,
    setSize,
    waybillNo,
    setWaybillNo,
    status,
    setStatus,
    severity,
    setSeverity,
    items,
    total,
    loading,
    error,
    detailId,
    setDetailId,
    reload: () => {
      setLoading(true);
      setReloadKey((current) => current + 1);
    },
    resetFilters: () => {
      setWaybillNo("");
      setStatus("");
      setSeverity("");
      setPage(1);
    },
  };
}
