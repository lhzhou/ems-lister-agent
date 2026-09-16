import React, { useCallback, useEffect, useState } from "react";
import {
  Package,
  Truck,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Users,
} from "lucide-react";
import { ExpressPackage } from "../types/express";
import { DashboardAlert, DashboardMetrics, StagnantWaybill, logisticsApi } from "../api/logistics";
import { DashboardTrendChart } from "./DashboardTrendChart";
import { WaybillDetailModal } from "./WaybillDetailModal";
import { TREND_DATA, type TrendPoint } from "../lib/dashboard-trend";
import { dashboardStatusCoverage, rankedDashboardStatuses } from "../lib/dashboard-status";
import { formatElapsedHours } from "../lib/elapsed-hours";

const STATUS_LABELS: Record<string, string> = {
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

interface DashboardViewProps {
  packages: ExpressPackage[];
  onSelectPackage: (trackingNumberOrId: string) => void;
  onOpenReminderModal?: (pkg: ExpressPackage) => void;
  onViewMoreStagnant?: () => void;
}

interface ExceptionAlertItem {
  id: string;
  waybillId?: number;
  riskLevel: "一般" | "中风险" | "高风险";
  customer: string;
  mailNo: string;
  description: string;
  currentNode: string;
  occurTime: string;
}

// Exception alerts matching image 2
const INITIAL_EXCEPTIONS: ExceptionAlertItem[] = [
  {
    id: "e-1",
    riskLevel: "一般",
    customer: "商丘宜洁日用品有限公司",
    mailNo: "9823169124463",
    description: "轨迹描述包含门卫、门把手、快递箱或代收点关键词，判定为投递位置风险",
    currentNode: "-",
    occurTime: "1分前",
  },
  {
    id: "e-2",
    riskLevel: "一般",
    customer: "商丘宜洁日用品有限公司",
    mailNo: "9819357717574",
    description: "轨迹描述包含门卫、门把手、快递箱或代收点关键词，判定为投递位置风险",
    currentNode: "-",
    occurTime: "34分前",
  },
  {
    id: "e-3",
    riskLevel: "一般",
    customer: "商丘宜洁日用品有限公司",
    mailNo: "9819295757370",
    description: "轨迹描述包含门卫、门把手、快递箱或代收点关键词，判定为投递位置风险",
    currentNode: "-",
    occurTime: "53分前",
  },
  {
    id: "e-4",
    riskLevel: "一般",
    customer: "商丘宜洁日用品有限公司",
    mailNo: "9823169104666",
    description: "轨迹描述包含门卫、门把手、快递箱或代收点关键词，判定为投递位置风险",
    currentNode: "-",
    occurTime: "55分前",
  },
  {
    id: "e-5",
    riskLevel: "一般",
    customer: "商丘宜洁日用品有限公司",
    mailNo: "9823169176414",
    description: "轨迹描述包含门卫、门把手、快递箱或代收点关键词，判定为投递位置风险",
    currentNode: "-",
    occurTime: "64分前",
  },
  {
    id: "e-6",
    riskLevel: "高风险",
    customer: "北京机要综合保障办",
    mailNo: "9823169101238",
    description: "公文特快转运时效延误，预警超时风险，已启动应急陆空联运备用通道",
    currentNode: "北京大兴航邮集散中心",
    occurTime: "72分前",
  },
  {
    id: "e-7",
    riskLevel: "中风险",
    customer: "清华大学招生办公室",
    mailNo: "9819295899120",
    description: "收件人电话关机且短信未回复，已转入专人11183外呼重试队列",
    currentNode: "海淀区清华特快揽投部",
    occurTime: "85分前",
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  packages,
  onSelectPackage,
  onViewMoreStagnant,
}) => {
  const [showAllExceptions, setShowAllExceptions] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<ExceptionAlertItem[]>([]);
  const [stagnantItems, setStagnantItems] = useState<StagnantWaybill[]>([]);
  const [detailId, setDetailId] = useState<number | null>(null);

  const loadDashboard = useCallback(() => {
    return Promise.all([
      logisticsApi
        .getDashboardMetrics()
        .then((next) => setMetrics(next))
        .catch(() => undefined),
      logisticsApi
        .getDashboardAlerts()
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
      logisticsApi
        .getStagnantWaybills()
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

  const exceptionRows = alerts.length > 0 ? alerts : INITIAL_EXCEPTIONS;
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

      {/* 3. 最新滞留信息 */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">最新滞留信息</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                超过24小时未推进
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              按最近轨迹时间倒序，展示当前账号可见的滞留邮件
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onViewMoreStagnant) {
                onViewMoreStagnant();
                return;
              }
              onSelectPackage("stagnant");
            }}
            className="inline-flex items-center gap-0.5 px-3 py-1 text-xs font-medium text-[#00703C] border border-[#00703C]/20 rounded-md bg-white hover:bg-emerald-50"
          >
            <span>查看更多</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700 border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 bg-stone-50/50">
                <th className="py-2.5 px-3 font-semibold">最近轨迹</th>
                <th className="py-2.5 px-3 font-semibold">重点客户</th>
                <th className="py-2.5 px-3 font-semibold">邮件号</th>
                <th className="py-2.5 px-3 font-semibold">当前状态</th>
                <th className="py-2.5 px-3 font-semibold">订单开始时间</th>
                <th className="py-2.5 px-3 font-semibold">当前用时</th>
                <th className="py-2.5 px-3 font-semibold">滞留时长</th>
                <th className="py-2.5 px-3 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {stagnantItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    暂无滞留邮件
                  </td>
                </tr>
              ) : (
                stagnantItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-stone-500 whitespace-nowrap">
                      {item.last_op_time ?? "-"}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-stone-900">
                      {item.customer_name ?? "未关联客户"}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-[#00703C]">
                      <button
                        type="button"
                        onClick={() => setDetailId(item.id)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {item.waybill_no}
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-stone-700">
                      {STATUS_LABELS[item.current_status] ?? item.current_status}
                      {item.current_substatus ? (
                        <span className="ml-1 text-stone-400">{item.current_substatus}</span>
                      ) : null}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-stone-500 whitespace-nowrap">
                      {item.started_at ?? "-"}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-stone-700">
                      {formatElapsedHours(item.elapsed_hours)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-amber-700">
                      {item.stagnant_hours}小时
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDetailId(item.id)}
                        className="text-xs text-[#00703C] hover:text-[#005229] font-medium inline-flex items-center gap-0.5"
                      >
                        <span>轨迹</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 今日异常预警 (Image 2) */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">今日异常预警</h3>
            <p className="text-xs text-stone-400 mt-0.5">仅展示今日检出的最新异常</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllExceptions((prev) => !prev)}
            className="px-3 py-1 text-xs text-stone-600 border border-stone-200 rounded-md bg-white hover:bg-stone-50 font-medium transition-colors"
          >
            {showAllExceptions ? "收起列表" : "查看全部"}
          </button>
        </div>

        {/* Exception Table matching Image 2 columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700 border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 bg-stone-50/50">
                <th className="py-2.5 px-3 font-semibold w-24">风险等级</th>
                <th className="py-2.5 px-3 font-semibold w-48">重点客户</th>
                <th className="py-2.5 px-3 font-semibold w-36">邮件号</th>
                <th className="py-2.5 px-3 font-semibold">异常说明</th>
                <th className="py-2.5 px-3 font-semibold w-36">当前节点</th>
                <th className="py-2.5 px-3 font-semibold w-24 text-right">发生时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {displayedExceptions.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                  {/* 风险等级 */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.riskLevel === "高风险"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : item.riskLevel === "中风险"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{item.riskLevel}</span>
                    </span>
                  </td>

                  {/* 重点客户 */}
                  <td className="py-3 px-3 font-medium text-stone-900">{item.customer}</td>

                  {/* 邮件号 */}
                  <td className="py-3 px-3 font-mono text-stone-700">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.waybillId) {
                          setDetailId(item.waybillId);
                          return;
                        }
                        onSelectPackage(item.mailNo);
                      }}
                      className="text-[#00703C] hover:underline font-medium flex items-center gap-1"
                    >
                      <span>{item.mailNo}</span>
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </button>
                  </td>

                  {/* 异常说明 */}
                  <td className="py-3 px-3 text-stone-600 leading-relaxed">{item.description}</td>

                  {/* 当前节点 */}
                  <td className="py-3 px-3 text-stone-500">{item.currentNode}</td>

                  {/* 发生时间 */}
                  <td className="py-3 px-3 text-stone-400 text-right font-mono whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{item.occurTime}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <WaybillDetailModal
        id={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
};
