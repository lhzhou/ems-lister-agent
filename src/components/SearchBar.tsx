import React, { useState } from 'react';
import { 
  Search, 
  Layers, 
  RotateCcw, 
  Sparkles, 
  CheckCheck, 
  PhoneCall, 
  X,
  FileText
} from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  phoneQuery: string;
  onPhoneChange: (phone: string) => void;
  onReset: () => void;
  onSelectSample: (trackingNumber: string) => void;
  onOpenBatchModal: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  phoneQuery,
  onPhoneChange,
  onReset,
  onSelectSample,
  onOpenBatchModal
}) => {
  const quickSamples = [
    { label: '机要政务公文', number: 'EA982345671CN' },
    { label: '北大录取通知书', number: '1198034789123' },
    { label: '阳澄湖大闸蟹极速鲜', number: 'EA671829034CN' },
    { label: '华为5万保价件', number: '9871029384501' },
    { label: '生物冷链异常预警', number: 'EA551209847CN' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5">
      {/* Search inputs row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Main tracking number query */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-5 h-5 text-emerald-700" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="输入邮政邮件号 (如 EA982345671CN / 119803...) 或品名/收寄件人"
            className="w-full pl-11 pr-10 py-2.5 text-sm bg-stone-50/70 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00703C] focus:bg-white text-stone-800 placeholder-stone-400 font-mono tracking-wide"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Optional Recipient Phone Last 4 Digits for verification */}
        <div className="relative w-full lg:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <PhoneCall className="w-4 h-4 text-stone-400" />
          </div>
          <input
            type="text"
            maxLength={4}
            value={phoneQuery}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
            placeholder="收件人手机尾号4位"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50/70 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00703C] focus:bg-white text-stone-800 placeholder-stone-400 font-mono"
          />
          {phoneQuery && (
            <button
              type="button"
              onClick={() => onPhoneChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenBatchModal}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-stone-300/80"
          >
            <Layers className="w-4 h-4 text-stone-600" />
            <span>批量查询</span>
          </button>

          {(searchQuery || phoneQuery) && (
            <button
              type="button"
              onClick={onReset}
              className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1 border border-stone-300/80"
              title="重置查询"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重置</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick sample chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 text-xs">
        <span className="text-stone-500 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-[#F9B200]" /> 重点快件速查示例:
        </span>
        {quickSamples.map((sample) => (
          <button
            key={sample.number}
            type="button"
            onClick={() => onSelectSample(sample.number)}
            className="px-2.5 py-1 rounded-lg bg-emerald-50/80 hover:bg-emerald-100 text-[#00703C] border border-emerald-200/70 transition-colors font-medium text-[11px] flex items-center gap-1"
          >
            <span>{sample.label}</span>
            <span className="text-emerald-800/60 font-mono text-[10px]">({sample.number.slice(0, 5)}...)</span>
          </button>
        ))}
      </div>
    </div>
  );
};
