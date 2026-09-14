import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Bell,
  MessageSquare,
  PhoneCall,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { ExpressPackage } from '../types/express';

interface DashboardViewProps {
  packages: ExpressPackage[];
  onSelectPackage: (trackingNumberOrId: string) => void;
  onOpenReminderModal?: (pkg: ExpressPackage) => void;
}

interface TrendPoint {
  time: string;
  orderCount: number;
  exceptionCount: number;
  subscribeCount: number;
  stagnantCount: number;
}

// 24-hour simulation trend points matching the curve in user screenshot
const TREND_DATA: TrendPoint[] = [
  { time: '00:00', orderCount: 20, exceptionCount: 1, subscribeCount: 95, stagnantCount: 12 },
  { time: '01:00', orderCount: 15, exceptionCount: 0, subscribeCount: 160, stagnantCount: 14 },
  { time: '02:00', orderCount: 10, exceptionCount: 0, subscribeCount: 80, stagnantCount: 15 },
  { time: '03:00', orderCount: 12, exceptionCount: 1, subscribeCount: 190, stagnantCount: 16 },
  { time: '04:00', orderCount: 8, exceptionCount: 0, subscribeCount: 75, stagnantCount: 18 },
  { time: '05:00', orderCount: 25, exceptionCount: 0, subscribeCount: 140, stagnantCount: 20 },
  { time: '05:30', orderCount: 30, exceptionCount: 1, subscribeCount: 520, stagnantCount: 22 },
  { time: '06:00', orderCount: 45, exceptionCount: 1, subscribeCount: 90, stagnantCount: 24 },
  { time: '07:00', orderCount: 65, exceptionCount: 2, subscribeCount: 180, stagnantCount: 25 },
  { time: '08:00', orderCount: 95, exceptionCount: 2, subscribeCount: 250, stagnantCount: 28 },
  { time: '09:00', orderCount: 140, exceptionCount: 2, subscribeCount: 310, stagnantCount: 30 },
  { time: '09:40', orderCount: 210, exceptionCount: 3, subscribeCount: 430, stagnantCount: 32 },
  { time: '10:00', orderCount: 480, exceptionCount: 4, subscribeCount: 680, stagnantCount: 35 },
  { time: '10:30', orderCount: 120, exceptionCount: 3, subscribeCount: 450, stagnantCount: 36 },
  { time: '11:00', orderCount: 75, exceptionCount: 2, subscribeCount: 790, stagnantCount: 35 },
  { time: '11:30', orderCount: 50, exceptionCount: 2, subscribeCount: 620, stagnantCount: 33 },
  { time: '12:00', orderCount: 60, exceptionCount: 1, subscribeCount: 810, stagnantCount: 32 },
  { time: '12:30', orderCount: 90, exceptionCount: 2, subscribeCount: 280, stagnantCount: 30 },
  { time: '13:00', orderCount: 230, exceptionCount: 3, subscribeCount: 340, stagnantCount: 28 },
  { time: '13:30', orderCount: 80, exceptionCount: 1, subscribeCount: 120, stagnantCount: 27 },
  { time: '15:00', orderCount: 40, exceptionCount: 0, subscribeCount: 60, stagnantCount: 25 },
  { time: '18:00', orderCount: 35, exceptionCount: 0, subscribeCount: 45, stagnantCount: 22 },
  { time: '21:00', orderCount: 20, exceptionCount: 0, subscribeCount: 30, stagnantCount: 20 },
  { time: '24:00', orderCount: 10, exceptionCount: 0, subscribeCount: 15, stagnantCount: 18 }
];

interface ExceptionAlertItem {
  id: string;
  riskLevel: '一般' | '中风险' | '高风险';
  customer: string;
  mailNo: string;
  description: string;
  currentNode: string;
  occurTime: string;
}

