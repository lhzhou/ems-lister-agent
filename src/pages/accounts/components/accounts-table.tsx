import type { ReactNode } from "react";
import { accountStatusTone, Button, Popconfirm, Status } from "@/src/components/Form";
import { Table, type ColumnsType } from "@/src/components/Form";
import {
  accountStatusLabel,
  accountTypeLabel,
  canManageAccount,
  type AccountRecord,
} from "../model/types";

export function AccountsTable({
  items,
  total,
  page,
  size,
  loading,
  error,
  onReload,
  onPageChange,
  onSizeChange,
  onView,
  onEdit,
  onResetPassword,
  onDelete,
  extra,
}: {
  items: AccountRecord[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  error: string;
  onReload: () => void;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onView: (item: AccountRecord) => void;
  onEdit: (item: AccountRecord) => void;
  onResetPassword: (item: AccountRecord) => void;
  onDelete: (item: AccountRecord) => void;
  extra?: ReactNode;
}) {
  const columns: ColumnsType<AccountRecord> = [
    { title: "账号", dataIndex: "username", key: "username", className: "font-mono" },
    { title: "姓名", dataIndex: "display_name", key: "display_name" },
    {
      title: "岗位",
      dataIndex: "type",
      key: "type",
      render: (value: string) => accountTypeLabel(value),
    },
    {
      title: "客服组",
      dataIndex: "group_name",
      key: "group_name",
      render: (value?: string) => value || "—",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Status tone={accountStatusTone(value)}>{accountStatusLabel(value)}</Status>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 300,
      className: "whitespace-nowrap",
      render: (_value, item) => {
        const writable = canManageAccount(item.type);
        return (
          <div className="flex flex-nowrap items-center gap-4">
            <Button type="view" onClick={() => onView(item)}>
              查看
            </Button>
            <Button type="edit" disabled={!writable} onClick={() => onEdit(item)}>
              编辑
            </Button>
            <Button type="edit" disabled={!writable} onClick={() => onResetPassword(item)}>
              重置密码
            </Button>
            <Popconfirm
              title="确定删除该账号？"
              okText="删除"
              cancelText="取消"
              disabled={!writable}
              onConfirm={() => onDelete(item)}
            >
              <Button type="delete" disabled={!writable}>
                删除
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <Table<AccountRecord>
      title="账号管理"
      extra={extra}
      rowKey="id"
      data={items}
      columns={columns}
      loading={loading}
      error={error}
      empty="暂无公司账号"
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
