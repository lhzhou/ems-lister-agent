import type { WaybillIndexItem } from "@/src/api";

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

export function severityClass(severity?: string) {
  if (severity === "P0" || severity === "P1") {
    return "border border-[#ffccc7] bg-alert-error-bg text-error";
  }
  if (severity === "P2") return "border border-[#ffe58f] bg-alert-warning-bg text-warning";
  if (severity === "P3") return "border border-[#91caff] bg-tag-blue-bg text-info";
  return "bg-surface-container text-on-surface-variant";
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
