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
    return http.get<DashboardMetrics>('/logistics/dashboard/metrics');
  },

  /** 获取提醒与异常日志流水 */
  getNotificationLogs(limit: number = 50): Promise<NotificationLog[]> {
    return http.get<NotificationLog[]>('/logistics/notifications', { limit });
  }
};
