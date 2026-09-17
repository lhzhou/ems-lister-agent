import { Search } from "lucide-react";
import { Button, Card, Input, Select } from "@/src/components/Form";
import { CREDENTIAL_STATUS_OPTIONS } from "../model/credential-types";

export function CredentialsSearch({
  keyword,
  status,
  onKeywordChange,
  onStatusChange,
  onReset,
}: {
  keyword: string;
  status: string;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <Card>
      <div className="grid gap-3 md:grid-cols-3">
        <Input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          onClear={() => onKeywordChange("")}
          placeholder="搜索密钥名称、客户、协议号或路由键"
          aria-label="搜索密钥名称、客户、协议号或路由键"
          prefix={<Search className="h-4 w-4 text-on-surface-disabled" aria-hidden="true" />}
          allowClear
        />
        <Select
          value={status || undefined}
          onChange={(value) => onStatusChange(value ?? "")}
          placeholder="全部状态"
          aria-label="筛选状态"
          options={CREDENTIAL_STATUS_OPTIONS.filter((option) => option.value).map((option) => ({
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
