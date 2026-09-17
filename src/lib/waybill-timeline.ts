import { formatDuration } from "./duration";

export const WAYBILL_STATUS_LABELS: Record<string, string> = {
  pending_pickup: "待揽收",
  in_transit: "运输中",
  delivered: "已签收",
  returned: "退回",
  cancelled: "撤单",
  picked_up: "运输中",
  arrived_destination: "运输中",
  out_for_delivery: "运输中",
  rejected: "退回",
  unknown: "未知",
};

export type WaybillTimelineSource = {
  waybill: {
    waybill_no: string;
    current_status: string;
    current_substatus?: string;
    customer_name?: string;
    first_received_at?: string;
  };
  events: Array<{
    id: number;
    op_time: string;
    op_code: string;
    op_name: string;
    op_desc: string;
    op_org_name: string;
  }>;
};

export type WaybillTimelineEventView = {
  id: string;
  title: string;
  time: string;
  org: string;
  desc: string;
  durationLabel?: string;
};

export type WaybillTimelineNodeView = WaybillTimelineEventView & {
  duration?: string;
  durationLabel?: string;
  isLatest: boolean;
  isOrigin: boolean;
  isDelivered: boolean;
};

export type WaybillTimelineView = {
  title: string;
  waybillNo: string;
  customerName: string;
  sentAt: string;
  statusLabel: string;
  substatus: string;
  events: WaybillTimelineEventView[];
};

export function waybillStatusLabel(status: string) {
  return WAYBILL_STATUS_LABELS[status] ?? status ?? "—";
}

export function coarseStatusClass(status: string) {
  switch (status) {
    case "pending_pickup":
      return "bg-surface-container text-on-surface-variant";
    case "delivered":
      return "border border-primary-border bg-primary-light text-primary";
    case "returned":
    case "rejected":
      return "border border-[#ffe58f] bg-alert-warning-bg text-warning";
    case "cancelled":
      return "bg-surface-container text-on-surface-disabled";
    case "in_transit":
    case "picked_up":
    case "arrived_destination":
    case "out_for_delivery":
      return "border border-[#91caff] bg-tag-blue-bg text-info";
    default:
      return "bg-surface-container text-on-surface-variant";
  }
}

export function latestWaybillOpName(detail: WaybillTimelineSource) {
  const latest = [...detail.events].sort((a, b) => {
    const delta = new Date(b.op_time).getTime() - new Date(a.op_time).getTime();
    if (delta !== 0) return delta;
    return b.id - a.id;
  })[0];
  const name = latest?.op_name?.trim();
  return name || waybillStatusLabel(detail.waybill.current_status);
}

export function formatWaybillEventTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";
  return date.toLocaleString("zh-CN", { hour12: false });
}

export function formatNodeDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分`;
  return `${seconds}秒`;
}

export function formatStayDuration(ms: number) {
  const hours = Math.max(0, Math.floor(ms / 3_600_000));
  return formatDuration(hours);
}

export function isDeliveredWaybillStatus(status: string) {
  return status === "delivered";
}

export function buildWaybillTimelineNodes(
  detail: WaybillTimelineSource,
  now = Date.now(),
): WaybillTimelineNodeView[] {
  const chronological = [...detail.events].sort((a, b) => {
    const delta = new Date(a.op_time).getTime() - new Date(b.op_time).getTime();
    if (delta !== 0) return delta;
    return a.id - b.id;
  });
  const origin = chronological.find((event) => event.op_code === "203") ?? chronological[0];
  const delivered = isDeliveredWaybillStatus(detail.waybill.current_status);
  const nodes = chronological.map((event, index) => {
    const previous = index > 0 ? chronological[index - 1] : undefined;
    const durationMs = previous
      ? new Date(event.op_time).getTime() - new Date(previous.op_time).getTime()
      : 0;
    const duration = previous ? formatNodeDuration(durationMs) : undefined;
    return {
      id: `${event.id}-${event.op_time}-${event.op_code}`,
      title: event.op_name || event.op_code,
      time: formatWaybillEventTime(event.op_time),
      org: event.op_org_name?.trim() ?? "",
      desc: event.op_desc?.trim() ?? "",
      duration,
      durationLabel: duration ? `耗时 ${duration}` : undefined,
      isLatest: false,
      isOrigin: origin != null && event.id === origin.id,
      isDelivered: delivered,
    };
  });
  nodes.reverse();
  if (nodes[0]) {
    nodes[0].isLatest = true;
    if (!delivered) {
      const stayMs = Math.max(
        0,
        now - new Date(chronological[chronological.length - 1].op_time).getTime(),
      );
      nodes[0].duration = formatStayDuration(stayMs);
      nodes[0].durationLabel = `已经停留 ${nodes[0].duration}`;
    }
  }
  return nodes;
}

export function waybillSentAt(detail: WaybillTimelineSource) {
  if (detail.waybill.first_received_at) {
    return formatWaybillEventTime(detail.waybill.first_received_at);
  }
  const firstEvent = detail.events.reduce<string | undefined>((earliest, event) => {
    if (!event.op_time) return earliest;
    if (!earliest) return event.op_time;
    return new Date(event.op_time).getTime() < new Date(earliest).getTime()
      ? event.op_time
      : earliest;
  }, undefined);
  return firstEvent ? formatWaybillEventTime(firstEvent) : "-";
}

export function wrapText(text: string, maxWidth: number, measure: (value: string) => number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [] as string[];
  const lines: string[] = [];
  let current = "";
  for (const char of Array.from(normalized)) {
    const next = current + char;
    if (!current || measure(next) <= maxWidth) {
      current = next;
      continue;
    }
    lines.push(current);
    current = char;
  }
  if (current) lines.push(current);
  return lines;
}

export function wrapParagraphs(text: string, maxWidth: number, measure: (value: string) => number) {
  return text
    .split(/\n+/)
    .flatMap((paragraph) => wrapText(paragraph, maxWidth, measure))
    .filter(Boolean);
}

export function waybillHeaderMeta(
  view: Pick<
    WaybillTimelineView,
    "waybillNo" | "customerName" | "sentAt" | "statusLabel" | "substatus"
  >,
) {
  const status = view.substatus ? `${view.statusLabel} / ${view.substatus}` : view.statusLabel;
  return `运单号：${view.waybillNo}    客户：${view.customerName}    发件日期：${view.sentAt}    当前状态：${status}`;
}

export function buildWaybillTimelineView(
  detail: WaybillTimelineSource,
  now = Date.now(),
): WaybillTimelineView {
  const substatus = detail.waybill.current_substatus?.trim() ?? "";
  return {
    title: "运单轨迹",
    waybillNo: detail.waybill.waybill_no,
    customerName: detail.waybill.customer_name?.trim() || "未关联客户",
    sentAt: waybillSentAt(detail),
    statusLabel: latestWaybillOpName(detail),
    substatus,
    events: buildWaybillTimelineNodes(detail, now).map((node) => ({
      id: node.id,
      title: node.title,
      time: node.time,
      org: node.org,
      desc: node.desc,
      durationLabel: node.durationLabel,
    })),
  };
}
