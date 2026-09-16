import React, { useState } from "react";
import { X, Layers, Search, Check, AlertCircle } from "lucide-react";
import { ExpressPackage } from "../types/express";

interface BatchQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchBatch: (numbers: string[]) => void;
  availablePackages: ExpressPackage[];
}

export const BatchQueryModal: React.FC<BatchQueryModalProps> = ({
  isOpen,
  onClose,
  onSearchBatch,
  availablePackages,
}) => {
  const [inputText, setInputText] = useState("");

  if (!isOpen) return null;

  const handleFillAllExisting = () => {
    const numbers = availablePackages.map((p) => p.trackingNumber).join("\n");
    setInputText(numbers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const list = inputText
      .split(/[\n,，\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    onSearchBatch(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-gradient-to-r from-[#005f32] to-[#00703C] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F9B200]" />
            <h3 className="font-bold text-base">VIP 重点邮件批量查询</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700">
                输入待查邮件号 (支持换行、空格或逗号分隔，单次最多50单):
              </label>
              <button
                type="button"
                onClick={handleFillAllExisting}
                className="text-xs text-[#00703C] hover:underline font-semibold"
              >
                一键填入系统现有全部重点单号
              </button>
            </div>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="例如：&#10;EA982345671CN&#10;1198034789123&#10;EA671829034CN&#10;9871029384501"
              className="w-full p-3 text-xs font-mono bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#00703C] focus:bg-white text-stone-800"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>系统将对批量邮件进行并发时效匹配与签收状态检索。</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#00703C] hover:bg-[#005f32] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>开始批量检索</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
