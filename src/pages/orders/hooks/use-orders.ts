import { useEffect, useState } from "react";
import { waybillsApi } from "@/src/api";
import { replaceBrowserHref } from "@/src/hooks/use-workspace-location";
import { workspaceTabFromHref } from "@/src/routers/workspace-tab";
import { tabPathname } from "@/src/stores/workspace-logic";
import { useWorkspaceStore } from "@/src/stores/workspace-store";
import {
  DEFAULT_ORDERS_QUERY,
  ordersHref,
  parseOrdersQuery,
  type OrdersQuery,
} from "../model/query";
import type { WaybillIndexItem } from "../model/types";

function ordersSearchFromHref(href: string) {
  const index = href.indexOf("?");
  return index >= 0 ? href.slice(index) : "";
}

function commitQuery(next: OrdersQuery) {
  const href = ordersHref(next);
  replaceBrowserHref(href);
  const tab = workspaceTabFromHref(href);
  if (tab) useWorkspaceStore.getState().open(tab);
}

export function useOrders() {
  const href = useWorkspaceStore(
    (state) => state.tabs.find((item) => tabPathname(item.id) === "/orders")?.href ?? "/orders",
  );
  const query = parseOrdersQuery(ordersSearchFromHref(href));
  const [items, setItems] = useState<WaybillIndexItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [rearchivingId, setRearchivingId] = useState<number | null>(null);

  const applyQuery = (patch: Partial<OrdersQuery>) => {
    setLoading(true);
    commitQuery({ ...query, ...patch });
  };

  useEffect(() => {
    let cancelled = false;
    void waybillsApi
      .list({
        page: query.page,
        size: query.size,
        waybill_no: query.waybillNo.trim() || undefined,
        status: query.status || undefined,
        severity: query.severity || undefined,
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
  }, [query.page, query.size, query.waybillNo, query.status, query.severity, reloadKey]);

  return {
    page: query.page,
    setPage: (page: number) => applyQuery({ page }),
    size: query.size,
    setSize: (size: number) => applyQuery({ size, page: 1 }),
    waybillNo: query.waybillNo,
    setWaybillNo: (waybillNo: string) => applyQuery({ waybillNo, page: 1 }),
    status: query.status,
    setStatus: (status: string) => applyQuery({ status, page: 1 }),
    severity: query.severity,
    setSeverity: (severity: string) => applyQuery({ severity, page: 1 }),
    items,
    total,
    loading,
    error,
    detailId,
    setDetailId,
    rearchivingId,
    rearchive: (id: number) => {
      if (!id || rearchivingId) return;
      setRearchivingId(id);
      void waybillsApi
        .rearchive(id)
        .then(() => {
          setLoading(true);
          setReloadKey((current) => current + 1);
        })
        .catch((cause: unknown) => {
          setError(cause instanceof Error ? cause.message : "重新归档失败");
        })
        .finally(() => setRearchivingId(null));
    },
    reload: () => {
      setLoading(true);
      setReloadKey((current) => current + 1);
    },
    resetFilters: () => applyQuery({ ...DEFAULT_ORDERS_QUERY }),
  };
}
