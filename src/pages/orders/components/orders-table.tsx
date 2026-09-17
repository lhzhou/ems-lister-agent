import { Clock, ExternalLink } from "lucide-react";
import { Button, Table, type ColumnsType } from "@/src/components/Form";
import { formatDuration } from "@/src/lib/duration";
import { coarseStatusClass, waybillStatusLabel } from "@/src/lib/waybill-timeline";
import {
  PAGE_SIZES,
  formatOpTime,
  severityClass,
  severityText,
  type WaybillIndexItem,
} from "../model/types";

export function OrdersTable({
  items,
  total,
  page,
  size,
  loading,
  error,
  onReload,
  onPageChange,
  onSizeChange,
  onOpenDetail,
  onRearchive,
  rearchivingId,
}: {
  items: WaybillIndexItem[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  error: string;
  onReload: () => void;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onOpenDetail: (id: number) => void;
  onRearchive: (id: number) => void;
  rearchivingId: number | null;
}) {
  const columns: ColumnsType<WaybillIndexItem> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      className: "font-mono text-on-surface-disabled",
    },
    {
      title: "订单状态",
      key: "status",
      render: (_value, item) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${coarseStatusClass(item.current_status)}`}
        >
          {waybillStatusLabel(item.current_status)}
        </span>
      ),
    },
    {
      title: "运单号",
      dataIndex: "waybill_no",
      key: "waybill_no",
      render: (value: string, item) => (
        <Button
          type="view"
          className="inline-flex items-center gap-1 px-0 font-mono"
          onClick={() => onOpenDetail(item.id)}
        >
          {value}
          <ExternalLink className="h-3 w-3 text-on-surface-disabled" />
        </Button>
      ),
    },
    {
      title: "客户",
      dataIndex: "customer_name",
      key: "customer",
      className: "font-medium text-on-surface",
      render: (value: string | undefined) => value || "—",
    },
    {
      title: "运输状态",
      key: "last_op_name",
      dataIndex: "last_op_name",
      render: (value: string | undefined) => value || "—",
    },

    {
      title: "当前节点",
      dataIndex: "current_node",
      key: "current_node",
      className: "text-on-surface-variant",
      render: (value: string | undefined) => value || "—",
    },

    {
      title: "异常等级",
      dataIndex: "highest_severity",
      key: "severity",
      render: (value: string | undefined) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${severityClass(value)}`}
        >
          <Clock className="h-3 w-3 text-on-surface-disabled" />
          {severityText(value)}
        </span>
      ),
    },
    {
      title: "当前问题",
      key: "issue",
      className: "leading-relaxed text-on-surface-variant",
      render: (_value, item) => (
        <>
          {item.active_issue_summary || "无"}
          {item.is_stagnant ? <span className="ml-2 text-warning">滞留</span> : null}
        </>
      ),
    },
    {
      title: "订单首发时间",
      width: 170,
      dataIndex: "started_at",
      key: "started_at",
      className: "whitespace-nowrap font-mono text-on-surface-variant",
      render: (value: string | undefined) => formatOpTime(value),
    },
    {
      title: "最后更新时间",
      width: 170,
      dataIndex: "last_op_time",
      key: "updated",
      className: "whitespace-nowrap font-mono text-on-surface-variant",
      render: (value: string | undefined) => formatOpTime(value),
    },

    {
      title: "运时",
      dataIndex: "elapsed_hours",
      key: "elapsed",
      width: 120,
      className: "font-medium text-on-surface",
      render: (value: number | undefined) => formatDuration(value),
    },
    {
      title: "操作",
      key: "action",
      align: "right",
      render: (_value, item) => (
        <span className="inline-flex items-center gap-3">
          <Button type="view" onClick={() => onOpenDetail(item.id)}>
            查看轨迹
          </Button>
          <Button
            type="edit"
            disabled={rearchivingId === item.id}
            onClick={() => onRearchive(item.id)}
          >
            {rearchivingId === item.id ? "归档中" : "重新归档"}
          </Button>
        </span>
      ),
    },
  ];

  return (
    <Table
      title="订单索引"
      rowKey="id"
      columns={columns}
      data={items}
      loading={loading}
      error={error}
      empty="当前筛选条件下没有订单索引记录。"
      onRetry={onReload}
      pagination={{
        current: page,
        pageSize: size,
        total,
        showSizeChanger: true,
        pageSizeOptions: PAGE_SIZES.map(String),
        onChange: (nextPage, nextSize) => {
          if (nextSize !== size) {
            onSizeChange(nextSize);
            return;
          }
          onPageChange(nextPage);
        },
      }}
    />
  );
}
