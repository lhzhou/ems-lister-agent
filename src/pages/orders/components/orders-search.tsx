import { Search } from "lucide-react";
import { Button, Card, Input, Select } from "@/src/components/Form";
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
    <Card>
      <div className="grid gap-3 md:grid-cols-5">
        <Input
          rootClassName="md:col-span-2"
          value={waybillNo}
          onChange={(event) => onWaybillNoChange(event.target.value)}
          onClear={() => onWaybillNoChange("")}
          placeholder="搜索运单号"
          aria-label="搜索运单号"
          prefix={<Search className="h-4 w-4 text-on-surface-disabled" aria-hidden="true" />}
          allowClear
        />
        <Select
          value={status || undefined}
          onChange={(value) => onStatusChange(value ?? "")}
          placeholder="全部状态"
          aria-label="筛选当前状态"
          options={STATUS_OPTIONS.filter((option) => option.value).map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          allowClear
        />
        <Select
          value={severity || undefined}
          onChange={(value) => onSeverityChange(value ?? "")}
          placeholder="全部异常等级"
          aria-label="筛选异常等级"
          options={SEVERITY_OPTIONS.filter((option) => option.value).map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          allowClear
        />
        <Button type="reset" onClick={onReset}>
          重置筛选
        </Button>
      </div>
    </Card>
  );
}
