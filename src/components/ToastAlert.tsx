import React from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  X,
  Smartphone,
  MessageSquare,
  Laptop,
  ArrowRight,
} from "lucide-react";
import { NotificationLog } from "../types/express";

interface ToastAlertProps {
  notification: NotificationLog | null;
  onClose: () => void;
  onViewPackage: (trackingNumber: string) => void;
}

export const ToastAlert: React.FC<ToastAlertProps> = ({ notification, onClose, onViewPackage }) => {
  if (!notification) return null;

  const getChannelIcon = () => {
    switch (notification.channel) {
      case "SMS":
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case "WECHAT":
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      default:
        return <Laptop className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#00703C] p-4 text-stone-800 overflow-hidden relative">
        {/* Top ribbon */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-emerald-100 text-[#00703C]">{getChannelIcon()}</div>
            <span className="text-xs font-bold text-[#00703C]">
              中国邮政 11183 重点快递签收服务提醒
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <h4 className="font-bold text-sm text-stone-900 mb-1 flex items-center gap-1.5">
          {notification.eventType === "delivered" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <Bell className="w-4 h-4 text-[#F9B200] flex-shrink-0" />
          )}
          <span>{notification.title}</span>
        </h4>

        <p className="text-xs text-stone-600 leading-relaxed font-mono bg-stone-50 p-2 rounded-lg border border-stone-200/60 mb-3">
          {notification.message}
        </p>

        {/* Action button */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] text-stone-400 font-mono">
            发送时间: {notification.time}
          </span>
          <button
            type="button"
            onClick={() => {
              onViewPackage(notification.trackingNumber);
              onClose();
            }}
            className="px-3 py-1 bg-[#00703C] hover:bg-[#005f32] text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <span>立即查看快件</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
