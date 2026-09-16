export const DASHBOARD_STATUS_LABELS: Record<string, string> = {
  pending_pickup: "待揽收",
  picked_up: "已揽收",
  in_transit: "运输中",
  arrived_destination: "到达目的地",
  out_for_delivery: "派送中",
  delivered: "已签收",
  returned: "已退回",
  rejected: "拒收",
  cancelled: "撤单",
  unknown: "未知",
};

const STATUS_ORDER = [
  "in_transit",
  "picked_up",
  "arrived_destination",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "rejected",
  "returned",
  "pending_pickup",
  "unknown",
];

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
    const status = item.current_status || "unknown";
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
