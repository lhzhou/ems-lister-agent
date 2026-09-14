import React from 'react';
import { 
  BarChart3, 
  Plane, 
  Truck, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Radio, 
  MapPin, 
  Activity,
  Wind
} from 'lucide-react';
import { ExpressPackage } from '../types/express';

interface LogisticsStatsViewProps {
  packages: ExpressPackage[];
}

export const LogisticsStatsView: React.FC<LogisticsStatsViewProps> = ({ packages }) => {
  const inTransitCount = packages.filter(p => p.status === 'in_transit' || p.status === 'delivering').length;
  const deliveredCount = packages.filter(p => p.status === 'delivered').length;
  const exceptionCount = packages.filter(p => p.status === 'exception').length;

  const postalFlights = [
    {
      flightNo: 'CF9018',
      route: '北京大兴 (PKX) ➔ 广州白云 (CAN)',
      aircraft: '中邮航 B757-200F 全货机',
      altitude: '10,200 米 (巡航中)',
      speed: '860 km/h',
      status: 'AIRBORNE',
      statusText: '空中巡航',
      cargo: '华南重点机要与高保价专运包',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      flightNo: 'CF9022',
      route: '上海浦东 (PVG) ➔ 深圳宝安 (SZX)',
      aircraft: '中邮航 B737-800F 极速鲜包机',
      altitude: '地面机坪',
      speed: '0 km/h',
      status: 'LANDED',
      statusText: '已平安落地·极速分流',
      cargo: '华东大闸蟹冷链与生鲜',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      flightNo: 'CF9035',
      route: '武汉集散 (WUH) ➔ 成都双流 (CTU)',
      aircraft: '中邮航 B737-400F 特快专线',
      altitude: '待命装机',
      speed: '0 km/h',
      status: 'PREPARING',
      statusText: '机坪安检装载完毕',
      cargo: '川渝高考通知书与特急件',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  ];

  const hubNodes = [
    { name: '北京集散中心', load: '82%', status: '正常高效', throughput: '128,400件/时', temp: '22℃' },
    { name: '上海转运港', load: '88%', status: '波峰运转', throughput: '162,100件/时', temp: '24℃' },
    { name: '广州特快枢纽', load: '76%', status: '绿色畅通', throughput: '115,300件/时', temp: '28℃' },
    { name: '武汉航空中心', load: '71%', status: '平稳有序', throughput: '94,800件/时', temp: '23℃' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-3 border border-white/15">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>中国邮政航空网 & 地面特快干线实时监控</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            全国重点邮政物流时效与枢纽负荷监控大屏
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
            依托自主全货机机队（波音机队夜航网）、高铁专列特快通道及全国数字化智能分拣集散港，确保全国重点邮件“次晨达”与“次日递”承诺时效。
          </p>
        </div>
      </div>

      {/* KPI Highlight metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 flex items-center justify-between">
            <span>重点邮件准时妥投率</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-mono">99.98%</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>高于行业标准 1.2%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 flex items-center justify-between">
            <span>全程平均流转时效</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-mono">13.8 小时</div>
          <div className="text-[11px] text-stone-500 mt-1">
            跨省航空夜航极速达
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 flex items-center justify-between">
            <span>签收提醒短信触达率</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-mono">100.0%</div>
          <div className="text-[11px] text-emerald-700 mt-1">
            106 专属国资政务通道
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 flex items-center justify-between">
            <span>保价快件完好率</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-mono">100.0%</div>
          <div className="text-[11px] text-purple-700 mt-1">
            零破损 · 独立加固集装
          </div>
        </div>
      </div>

      {/* Postal Airlines Fleet Radar */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                中邮航 (China Postal Airlines) 重点全货机班次雷达
              </h3>
              <p className="text-xs text-stone-500">
                自主全货机夜航网，为全国核心城市提供机要、录取通知书及冷链极速航空运力
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full">
            空管绿色优先直飞
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {postalFlights.map((flight, idx) => (
            <div key={idx} className="p-4 sm:p-5 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-stone-900">{flight.flightNo}</span>
                  <span className="text-xs font-semibold text-stone-700">{flight.route}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${flight.statusColor}`}>
                    {flight.statusText}
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-3">
                  <span>机型：{flight.aircraft}</span>
                  <span>•</span>
                  <span>主要载荷：{flight.cargo}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs self-start sm:self-auto bg-stone-50 px-3 py-2 rounded-xl border border-stone-200/60">
                <div>
                  <div className="text-[10px] text-stone-400 font-sans">当前高度</div>
                  <div className="font-bold text-stone-800">{flight.altitude}</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 font-sans">地速</div>
                  <div className="font-bold text-stone-800">{flight.speed}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Major Distribution Hubs Grid */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#00703C]" />
              <span>国家综合枢纽集散港运行负荷</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              全国自动化矩阵流水线负荷与智能调度状态
            </p>
          </div>
          <span className="text-xs text-stone-400">更新时间：1分钟前</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hubNodes.map((hub, idx) => (
            <div key={idx} className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800">{hub.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  {hub.status}
                </span>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                  <span>实时负荷率</span>
                  <span className="font-mono font-bold text-stone-800">{hub.load}</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#00703C] h-1.5 rounded-full" 
                    style={{ width: hub.load }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                <span>分拣吞吐能力</span>
                <span className="font-mono text-stone-700">{hub.throughput}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
