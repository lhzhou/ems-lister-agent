import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { logisticsApi, WaybillIndexItem } from "../api/logistics";
import { WAYBILL_STATUS_LABELS } from "../lib/waybill-timeline";
import { WaybillDetailModal } from "./WaybillDetailModal";

const PAGE_SIZES = [20, 50, 100];

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "pending_pickup", label: "待揽收" },
  { value: "picked_up", label: "已揽收" },
  { value: "in_transit", label: "运输中" },
  { value: "arrived_destination", label: "到达目的地" },
  { value: "out_for_delivery", label: "派送中" },
  { value: "delivered", label: "已签收" },
  { value: "returned", label: "已退回" },
  { value: "rejected", label: "拒收" },
  { value: "cancelled", label: "撤单" },
];

const SEVERITY_OPTIONS = [
  { value: "", label: "全部异常等级" },
  { value: "P0", label: "P0（紧急）" },
  { value: "P1", label: "P1（高）" },
  { value: "P2", label: "P2（中）" },
  { value: "P3", label: "P3（低）" },
  { value: "NONE", label: "无异常" },
];

function statusLabel(status: string, substatus?: string) {
  const label = WAYBILL_STATUS_LABELS[status] || status || "—";
  return substatus ? `${label} / ${substatus}` : label;
}

function severityClass(severity?: string) {
  if (severity === "P0" || severity === "P1") return "bg-rose-50 text-rose-700 border-rose-200";
  if (severity === "P2") return "bg-amber-50 text-amber-700 border-amber-200";
  if (severity === "P3") return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-stone-100 text-stone-500 border-stone-200";
}

function severityText(severity?: string) {
  return !severity || severity === "NONE" ? "无" : severity;
}

function formatOpTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

function pageItems(page: number, pageCount: number) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const items: Array<number | "…"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) items.push("…");
  for (let n = start; n <= end; n += 1) items.push(n);
  if (end < pageCount - 1) items.push("…");
  items.push(pageCount);
  return items;
}

export function OrderIndexView() {
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

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void logisticsApi
      .getWaybills({
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
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setError(cause instanceof Error ? cause.message : "订单索引加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, size, waybillNo, status, severity, reloadKey]);

  useEffect(() => load(), [load]);

  const pageCount = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="grid gap-3 md:grid-cols-5">
          <label className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={waybillNo}
              onChange={(event) => {
                setWaybillNo(event.target.value);
                setPage(1);
              }}
              placeholder="搜索运单号"
              aria-label="搜索运单号"
              className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm text-stone-800 outline-none focus:border-emerald-300 focus:bg-white"
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="筛选当前状态"
            className="h-10 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none focus:border-emerald-300 focus:bg-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={severity}
            onChange={(event) => {
              setSeverity(event.target.value);
              setPage(1);
            }}
            aria-label="筛选异常等级"
            className="h-10 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none focus:border-emerald-300 focus:bg-white"
          >
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setWaybillNo("");
              setStatus("");
              setSeverity("");
              setPage(1);
            }}
            className="h-10 rounded-xl border border-stone-200 px-4 text-sm text-stone-600 hover:bg-stone-50"
          >
            重置筛选
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        <header className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-stone-800">订单索引</h2>
            <p className="mt-0.5 text-xs text-stone-400">共 {total} 条</p>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-stone-500 hover:bg-stone-50 hover:text-stone-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </button>
        </header>

        {loading ? (
          <p className="px-4 py-16 text-center text-sm text-stone-400">正在加载订单索引…</p>
        ) : error ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-3 rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50"
            >
              重试
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-stone-400">
            当前筛选条件下没有订单索引记录。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs font-semibold text-stone-500">
                <tr>
                  <th className="px-3 py-2.5">ID</th>
                  <th className="px-3 py-2.5">订单号</th>
                  <th className="px-3 py-2.5">运单号</th>
                  <th className="px-3 py-2.5">客户</th>
                  <th className="px-3 py-2.5">当前状态</th>
                  <th className="px-3 py-2.5">异常等级</th>
                  <th className="px-3 py-2.5">当前问题</th>
                  <th className="px-3 py-2.5">最后更新时间</th>
                  <th className="px-3 py-2.5">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-stone-100 text-stone-700">
                    <td className="px-3 py-2.5 font-mono text-xs text-stone-400">{item.id}</td>
                    <td className="px-3 py-2.5">{item.order_no || "—"}</td>
                    <td className="px-3 py-2.5 font-medium">{item.waybill_no}</td>
                    <td className="px-3 py-2.5">{item.customer_name || "—"}</td>
                    <td className="px-3 py-2.5">
                      {statusLabel(item.current_status, item.current_substatus)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${severityClass(item.highest_severity)}`}
                      >
                        {severityText(item.highest_severity)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {item.active_issue_summary || "无"}
                      {item.is_stagnant ? <span className="ml-2 text-amber-600">滞留</span> : null}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {formatOpTime(item.last_op_time)}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setDetailId(item.id)}
                        className="text-sm font-medium text-sky-600 hover:text-sky-700"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-stone-500">
        <select
          value={size}
          onChange={(event) => {
            setSize(Number(event.target.value));
            setPage(1);
          }}
          className="h-8 rounded-lg border border-stone-200 bg-white px-2"
          aria-label="每页条数"
        >
          {PAGE_SIZES.map((value) => (
            <option key={value} value={value}>
              {value} 条/页
            </option>
          ))}
        </select>
        {pageItems(page, pageCount).map((item, index) =>
          item === "…" ? (
            <span key={`ellipsis-${index}`} className="px-1">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => setPage(item)}
              className={`min-w-8 rounded-lg px-2 py-1 ${
                item === page
                  ? "bg-[#00703C] text-white"
                  : "border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <WaybillDetailModal
        id={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
