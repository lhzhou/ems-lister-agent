import type { ReactNode } from "react";
import { Button, customerStatusTone, Popconfirm, Status } from "@/src/components/Form";
import { Table, type ColumnsType } from "@/src/components/Form";
import { customerLoginRoleLabel, customerStatusLabel, type CustomerRecord } from "../model/types";

export function CustomersTable({
  items,
  total,
  page,
  size,
  loading,
  error,
  extra,
  title = "客户管理",
  onReload,
  onPageChange,
  onSizeChange,
  onView,
  onEdit,
  onDelete,
  allowEdit = true,
}: {
  items: CustomerRecord[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  error: string;
  extra?: ReactNode;
  title?: string;
  onReload: () => void;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onView: (item: CustomerRecord) => void;
  onEdit: (item: CustomerRecord) => void;
  onDelete: (item: CustomerRecord) => void;
  allowEdit?: boolean;
}) {
  const columns: ColumnsType<CustomerRecord> = [
    { title: "公司名称", dataIndex: "customer_name", key: "customer_name" },
    {
      title: "客户编号",
      dataIndex: "customer_no",
      key: "customer_no",
      className: "font-mono text-on-surface-variant",
    },
    {
      title: "登录账号",
      dataIndex: "login_username",
      key: "login_username",
      className: "font-mono",
      render: (value?: string) => value || "未绑定",
    },
    { title: "联系人", dataIndex: "contact_name", key: "contact_name" },
    { title: "联系电话", dataIndex: "contact_phone", key: "contact_phone" },
    {
      title: "角色",
      dataIndex: "login_role",
      key: "login_role",
      render: (value?: string) => customerLoginRoleLabel(value),
    },
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
          {allowEdit ? (
            <Button type="edit" onClick={() => onEdit(item)}>
              编辑
            </Button>
          ) : null}
          <Popconfirm
            title="确定删除该客户？"
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
      title={title}
      extra={extra}
      rowKey="id"
      data={items}
      columns={columns}
      loading={loading}
      error={error}
      empty="暂无本机构客户"
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
