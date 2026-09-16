export const DASHBOARD_STATUS_LABELS: Record<string, string> = {
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

const STATUS_ORDER = [
  "pending_pickup",
  "in_transit",
  "delivered",
  "returned",
  "cancelled",
  "unknown",
];

const STATUS_BUCKET: Record<string, string> = {
  pending_pickup: "pending_pickup",
  in_transit: "in_transit",
  delivered: "delivered",
  returned: "returned",
  cancelled: "cancelled",
  picked_up: "in_transit",
  arrived_destination: "in_transit",
  out_for_delivery: "in_transit",
  rejected: "returned",
};

export type DashboardStatusCount = {
  current_status: string;
  total: number;
};

export type DashboardStatusRow = {
  status: string;
  label: string;
  total: number;
};

export function rankedDashboardStatuses(
  counts: DashboardStatusCount[] | undefined,
): DashboardStatusRow[] {
  const byStatus = new Map<string, number>();
  for (const item of counts ?? []) {
    const status = STATUS_BUCKET[item.current_status] || item.current_status || "unknown";
    byStatus.set(status, (byStatus.get(status) ?? 0) + Number(item.total ?? 0));
  }
  const seen = new Set<string>();
  const rows: DashboardStatusRow[] = [];
  for (const status of STATUS_ORDER) {
    if (!byStatus.has(status)) continue;
    seen.add(status);
    rows.push({
      status,
      label: DASHBOARD_STATUS_LABELS[status] ?? status,
      total: byStatus.get(status) ?? 0,
    });
  }
  for (const [status, total] of byStatus) {
    if (seen.has(status)) continue;
    rows.push({
      status,
      label: DASHBOARD_STATUS_LABELS[status] ?? status,
      total,
    });
  }
  return rows;
}

export function dashboardStatusCoverage(rows: DashboardStatusRow[], totalOrders: number) {
  const covered = rows.reduce((sum, row) => sum + row.total, 0);
  if (totalOrders <= 0) return { covered, rate: "0.0%" };
  return { covered, rate: `${((covered / totalOrders) * 100).toFixed(1)}%` };
}
