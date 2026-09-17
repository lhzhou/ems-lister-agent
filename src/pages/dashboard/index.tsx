/** @route
meta:
  layout: default
  title: 看板
  tab:
    closable: false
*/

import React, { useCallback, useEffect, useState } from "react";
import { Skeleton, Spin } from "antd";
import { Package, Truck, AlertTriangle, Clock, Users } from "lucide-react";
import { Button } from "@/src/components/Form";
import {
  dashboardApi,
  type DashboardAlert,
  type DashboardMetrics,
  type StagnantWaybill,
} from "@/src/api";
import { WaybillDetailModal } from "@/src/components/Waybill/DetailModal";
import { dashboardStatusCoverage, rankedDashboardStatuses } from "./model/status";
import { type TrendPoint } from "./model/trend";
import { DashboardAlertsTable, type DashboardAlertItem } from "./components/dashboard-alerts-table";
import { DashboardStagnantTable } from "./components/dashboard-stagnant-table";
import { DashboardTrendChart } from "./components/dashboard-trend-chart";

const TEN_MINUTES_MS = 10 * 60 * 1000;

function MetricNumber({ loading, value }: { loading: boolean; value?: number }) {
  return (
    <div className="block h-9 leading-9">
      {loading ? (
        <Skeleton.Input active size="small" className="!h-7 !w-24 !min-w-0 align-middle" />
      ) : (
        <span className="text-3xl font-semibold tracking-tight text-on-surface tabular-nums">
          {(value ?? 0).toLocaleString("zh-CN")}
        </span>
      )}
    </div>
  );
}

function delayUntilNextTenMinutes(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const second = Number(parts.find((part) => part.type === "second")?.value ?? 0);
  const elapsed = ((hour * 60 + minute) * 60 + second) * 1000;
  const wait = TEN_MINUTES_MS - (elapsed % TEN_MINUTES_MS);
  return wait === 0 ? TEN_MINUTES_MS : wait;
}

export interface DashboardPageProps {
  onViewMoreStagnant?: () => void;
}

