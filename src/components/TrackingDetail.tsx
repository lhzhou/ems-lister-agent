import React, { useState } from 'react';
import { 
  Plane, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  BellRing, 
  FileText, 
  Sparkles, 
  Thermometer, 
  Droplets,
  AlertTriangle,
  Play,
  RotateCw,
  Share2,
  Check,
  Building2,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { ExpressPackage, LogisticsNode, ExpressStatus } from '../types/express';

interface TrackingDetailProps {
  pkg: ExpressPackage;
  onOpenReminderModal: (pkg: ExpressPackage) => void;
  onOpenPODModal: (pkg: ExpressPackage) => void;
  onSimulateNextStep: (pkg: ExpressPackage) => void;
  onSimulateSignOff: (pkg: ExpressPackage) => void;
  onResetSimulation: (pkg: ExpressPackage) => void;
}

export const TrackingDetail: React.FC<TrackingDetailProps> = ({
  pkg,
  onOpenReminderModal,
  onOpenPODModal,
  onSimulateNextStep,
  onSimulateSignOff,
  onResetSimulation
}) => {
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<boolean>(true);

  const handleShare = () => {
    const text = `【中国邮政重点快递实时动态】\n邮件号: ${pkg.trackingNumber}\n服务类型: ${pkg.serviceType}\n状态: ${pkg.statusText}\n发件地: ${pkg.origin.city} -> 目的地: ${pkg.destination.city}\n最新进度: ${pkg.nodes[0]?.description || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Calculate current progress stage
  const getStepIndex = (status: ExpressStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'in_transit': return 1;
      case 'delivering': return 3;
      case 'delivered': return 4;
      case 'exception': return 2;
      default: return 1;
    }
  };

  const currentStep = getStepIndex(pkg.status);

  const steps = [
    { label: '网点收寄', desc: pkg.origin.city },
    { label: '干线转运', desc: '航空/陆运' },
    { label: '到达网点', desc: '分拣核验' },
    { label: '专人派送', desc: '上门投递' },
    { label: '妥投签收', desc: pkg.destination.city }
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden sticky top-24">
      {/* Top Banner - China Post Green & Gold Accent */}
      <div className="bg-gradient-to-r from-[#005f32] to-[#00703C] p-4 sm:p-6 text-white relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#F9B200] text-stone-900 font-bold px-2 py-0.5 rounded text-xs">
                {pkg.vipLabel}
              </span>
              <span className="text-xs text-emerald-100 bg-white/15 px-2 py-0.5 rounded font-mono">
                {pkg.serviceType}
              </span>
              {pkg.isUrgent && (
                <span className="text-xs text-rose-300 font-medium animate-pulse">
                  ● 重点急件优先流转
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-wider flex items-center gap-2">
              {pkg.trackingNumber}
            </h3>
            <p className="text-xs text-emerald-100/90 mt-1">
              品名：<strong className="text-white">{pkg.itemName}</strong> ({pkg.itemWeight})
              {pkg.declaredValue && ` · 保价金额：￥${pkg.declaredValue.toLocaleString()}元`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="复制轨迹摘要"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? '已复制分享文本' : '分享轨迹'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenReminderModal(pkg)}
              className="px-3 py-1.5 rounded-lg bg-[#F9B200] hover:bg-[#e5a400] text-stone-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <BellRing className="w-3.5 h-3.5 text-stone-900" />
              <span>配置签收提醒</span>
            </button>
          </div>
        </div>

        {/* Cold chain telemetry banner if fresh/biological */}
        {(pkg.temperature || pkg.humidity) && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-200">
              <Thermometer className="w-4 h-4 text-cyan-300" />
              <span>实时温控: <strong>{pkg.temperature}</strong></span>
            </div>
            {pkg.humidity && (
              <div className="flex items-center gap-1.5 text-blue-200">
                <Droplets className="w-4 h-4 text-blue-300" />
                <span>湿度传感: <strong>{pkg.humidity}</strong></span>
              </div>
            )}
            <span className="ml-auto text-[10px] text-emerald-300 bg-emerald-800/80 px-1.5 py-0.5 rounded">
              IoT 实时回传正常
            </span>
          </div>
        )}
      </div>

      {/* Interactive Simulation Panel - Essential for demonstrating real-time tracking & sign-off reminders */}
      <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
          <span className="text-xs font-bold text-amber-900">
            物流实时演练与提醒触发器:
          </span>
          <span className="text-[11px] text-amber-700 hidden sm:inline">
            点击下方按钮可实时模拟节点流转并触发签收提醒通知
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pkg.status !== 'delivered' ? (
            <>
              <button
                type="button"
                onClick={() => onSimulateNextStep(pkg)}
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs transition-all active:scale-95"
                title="模拟推进至下一中转站或开始派送"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>模拟流转下一节点</span>
              </button>
              <button
                type="button"
                onClick={() => onSimulateSignOff(pkg)}
                className="px-2.5 py-1.5 bg-[#F9B200] hover:bg-[#e5a400] text-stone-900 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                title="直接模拟快件送达并本人签收，触发签收提醒"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>模拟立即妥投签收</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onResetSimulation(pkg)}
              className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCw className="w-3 h-3" />
              <span>重新演练此单</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Visual Progress Steps Bar */}
        <div>
          <div className="grid grid-cols-5 gap-2 relative">
            {/* Connecting background line */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-stone-200 -z-0">
              <div 
                className="h-full bg-[#00703C] transition-all duration-500" 
                style={{ width: `${(Math.min(currentStep, 4) / 4) * 100}%` }}
              ></div>
            </div>

            {steps.map((step, idx) => {
              const isPassed = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step.label} className="relative z-10 flex flex-col items-center text-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-[#00703C] text-white ring-4 ring-[#00703C]/20 shadow scale-110'
                        : isPassed
                        ? 'bg-[#00703C] text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {isPassed && idx < currentStep ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`text-xs font-bold mt-2 ${isCurrent ? 'text-[#00703C]' : 'text-stone-700'}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5 truncate max-w-full">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status Highlights Box */}
        <div className={`p-4 rounded-xl border ${
          pkg.status === 'delivered'
            ? 'bg-emerald-50/70 border-emerald-200'
            : pkg.status === 'delivering'
            ? 'bg-amber-50/70 border-amber-200'
            : pkg.status === 'exception'
            ? 'bg-rose-50/70 border-rose-200'
            : 'bg-blue-50/70 border-blue-200'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900">
                当前状态: {pkg.statusText}
              </span>
              <span className="text-xs text-stone-500 font-mono">
                ({pkg.nodes[0]?.time || pkg.sendTime})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>预计送达: <strong className="text-stone-800 font-mono">{pkg.estimatedDeliveryTime}</strong></span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
            {pkg.nodes[0]?.description || '暂无进一步节点更新'}
          </p>

          {/* If delivered, show quick entry for ePOD receipt */}
          {pkg.status === 'delivered' && pkg.pod && (
            <div className="mt-3 pt-3 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-emerald-900">
                <span>签收人: <strong>{pkg.pod.signeeName}</strong></span>
                <span className="ml-3 text-emerald-800">签收类型: {pkg.pod.signType}</span>
                <span className="ml-3 text-stone-500 font-mono">{pkg.pod.signTime}</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenPODModal(pkg)}
                className="px-3 py-1.5 rounded-lg bg-[#00703C] hover:bg-[#005f32] text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>调阅电子签收凭单 (ePOD)</span>
              </button>
            </div>
          )}
        </div>

        {/* Courier dispatch information card (if delivering or delivered) */}
        {pkg.courier && (
          <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00703C]">
                <Award className="w-4 h-4 text-[#F9B200]" />
                <span>中国邮政 EMS 专属重点投递员</span>
              </div>
              <span className="text-[11px] text-stone-500 font-mono">
                工号: {pkg.courier.workId}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={pkg.courier.avatar}
                  alt={pkg.courier.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600/40 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-stone-900">{pkg.courier.name}</h4>
                    <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      ★ {pkg.courier.rating} 分
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{pkg.courier.vehicleType}</p>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" /> {pkg.courier.currentLocation}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end gap-2">
                <button
                  type="button"
                  onClick={() => setCallModalOpen(true)}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>联系投递员</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Chronological Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#00703C]" />
              <span>全流程物流节点追踪 ({pkg.nodes.length}个节点记录)</span>
            </h4>
            <button
              type="button"
              onClick={() => setExpandedNodes(!expandedNodes)}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
            >
              <span>{expandedNodes ? '收起历史节点' : '展开全部节点'}</span>
              {expandedNodes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {expandedNodes && (
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200">
              {pkg.nodes.map((node, index) => {
                const isLatest = index === 0;

                const getNodeIcon = () => {
                  if (node.status === 'delivered') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                  if (node.status === 'exception') return <AlertTriangle className="w-4 h-4 text-rose-600" />;
                  if (node.facilityType === 'airport') return <Plane className="w-4 h-4 text-blue-600" />;
                  if (node.facilityType === 'courier') return <ShieldCheck className="w-4 h-4 text-amber-600" />;
                  if (node.facilityType === 'hub') return <Building2 className="w-4 h-4 text-emerald-700" />;
                  return <Truck className="w-4 h-4 text-stone-600" />;
                };

                return (
                  <div key={node.id} className="relative flex items-start gap-4 text-xs">
                    {/* Circle marker */}
                    <div 
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isLatest 
                          ? 'bg-emerald-100 ring-4 ring-emerald-50 border-2 border-[#00703C]' 
                          : 'bg-white border-2 border-stone-300'
                      }`}
                    >
                      {getNodeIcon()}
                    </div>

                    {/* Node Content Card */}
                    <div className={`flex-1 p-3 rounded-xl border transition-all ${
                      isLatest 
                        ? 'bg-white border-[#00703C]/40 shadow-xs' 
                        : 'bg-stone-50/80 border-stone-200'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className={`font-bold text-xs ${isLatest ? 'text-[#00703C]' : 'text-stone-800'}`}>
                          {node.title}
                        </span>
                        <span className="text-[11px] font-mono text-stone-400">
                          {node.time}
                        </span>
                      </div>

                      <p className="text-stone-700 leading-relaxed">
                        {node.description}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {node.location}
                        </span>
                        {node.vehicleNo && (
                          <span className="bg-stone-200/80 px-1.5 py-0.5 rounded text-[10px] font-mono">
                            运载班次: {node.vehicleNo}
                          </span>
                        )}
                        {node.operator && (
                          <span>经办人: {node.operator}</span>
                        )}
                        {node.phone && (
                          <span className="font-mono text-emerald-800">联系方式: {node.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Courier Calling Dialog */}
      {callModalOpen && pkg.courier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-[#00703C]">
              <Phone className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-center font-bold text-base text-stone-900">
              呼叫投递员: {pkg.courier.name}
            </h3>
            <p className="text-center text-xs text-stone-500 mt-1">
              中国邮政 VIP 重点专线直连
            </p>
            <div className="bg-stone-50 rounded-xl p-3 my-4 text-center">
              <span className="text-xl font-bold font-mono text-stone-800">
                {pkg.courier.phone}
              </span>
              <p className="text-[11px] text-stone-400 mt-1">
                派送区域：{pkg.courier.currentLocation}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCallModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                关闭
              </button>
              <a
                href={`tel:${pkg.courier.phone}`}
                onClick={() => setCallModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[#00703C] hover:bg-[#005f32] text-white text-xs font-semibold text-center"
              >
                拨打电话
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
