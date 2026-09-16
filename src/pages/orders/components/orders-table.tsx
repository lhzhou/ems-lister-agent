import { Button, Typography } from "antd";
import { ChevronRight, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { Table, type ColumnsType } from "@/src/components/Form";
import { formatElapsedHours } from "@/src/lib/elapsed-hours";
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
}) {
  const columns: ColumnsType<WaybillIndexItem> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      className: "font-mono text-stone-400",
    },
    {
      title: "运单号",
      dataIndex: "waybill_no",
      key: "waybill_no",
      render: (value: string, item) => (
        <Typography.Link
          onClick={() => onOpenDetail(item.id)}
          className="inline-flex items-center gap-1 font-mono"
        >
          {value}
          <ExternalLink className="h-3 w-3 text-stone-400" />
        </Typography.Link>
      ),
    },
    {
      title: "客户",
      dataIndex: "customer_name",
      key: "customer",
      className: "font-medium text-stone-900",
      render: (value: string | undefined) => value || "—",
    },
    {
      title: "运输状态",
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
      title: "当前节点",
      dataIndex: "current_node",
      key: "current_node",
      className: "text-stone-500",
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
          <Clock className="h-3 w-3 text-stone-400" />
          {severityText(value)}
        </span>
      ),
    },
    {
      title: "当前问题",
      key: "issue",
      className: "leading-relaxed text-stone-600",
      render: (_value, item) => (
        <>
          {item.active_issue_summary || "无"}
          {item.is_stagnant ? <span className="ml-2 text-amber-700">滞留</span> : null}
        </>
      ),
    },
    {
      title: "订单首发时间",
      width: 170,
      dataIndex: "started_at",
      key: "started_at",
      className: "whitespace-nowrap font-mono text-stone-500",
      render: (value: string | undefined) => formatOpTime(value),
    },
    {
      title: "最后更新时间",
      width: 170,
      dataIndex: "last_op_time",
      key: "updated",
      className: "whitespace-nowrap font-mono text-stone-500",
      render: (value: string | undefined) => formatOpTime(value),
    },

    {
      title: "运时",
      dataIndex: "elapsed_hours",
      key: "elapsed",
      width: 96,
      className: "font-medium text-stone-700",
      render: (value: number | undefined) => formatElapsedHours(value),
    },
    {
      title: "操作",
      key: "action",
      align: "right",
      render: (_value, item) => (
        <Typography.Link
          onClick={() => onOpenDetail(item.id)}
          className="inline-flex items-center gap-0.5"
        >
          查看轨迹
        </Typography.Link>
      ),
    },
  ];

  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-stone-900">订单索引</h3>
          <p className="mt-0.5 text-xs text-stone-400">共 {total} 条</p>
        </div>
        <Button size="small" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={onReload}>
          刷新
        </Button>
      </div>

      <Table
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
          showTotal: (count) => `共 ${count} 条`,
          onChange: (nextPage, nextSize) => {
            if (nextSize !== size) {
              onSizeChange(nextSize);
              return;
            }
            onPageChange(nextPage);
          },
        }}
      />
    </section>
  );
}
