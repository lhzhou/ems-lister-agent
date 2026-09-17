import type { ReactNode } from "react";
import {
  Button,
  customerStatusTone,
  Popconfirm,
  Status,
  Table,
  type ColumnsType,
} from "@/src/components/Form";
import { customerStatusLabel, type CustomerRecord } from "@/src/pages/customers/model/types";

export function EnterprisesTable({
  items,
  total,
  page,
  size,
  loading,
  error,
  extra,
  onReload,
  onPageChange,
  onSizeChange,
  onView,
  onEdit,
  onDelete,
}: {
  items: CustomerRecord[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  error: string;
  extra?: ReactNode;
  onReload: () => void;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onView: (item: CustomerRecord) => void;
  onEdit: (item: CustomerRecord) => void;
  onDelete: (item: CustomerRecord) => void;
}) {
  const columns: ColumnsType<CustomerRecord> = [
    { title: "公司名称", dataIndex: "customer_name", key: "customer_name" },
    {
      title: "客户编号",
      dataIndex: "customer_no",
      key: "customer_no",
      className: "font-mono text-on-surface-variant",
    },
    { title: "联系人", dataIndex: "contact_name", key: "contact_name" },
    { title: "联系电话", dataIndex: "contact_phone", key: "contact_phone" },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Status tone={customerStatusTone(value)}>{customerStatusLabel(value)}</Status>
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
            title="确定删除该企业？"
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
    <Table<CustomerRecord>
      title="企业管理"
      extra={extra}
      rowKey="id"
      data={items}
      columns={columns}
      loading={loading}
      error={error}
      empty="暂无本机构企业"
      onRetry={onReload}
      pagination={{
        current: page,
        pageSize: size,
        total,
        showSizeChanger: true,
        onChange: (nextPage, nextSize) => {
          if (nextSize !== size) onSizeChange(nextSize);
          else onPageChange(nextPage);
        },
      }}
    />
  );
}