// Exception alerts matching image 2
const INITIAL_EXCEPTIONS: ExceptionAlertItem[] = [
  {
    id: 'e-1',
    riskLevel: '一般',
    customer: '商丘宜洁日用品有限公司',
    mailNo: '9823169124463',
    description: '轨迹描述包含门卫、门把手、快递箱或代收点关键词，判定为投递位置风险',
    currentNode: '-',
    occurTime: '1分前'
  },
  {
    id: 'e-2',
    riskLevel: '一般',
    customer: '商丘宜洁日用品有限公司',
    mailNo: '9819357717574',
    description: '轨迹描述包含门卫、门把手、快递箱或代收点关键词，判定为投递位置风险',
    currentNode: '-',
    occurTime: '34分前'
  },
  {
    id: 'e-3',
    riskLevel: '一般',
    customer: '商丘宜洁日用品有限公司',
    mailNo: '9819295757370',
    description: '轨迹描述包含门卫、门把手、快递箱或代收点关键词，判定为投递位置风险',
    currentNode: '-',
    occurTime: '53分前'
  },
  {
    id: 'e-4',
    riskLevel: '一般',
    customer: '商丘宜洁日用品有限公司',
    mailNo: '9823169104666',
    description: '轨迹描述包含门卫、门把手、快递箱或代收点关键词，判定为投递位置风险',
    currentNode: '-',
    occurTime: '55分前'
  },
  {
    id: 'e-5',
    riskLevel: '一般',
    customer: '商丘宜洁日用品有限公司',
    mailNo: '9823169176414',
    description: '轨迹描述包含门卫、门把手、快递箱或代收点关键词，判定为投递位置风险',
    currentNode: '-',
    occurTime: '64分前'
  },
  {
    id: 'e-6',
    riskLevel: '高风险',
    customer: '北京机要综合保障办',
    mailNo: '9823169101238',
    description: '公文特快转运时效延误，预警超时风险，已启动应急陆空联运备用通道',
    currentNode: '北京大兴航邮集散中心',
    occurTime: '72分前'
  },
  {
    id: 'e-7',
    riskLevel: '中风险',
    customer: '清华大学招生办公室',
    mailNo: '9819295899120',
    description: '收件人电话关机且短信未回复，已转入专人11183外呼重试队列',
    currentNode: '海淀区清华特快揽投部',
    occurTime: '85分前'
  }
];

interface SubscriptionRecord {
  id: string;
  time: string;
  channel: '微信服务号' | '106短信' | '11183语音' | '企业协同';
  mailNo: string;
  receiver: string;
  phone: string;
  event: string;
  status: '已送达' | '推送中' | '重试';
  latency: string;
}

