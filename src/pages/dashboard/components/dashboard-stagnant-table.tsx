import { ChevronRight, ExternalLink } from "lucide-react";
import type { StagnantWaybill } from "@/src/api";
import { Button, Table, type ColumnsType } from "@/src/components/Form";
import { formatDurationFromTime } from "@/src/lib/duration";
import { coarseStatusClass, waybillStatusLabel } from "@/src/lib/waybill-timeline";

export function DashboardStagnantTable({
  items,
  onOpenDetail,
  onViewMore,
}: {
  items: StagnantWaybill[];
  onOpenDetail: (id: number) => void;
  onViewMore?: () => void;
}) {
  const columns: ColumnsType<StagnantWaybill> = [
    {
      title: "最近轨迹",
      dataIndex: "last_op_time",
      key: "last_op_time",
      className: "whitespace-nowrap font-mono text-on-surface-variant",
      render: (value: string | undefined) => value ?? "-",
    },
    {
      title: "重点客户",
      dataIndex: "customer_name",
      key: "customer",
      className: "font-medium text-on-surface",
      render: (value: string | undefined) => value ?? "未关联客户",
    },
    {
      title: "邮件号",
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
      title: "当前状态",
      dataIndex: "current_status",
      key: "status",
      render: (value: string) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${coarseStatusClass(value)}`}
        >
          {waybillStatusLabel(value)}
        </span>
      ),
    },
    {
      title: "滞留节点",
      dataIndex: "current_node",
      key: "current_node",
      className: "font-medium text-on-surface",
      render: (value: string | undefined) => value ?? "-",
    },
    {
      title: "订单开始时间",
      dataIndex: "started_at",
      key: "started_at",
      className: "whitespace-nowrap font-mono text-on-surface-variant",
      render: (value: string | undefined) => value ?? "-",
    },
    {
      title: "当前用时",
      dataIndex: "elapsed_hours",
      key: "elapsed",
      className: "font-medium text-on-surface",
      render: (_value: number | undefined, item) =>
        formatDurationFromTime(item.started_at, item.elapsed_hours),
    },
    {
      title: "滞留时长",
      dataIndex: "stagnant_hours",
      key: "stagnant",
      className: "font-medium text-warning",
      render: (_value: number | undefined, item) =>
        formatDurationFromTime(item.last_op_time, item.stagnant_hours),
    },
    {
      title: "操作",
      key: "action",
      align: "right",
      render: (_value, item) => (
        <Button
          type="view"
          className="inline-flex items-center gap-0.5"
          onClick={() => onOpenDetail(item.id)}
        >
          轨迹
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <Table
      title={
        <span className="inline-flex items-center gap-2">
          最新滞留信息
          <span className="app-status-tag border border-[#ffe58f] bg-alert-warning-bg text-warning">
            超过24小时未推进
          </span>
        </span>
      }
      description="按最近轨迹时间倒序，展示当前账号可见的滞留邮件"
      extra={
        <Button type="view" onClick={() => onViewMore?.()}>
          <span className="inline-flex items-center gap-0.5 text-primary">
            查看更多
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </Button>
      }
      rowKey="id"
      columns={columns}
      data={items}
      empty="暂无滞留邮件"
    />
  );
}
