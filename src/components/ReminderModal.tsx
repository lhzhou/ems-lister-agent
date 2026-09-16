import React, { useState } from "react";
import {
  X,
  BellRing,
  Smartphone,
  MessageSquare,
  Send,
  Check,
  ShieldCheck,
  Volume2,
  Clock,
  Sparkles,
  PhoneCall,
  Laptop,
} from "lucide-react";
import { ExpressPackage, ReminderConfig } from "../types/express";
import { playNotificationChime } from "../utils/sound";

interface ReminderModalProps {
  pkg: ExpressPackage;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkgId: string, config: ReminderConfig) => void;
  onSendTestReminder: (pkg: ExpressPackage, channel: "SMS" | "WECHAT" | "BROWSER") => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  pkg,
  isOpen,
  onClose,
  onSave,
  onSendTestReminder,
}) => {
  const [config, setConfig] = useState<ReminderConfig>({
    ...pkg.reminderConfig,
  });
  const [testSent, setTestSent] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleEvent = (key: keyof ReminderConfig["events"]) => {
    setConfig((prev) => ({
      ...prev,
      events: {
        ...prev.events,
        [key]: !prev.events[key],
      },
    }));
  };

  const handleSave = () => {
    onSave(pkg.id, config);
    onClose();
  };

  const triggerTest = (channel: "SMS" | "WECHAT" | "BROWSER") => {
    onSendTestReminder(pkg, channel);
    setTestSent(channel);
    setTimeout(() => setTestSent(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005f32] to-[#00703C] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F9B200] text-stone-900 flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                重点快递签收提醒服务配置
              </h3>
              <p className="text-xs text-emerald-100/90 font-mono">
                单号：{pkg.trackingNumber} ({pkg.destination.recipient})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700">
          {/* VIP Guarantee Description Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#F9B200] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              中国邮政 VIP 重点快件享有<strong>零延迟通知特权</strong>
              。当快件到达末端营业部、投递员揽件派送或签收人签收完成后，系统将自动触发指定渠道提醒。
            </p>
          </div>

          {/* Section 1: Notification Channels */}
          <div>
            <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#00703C]" />
              <span>1. 提醒接收渠道</span>
            </h4>

            <div className="space-y-3">
              {/* SMS Option */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableSMS}
                      onChange={(e) => setConfig({ ...config, enableSMS: e.target.checked })}
                      className="w-4 h-4 rounded text-[#00703C] focus:ring-[#00703C]"
                    />
                    <span>手机实时短信提醒 (SMS)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => triggerTest("SMS")}
                    disabled={!config.enableSMS}
                    className="text-xs text-[#00703C] hover:text-[#005f32] font-semibold disabled:opacity-40 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{testSent === "SMS" ? "已发送模拟短信" : "测试短信"}</span>
                  </button>
                </div>
                {config.enableSMS && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="tel"
                      value={config.smsPhone}
                      onChange={(e) => setConfig({ ...config, smsPhone: e.target.value })}
                      placeholder="输入接收通知的手机号"
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#00703C] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          smsPhone: pkg.destination.phoneFull || "13900000000",
                        })
                      }
                      className="text-[11px] text-stone-500 hover:text-stone-800 bg-stone-200/80 px-2 py-1.5 rounded-lg whitespace-nowrap"
                    >
                      填入收件人手机
                    </button>
                  </div>
                )}
              </div>

              {/* WeChat Service Message Option */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableWeChat}
                      onChange={(e) => setConfig({ ...config, enableWeChat: e.target.checked })}
                      className="w-4 h-4 rounded text-[#00703C] focus:ring-[#00703C]"
                    />
                    <span>微信服务号 / 企业微信推送</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => triggerTest("WECHAT")}
                    disabled={!config.enableWeChat}
                    className="text-xs text-[#00703C] hover:text-[#005f32] font-semibold disabled:opacity-40 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{testSent === "WECHAT" ? "已推送模拟消息" : "测试微信推送"}</span>
                  </button>
                </div>
                {config.enableWeChat && (
                  <input
                    type="text"
                    value={config.wechatId}
                    onChange={(e) => setConfig({ ...config, wechatId: e.target.value })}
                    placeholder="绑定微信号 / 企微账号 / OpenID"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#00703C] font-mono"
                  />
                )}
              </div>

              {/* Browser Desktop Push */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableBrowserPush}
                      onChange={(e) =>
                        setConfig({ ...config, enableBrowserPush: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#00703C] focus:ring-[#00703C]"
                    />
                    <span className="flex items-center gap-1">
                      <Laptop className="w-3.5 h-3.5 text-stone-500" />
                      系统网页桌面浮窗 & 提示音
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => triggerTest("BROWSER")}
                    disabled={!config.enableBrowserPush}
                    className="text-xs text-[#00703C] hover:text-[#005f32] font-semibold disabled:opacity-40 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{testSent === "BROWSER" ? "已触发弹窗" : "测试弹窗"}</span>
                  </button>
                </div>
              </div>

              {/* Automatic Voice Call for Confidential/Urgent VIP */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableVoiceCall}
                      onChange={(e) => setConfig({ ...config, enableVoiceCall: e.target.checked })}
                      className="w-4 h-4 rounded text-[#00703C] focus:ring-[#00703C]"
                    />
                    <span className="flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-stone-500" />
                      重点急件 11183 智能语音电话提醒
                    </span>
                  </label>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
                    VIP专享
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Trigger Events */}
          <div>
            <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00703C]" />
              <span>2. 提醒触发节点</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 bg-white hover:bg-emerald-50/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.events.outForDelivery}
                  onChange={() => handleToggleEvent("outForDelivery")}
                  className="w-4 h-4 rounded text-[#00703C] focus:ring-[#00703C] mt-0.5"
                />
                <div>
                  <span className="font-semibold text-xs block text-stone-800">开始派送时提醒</span>
                  <span className="text-[11px] text-stone-500">投递员领件出发并发送投递员电话</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 bg-white hover:bg-emerald-50/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.events.approaching}
                  onChange={() => handleToggleEvent("approaching")}
                  className="w-4 h-4 rounded text-[#00703C] focus:ring-[#00703C] mt-0.5"
                />
                <div>
                  <span className="font-semibold text-xs block text-stone-800">
                    预计2小时内送达
                  </span>
                  <span className="text-[11px] text-stone-500">
                    距离收件地址小于2公里时预先提醒
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#00703C]/40 bg-emerald-50/30 hover:bg-emerald-50/60 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.events.delivered}
                  onChange={() => handleToggleEvent("delivered")}
                  className="w-4 h-4 rounded text-[#00703C] focus:ring-[#00703C] mt-0.5"
                />
                <div>
                  <span className="font-semibold text-xs block text-[#00703C]">
                    快件签收成功提醒 (核心)
                  </span>
                  <span className="text-[11px] text-emerald-800">签收完毕立即回传签收人和签单</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 bg-white hover:bg-rose-50/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.events.exception}
                  onChange={() => handleToggleEvent("exception")}
                  className="w-4 h-4 rounded text-[#00703C] focus:ring-[#00703C] mt-0.5"
                />
                <div>
                  <span className="font-semibold text-xs block text-rose-800">
                    异常滞留与天气预警
                  </span>
                  <span className="text-[11px] text-stone-500">航班延误或道路管制第一时效通知</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#00703C] hover:bg-[#005f32] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>保存并开启签收提醒</span>
          </button>
        </div>
      </div>
    </div>
  );
};
