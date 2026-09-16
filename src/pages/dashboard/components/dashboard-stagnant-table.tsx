import { Button, Typography } from "antd";
import { ChevronRight, ExternalLink } from "lucide-react";
import type { StagnantWaybill } from "@/src/api";
import { Table, type ColumnsType } from "@/src/components/Form";
import { formatElapsedHours } from "@/src/lib/elapsed-hours";
import { WAYBILL_STATUS_LABELS } from "@/src/lib/waybill-timeline";

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
      className: "whitespace-nowrap font-mono text-stone-500",
      render: (value: string | undefined) => value ?? "-",
    },
    {
      title: "重点客户",
      dataIndex: "customer_name",
      key: "customer",
      className: "font-medium text-stone-900",
      render: (value: string | undefined) => value ?? "未关联客户",
    },
    {
      title: "邮件号",
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
      title: "当前状态",
      dataIndex: "current_status",
      key: "status",
      render: (_value: string, item) =>
        item.last_op_name?.trim() || WAYBILL_STATUS_LABELS[item.current_status] || item.current_status,
    },
    {
      title: "订单开始时间",
      dataIndex: "started_at",
      key: "started_at",
      className: "whitespace-nowrap font-mono text-stone-500",
      render: (value: string | undefined) => value ?? "-",
    },
    {
      title: "当前用时",
      dataIndex: "elapsed_hours",
      key: "elapsed",
      className: "font-medium text-stone-700",
      render: (value: number | undefined) => formatElapsedHours(value),
    },
    {
      title: "滞留时长",
      dataIndex: "stagnant_hours",
      key: "stagnant",
      className: "font-medium text-amber-700",
      render: (value: number) => `${value}小时`,
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
          轨迹
          <ChevronRight className="h-3.5 w-3.5" />
        </Typography.Link>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">最新滞留信息</h3>
            <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              超过24小时未推进
            </span>
          </div>
          <p className="mt-0.5 text-xs text-stone-400">
            按最近轨迹时间倒序，展示当前账号可见的滞留邮件
          </p>
        </div>
        <Button type="default" size="small" onClick={() => onViewMore?.()}>
          <span className="inline-flex items-center gap-0.5 text-[#00703C]">
            查看更多
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        data={items}
        empty="暂无滞留邮件"
      />
    </div>
  );
}
