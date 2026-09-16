/**
 * 重点物流邮件追踪与签收调度相关 API
 */

import { http } from "./request";
import { ExpressPackage, NotificationLog, ReminderConfig } from "../types/express";

export interface TrackingQueryParams {
  trackingNumber?: string;
  phone?: string;
  status?: string;
  vipLevel?: string;
  page?: number;
  pageSize?: number;
}

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
  /** 单号详情/节点全生命周期查询 */
  getDetail(trackingNumber: string): Promise<ExpressPackage> {
    return http.get<ExpressPackage>(`/logistics/track/${trackingNumber}`);
  },

  /** 分页或筛选重点邮件列表 */
  getList(params?: TrackingQueryParams): Promise<{ list: ExpressPackage[]; total: number }> {
    return http.get<{ list: ExpressPackage[]; total: number }>("/logistics/packages", params);
  },

  /** 批量邮件查询 */
  batchQuery(trackingNumbers: string[]): Promise<ExpressPackage[]> {
    return http.post<ExpressPackage[]>("/logistics/batch-query", { trackingNumbers });
  },

  /** 录入新增重点邮件 */
  createPackage(pkg: Partial<ExpressPackage>): Promise<ExpressPackage> {
    return http.post<ExpressPackage>("/logistics/packages", pkg);
  },

  /** 更新多渠道签收提醒配置 */
  updateReminder(
    packageId: string,
    config: Partial<ReminderConfig>,
  ): Promise<{ success: boolean; config: ReminderConfig }> {
    return http.put(`/logistics/packages/${packageId}/reminder`, config);
  },

  /** 手动触发一次投递/签收模拟推送 */
  triggerTestPush(packageId: string, eventType: string): Promise<NotificationLog> {
    return http.post<NotificationLog>(`/logistics/packages/${packageId}/push-test`, { eventType });
  },

  /** 获取大盘今日汇总统计数据 */
  getDashboardMetrics(): Promise<DashboardMetrics> {
    return http.get<any>("/v1/dashboard", { scope: "today" }).then((payload) => {
      const stats = payload?.stats ?? payload ?? {};
      return {
        totalOrders: Number(stats.total_orders ?? 0),
        inTransit: Number(
          stats.status_counts?.find((item: any) => item.current_status === "in_transit")?.total ??
            0,
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

  /** 今日异常预警独立接口，避免与看板汇总统计耦合。 */
  getDashboardAlerts(): Promise<DashboardAlert[]> {
    return http
      .get<{ items?: DashboardAlert[] }>("/v1/anomalies", { page: 1, size: 5, scope: "today" })
      .then((payload) => payload.items ?? []);
  },

  /** 最新滞留运单，与总后台滞留列表同一口径。 */
  getStagnantWaybills(): Promise<StagnantWaybill[]> {
    return http
      .get<{ items?: StagnantWaybill[] }>("/v1/stagnant-waybills", { page: 1, size: 5 })
      .then((payload) => payload.items ?? []);
  },

  /** 运单轨迹详情，与总后台 GET /v1/waybills/{id}/detail 同一口径。 */
  getWaybillDetail(id: number): Promise<WaybillDetail> {
    return http.get<WaybillDetail>(`/v1/waybills/${id}/detail`);
  },

  /** 订单索引，与总后台 GET /v1/waybills 同一口径。 */
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

  /** 获取提醒与异常日志流水 */
  getNotificationLogs(limit: number = 50): Promise<NotificationLog[]> {
    return http.get<NotificationLog[]>("/logistics/notifications", { limit });
  },
};
