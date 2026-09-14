import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Stamp,
  Award,
  Calendar,
  Building
} from 'lucide-react';
import { ExpressPackage } from '../types/express';

interface ElectronicReceiptModalProps {
  pkg: ExpressPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ElectronicReceiptModal: React.FC<ElectronicReceiptModalProps> = ({
  pkg,
  isOpen,
  onClose
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !pkg || !pkg.pod) return null;

  const pod = pkg.pod;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-300 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-stone-900 px-6 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F9B200]" />
            <span className="font-bold text-sm">中国邮政 EMS 重点快递电子回执凭证 (ePOD)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印回执</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Sheet */}
        <div className="p-6 overflow-y-auto bg-stone-100 flex justify-center">
          <div 
            ref={receiptRef}
            className="w-full max-w-xl bg-[#fffdfa] border-2 border-stone-400/80 rounded-xl p-6 sm:p-8 shadow-md relative overflow-hidden text-stone-800"
          >
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-8xl font-black rotate-[-30deg] tracking-widest text-[#00703C]">
                CHINA POST EMS
              </span>
            </div>

            {/* Official Header */}
            <div className="border-b-2 border-[#00703C] pb-4 mb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#00703C] text-white text-xs font-bold px-2 py-0.5 rounded">
                    中国邮政速递物流
                  </span>
                  <span className="text-xs text-[#00703C] font-semibold tracking-wider">
                    CHINA POST EMS
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 tracking-wider">
                  重点邮件电子签收单 (POD)
                </h2>
                <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                  电子档案存根唯一编号: {pod.receiptNumber}
                </p>
              </div>

              {/* Barcode representation */}
              <div className="text-right">
                <div className="w-32 h-9 bg-stone-900 flex items-center justify-center text-white text-[10px] font-mono tracking-widest p-1">
                  ||| | |||| | ||||| ||
                </div>
                <span className="text-[10px] font-mono text-stone-500 block mt-0.5">
                  {pkg.trackingNumber}
                </span>
              </div>
            </div>

            {/* Meta Table Info */}
            <div className="grid grid-cols-2 gap-4 text-xs border border-stone-200 rounded-lg p-3.5 bg-stone-50/60 mb-5">
              <div>
                <span className="text-stone-400 block text-[11px]">重点服务类型</span>
                <span className="font-bold text-stone-800">{pkg.serviceType} ({pkg.vipLabel})</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">物品名称及重量</span>
                <span className="font-bold text-stone-800">{pkg.itemName} / {pkg.itemWeight}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">寄件方信息</span>
                <span className="text-stone-800 font-medium">{pkg.origin.city} · {pkg.origin.sender}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">收件方与地址</span>
                <span className="text-stone-800 font-medium">{pkg.destination.city} · {pkg.destination.address}</span>
              </div>
            </div>

            {/* Delivery & Signature Core Box */}
            <div className="border border-stone-300 rounded-xl p-4 bg-white relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Signee Side */}
                <div>
                  <span className="text-xs text-stone-500 font-medium block mb-1">
                    收件人/代签人签名确认:
                  </span>
                  {/* Handwritten Calligraphy Signature Simulation */}
                  <div className="h-20 border border-dashed border-stone-300 rounded-lg bg-stone-50 flex items-center justify-center relative overflow-hidden px-4">
                    <span className="font-serif italic font-black text-2xl text-stone-800 select-none tracking-widest rotate-[-3deg]">
                      {pod.signeeName}
                    </span>
                    <span className="absolute bottom-1 right-2 text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                      电子笔迹核验通过
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-stone-500 space-y-0.5">
                    <div>签收模式：<strong>{pod.signType}</strong></div>
                    <div>验证手机：<strong>{pod.signeePhoneMasked}</strong></div>
                    <div>签收时间：<strong className="font-mono">{pod.signTime}</strong></div>
                  </div>
                </div>

                {/* Postman & Official Seal Side */}
                <div className="flex flex-col justify-between relative">
                  <div>
                    <span className="text-xs text-stone-500 font-medium block mb-1">
                      投递员经办与工号:
                    </span>
                    <div className="text-xs text-stone-800 space-y-1">
                      <p>投递员：<strong>{pod.courierName}</strong></p>
                      <p className="font-mono">工号：<strong>{pod.courierWorkId}</strong></p>
                      <p className="text-[11px] text-emerald-800">
                        ✓ 已核验证件与包装封签完好
                      </p>
                    </div>
                  </div>

                  {/* Red Official Postal Stamp Seal Simulation */}
                  <div className="absolute right-0 bottom-0 w-28 h-28 rounded-full border-2 border-red-600/70 flex flex-col items-center justify-center p-2 text-red-600 rotate-[-12deg] pointer-events-none select-none">
                    <div className="w-24 h-24 rounded-full border border-dashed border-red-500 flex flex-col items-center justify-center text-center p-1">
                      <span className="text-[8px] font-bold tracking-tighter leading-none text-red-700">
                        ★ 中国邮政速递物流 ★
                      </span>
                      <span className="text-[11px] font-black my-0.5 leading-none text-red-600">
                        妥投专用章
                      </span>
                      <span className="text-[7px] font-mono leading-none text-red-500">
                        {pod.signTime.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal / Security Footer */}
            <div className="mt-5 pt-3 border-t border-stone-200 text-[10px] text-stone-400 flex items-center justify-between">
              <span>中国邮政重点邮件全程数字化履约保障体系</span>
              <span>官方客服查询热线：11183</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
