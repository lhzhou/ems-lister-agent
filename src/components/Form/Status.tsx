import { Tag } from "antd";
import type { TagProps } from "antd";
import type { ReactNode } from "react";

export const STATUS_TONES = ["success", "processing", "warning", "error", "default"] as const;

export type AppStatusTone = (typeof STATUS_TONES)[number];

export type AppStatusProps = Omit<TagProps, "color"> & {
  tone?: AppStatusTone;
  children: ReactNode;
};

export function Status({ tone = "default", className, children, ...rest }: AppStatusProps) {
  return (
    <Tag color={tone} className={["m-0", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </Tag>
  );
}

export function waybillStatusTone(status: string): AppStatusTone {
  switch (status) {
    case "delivered":
      return "success";
    case "in_transit":
    case "picked_up":
    case "arrived_destination":
    case "out_for_delivery":
      return "processing";
    case "returned":
    case "rejected":
      return "warning";
    case "cancelled":
      return "error";
    case "pending_pickup":
    default:
      return "default";
  }
}

export function severityTone(severity?: string): AppStatusTone {
  if (severity === "P0" || severity === "P1") return "error";
  if (severity === "P2") return "warning";
  if (severity === "P3") return "processing";
  return "default";
}

export function accountStatusTone(status: string): AppStatusTone {
  if (status === "active") return "success";
  if (status === "locked") return "error";
  return "default";
}

export function customerStatusTone(status: string): AppStatusTone {
  return status === "frozen" ? "error" : "success";
}

export function credentialStatusTone(status: string): AppStatusTone {
  return status === "active" ? "success" : "default";
}

export function enabledStatusTone(enabled: boolean): AppStatusTone {
  return enabled ? "success" : "default";
}

export function riskStatusTone(level: string): AppStatusTone {
  if (level === "高风险") return "error";
  if (level === "中风险") return "warning";
  return "default";
}
