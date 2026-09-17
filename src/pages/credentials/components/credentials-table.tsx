import type { ReactNode } from "react";
import {
  Button,
  credentialStatusTone,
  Popconfirm,
  Status,
  Table,
  type ColumnsType,
} from "@/src/components/Form";
import {
  credentialConfiguredLabel,
  credentialInterfaceLabel,
  credentialProtocolNo,
  credentialStatusLabel,
  type CustomerCredentialRecord,
} from "../model/credential-types";

export function CredentialsTable({
  items,
  total,
  loading,
  error,
  extra,
  onReload,
  onView,
  onEdit,
  onDelete,
}: {
  items: CustomerCredentialRecord[];
  total: number;
  loading: boolean;
  error: string;
  extra?: ReactNode;
  onReload: () => void;
  onView: (item: CustomerCredentialRecord) => void;
  onEdit: (item: CustomerCredentialRecord) => void;
  onDelete: (item: CustomerCredentialRecord) => void;
}) {
  const columns: ColumnsType<CustomerCredentialRecord> = [
    { title: "客户", dataIndex: "customer_name", key: "customer_name", width: 160 },
    { title: "密钥名称", dataIndex: "name", key: "name", width: 160 },
    {
      title: "测试密钥",
      key: "testing",
      children: [
        {
          title: "协议号",
          key: "test_protocol_no",
          className: "font-mono",
          render: (_value, item) => credentialProtocolNo(item, "testing") || "—",
        },
        {
          title: "配置",
          key: "test_configured",
          width: 104,
          render: (_value, item) => (
            <Status tone={item.test_configured ? "success" : "default"}>
              {credentialConfiguredLabel(item.test_configured)}
            </Status>
          ),
        },
      ],
    },
    {
      title: "正式密钥",
      key: "production",
      children: [
        {
          title: "协议号",
          key: "production_protocol_no",
          className: "font-mono",
          render: (_value, item) => credentialProtocolNo(item, "production") || "—",
        },
        {
          title: "配置",
          key: "production_configured",
          width: 104,
          render: (_value, item) => (
            <Status tone={item.production_configured ? "success" : "default"}>
              {credentialConfiguredLabel(item.production_configured)}
            </Status>
          ),
        },
      ],
    },
    {
      title: "接口",
      key: "interfaces",
      width: 160,
      render: (_value, item) => credentialInterfaceLabel(item),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 96,
      render: (value: string) => (
        <Status tone={credentialStatusTone(value)}>{credentialStatusLabel(value)}</Status>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 240,
      className: "whitespace-nowrap",
      render: (_value, item) => (
        <div className="flex flex-nowrap items-center gap-4">
          <Button type="view" onClick={() => onView(item)}>
            查看
          </Button>
          <Button type="edit" onClick={() => onEdit(item)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该密钥？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => onDelete(item)}
          >
            <Button type="delete">删除</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table<CustomerCredentialRecord>
      title="密钥管理"
      extra={extra}
      rowKey="id"
      data={items}
      columns={columns}
      loading={loading}
      error={error}
      empty="暂无本机构客户密钥"
      onRetry={onReload}
      pagination={{
        current: 1,
        pageSize: 20,
        total,
        showSizeChanger: false,
      }}
    />
  );
}
