import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Trash2, 
  CheckCheck, 
  MessageSquare, 
  Smartphone, 
  Laptop, 
  Clock, 
  Filter,
  CheckCircle2,
  AlertTriangle,
  Send
} from 'lucide-react';
import { NotificationLog } from '../types/express';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationLog[];
  onClearAll: () => void;
  onSelectPackageByTracking: (trackingNumber: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onSelectPackageByTracking
}) => {
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'SMS' | 'WECHAT' | 'BROWSER'>('ALL');

  if (!isOpen) return null;

  const filtered = channelFilter === 'ALL' 
    ? notifications 
    : notifications.filter(n => n.channel === channelFilter);

  const getChannelBadge = (channel: NotificationLog['channel']) => {
    switch (channel) {
      case 'SMS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
            <Smartphone className="w-3 h-3" /> 手机短信
          </span>
        );
      case 'WECHAT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
            <MessageSquare className="w-3 h-3" /> 微信通知
          </span>
        );
      case 'BROWSER':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-medium">
            <Laptop className="w-3 h-3" /> 桌面推送
          </span>
        );
      default:
        return null;
    }
  };

  const getEventIcon = (type: NotificationLog['eventType']) => {
    switch (type) {
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
      case 'exception':
        return <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-[#00703C] flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#005f32] to-[#00703C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#F9B200]" />
            <div>
              <h3 className="font-bold text-sm">签收提醒与预警记录中心</h3>
              <p className="text-[11px] text-emerald-100/80">已触发 {notifications.length} 条通知记录</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white transition-colors text-xs flex items-center gap-1"
                title="清空记录"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">清空</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">通知渠道筛选:</span>
          <div className="flex gap-1">
            {(['ALL', 'SMS', 'WECHAT', 'BROWSER'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannelFilter(ch)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  channelFilter === ch
                    ? 'bg-[#00703C] text-white font-semibold'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                {ch === 'ALL' ? '全部' : ch === 'SMS' ? '短信' : ch === 'WECHAT' ? '微信' : '推送'}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">暂无对应的提醒记录</p>
              <p className="text-[11px] text-stone-400 mt-1">
                点击快递详情中的“模拟立即妥投签收”即可触发实时推送
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-stone-200 hover:border-[#00703C]/40 bg-stone-50/40 hover:bg-white transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {getEventIcon(item.eventType)}
                    <span className="font-bold text-xs text-stone-800">
                      {item.title}
                    </span>
                  </div>
                  {getChannelBadge(item.channel)}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed bg-white p-2.5 rounded-lg border border-stone-200/70 font-mono">
                  {item.message}
                </p>

                <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPackageByTracking(item.trackingNumber);
                      onClose();
                    }}
                    className="text-[#00703C] hover:underline font-semibold font-mono"
                  >
                    查看单号 {item.trackingNumber} →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-xs text-stone-500">
          中国邮政 11183 智能签收提醒调度系统
        </div>
      </div>
    </div>
  );
};
