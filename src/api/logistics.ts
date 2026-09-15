/**
 * 重点物流邮件追踪与签收调度相关 API
 */

import { http } from './request';
import { ExpressPackage, NotificationLog, ReminderConfig } from '../types/express';

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
  deliveryRate: string;
  vipGuaranteedRate: string;
  generatedAt?: string;
  statDate?: string;
  hourlyNew?: Array<{ hour: string; total: number }>;
  intervalStats?: Array<{ hour: string; new_orders: number; subscription_count: number; anomaly_count: number; stagnant_orders: number }>;
  statusCounts?: Array<{ current_status: string; total: number }>;
}

export interface DashboardAlert {
  id: number;
  customer_name?: string;
  waybill_no: string;
  severity?: string;
  reason?: string;
  summary?: string;
  detected_at?: string;
}

export const logisticsApi = {
  /** 单号详情/节点全生命周期查询 */
  getDetail(trackingNumber: string): Promise<ExpressPackage> {
    return http.get<ExpressPackage>(`/logistics/track/${trackingNumber}`);
  },

  /** 分页或筛选重点邮件列表 */
  getList(params?: TrackingQueryParams): Promise<{ list: ExpressPackage[]; total: number }> {
    return http.get<{ list: ExpressPackage[]; total: number }>('/logistics/packages', params);
  },

  /** 批量邮件查询 */
  batchQuery(trackingNumbers: string[]): Promise<ExpressPackage[]> {
    return http.post<ExpressPackage[]>('/logistics/batch-query', { trackingNumbers });
  },

  /** 录入新增重点邮件 */
  createPackage(pkg: Partial<ExpressPackage>): Promise<ExpressPackage> {
    return http.post<ExpressPackage>('/logistics/packages', pkg);
  },

  /** 更新多渠道签收提醒配置 */
  updateReminder(packageId: string, config: Partial<ReminderConfig>): Promise<{ success: boolean; config: ReminderConfig }> {
    return http.put(`/logistics/packages/${packageId}/reminder`, config);
  },

  /** 手动触发一次投递/签收模拟推送 */
  triggerTestPush(packageId: string, eventType: string): Promise<NotificationLog> {
    return http.post<NotificationLog>(`/logistics/packages/${packageId}/push-test`, { eventType });
  },

  /** 获取大盘今日汇总统计数据 */
  getDashboardMetrics(): Promise<DashboardMetrics> {
    return http.get<any>('/v1/dashboard', { scope: 'today' }).then((payload) => {
      const stats = payload?.stats ?? payload ?? {};
      return {
        totalOrders: Number(stats.total_orders ?? 0),
        inTransit: Number(stats.status_counts?.find((item: any) => item.current_status === 'in_transit')?.total ?? 0),
        delivering: Number(stats.status_counts?.find((item: any) => item.current_status === 'out_for_delivery')?.total ?? 0),
        delivered: Number(stats.status_counts?.find((item: any) => item.current_status === 'delivered')?.total ?? 0),
        exceptions: Number(stats.active_anomalies ?? 0),
        deliveryRate: stats.total_orders ? `${((Number(stats.status_counts?.find((item: any) => item.current_status === 'delivered')?.total ?? 0) / Number(stats.total_orders)) * 100).toFixed(1)}%` : '0.0%',
        vipGuaranteedRate: '—',
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
    return http.get<{ items?: DashboardAlert[] }>('/v1/anomalies', { page: 1, size: 5, scope: 'today' }).then((payload) => payload.items ?? []);
  },

  /** 获取提醒与异常日志流水 */
  getNotificationLogs(limit: number = 50): Promise<NotificationLog[]> {
    return http.get<NotificationLog[]>('/logistics/notifications', { limit });
  }
};
