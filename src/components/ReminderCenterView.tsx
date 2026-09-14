import React, { useState } from 'react';
import { 
  BellRing, 
  MessageSquare, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  PhoneCall, 
  Volume2, 
  Filter, 
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ExpressPackage, NotificationLog, ReminderConfig } from '../types/express';

interface ReminderCenterViewProps {
  packages: ExpressPackage[];
  notifications: NotificationLog[];
  onSaveReminderConfig: (pkgId: string, config: ReminderConfig) => void;
  onSendTestReminder: (pkg: ExpressPackage, channel: 'SMS' | 'WECHAT' | 'BROWSER') => void;
  onSelectPackage: (pkgId: string) => void;
  onClearNotifications: () => void;
}

export const ReminderCenterView: React.FC<ReminderCenterViewProps> = ({
  packages,
  notifications,
  onSaveReminderConfig,
  onSendTestReminder,
  onSelectPackage,
  onClearNotifications
}) => {
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('ALL');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleToggleChannel = (pkg: ExpressPackage, channel: 'SMS' | 'WECHAT' | 'BROWSER' | 'VOICE') => {
    const updatedConfig: ReminderConfig = {
      ...pkg.reminderConfig,
      enableSMS: channel === 'SMS' ? !pkg.reminderConfig.enableSMS : pkg.reminderConfig.enableSMS,
      enableWeChat: channel === 'WECHAT' ? !pkg.reminderConfig.enableWeChat : pkg.reminderConfig.enableWeChat,
      enableBrowserPush: channel === 'BROWSER' ? !pkg.reminderConfig.enableBrowserPush : pkg.reminderConfig.enableBrowserPush,
      enableVoiceCall: channel === 'VOICE' ? !pkg.reminderConfig.enableVoiceCall : pkg.reminderConfig.enableVoiceCall,
    };
    onSaveReminderConfig(pkg.id, updatedConfig);
    showToast(`已更新【${pkg.trackingNumber}】的提醒通道配置`);
  };

  const filteredLogs = notifications.filter(n => {
    if (selectedChannelFilter === 'ALL') return true;
    return n.channel === selectedChannelFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast popup */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#00703C] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#F9B200]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#00703C] to-emerald-800 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-6 w-56 h-56 rounded-full bg-white/5 pointer-events-none blur-xl"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-3 border border-white/15">
            <BellRing className="w-3.5 h-3.5 text-[#F9B200]" />
            <span>智能签收提醒引擎 · 毫秒级多端推送</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            全渠道快件流转与妥投签收提醒中心
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            支持 106 官方短信通道、微信模板消息、桌面浮窗与 11183 智能语音外呼。在快件派送、临近到达、本人签收或遇到航路异常时自动触发秒级触达。
          </p>
        </div>
      </div>

      {/* Channel Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">106短信通道 (SMS)</div>
            <div className="text-sm font-bold text-stone-900 mt-0.5">中国邮政专线通道</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              99.98% 3秒内触达
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">微信服务通知 (WeChat)</div>
            <div className="text-sm font-bold text-stone-900 mt-0.5">EMS官方微信号</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              卡片式图文推送
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">11183 智能语音 (IVR)</div>
            <div className="text-sm font-bold text-stone-900 mt-0.5">重要专件外呼</div>
            <div className="text-[11px] text-amber-600 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              仅限重要通知书/公文
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">系统声音与桌面提醒</div>
            <div className="text-sm font-bold text-stone-900 mt-0.5">即时网页 Toast</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              高保真合成提示音
            </div>
          </div>
        </div>
      </div>

      {/* Package Reminder Settings Matrix */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00703C]" />
              <span>重点快件提醒订阅矩阵与快速触发</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              各单号独立配置接收通道，可随时点击一键向接收人发送测试提醒
            </p>
          </div>
          <div className="text-xs text-stone-400 font-medium">
            共 <span className="font-bold text-stone-700">{packages.length}</span> 个重点监控件
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
              <tr>
                <th className="p-3.5 pl-5">邮件单号 / 物品</th>
                <th className="p-3.5">收件人 / 手机号</th>
                <th className="p-3.5">当前状态</th>
                <th className="p-3.5 text-center">短信提醒 (SMS)</th>
                <th className="p-3.5 text-center">微信服务通知</th>
                <th className="p-3.5 text-center">11183语音外呼</th>
                <th className="p-3.5 pr-5 text-right">即时测试与操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {packages.map(pkg => (
                <tr key={pkg.id} className="hover:bg-stone-50/80 transition-colors">
                  {/* Package info */}
                  <td className="p-3.5 pl-5">
                    <button
                      type="button"
                      onClick={() => onSelectPackage(pkg.id)}
                      className="text-left group"
                    >
                      <div className="font-mono font-bold text-[#00703C] group-hover:underline flex items-center gap-1">
                        <span>{pkg.trackingNumber}</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </div>
                      <div className="text-[11px] text-stone-600 mt-0.5 font-medium">{pkg.itemName}</div>
                      <div className="text-[10px] text-stone-400">{pkg.serviceType}</div>
                    </button>
                  </td>

                  {/* Recipient */}
                  <td className="p-3.5">
                    <div className="font-medium text-stone-800">{pkg.destination.recipient}</div>
                    <div className="font-mono text-stone-500 text-[11px] mt-0.5">{pkg.destination.phoneMasked}</div>
                    <div className="text-[10px] text-stone-400 truncate max-w-[140px]">{pkg.destination.city}</div>
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      pkg.status === 'delivered' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : pkg.status === 'delivering'
                        ? 'bg-amber-100 text-amber-800'
                        : pkg.status === 'exception'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {pkg.statusText}
                    </span>
                  </td>

                  {/* SMS Toggle */}
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleChannel(pkg, 'SMS')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                        pkg.reminderConfig.enableSMS 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-stone-100 text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      {pkg.reminderConfig.enableSMS ? '✓ 已开通' : '未开启'}
                    </button>
                  </td>

                  {/* WeChat Toggle */}
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleChannel(pkg, 'WECHAT')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                        pkg.reminderConfig.enableWeChat 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-stone-100 text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      {pkg.reminderConfig.enableWeChat ? '✓ 已开通' : '未开启'}
                    </button>
                  </td>

                  {/* Voice Toggle */}
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleChannel(pkg, 'VOICE')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                        pkg.reminderConfig.enableVoiceCall 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-stone-100 text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      {pkg.reminderConfig.enableVoiceCall ? '✓ 已就绪' : '未开启'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSendTestReminder(pkg, 'SMS');
                          showToast(`已向 ${pkg.destination.phoneMasked} 触发测试短信`);
                        }}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-medium transition-colors"
                        title="测试短信"
                      >
                        测试短信
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSendTestReminder(pkg, 'WECHAT');
                          showToast(`已向微信模板消息通道发送测试数据`);
                        }}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-medium transition-colors"
                        title="测试微信"
                      >
                        测试微信
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Triggered Notification Event Logs */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00703C]" />
              <span>实时提醒推送流水日志 ({notifications.length} 条)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              记录短信、微信、语音外呼与桌面弹窗的发送时间及收件人确认状态
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
              {(['ALL', 'SMS', 'WECHAT', 'BROWSER'] as const).map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setSelectedChannelFilter(ch)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    selectedChannelFilter === ch 
                      ? 'bg-white text-stone-900 shadow-xs' 
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {ch === 'ALL' ? '全部' : ch}
                </button>
              ))}
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearNotifications}
                className="text-xs text-stone-400 hover:text-rose-600 px-2 py-1 transition-colors"
              >
                清空日志
              </button>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            暂无提醒记录，当有快件流转派送或签收时，会自动在此留痕归档。
          </div>
        ) : (
          <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-stone-50/70 transition-colors flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                    log.channel === 'SMS' 
                      ? 'bg-blue-50 text-blue-600' 
                      : log.channel === 'WECHAT' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-purple-50 text-purple-600'
                  }`}>
                    {log.channel === 'SMS' ? <Smartphone className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">{log.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-mono">
                        {log.trackingNumber}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                        {log.channel}已送达
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{log.message}</p>
                    <div className="text-[11px] text-stone-400 mt-1 font-mono">{log.time}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const matched = packages.find(p => p.trackingNumber === log.trackingNumber);
                    if (matched) onSelectPackage(matched.id);
                  }}
                  className="text-[11px] text-[#00703C] hover:underline flex-shrink-0 font-medium"
                >
                  定位邮件
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
