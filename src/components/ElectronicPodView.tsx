import React, { useState } from 'react';
import { 
  FileCheck, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Clock, 
  User, 
  Calendar,
  Download,
  Eye
} from 'lucide-react';
import { ExpressPackage } from '../types/express';

interface ElectronicPodViewProps {
  packages: ExpressPackage[];
  onOpenPODModal: (pkg: ExpressPackage) => void;
  onSelectPackage: (pkgId: string) => void;
}

export const ElectronicPodView: React.FC<ElectronicPodViewProps> = ({
  packages,
  onOpenPODModal,
  onSelectPackage
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Packages that have POD
  const deliveredPackages = packages.filter(p => p.status === 'delivered' && p.pod);

  const filteredList = deliveredPackages.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.trim().toLowerCase();
    return (
      p.trackingNumber.toLowerCase().includes(q) ||
      p.itemName.toLowerCase().includes(q) ||
      (p.pod && p.pod.signeeName.toLowerCase().includes(q)) ||
      (p.pod && p.pod.receiptNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-stone-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-3 border border-white/15">
            <FileCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>中国邮政电子签名回单存根库 (ePOD System)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            重点邮件妥投电子签收凭单归档
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-blue-100/80 leading-relaxed">
            所有重点邮件妥投签收时均已生成具有法律效力的电子签收凭证，包含当面核验人笔迹、投递工号防伪码及中国邮政专用业务电子印章，提供防篡改永久归档查验。
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索单号、签收人或回单编号..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00703C]/30 focus:border-[#00703C]"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500 self-end sm:self-auto">
          <span>已归档妥投回单: <strong className="text-stone-800 font-bold">{deliveredPackages.length}</strong> 份</span>
        </div>
      </div>

      {/* Grid of Receipts */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <FileCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-700">暂未查询到已签收归档的电子回单</h3>
          <p className="text-xs text-stone-400 mt-1">
            您可在重点快递查询页中选择在途快件，点击“模拟立即妥投签收”体验签单生成。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map(pkg => {
            const pod = pkg.pod!;
            return (
              <div 
                key={pkg.id} 
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Card Top / Header */}
                <div className="p-4 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-mono text-xs font-bold text-[#00703C]">
                      {pkg.trackingNumber}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200/60 text-stone-600 font-semibold">
                    {pod.receiptNumber}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 text-xs">
                  <div>
                    <div className="text-[11px] text-stone-400">邮件托寄品</div>
                    <div className="text-sm font-bold text-stone-900 mt-0.5">{pkg.itemName}</div>
                    <div className="text-[11px] text-emerald-700 font-medium">{pkg.serviceType}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                    <div>
                      <div className="text-[10px] text-stone-400">签收人</div>
                      <div className="text-xs font-bold text-stone-800 mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3 text-stone-500" />
                        <span>{pod.signeeName}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">{pod.signeePhoneMasked}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400">签收方式</div>
                      <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                        {pod.signType}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">当面验视无误</div>
                    </div>
                  </div>

                  {/* Signature display simulation */}
                  <div className="border border-dashed border-stone-200 rounded-xl p-2.5 bg-stone-50/30 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-400">收件人手写笔迹</div>
                      <div className="font-serif italic font-bold text-base text-stone-800 tracking-widest mt-1">
                        {pod.signeeName}
                      </div>
                    </div>
                    {/* Simulated small red seal stamp */}
                    <div className="w-14 h-14 rounded-full border border-rose-500/80 text-rose-600 flex flex-col items-center justify-center text-[7px] text-center p-1 transform rotate-[-8deg] shadow-xs select-none">
                      <span className="font-bold leading-none">中国邮政</span>
                      <span className="text-[6px] leading-tight mt-0.5">投递专用章</span>
                      <span className="text-[5px] scale-90 text-rose-400">已验视妥投</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>妥投时间：{pod.signTime}</span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectPackage(pkg.id)}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>查看完整轨迹</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenPODModal(pkg)}
                    className="px-3 py-1.5 bg-[#00703C] hover:bg-[#005f32] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>电子回执详情</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
