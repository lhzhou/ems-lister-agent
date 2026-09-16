import React, { useState } from "react";
import {
  Copy,
  Check,
  MapPin,
  ArrowRight,
  Clock,
  BellRing,
  FileCheck,
  ShieldAlert,
  ChevronRight,
  Send,
  Sparkles,
  Smartphone,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { ExpressPackage, VIPLevel } from "../types/express";

interface PackageListProps {
  packages: ExpressPackage[];
  selectedId: string | null;
  onSelect: (pkg: ExpressPackage) => void;
  onOpenReminderModal: (pkg: ExpressPackage) => void;
  onOpenPODModal: (pkg: ExpressPackage) => void;
  onOpenInNewTab?: (pkg: ExpressPackage) => void;
}

export const PackageList: React.FC<PackageListProps> = ({
  packages,
  selectedId,
  onSelect,
  onOpenReminderModal,
  onOpenPODModal,
  onOpenInNewTab,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getVIPBadge = (level: VIPLevel, label: string) => {
    switch (level) {
      case "vip_confidential":
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-purple-600" /> {label}
          </span>
        );
      case "vip_government":
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            ★ {label}
          </span>
        );
      case "vip_fresh":
        return (
          <span className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-900 border border-cyan-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            ❄ {label}
          </span>
        );
      case "vip_enterprise":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold">
            💎 {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            EMS特快
          </span>
        );
    }
  };

  const getStatusBadge = (status: ExpressPackage["status"]) => {
    switch (status) {
      case "delivering":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            派送中
          </span>
        );
      case "in_transit":
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            运输中
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            已妥投签收
          </span>
        );
      case "exception":
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            滞留预警
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-full text-xs font-medium">
            待揽收
          </span>
        );
    }
  };

  if (packages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
          <FileCheck className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-stone-700">未找到符合条件的重点快递</h3>
        <p className="text-xs text-stone-500 mt-1">请尝试修改单号、手机尾号或在上方点击重置查询</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {packages.map((pkg) => {
        const isSelected = selectedId === pkg.id;
        const latestNode = pkg.nodes[0];
        const hasReminders =
          pkg.reminderConfig.enableSMS ||
          pkg.reminderConfig.enableWeChat ||
          pkg.reminderConfig.enableBrowserPush;

        return (
          <div
            key={pkg.id}
            onClick={() => onSelect(pkg)}
            className={`bg-white rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden relative ${
              isSelected
                ? "border-[#00703C] ring-2 ring-[#00703C]/20 shadow-md bg-emerald-50/20"
                : "border-stone-200/90 hover:border-stone-300 hover:shadow-sm"
            }`}
          >
            {/* VIP Header Ribbon */}
            <div className="px-4 py-2.5 bg-stone-50/70 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {getVIPBadge(pkg.vipLevel, pkg.vipLabel)}
                <span className="text-xs font-mono font-bold text-stone-900 tracking-wider">
                  {pkg.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, pkg.trackingNumber, pkg.id)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded hover:bg-stone-100 transition-colors"
                  title="复制单号"
                >
                  {copiedId === pkg.id ? (
                    <span className="flex items-center text-[10px] text-emerald-600 font-medium">
                      <Check className="w-3 h-3 mr-0.5" /> 已复制
                    </span>
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Active Notification Indicator */}
                {hasReminders && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    <BellRing className="w-3 h-3 text-emerald-600" /> 签收提醒已开通
                  </span>
                )}
                {getStatusBadge(pkg.status)}
              </div>
            </div>

            {/* Main content body */}
            <div className="p-4">
              {/* Route: Origin -> Destination */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                    <span>寄件地</span>
                  </div>
                  <h4 className="text-base font-bold text-stone-900 truncate">{pkg.origin.city}</h4>
                  <p className="text-xs text-stone-500 truncate">{pkg.origin.sender}</p>
                </div>

                {/* Arrow & Service Type in between */}
                <div className="flex flex-col items-center justify-center px-3 flex-shrink-0">
                  <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mb-1 border border-emerald-100">
                    {pkg.serviceType}
                  </span>
                  <div className="flex items-center gap-1 text-[#00703C]">
                    <div className="w-6 h-0.5 bg-[#00703C]/30"></div>
                    <ArrowRight className="w-4 h-4 text-[#00703C]" />
                    <div className="w-6 h-0.5 bg-[#00703C]/30"></div>
                  </div>
                  {pkg.declaredValue && (
                    <span className="text-[10px] text-amber-700 font-mono mt-0.5">
                      保价￥{pkg.declaredValue.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-stone-500 text-xs mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00703C]"></span>
                    <span>目的地</span>
                  </div>
                  <h4 className="text-base font-bold text-stone-900 truncate">
                    {pkg.destination.city}
                  </h4>
                  <p className="text-xs text-stone-500 truncate">{pkg.destination.recipient}</p>
                </div>
              </div>

              {/* Package description snippet */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span className="truncate max-w-[280px] sm:max-w-md text-stone-700 font-medium">
                  物品: {pkg.itemName}
                </span>
                <span className="text-stone-400 font-mono text-[11px] flex-shrink-0">
                  重量: {pkg.itemWeight}
                </span>
              </div>

              {/* Latest Node Information Box */}
              {latestNode && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-xs">
                  <div className="flex items-center justify-between text-stone-500 text-[11px] mb-1">
                    <span className="font-semibold text-emerald-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> 最新动态:{" "}
                      {latestNode.title}
                    </span>
                    <span className="font-mono text-stone-400">{latestNode.time}</span>
                  </div>
                  <p className="text-stone-700 line-clamp-2 leading-relaxed">
                    {latestNode.description}
                  </p>
                </div>
              )}

              {/* Bottom control bar with interactive buttons */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    预计送达:{" "}
                    <strong className="text-stone-800 font-mono">
                      {pkg.estimatedDeliveryTime}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {/* Reminder Settings button */}
                  <button
                    type="button"
                    onClick={() => onOpenReminderModal(pkg)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-600" />
                    <span>签收提醒设置</span>
                  </button>

                  {/* ePOD electronic receipt button if delivered */}
                  {pkg.status === "delivered" && pkg.pod && (
                    <button
                      type="button"
                      onClick={() => onOpenPODModal(pkg)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#00703C] border border-emerald-200 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[#00703C]" />
                      <span>查看签收存根</span>
                    </button>
                  )}

                  {/* Open in Dedicated Window Tab button */}
                  {onOpenInNewTab && (
                    <button
                      type="button"
                      onClick={() => onOpenInNewTab(pkg)}
                      title="在独立窗口标签页中打开邮件"
                      className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-[#00703C] hover:border-emerald-300 border border-stone-200 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>新窗口</span>
                    </button>
                  )}

                  {/* View Details arrow button */}
                  <button
                    type="button"
                    onClick={() => onSelect(pkg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isSelected
                        ? "bg-[#00703C] text-white"
                        : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                    }`}
                  >
                    <span>{isSelected ? "正在查看" : "查看轨迹"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
