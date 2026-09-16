import React, { useState } from "react";
import {
  X,
  PlusCircle,
  Package,
  ShieldCheck,
  Sparkles,
  MapPin,
  Phone,
  User,
  BellRing,
  Check,
} from "lucide-react";
import { ExpressPackage, VIPLevel } from "../types/express";

interface NewPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPackage: (pkg: ExpressPackage) => void;
}

export const NewPackageModal: React.FC<NewPackageModalProps> = ({
  isOpen,
  onClose,
  onAddPackage,
}) => {
  const [trackingNumber, setTrackingNumber] = useState(
    `EA${Math.floor(100000000 + Math.random() * 900000000)}CN`,
  );
  const [vipLevel, setVipLevel] = useState<VIPLevel>("vip_confidential");
  const [serviceType, setServiceType] = useState<ExpressPackage["serviceType"]>("重点政务公文");
  const [itemName, setItemName] = useState("重点政务公文正本（特急件）");
  const [itemWeight, setItemWeight] = useState("1.2 kg");
  const [declaredValue, setDeclaredValue] = useState<number>(10000);

  // Origin
  const [originCity, setOriginCity] = useState("北京市");
  const [senderName, setSenderName] = useState("中共北京市委办公厅");
  const [senderPhone, setSenderPhone] = useState("010-6512****");
  const [senderAddress, setSenderAddress] = useState("北京市东城区正义路2号");

  // Destination
  const [destCity, setDestCity] = useState("广州市");
  const [recipientName, setRecipientName] = useState("广东省人民政府办公厅综合处");
  const [recipientPhone, setRecipientPhone] = useState("13822119988");
  const [destAddress, setDestAddress] = useState("广东省广州市越秀区东风中路305号");

  // Reminders
  const [enableSMS, setEnableSMS] = useState(true);
  const [enableWeChat, setEnableWeChat] = useState(true);
  const [enableBrowser, setEnableBrowser] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    const etaStr = new Date(Date.now() + 24 * 3600 * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, 16);

    const vipLabelMap: Record<VIPLevel, string> = {
      vip_confidential: "机要政务特快",
      vip_government: "重点考录公文",
      vip_enterprise: "企业高保价件",
      vip_fresh: "极速鲜冷链",
      normal: "EMS特快专递",
    };

    const newPkg: ExpressPackage = {
      id: `pkg-${Date.now()}`,
      trackingNumber: trackingNumber.trim(),
      vipLevel,
      vipLabel: vipLabelMap[vipLevel],
      serviceType,
      itemName,
      itemWeight,
      declaredValue: Number(declaredValue) || undefined,
      status: "delivering",
      statusText: "派送中",
      origin: {
        city: originCity,
        sender: senderName,
        phoneMasked: senderPhone,
        address: senderAddress,
      },
      destination: {
        city: destCity,
        recipient: recipientName,
        phoneMasked: recipientPhone.slice(0, 3) + "****" + recipientPhone.slice(-4),
        phoneFull: recipientPhone,
        address: destAddress,
      },
      sendTime: nowStr,
      estimatedDeliveryTime: etaStr,
      isUrgent: true,
      reminderConfig: {
        enableSMS,
        smsPhone: recipientPhone,
        enableWeChat,
        wechatId: `wx_${recipientPhone}`,
        enableBrowserPush: enableBrowser,
        enableVoiceCall: true,
        events: {
          outForDelivery: true,
          approaching: true,
          delivered: true,
          exception: true,
          lockerDeposit: false,
        },
        doNotDisturb: false,
        dndStart: "22:00",
        dndEnd: "08:00",
      },
      courier: {
        name: "张国富",
        phone: "13922338877",
        workId: `EMS-${destCity.slice(0, 2)}-${Math.floor(1000 + Math.random() * 9000)}`,
        rating: 4.99,
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        currentLocation: `${destCity}重点投递专线·派送中`,
        vehicleType: "中国邮政VIP巡回专用特派车",
      },
      nodes: [
        {
          id: `n-${Date.now()}-1`,
          time: nowStr,
          title: "正在派送中",
          description: `【${destCity}重点揽投专线】邮政专属投递员 [张国富 13922338877] 正在为您特快派送。已启动重点邮件当面核验签收程序。`,
          location: destCity,
          status: "delivering",
          operator: "张国富",
          phone: "13922338877",
          facilityType: "courier",
        },
        {
          id: `n-${Date.now()}-2`,
          time: "1小时前",
          title: "到达目的地营业部",
          description: `快件已运达【${destCity}特快专递处理分局】，已完成VIP重点邮件安检与扫码核验。`,
          location: destCity,
          status: "in_transit",
          facilityType: "branch",
        },
        {
          id: `n-${Date.now()}-3`,
          time: "3小时前",
          title: "航空干线运抵",
          description: `中国邮政航空货运专机运达目的地，经VIP绿色通道完成封发。`,
          location: destCity,
          status: "in_transit",
          facilityType: "airport",
        },
        {
          id: `n-${Date.now()}-4`,
          time: "6小时前",
          title: "已揽收",
          description: `中国邮政【${originCity}政务大客户揽收专席】已收寄，完成封箱封签。`,
          location: originCity,
          status: "pending",
          facilityType: "branch",
        },
      ],
    };

    onAddPackage(newPkg);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005f32] to-[#00703C] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#F9B200]" />
            <h3 className="font-bold text-base">录入并监控新的重点快件</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Tracking Number and VIP Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">邮件单号 (EMS标准格式)</label>
              <input
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono focus:ring-2 focus:ring-[#00703C]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">VIP 重点等级分类</label>
              <select
                value={vipLevel}
                onChange={(e) => {
                  const val = e.target.value as VIPLevel;
                  setVipLevel(val);
                  if (val === "vip_confidential") setServiceType("重点政务公文");
                  else if (val === "vip_government") setServiceType("考录录取通知书");
                  else if (val === "vip_fresh") setServiceType("极速鲜冷链");
                  else if (val === "vip_enterprise") setServiceType("高价值保价速递");
                  else setServiceType("特快专递(EMS)");
                }}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#00703C]"
              >
                <option value="vip_confidential">机要政务特快 (保密机要)</option>
                <option value="vip_government">重点考录公文 (录取通知书)</option>
                <option value="vip_fresh">极速鲜冷链 (生鲜时效)</option>
                <option value="vip_enterprise">企业高保价件 (贵重数码/样本)</option>
                <option value="normal">特快专递 (EMS标准件)</option>
              </select>
            </div>
          </div>

          {/* Item details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">托寄物品品名</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#00703C]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">保价金额 (元)</label>
              <input
                type="number"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#00703C]"
              />
            </div>
          </div>

          {/* Origin & Sender */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="font-bold text-[#00703C] block">寄件方信息 (始发站)</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="寄件城市 (如 北京市)"
                className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
              />
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="寄件人/单位"
                className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          {/* Destination & Recipient */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="font-bold text-[#00703C] block">收件方信息 (目的站及签收人)</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={destCity}
                onChange={(e) => setDestCity(e.target.value)}
                placeholder="目的城市 (如 广州市)"
                className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
              />
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="收件人姓名"
                className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
              />
              <input
                type="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="收件人手机号"
                className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-mono"
              />
            </div>
            <input
              type="text"
              value={destAddress}
              onChange={(e) => setDestAddress(e.target.value)}
              placeholder="详细收件地址"
              className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
            />
          </div>

          {/* Reminder Checkboxes */}
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
            <span className="font-bold text-emerald-900 block">默认开通签收提醒服务</span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSMS}
                  onChange={(e) => setEnableSMS(e.target.checked)}
                  className="rounded text-[#00703C]"
                />
                <span>SMS 手机短信</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableWeChat}
                  onChange={(e) => setEnableWeChat(e.target.checked)}
                  className="rounded text-[#00703C]"
                />
                <span>微信/企微模板消息</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBrowser}
                  onChange={(e) => setEnableBrowser(e.target.checked)}
                  className="rounded text-[#00703C]"
                />
                <span>系统弹窗 & 声音提醒</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#00703C] hover:bg-[#005f32] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>录入快件并开始监控</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
