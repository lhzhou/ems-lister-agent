import type { WaybillIndexItem } from "@/src/api";
import { WAYBILL_STATUS_LABELS } from "@/src/lib/waybill-timeline";

export const PAGE_SIZES = [20, 50, 100];

export const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "pending_pickup", label: "待揽收" },
  { value: "in_transit", label: "运输中" },
  { value: "delivered", label: "已签收" },
  { value: "returned", label: "退回" },
  { value: "cancelled", label: "撤单" },
];

export const SEVERITY_OPTIONS = [
  { value: "", label: "全部异常等级" },
  { value: "P0", label: "P0（紧急）" },
  { value: "P1", label: "P1（高）" },
  { value: "P2", label: "P2（中）" },
  { value: "P3", label: "P3（低）" },
  { value: "NONE", label: "无异常" },
];

export function statusLabel(status: string, substatus?: string, opName?: string) {
  const name = opName?.trim();
  if (name) return name;
  const label = WAYBILL_STATUS_LABELS[status] || status || "—";
  return substatus ? `${label} / ${substatus}` : label;
}

export function severityClass(severity?: string) {
  if (severity === "P0" || severity === "P1") {
    return "bg-red-50 text-red-700 border border-red-200";
  }
  if (severity === "P2") return "bg-amber-50 text-amber-700 border border-amber-200";
  if (severity === "P3") return "bg-sky-50 text-sky-700 border border-sky-200";
  return "bg-stone-100 text-stone-600";
}

export function severityText(severity?: string) {
  return !severity || severity === "NONE" ? "无" : severity;
}

export function formatOpTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

export type { WaybillIndexItem };
