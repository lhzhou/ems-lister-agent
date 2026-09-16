/** @route
meta:
  layout: default
  title: 看板
  tab:
    closable: false
*/

import React, { useCallback, useEffect, useState } from "react";
import {
  Package,
  Truck,
  AlertTriangle,
  Clock,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  dashboardApi,
  type DashboardAlert,
  type DashboardMetrics,
  type StagnantWaybill,
} from "@/src/api";
import { WaybillDetailModal } from "@/src/components/Waybill/DetailModal";
import { dashboardStatusCoverage, rankedDashboardStatuses } from "./model/status";
import { TREND_DATA, type TrendPoint } from "./model/trend";
import { DashboardAlertsTable, type DashboardAlertItem } from "./components/dashboard-alerts-table";
import { DashboardStagnantTable } from "./components/dashboard-stagnant-table";
import { DashboardTrendChart } from "./components/dashboard-trend-chart";

const TEN_MINUTES_MS = 10 * 60 * 1000;

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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlertItem[]>([]);
  const [stagnantItems, setStagnantItems] = useState<StagnantWaybill[]>([]);
  const [detailId, setDetailId] = useState<number | null>(null);

  const loadDashboard = useCallback(() => {
    return Promise.all([
      dashboardApi
        .metrics()
        .then((next) => setMetrics(next))
        .catch(() => undefined),
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
    ]);
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

  const metricValue = (value: number, fallback: string) =>
    metrics ? value.toLocaleString("zh-CN") : fallback;
  const apiTrend = metrics?.intervalStats?.map((item) => ({
    time: item.hour,
    orderCount: Number(item.new_orders),
    exceptionCount: Number(item.anomaly_count),
    subscribeCount: Number(item.subscription_count),
    stagnantCount: Number(item.stagnant_orders),
  }));
  const trendData: TrendPoint[] = apiTrend && apiTrend.length > 0 ? apiTrend : TREND_DATA;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: 今日新增订单 */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-stone-300 transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-stone-600">今日新增订单</span>
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
                {metricValue(metrics?.totalOrders ?? 2612, "—")}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 font-sans">
            <span className="inline-flex items-center text-stone-700 font-medium">↗ 当日</span>
            <span className="text-stone-400">
              {metrics?.statDate ? `${metrics.statDate} 北京时间` : "按订单入库时间统计"}
            </span>
          </div>
        </div>

        {/* Card 2: 今日订阅次数 */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-stone-300 transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-stone-600">今日订阅次数</span>
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
                {metricValue(
                  metrics ? trendData.reduce((sum, point) => sum + point.subscribeCount, 0) : 40885,
                  "—",
                )}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 font-sans">
            <span className="inline-flex items-center text-stone-700 font-medium">↗ 当日</span>
            <span className="text-stone-400">推送事件次数</span>
          </div>
        </div>

        {/* Card 3: 今日活动异常 */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-stone-300 transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-stone-600">今日活动异常</span>
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
                {metricValue(metrics?.exceptions ?? 4, "—")}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 font-sans">
            <span className="inline-flex items-center text-sky-600 font-medium hover:underline cursor-pointer">
              ↘ 当日
            </span>
            <span className="text-stone-400">今日检出未闭环</span>
          </div>
        </div>

        {/* Card 4: 滞留 */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-stone-300 transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-stone-600">今日滞留</span>
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
                {metricValue(metrics?.todayStagnantOrders ?? 0, "—")}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-stone-500 font-sans">
            <span>
              <span className="text-sky-600 font-medium">↘ 当日</span>
              <span className="text-stone-400"> 今日新进入滞留</span>
            </span>
            <span>
              总滞留{" "}
              <span className="font-semibold text-stone-700">
                {metricValue(metrics?.stagnantOrders ?? 89, "—")}
              </span>
            </span>
          </div>
        </div>

        {/* Card 5: 客户数量 */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-stone-300 transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-stone-600">客户数量</span>
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
                {metricValue(metrics?.customerCount ?? 0, "—")}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 font-sans">
            <span className="inline-flex items-center text-stone-700 font-medium">当前</span>
            <span className="text-stone-400">已登记重点客户</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: 当日走势 (Trend Chart) + 今日订单状态 (Order Status Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 当日走势 (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-stone-900">当日走势</h3>
              <p className="text-xs text-stone-400 mt-0.5">
                北京时间 00:00—24:00，每 10 分钟一档实体统计
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-medium hover:bg-emerald-100 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>10分钟刷新</span>
            </button>
          </div>

          <div className="w-full my-2">
            <DashboardTrendChart points={trendData} statDate={metrics?.statDate} />
          </div>

          {/* Chart Legend matching Image 1 */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-stone-100 text-xs text-stone-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#00703C]"></span>
              <span>今日新增订单</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0284c7]"></span>
              <span>今日活动异常</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-[#d97706]"></span>
              <span>今日订阅次数</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#dc2626]"></span>
              <span>当前滞留</span>
            </div>
          </div>
        </div>

        {/* Right: 今日订单状态 (col-span-4) matching Image 1 */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-stone-900">今日订单状态</h3>
              <p className="text-xs text-stone-400 mt-0.5">仅统计今日新增订单的当前状态</p>
            </div>

            <div className="space-y-3.5">
              {metrics ? (
                statusRows.map((row, index) => (
                  <div
                    key={row.status}
                    className={`flex items-center justify-between py-1 ${index === statusRows.length - 1 ? "" : "border-b border-stone-100"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center font-mono">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-stone-700">{row.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-stone-900 font-mono tracking-tight">
                      {row.total.toLocaleString("zh-CN")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-stone-400">—</div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 mt-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>状态合计 / 今日新增</span>
              <span className="font-semibold text-stone-700 font-mono">
                {metrics
                  ? `${statusCoverage.covered.toLocaleString("zh-CN")} / ${metrics.totalOrders.toLocaleString("zh-CN")}`
                  : "—"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-stone-500">
              <span>状态监控覆盖率</span>
              <span className="font-semibold text-emerald-700 font-mono">
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
      />
    </div>
  );
}
