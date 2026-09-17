import React, { useEffect, useMemo, useState } from "react";
import { Clock, Copy, Download, RefreshCw } from "lucide-react";
import { logisticsApi, type WaybillDetail } from "@/src/api";
import { Button, Modal, notify } from "@/src/components/Form";
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
      <span key={index} className="font-semibold text-on-surface">
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

  return (
    <Modal
      size="xlarge"
      open={open}
      onCancel={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          轨迹详情
          <span className="app-status-tag border border-primary-border bg-primary-light text-primary">
            实时更新
          </span>
        </span>
      }
      footer={
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="refresh"
            disabled={loading || rearchiving || !id}
            loading={rearchiving}
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={rearchive}
          >
            重新归档
          </Button>
          <Button
            type="default"
            disabled={!detail}
            icon={<Download className="h-4 w-4" />}
            onClick={() => {
              if (detail) downloadWaybillTimelinePdf(detail);
            }}
          >
            下载 PDF
          </Button>
          <Button type="primary" onClick={onClose}>
            关闭
          </Button>
        </div>
      }
    >
      {loading && <p className="text-sm text-on-surface-variant">正在加载…</p>}
      {error && <p className="mb-4 text-sm text-error">{error}</p>}
      {detail && (
        <div className="space-y-4">
          {detail.refresh_warning ? (
            <p className="rounded-lg border border-[#ffe58f] bg-alert-warning-bg px-3 py-2 text-sm text-warning">
              {detail.refresh_warning}
            </p>
          ) : null}
          <section className="rounded-lg border border-outline bg-surface-container p-4">
            <div className="flex items-center justify-between gap-3 border-b border-outline pb-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-sm text-on-surface-variant">单号</span>
                <span className="truncate font-mono text-sm font-medium tracking-tight text-on-surface tabular-nums">
                  {detail.waybill.waybill_no}
                </span>
                <span className="text-sm text-on-surface-disabled">(中国邮政)</span>
                <Button
                  type="view"
                  className="px-0"
                  icon={<Copy className="h-3.5 w-3.5" />}
                  onClick={() => {
                    void copyText(detail.waybill.waybill_no).then((ok) => {
                      if (!ok) {
                        notify.error("复制失败，请手动选择单号");
                        return;
                      }
                      setError("");
                      setCopied(true);
                      notify.success("运单号已复制");
                      window.setTimeout(() => setCopied(false), 1500);
                    });
                  }}
                >
                  {copied ? "已复制" : "复制"}
                </Button>
              </div>
              <span className="app-status-tag flex-shrink-0 bg-primary text-on-primary">
                <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-on-primary" />
                {status}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 pt-3 text-sm">
              <div className="flex items-center justify-between gap-3 text-on-surface-variant">
                <span>寄件客户</span>
                <span className="max-w-[240px] truncate text-right font-medium text-on-surface">
                  {detail.waybill.customer_name?.trim() || "未关联客户"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-on-surface-variant">
                <span>发件日期</span>
                <span className="font-mono font-medium text-on-surface tabular-nums">
                  {waybillSentAt(detail)}
                </span>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-on-surface">
                物流动态（{nodes.length}条轨迹）
              </h2>
              <span className="text-sm text-on-surface-disabled">由新至旧排列</span>
            </div>
            {nodes.length === 0 ? (
              <p className="text-sm text-on-surface-disabled">暂无轨迹节点</p>
            ) : (
              <div className="relative space-y-3 pl-5">
                <div aria-hidden className="absolute top-3 bottom-3 left-[7px] w-0.5 bg-outline" />
                {nodes.map((node) => (
                  <article key={node.id} className="group relative">
                    {node.isLatest ? (
                      <div className="absolute top-3 -left-[18px] flex items-center justify-center">
                        <span className="pulse-dot absolute h-4 w-4 rounded-full bg-primary-hover" />
                        <span className="relative h-2.5 w-2.5 rounded-full border-2 border-white bg-primary shadow" />
                      </div>
                    ) : node.isOrigin ? (
                      <span className="absolute top-3 -left-[16px] h-2 w-2 rounded-full border-2 border-white bg-primary-hover ring-2 ring-primary-light" />
                    ) : (
                      <span className="absolute top-3 -left-[16px] h-2 w-2 rounded-full border-2 border-white bg-outline ring-2 ring-outline-variant" />
                    )}
                    <div
                      className={
                        node.isLatest
                          ? "rounded-lg border border-primary-border bg-primary-light p-3"
                          : "rounded-lg border border-outline bg-surface p-3"
                      }
                    >
                      <div className="mb-1.5 flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={
                              node.isLatest
                                ? "text-sm font-semibold text-primary-dark"
                                : "text-sm font-semibold text-on-surface"
                            }
                          >
                            {node.title}
                          </span>
                          {node.isLatest ? (
                            <span className="app-status-tag bg-primary text-on-primary">最新</span>
                          ) : null}
                          {node.isOrigin && !node.isLatest ? (
                            <span className="app-status-tag border border-outline bg-surface-container text-on-surface-variant">
                              始发
                            </span>
                          ) : null}
                        </div>
                        {node.durationLabel ? (
                          <span
                            className={
                              node.isLatest
                                ? "app-status-tag flex-shrink-0 gap-1 border border-primary-border bg-primary-light text-primary"
                                : "app-status-tag flex-shrink-0 gap-1 border border-outline bg-surface-container text-on-surface-variant"
                            }
                          >
                            <Clock className="h-3 w-3" />
                            <span>{node.durationLabel}</span>
                          </span>
                        ) : null}
                      </div>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span
                          className={
                            node.isLatest
                              ? "font-medium text-primary"
                              : "font-medium text-on-surface-variant"
                          }
                        >
                          {node.org || "—"}
                        </span>
                        <time
                          className={
                            node.isLatest
                              ? "font-mono font-medium text-primary tabular-nums"
                              : "font-mono text-on-surface-disabled tabular-nums"
                          }
                        >
                          {node.time}
                        </time>
                      </div>
                      {node.desc ? (
                        <p className="text-sm leading-5 text-on-surface-variant">
                          {highlightDesc(node.desc)}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
