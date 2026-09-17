import type { ReactNode } from "react";
import { Tag } from "antd";
import { Button, Popconfirm } from "@/src/components/Form";
import { Table, type ColumnsType } from "@/src/components/Form";
import type { AccountRecord } from "@/src/pages/accounts/model/types";
import type { GroupRecord } from "../model/types";

export function GroupsTable({
  items,
  total,
  page,
  size,
  loading,
  error,
  leaders,
  onReload,
  onPageChange,
  onSizeChange,
  onView,
  onEdit,
  onDelete,
  extra,
}: {
  items: GroupRecord[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  error: string;
  leaders: AccountRecord[];
  onReload: () => void;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onView: (item: GroupRecord) => void;
  onEdit: (item: GroupRecord) => void;
  onDelete: (item: GroupRecord) => void;
  extra?: ReactNode;
}) {
  const leaderName = (id: number) =>
    leaders.find((item) => item.id === id)?.display_name ?? String(id);

  const columns: ColumnsType<GroupRecord> = [
    { title: "组名称", dataIndex: "name", key: "name" },
    {
      title: "组编码",
      dataIndex: "code",
      key: "code",
      className: "font-mono text-on-surface-variant",
    },
    {
      title: "组长",
      dataIndex: "leader_account_id",
      key: "leader",
      render: (value: number) => leaderName(value),
    },
    {
      title: "状态",
      dataIndex: "enabled",
      key: "enabled",
      render: (value: boolean) => (
        <Tag color={value ? "green" : "orange"}>{value ? "启用" : "停用"}</Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      render: (_value, item) => (
        <div className="flex flex-wrap gap-1">
          <Button type="view" onClick={() => onView(item)}>
            查看
          </Button>
          <Button type="edit" onClick={() => onEdit(item)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该客服组？"
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
    <Table<GroupRecord>
      title="客服组管理"
      extra={extra}
      rowKey="id"
      data={items}
      columns={columns}
      loading={loading}
      error={error}
      empty="暂无客服组"
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