const INITIAL_SUBSCRIPTIONS: SubscriptionRecord[] = [
  {
    id: 'sub-1',
    time: '12:41:05',
    channel: '微信服务号',
    mailNo: '9823169124463',
    receiver: '张*远 (收件人)',
    phone: '138****5678',
    event: '派送上门前预约提醒已推送',
    status: '已送达',
    latency: '86ms'
  },
  {
    id: 'sub-2',
    time: '12:39:18',
    channel: '106短信',
    mailNo: '9819357717574',
    receiver: '刘*华 (寄件人)',
    phone: '139****1234',
    event: '快件已到达商丘转运中心通知',
    status: '已送达',
    latency: '112ms'
  },
  {
    id: 'sub-3',
    time: '12:37:44',
    channel: '11183语音',
    mailNo: '1109845210981',
    receiver: '李* (机要收发员)',
    phone: '010-****8821',
    event: '特快公文妥投专属语音回执播报',
    status: '已送达',
    latency: '340ms'
  },
  {
    id: 'sub-4',
    time: '12:35:10',
    channel: '微信服务号',
    mailNo: '9823169104666',
    receiver: '王* (经办人)',
    phone: '186****9012',
    event: '干线冷链温度实时正常达标推送',
    status: '已送达',
    latency: '95ms'
  },
  {
    id: 'sub-5',
    time: '12:31:22',
    channel: '企业协同',
    mailNo: '9823169176414',
    receiver: '商丘宜洁日用品物流科',
    phone: '0370-****666',
    event: '批量在途监控状态WebHook回调',
    status: '已送达',
    latency: '45ms'
  }
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  packages,
  onSelectPackage
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('全部');
  const [showAllExceptions, setShowAllExceptions] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const filteredSubscriptions = subscriptionFilter === '全部' 
    ? INITIAL_SUBSCRIPTIONS 
    : INITIAL_SUBSCRIPTIONS.filter(s => s.channel === subscriptionFilter);

  const displayedExceptions = showAllExceptions 
    ? INITIAL_EXCEPTIONS 
    : INITIAL_EXCEPTIONS.slice(0, 5);

  // SVG dimensions for trend chart
  const svgWidth = 1000;
  const svgHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const maxVal = 900; // max value on y axis

  const getX = (index: number) => paddingLeft + (index / (TREND_DATA.length - 1)) * chartW;
  const getY = (val: number) => paddingTop + chartH - (val / maxVal) * chartH;

  // Build SVG path strings
  const orderPath = TREND_DATA.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.orderCount)}`).join(' ');
  const subscribePath = TREND_DATA.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.subscribeCount)}`).join(' ');
  const exceptionPath = TREND_DATA.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.exceptionCount * 30)}`).join(' ');
  const stagnantPath = TREND_DATA.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.stagnantCount * 3)}`).join(' ');

  return (
    <div className="space-y-5">
      {/* 1. Top 4 Metric KPI Cards matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 今日新增订单 */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-stone-300 transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-stone-600">今日新增订单</span>
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">2,612</div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 font-sans">
            <span className="inline-flex items-center text-stone-700 font-medium">↗ 当日</span>
            <span className="text-stone-400">2026-09-13 北京时间</span>
          </div>
        </div>

        {/* Card 2: 今日订阅次数 */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-stone-300 transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-stone-600">今日订阅次数</span>
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">40,885</div>
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
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">4</div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 font-sans">
            <span className="inline-flex items-center text-sky-600 font-medium hover:underline cursor-pointer">↘ 当日</span>
            <span className="text-stone-400">今日检出未闭环</span>
          </div>
        </div>

        {/* Card 4: 当前滞留 */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:border-stone-300 transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-stone-600">当前滞留</span>
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">89</div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 font-sans">
            <span className="inline-flex items-center text-sky-600 font-medium hover:underline cursor-pointer">↘ &gt;24小时</span>
            <span className="text-stone-400">未签收且未推进</span>
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
              <p className="text-xs text-stone-400 mt-0.5">北京时间 00:00—24:00，每 10 分钟一档实体统计</p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-medium hover:bg-emerald-100 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>10分钟刷新</span>
            </button>
          </div>

          {/* SVG Trend Chart */}
          <div className="w-full relative overflow-x-auto my-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[600px] select-none"
            >
              {/* Horizontal gridlines */}
              {[0, 200, 400, 600, 800].map((level) => {
                const y = getY(level);
                return (
                  <g key={level}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* X Axis Baseline */}
              <line
                x1={paddingLeft}
                y1={paddingTop + chartH}
                x2={svgWidth - paddingRight}
                y2={paddingTop + chartH}
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />

              {/* Time ticks on X axis */}
              {[
                { time: '0:00', x: getX(0) },
                { time: '03:00', x: getX(3) },
                { time: '06:00', x: getX(7) },
                { time: '09:00', x: getX(10) },
                { time: '12:00', x: getX(16) },
                { time: '15:00', x: getX(20) },
                { time: '18:00', x: getX(21) },
                { time: '21:00', x: getX(22) }
              ].map((tick, i) => (
                <text
                  key={i}
                  x={tick.x}
                  y={paddingTop + chartH + 18}
                  fontSize="11"
                  fill="#94a3b8"
                  textAnchor="middle"
                >
                  {tick.time}
                </text>
              ))}

              {/* Line 1: 今日订阅次数 (Yellow Dashed Line - Peaks to ~800) */}
              <path
                d={subscribePath}
                fill="none"
                stroke="#d97706"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />

              {/* Line 2: 今日新增订单 (Green Solid Line) */}
              <path
                d={orderPath}
                fill="none"
                stroke="#00703C"
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* Line 3: 今日活动异常 (Blue Solid Line) */}
              <path
                d={exceptionPath}
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Line 4: 当前滞留 (Red Solid Line) */}
              <path
                d={stagnantPath}
                fill="none"
                stroke="#dc2626"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Interactive invisible hover bars */}
              {TREND_DATA.map((p, i) => {
                const x = getX(i);
                return (
                  <rect
                    key={i}
                    x={x - 12}
                    y={paddingTop}
                    width={24}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer hover:fill-stone-900/5 transition-colors"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}

              {/* Hover crosshair tooltip if point active */}
              {hoveredPoint && (
                <g>
                  {(() => {
                    const idx = TREND_DATA.findIndex(d => d.time === hoveredPoint.time);
                    if (idx === -1) return null;
                    const x = getX(idx);
                    return (
                      <>
                        <line
                          x1={x}
                          y1={paddingTop}
                          x2={x}
                          y2={paddingTop + chartH}
                          stroke="#94a3b8"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                        <circle cx={x} cy={getY(hoveredPoint.orderCount)} r="3.5" fill="#00703C" />
                        <circle cx={x} cy={getY(hoveredPoint.subscribeCount)} r="3.5" fill="#d97706" />
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* Hover details badge overlay */}
            {hoveredPoint && (
              <div className="absolute top-2 right-4 bg-stone-900/90 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-3 shadow-lg pointer-events-none backdrop-blur-sm">
                <span className="font-mono text-amber-300 font-bold">{hoveredPoint.time}</span>
                <span>新增订单: <b className="text-emerald-400">{hoveredPoint.orderCount}</b></span>
                <span>订阅推送: <b className="text-amber-400">{hoveredPoint.subscribeCount}</b></span>
                <span>异常: <b className="text-sky-300">{hoveredPoint.exceptionCount}</b></span>
                <span>滞留: <b className="text-red-400">{hoveredPoint.stagnantCount}</b></span>
              </div>
            )}
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
              {/* 1. 运输中 */}
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center font-mono">
                    1
                  </span>
                  <span className="text-sm font-medium text-stone-700">运输中</span>
                </div>
                <span className="text-sm font-semibold text-stone-900 font-mono tracking-tight">2,071</span>
              </div>

              {/* 2. 已揽收 */}
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center font-mono">
                    2
                  </span>
                  <span className="text-sm font-medium text-stone-700">已揽收</span>
                </div>
                <span className="text-sm font-semibold text-stone-900 font-mono tracking-tight">436</span>
              </div>

              {/* 3. 到达目的地 */}
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center font-mono">
                    3
                  </span>
                  <span className="text-sm font-medium text-stone-700">到达目的地</span>
                </div>
                <span className="text-sm font-semibold text-stone-900 font-mono tracking-tight">87</span>
              </div>

              {/* 4. 已签收 */}
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center font-mono">
                    4
                  </span>
                  <span className="text-sm font-medium text-stone-700">已签收</span>
                </div>
                <span className="text-sm font-semibold text-stone-900 font-mono tracking-tight">14</span>
              </div>

              {/* 5. 撤单 */}
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center font-mono">
                    5
                  </span>
                  <span className="text-sm font-medium text-stone-700">撤单</span>
                </div>
                <span className="text-sm font-semibold text-stone-900 font-mono tracking-tight">5</span>
              </div>

              {/* 6. 拒收 */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center font-mono">
                    6
                  </span>
                  <span className="text-sm font-medium text-stone-700">拒收</span>
                </div>
                <span className="text-sm font-semibold text-stone-900 font-mono tracking-tight">1</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 mt-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>状态监控覆盖率</span>
              <span className="font-semibold text-emerald-700 font-mono">100.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 最新订阅信息 (Explicitly requested by user: 最新订阅信息) */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">最新订阅信息</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                实时推送流水
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">全渠道物流动态触发与收件人自动订阅外呼/消息流水</p>
          </div>

          {/* Channel Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['全部', '微信服务号', '106短信', '11183语音', '企业协同'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setSubscriptionFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  subscriptionFilter === tab
                    ? 'bg-[#00703C] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Subscription Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700 border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 bg-stone-50/50">
                <th className="py-2.5 px-3 font-semibold">推送时间</th>
                <th className="py-2.5 px-3 font-semibold">订阅渠道</th>
                <th className="py-2.5 px-3 font-semibold">邮件号</th>
                <th className="py-2.5 px-3 font-semibold">订阅受众</th>
                <th className="py-2.5 px-3 font-semibold">推送事件内容</th>
                <th className="py-2.5 px-3 font-semibold">响应状态</th>
                <th className="py-2.5 px-3 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-stone-500 whitespace-nowrap">{sub.time}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      {sub.channel === '微信服务号' && <MessageSquare className="w-3 h-3 text-emerald-600" />}
                      {sub.channel === '106短信' && <Bell className="w-3 h-3 text-blue-600" />}
                      {sub.channel === '11183语音' && <PhoneCall className="w-3 h-3 text-amber-600" />}
                      {sub.channel === '企业协同' && <Truck className="w-3 h-3 text-purple-600" />}
                      {sub.channel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-[#00703C] hover:underline cursor-pointer">
                    <button
                      type="button"
                      onClick={() => onSelectPackage(sub.mailNo)}
                      className="hover:underline flex items-center gap-1"
                    >
                      {sub.mailNo}
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-stone-800">
                    <div>{sub.receiver}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{sub.phone}</div>
                  </td>
                  <td className="py-2.5 px-3 text-stone-700">{sub.event}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{sub.status}</span>
                      <span className="text-[10px] text-stone-400 font-mono">({sub.latency})</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectPackage(sub.mailNo)}
                      className="text-xs text-[#00703C] hover:text-[#005229] font-medium inline-flex items-center gap-0.5"
                    >
                      <span>轨迹</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
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
            onClick={() => setShowAllExceptions(prev => !prev)}
            className="px-3 py-1 text-xs text-stone-600 border border-stone-200 rounded-md bg-white hover:bg-stone-50 font-medium transition-colors"
          >
            {showAllExceptions ? '收起列表' : '查看全部'}
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
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.riskLevel === '高风险'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : item.riskLevel === '中风险'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
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
                      onClick={() => onSelectPackage(item.mailNo)}
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
    </div>
  );
};