export default function DashboardPage({ onViewMoreStagnant }: DashboardPageProps) {
  const [showAllExceptions, setShowAllExceptions] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [metricsReady, setMetricsReady] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlertItem[]>([]);
  const [stagnantItems, setStagnantItems] = useState<StagnantWaybill[]>([]);
  const [detailId, setDetailId] = useState<number | null>(null);

  const loadDashboard = useCallback(() => {
    return Promise.all([
      dashboardApi
        .metrics()
        .then((next) => setMetrics(next))
        .catch(() => setMetrics(null)),
      dashboardApi
        .alerts()
        .then((items) => {
          setAlerts(
            items.map((item: DashboardAlert) => ({
              id: String(item.id),
              waybillId: item.waybill_id,
              riskLevel:
                item.severity === "P0" ? "高风险" : item.severity === "P1" ? "中风险" : "一般",
              customer: item.customer_name ?? "未关联客户",
              mailNo: item.waybill_no,
              description: item.reason ?? item.summary ?? "异常订单",
              currentNode: "-",
              occurTime: item.detected_at ?? "-",
            })),
          );
        })
        .catch(() => undefined),
      dashboardApi
        .stagnant()
        .then((items) => setStagnantItems(items))
        .catch(() => undefined),
    ]).finally(() => setMetricsReady(true));
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        void loadDashboard().then(() => {
          if (!cancelled) schedule();
        });
      }, delayUntilNextTenMinutes() + 3000);
    };
    void loadDashboard().then(() => {
      if (!cancelled) schedule();
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [loadDashboard]);

  const loading = !metricsReady;
  const apiTrend = metrics?.intervalStats?.map((item) => ({
    time: item.hour,
    orderCount: Number(item.new_orders),
    exceptionCount: Number(item.anomaly_count),
    subscribeCount: Number(item.subscription_count),
    stagnantCount: Number(item.stagnant_orders),
  }));
  const trendData: TrendPoint[] = apiTrend && apiTrend.length > 0 ? apiTrend : [];
  const subscribeTotal = trendData.reduce((sum, point) => sum + point.subscribeCount, 0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void loadDashboard().finally(() => setIsRefreshing(false));
  };

  const exceptionRows = alerts;
  const displayedExceptions = showAllExceptions ? exceptionRows : exceptionRows.slice(0, 5);
  const statusRows = rankedDashboardStatuses(metrics?.statusCounts);
  const statusCoverage = dashboardStatusCoverage(statusRows, metrics?.totalOrders ?? 0);

  return (
    <div className="space-y-5">
      {/* 1. Top 4 Metric KPI Cards matching Image 1 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="app-card app-card--kpi">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-on-surface-variant">今日新增订单</div>
              <MetricNumber loading={loading} value={metrics?.totalOrders} />
            </div>
            <div className="flex items-center justify-center rounded-[6px] border border-primary-border bg-primary-light p-2.5 text-primary">
              <Package className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="font-medium text-on-surface">当日</span>
            <span className="text-on-surface-disabled">
              {metrics?.statDate ? `${metrics.statDate} 北京时间` : "按订单入库时间统计"}
            </span>
          </div>
        </div>

        <div className="app-card app-card--kpi">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-on-surface-variant">今日订阅次数</div>
              <MetricNumber loading={loading} value={subscribeTotal} />
            </div>
            <div className="flex items-center justify-center rounded-[6px] border border-[#91caff] bg-tag-blue-bg p-2.5 text-info">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="font-medium text-on-surface">当日</span>
            <span className="text-on-surface-disabled">推送事件次数</span>
          </div>
        </div>

        <div className="app-card app-card--kpi">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-on-surface-variant">今日活动异常</div>
              <MetricNumber loading={loading} value={metrics?.exceptions} />
            </div>
            <div className="flex items-center justify-center rounded-[6px] border border-[#ffccc7] bg-alert-error-bg p-2.5 text-error">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="font-medium text-error">当日</span>
            <span className="text-on-surface-disabled">今日检出未闭环</span>
          </div>
        </div>

        <div className="app-card app-card--kpi">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-on-surface-variant">今日滞留</div>
              <MetricNumber loading={loading} value={metrics?.todayStagnantOrders} />
            </div>
            <div className="flex items-center justify-center rounded-[6px] border border-[#ffe58f] bg-alert-warning-bg p-2.5 text-warning">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-on-surface-variant">
            <span>
              <span className="font-medium text-warning">当日</span>
              <span className="text-on-surface-disabled"> 今日新进入滞留</span>
            </span>
            <span>
              总滞留{" "}
              <span className="font-semibold text-on-surface tabular-nums">
                {loading ? "…" : (metrics?.stagnantOrders ?? 0).toLocaleString("zh-CN")}
              </span>
            </span>
          </div>
        </div>

        <div className="app-card app-card--kpi">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-on-surface-variant">客户数量</div>
              <MetricNumber loading={loading} value={metrics?.customerCount} />
            </div>
            <div className="flex items-center justify-center rounded-[6px] border border-primary-border bg-primary-light p-2.5 text-primary">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="font-medium text-on-surface">当前</span>
            <span className="text-on-surface-disabled">已登记重点客户</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: 当日走势 (Trend Chart) + 今日订单状态 (Order Status Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 当日走势 (col-span-8) */}
        <div className="app-card lg:col-span-8 flex flex-col justify-between">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-on-surface">当日走势</h3>
              <p className="mt-0.5 text-xs text-on-surface-disabled">
                北京时间 00:00—24:00，每 10 分钟一档实体统计
              </p>
            </div>
            <Button type="refresh" loading={isRefreshing} onClick={handleRefresh}>
              10分钟刷新
            </Button>
          </div>

          <div className="relative my-2 min-h-[248px] w-full">
            {loading ? (
              <div className="flex h-[248px] items-center justify-center">
                <Spin />
              </div>
            ) : (
              <DashboardTrendChart points={trendData} statDate={metrics?.statDate} />
            )}
          </div>

          {/* Chart Legend matching Image 1 */}
          <div className="flex flex-wrap items-center justify-center gap-6 border-t border-outline-variant pt-3 text-xs font-medium text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary"></span>
              <span>今日新增订单</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-info"></span>
              <span>今日活动异常</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 border-t-2 border-dashed border-warning"></span>
              <span>今日订阅次数</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-error"></span>
              <span>当前滞留</span>
            </div>
          </div>
        </div>

        <div className="app-card lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-on-surface">今日订单状态</h3>
              <p className="mt-0.5 text-xs text-on-surface-disabled">
                仅统计今日新增订单的当前状态
              </p>
            </div>

            <div className="space-y-3.5">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Spin />
                </div>
              ) : metrics ? (
                statusRows.map((row, index) => (
                  <div
                    key={row.status}
                    className={`flex items-center justify-between py-1 ${index === statusRows.length - 1 ? "" : "border-b border-outline-variant"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-surface-container font-mono text-xs font-bold text-on-surface-variant">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-on-surface">{row.label}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold tracking-tight text-on-surface tabular-nums">
                      {row.total.toLocaleString("zh-CN")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-on-surface-disabled">暂无数据</div>
              )}
            </div>
          </div>

          <div className="mt-2 border-t border-outline-variant pt-3">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>状态合计 / 今日新增</span>
              <span className="font-mono font-semibold text-on-surface tabular-nums">
                {metrics
                  ? `${statusCoverage.covered.toLocaleString("zh-CN")} / ${metrics.totalOrders.toLocaleString("zh-CN")}`
                  : "—"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-on-surface-variant">
              <span>状态监控覆盖率</span>
              <span className="font-mono font-semibold text-primary tabular-nums">
                {metrics ? statusCoverage.rate : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DashboardStagnantTable
        items={stagnantItems}
        onOpenDetail={setDetailId}
        onViewMore={onViewMoreStagnant}
      />
      <DashboardAlertsTable
        items={displayedExceptions}
        showAll={showAllExceptions}
        onToggleShowAll={() => setShowAllExceptions((prev) => !prev)}
        onOpenDetail={setDetailId}
      />

      <WaybillDetailModal
        id={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        onRearchived={() => void loadDashboard()}
      />
    </div>
  );
}
