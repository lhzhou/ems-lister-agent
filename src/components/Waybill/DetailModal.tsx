import React, { useEffect, useMemo, useState } from "react";
import { Clock, Copy, Download, RefreshCw, X } from "lucide-react";
import { logisticsApi, type WaybillDetail } from "@/src/api";
import { copyText } from "@/src/lib/clipboard";
import { downloadWaybillTimelinePdf } from "@/src/lib/waybill-timeline-pdf";
import {
  buildWaybillTimelineNodes,
  latestWaybillOpName,
  waybillSentAt,
} from "@/src/lib/waybill-timeline";

function highlightDesc(desc: string) {
  return desc.split(/(【[^】]+】)/g).map((part, index) =>
    part.startsWith("【") ? (
      <span key={index} className="font-semibold text-slate-900">
        {part}
      </span>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    ),
  );
}

export function WaybillDetailModal({
  id,
  open,
  onClose,
  onRearchived,
}: {
  id: number | null;
  open: boolean;
  onClose: () => void;
  onRearchived?: () => void;
}) {
  const [detail, setDetail] = useState<WaybillDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [rearchiving, setRearchiving] = useState(false);

  useEffect(() => {
    if (!open || !id) {
      setDetail(null);
      setError("");
      setLoading(false);
      setCopied(false);
      setRearchiving(false);
      return;
    }
    let cancelled = false;
    setDetail(null);
    setError("");
    setCopied(false);
    setLoading(true);
    void logisticsApi
      .getWaybillDetail(id)
      .then((next) => {
        if (!cancelled) setDetail(next);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "查询失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, id]);

  const nodes = useMemo(() => (detail ? buildWaybillTimelineNodes(detail) : []), [detail]);
  const status = detail ? latestWaybillOpName(detail) : "";

  function rearchive() {
    if (!id || rearchiving) return;
    setRearchiving(true);
    setError("");
    void logisticsApi
      .rearchiveWaybill(id)
      .then((next) => {
        setDetail(next);
        onRearchived?.();
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "重新归档失败");
      })
      .finally(() => setRearchiving(false));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/60 p-0 sm:items-center sm:p-4">
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1),0_-8px_10px_-6px_rgba(0,0,0,0.05)] sm:rounded-2xl">
        <header className="sticky top-0 z-20 flex-shrink-0 border-b border-slate-100 bg-white px-5 pb-2.5 pt-2.5">
          <div aria-hidden className="mx-auto mb-2 h-1 w-9 rounded-full bg-slate-200 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900">轨迹详情</h1>
              <span className="inline-flex items-center rounded border border-emerald-200/60 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                实时更新
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={rearchive}
                disabled={loading || rearchiving || !id}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${rearchiving ? "animate-spin" : ""}`} />
                重新归档
              </button>
              <button
                type="button"
                onClick={onClose}
                title="关闭"
                className="-mr-1 rounded-full p-1 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {loading && <p className="text-sm text-slate-500">正在加载…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {detail && (
            <>
              {detail.refresh_warning ? (
                <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {detail.refresh_warning}
                </p>
              ) : null}
              <section className="rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-slate-100/70 p-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex min-w-0 items-center space-x-2">
                    <span className="text-[11px] font-medium text-slate-400">单号</span>
                    <span className="truncate font-mono text-sm font-bold tracking-tight text-slate-900">
                      {detail.waybill.waybill_no}
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">(中国邮政)</span>
                    <button
                      type="button"
                      onClick={() => {
                        void copyText(detail.waybill.waybill_no).then((ok) => {
                          if (!ok) {
                            setError("复制失败，请手动选择单号");
                            return;
                          }
                          setError("");
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 1500);
                        });
                      }}
                      className="ml-1 inline-flex items-center space-x-0.5 rounded bg-emerald-100/70 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copied ? "已复制" : "复制"}</span>
                    </button>
                  </div>
                  <div className="flex flex-shrink-0 items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm shadow-emerald-500/20">
                    <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    {status}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1 pt-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">寄件客户：</span>
                    <span className="max-w-[240px] truncate text-right font-medium text-slate-800">
                      {detail.waybill.customer_name?.trim() || "未关联客户"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">发件日期：</span>
                    <span className="font-mono text-[11px] font-medium text-slate-800">
                      {waybillSentAt(detail)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="pt-1">
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    物流动态 ({nodes.length}条轨迹)
                  </h2>
                  <span className="text-[10px] text-slate-400">由新至旧排列</span>
                </div>
                {nodes.length === 0 ? (
                  <p className="text-sm text-slate-400">暂无轨迹节点</p>
                ) : (
                  <div className="relative space-y-2.5 pl-5">
                    <div
                      aria-hidden
                      className="absolute bottom-3 left-[7px] top-3 w-0.5 bg-slate-200"
                    />
                    {nodes.map((node) => (
                      <article key={node.id} className="group relative">
                        {node.isLatest ? (
                          <div className="absolute -left-[18px] top-2.5 flex items-center justify-center">
                            <span className="pulse-dot absolute h-4 w-4 rounded-full bg-emerald-400" />
                            <span className="relative h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-600 shadow" />
                          </div>
                        ) : node.isOrigin ? (
                          <span className="absolute -left-[16px] top-2.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500 ring-2 ring-emerald-100" />
                        ) : (
                          <span className="absolute -left-[16px] top-2.5 h-2 w-2 rounded-full border-2 border-white bg-slate-300 ring-2 ring-slate-100" />
                        )}
                        <div
                          className={
                            node.isLatest
                              ? "rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-2.5 shadow-sm"
                              : "rounded-xl border border-slate-200/70 bg-white p-2.5 shadow-sm"
                          }
                        >
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={
                                  node.isLatest
                                    ? "text-xs font-bold text-emerald-950"
                                    : "text-xs font-semibold text-slate-800"
                                }
                              >
                                {node.title}
                              </span>
                              {node.isLatest ? (
                                <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-white">
                                  最新
                                </span>
                              ) : null}
                              {node.isOrigin && !node.isLatest ? (
                                <span className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                                  始发
                                </span>
                              ) : null}
                            </div>
                            {node.durationLabel ? (
                              <span
                                className={
                                  node.isLatest
                                    ? "inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-emerald-200/70 bg-emerald-100/90 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800"
                                    : "inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                                }
                              >
                                <Clock className="h-2.5 w-2.5" />
                                <span>{node.durationLabel}</span>
                              </span>
                            ) : null}
                          </div>
                          <div className="mb-1 flex items-center justify-between text-[11px]">
                            <span
                              className={
                                node.isLatest
                                  ? "font-medium text-emerald-800"
                                  : "font-medium text-slate-500"
                              }
                            >
                              {node.org || "—"}
                            </span>
                            <time
                              className={
                                node.isLatest
                                  ? "font-mono text-[11px] font-medium text-emerald-700"
                                  : "font-mono text-[11px] text-slate-400"
                              }
                            >
                              {node.time}
                            </time>
                          </div>
                          {node.desc ? (
                            <p className="text-xs leading-normal text-slate-600">
                              {highlightDesc(node.desc)}
                            </p>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        <footer className="z-20 flex flex-shrink-0 items-center justify-end space-x-3 border-t border-slate-100 bg-white p-3.5">
          <button
            type="button"
            onClick={() => {
              if (detail) downloadWaybillTimelinePdf(detail);
            }}
            disabled={!detail}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-emerald-600 bg-white px-4 py-2 text-xs font-medium text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            下载 PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-slate-900 px-5 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-slate-800 sm:flex-none"
          >
            关闭
          </button>
        </footer>
      </div>
    </div>
  );
}
