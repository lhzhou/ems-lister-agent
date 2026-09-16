/**
 * 重点物流邮件追踪相关 API
 */

import { http } from "@/src/lib/request";

export interface DashboardMetrics {
  totalOrders: number;
  inTransit: number;
  delivering: number;
  delivered: number;
  exceptions: number;
  stagnantOrders: number;
  todayStagnantOrders: number;
  customerCount: number;
  deliveryRate: string;
  vipGuaranteedRate: string;
  generatedAt?: string;
  statDate?: string;
  hourlyNew?: Array<{ hour: string; total: number }>;
  intervalStats?: Array<{
    hour: string;
    new_orders: number;
    subscription_count: number;
    anomaly_count: number;
    stagnant_orders: number;
  }>;
  statusCounts?: Array<{ current_status: string; total: number }>;
}

export interface DashboardAlert {
  id: number;
  waybill_id?: number;
  customer_name?: string;
  waybill_no: string;
  severity?: string;
  reason?: string;
  summary?: string;
  detected_at?: string;
}

export interface WaybillIndexItem {
  id: number;
  waybill_no: string;
  order_no?: string;
  customer_name?: string;
  current_status: string;
  current_substatus?: string;
  last_op_name?: string;
  started_at?: string;
  elapsed_hours?: number;
  current_node?: string;
  last_op_time?: string;
  highest_severity?: string;
  active_issue_summary?: string;
  is_stagnant?: boolean;
}

export interface WaybillIndexPage {
  items?: WaybillIndexItem[];
  total: number;
  page: number;
  size: number;
}

export interface StagnantWaybill {
  id: number;
  waybill_no: string;
  customer_name?: string;
  current_status: string;
  current_substatus?: string;
  last_op_name?: string;
  last_op_time?: string;
  started_at?: string;
  stagnant_hours: number;
  elapsed_hours?: number;
}

export interface WaybillDetail {
  waybill: {
    id: number;
    waybill_no: string;
    current_status: string;
    current_substatus?: string;
    direction: string;
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
  refresh_warning?: string;
}

export const logisticsApi = {
  getDashboardMetrics(): Promise<DashboardMetrics> {
    return http.get<any>("/v1/dashboard", { scope: "today" }).then((payload) => {
      const stats = payload?.stats ?? payload ?? {};
      return {
        totalOrders: Number(stats.total_orders ?? 0),
        inTransit: Number(
          stats.status_counts?.find((item: any) => item.current_status === "in_transit")?.total ?? 0,
        ),
        delivering: Number(
          stats.status_counts?.find((item: any) => item.current_status === "out_for_delivery")
            ?.total ?? 0,
        ),
        delivered: Number(
          stats.status_counts?.find((item: any) => item.current_status === "delivered")?.total ?? 0,
        ),
        exceptions: Number(stats.active_anomalies ?? 0),
        stagnantOrders: Number(stats.stagnant_orders ?? 0),
        todayStagnantOrders: Number(stats.today_stagnant_orders ?? 0),
        customerCount: Number(payload?.customer_count ?? stats.customer_count ?? 0),
        deliveryRate: stats.total_orders
          ? `${((Number(stats.status_counts?.find((item: any) => item.current_status === "delivered")?.total ?? 0) / Number(stats.total_orders)) * 100).toFixed(1)}%`
          : "0.0%",
        vipGuaranteedRate: "—",
        generatedAt: stats.generated_at,
        statDate: stats.stat_date,
        hourlyNew: stats.hourly_new,
        intervalStats: stats.interval_stats,
        statusCounts: stats.status_counts,
      };
    });
  },

  getDashboardAlerts(): Promise<DashboardAlert[]> {
    return http
      .get<{ items?: DashboardAlert[] }>("/v1/anomalies", { page: 1, size: 5, scope: "today" })
      .then((payload) => payload.items ?? []);
  },

  getStagnantWaybills(): Promise<StagnantWaybill[]> {
    return http
      .get<{ items?: StagnantWaybill[] }>("/v1/stagnant-waybills", { page: 1, size: 5 })
      .then((payload) => payload.items ?? []);
  },

  getWaybillDetail(id: number): Promise<WaybillDetail> {
    return http.get<WaybillDetail>(`/v1/waybills/${id}/detail`);
  },

  rearchiveWaybill(id: number): Promise<WaybillDetail> {
    return http.post<WaybillDetail>(`/v1/waybills/${id}/rearchive`);
  },

  getWaybills(
    params: {
      page?: number;
      size?: number;
      waybill_no?: string;
      status?: string;
      severity?: string;
    } = {},
  ): Promise<WaybillIndexPage> {
    return http.get<WaybillIndexPage>("/v1/waybills", params);
  },
};
