import { Button } from "antd";
import { Search } from "lucide-react";
import { Input, Select } from "@/src/components/Form";
import { ACCOUNT_STATUS_OPTIONS, ACCOUNT_TYPE_OPTIONS } from "../model/types";

export function AccountsSearch({
  keyword,
  type,
  status,
  onKeywordChange,
  onTypeChange,
  onStatusChange,
  onReset,
}: {
  keyword: string;
  type: string;
  status: string;
  onKeywordChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <Input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          onClear={() => onKeywordChange("")}
          placeholder="搜索账号或姓名"
          aria-label="搜索账号或姓名"
          prefix={<Search className="h-4 w-4 text-stone-400" />}
          allowClear
        />
        <Select
          value={type || undefined}
          onChange={(value) => onTypeChange(value ?? "")}
          placeholder="全部岗位"
          aria-label="筛选岗位"
          options={ACCOUNT_TYPE_OPTIONS.filter((option) => option.value).map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          allowClear
        />
        <Select
          value={status || undefined}
          onChange={(value) => onStatusChange(value ?? "")}
          placeholder="全部状态"
          aria-label="筛选状态"
          options={ACCOUNT_STATUS_OPTIONS.filter((option) => option.value).map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          allowClear
        />
        <Button onClick={onReset}>重置筛选</Button>
      </div>
    </section>
  );
}
