import { Button } from "antd";
import { Search } from "lucide-react";
import { Input, Select } from "@/src/components/Form";
import { GROUP_STATUS_OPTIONS } from "../model/types";

export function GroupsSearch({
  keyword,
  enabled,
  onKeywordChange,
  onEnabledChange,
  onReset,
}: {
  keyword: string;
  enabled: string;
  onKeywordChange: (value: string) => void;
  onEnabledChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-3">
        <Input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          onClear={() => onKeywordChange("")}
          placeholder="搜索组名称或编码"
          aria-label="搜索组名称或编码"
          prefix={<Search className="h-4 w-4 text-stone-400" />}
          allowClear
        />
        <Select
          value={enabled || undefined}
          onChange={(value) => onEnabledChange(value ?? "")}
          placeholder="全部状态"
          aria-label="筛选启用状态"
          options={GROUP_STATUS_OPTIONS.filter((option) => option.value).map((option) => ({
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
