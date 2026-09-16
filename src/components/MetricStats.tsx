import React from "react";
import { Package, Truck, CheckCircle2, AlertTriangle, BellRing, ShieldCheck } from "lucide-react";
import { ExpressPackage } from "../types/express";

interface MetricStatsProps {
  packages: ExpressPackage[];
  notificationCount: number;
  activeFilter: string;
  onFilterChange: (status: string) => void;
}

export const MetricStats: React.FC<MetricStatsProps> = ({
  packages,
  notificationCount,
  activeFilter,
  onFilterChange,
}) => {
  const total = packages.length;
  const inTransit = packages.filter((p) => p.status === "in_transit").length;
  const delivering = packages.filter((p) => p.status === "delivering").length;
  const delivered = packages.filter((p) => p.status === "delivered").length;
  const exception = packages.filter((p) => p.status === "exception").length;

  const cards = [
    {
      id: "all",
      label: "重点邮件总计",
      value: total,
      unit: "件",
      subtext: "全网重点监控VIP件",
      icon: Package,
      color: "text-emerald-800",
      bgColor: "bg-emerald-50 hover:bg-emerald-100/80",
      activeBorder: "border-emerald-600 ring-2 ring-emerald-600/30",
    },
    {
      id: "in_transit",
      label: "干线在途运输",
      value: inTransit,
      unit: "件",
      subtext: "陆空干线实时中转",
      icon: Truck,
      color: "text-blue-700",
      bgColor: "bg-blue-50 hover:bg-blue-100/80",
      activeBorder: "border-blue-600 ring-2 ring-blue-600/30",
    },
    {
      id: "delivering",
      label: "正在末端派送",
      value: delivering,
      unit: "件",
      subtext: "专人专车上门投递",
      icon: ShieldCheck,
      color: "text-amber-700",
      bgColor: "bg-amber-50 hover:bg-amber-100/80",
      activeBorder: "border-amber-600 ring-2 ring-amber-600/30",
    },
    {
      id: "delivered",
      label: "今日已妥投签收",
      value: delivered,
      unit: "件",
      subtext: "电子签收回单已归档",
      icon: CheckCircle2,
      color: "text-emerald-700",
      bgColor: "bg-emerald-50 hover:bg-emerald-100/80",
      activeBorder: "border-emerald-600 ring-2 ring-emerald-600/30",
    },
    {
      id: "exception",
      label: "滞留与异常预警",
      value: exception,
      unit: "件",
      subtext: "恶劣天气与联运调度",
      icon: AlertTriangle,
      color: "text-rose-700",
      bgColor: "bg-rose-50 hover:bg-rose-100/80",
      activeBorder: "border-rose-600 ring-2 ring-rose-600/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onFilterChange(card.id)}
            className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${card.bgColor} ${
              isActive
                ? `${card.activeBorder} shadow-sm bg-white`
                : "border-stone-200/80 hover:shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-stone-600">{card.label}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</span>
              <span className="text-xs text-stone-500">{card.unit}</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 truncate">{card.subtext}</p>
          </button>
        );
      })}
    </div>
  );
};
