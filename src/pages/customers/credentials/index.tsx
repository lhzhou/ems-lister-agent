/** @route
meta:
  layout: default
  title: 密钥管理
*/

import { Tag } from "antd";
import { Button, Card, Input, Table, type ColumnsType } from "@/src/components/Form";
import { Search } from "lucide-react";
import { useCredentials } from "../hooks/use-credentials";
import { credentialStatusLabel, type CustomerCredentialRecord } from "../model/credential-types";

export default function CredentialsPage() {
  const credentials = useCredentials();
  const columns: ColumnsType<CustomerCredentialRecord> = [
    { title: "密钥名称", dataIndex: "name", key: "name" },
    {
      title: "协议客户号",
      dataIndex: "postal_customer_no",
      key: "postal_customer_no",
      className: "font-mono",
    },
    { title: "协议号", dataIndex: "sender_no", key: "sender_no", className: "font-mono" },
    {
      title: "路由键",
      dataIndex: "gateway_route_key",
      key: "gateway_route_key",
      className: "font-mono",
    },
    {
      title: "测试",
      dataIndex: "test_configured",
      key: "test_configured",
      render: (value?: boolean) => (value ? "已配置" : "未配置"),
    },
    {
      title: "生产",
      dataIndex: "production_configured",
      key: "production_configured",
      render: (value?: boolean) => (value ? "已配置" : "未配置"),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Tag color={value === "active" ? "green" : "orange"}>{credentialStatusLabel(value)}</Tag>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            value={credentials.keyword}
            onChange={(event) => credentials.setKeyword(event.target.value)}
            onClear={() => credentials.setKeyword("")}
            placeholder="搜索密钥名称、协议号或路由键"
            aria-label="搜索密钥名称、协议号或路由键"
            prefix={<Search className="h-4 w-4 text-on-surface-disabled" aria-hidden="true" />}
            allowClear
          />
          <Button type="reset" onClick={credentials.resetFilters}>
            重置筛选
          </Button>
        </div>
      </Card>
      <Table<CustomerCredentialRecord>
        title="密钥管理"
        rowKey="id"
        data={credentials.items}
        columns={columns}
        loading={credentials.loading}
        error={credentials.error}
        empty="暂无本机构客户密钥"
        onRetry={credentials.reload}
        pagination={{
          current: 1,
          pageSize: 20,
          total: credentials.total,
          showSizeChanger: false,
        }}
      />
    </div>
  );
}
