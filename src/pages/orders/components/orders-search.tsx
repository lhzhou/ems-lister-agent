import { Search } from "lucide-react";
import { SEVERITY_OPTIONS, STATUS_OPTIONS } from "../model/types";

export function OrdersSearch({
  waybillNo,
  status,
  severity,
  onWaybillNoChange,
  onStatusChange,
  onSeverityChange,
  onReset,
}: {
  waybillNo: string;
  status: string;
  severity: string;
  onWaybillNoChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-5">
        <label className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={waybillNo}
            onChange={(event) => onWaybillNoChange(event.target.value)}
            placeholder="搜索运单号"
            aria-label="搜索运单号"
            className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm text-stone-800 outline-none focus:border-emerald-300 focus:bg-white"
          />
        </label>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          aria-label="筛选当前状态"
          className="h-10 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none focus:border-emerald-300 focus:bg-white"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={severity}
          onChange={(event) => onSeverityChange(event.target.value)}
          aria-label="筛选异常等级"
          className="h-10 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none focus:border-emerald-300 focus:bg-white"
        >
          {SEVERITY_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onReset}
          className="h-10 rounded-xl border border-stone-200 px-4 text-sm text-stone-600 hover:bg-stone-50"
        >
          重置筛选
        </button>
      </div>
    </section>
  );
}
