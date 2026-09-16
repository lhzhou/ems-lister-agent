import { Button, Typography } from "antd";
import { Clock, ExternalLink } from "lucide-react";
import { Table, type ColumnsType } from "@/src/components/Form";

export type DashboardAlertItem = {
  id: string;
  waybillId?: number;
  riskLevel: "一般" | "中风险" | "高风险";
  customer: string;
  mailNo: string;
  description: string;
  currentNode: string;
  occurTime: string;
};

export function DashboardAlertsTable({
  items,
  showAll,
  onToggleShowAll,
  onOpenDetail,
}: {
  items: DashboardAlertItem[];
  showAll: boolean;
  onToggleShowAll: () => void;
  onOpenDetail: (id: number) => void;
}) {
  const columns: ColumnsType<DashboardAlertItem> = [
    {
      title: "风险等级",
      dataIndex: "riskLevel",
      key: "risk",
      width: 96,
      render: (value: DashboardAlertItem["riskLevel"]) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value === "高风险"
              ? "bg-red-50 text-red-700 border border-red-200"
              : value === "中风险"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-stone-100 text-stone-600"
          }`}
        >
          <Clock className="h-3 w-3 text-stone-400" />
          <span>{value}</span>
        </span>
      ),
    },
    {
      title: "重点客户",
      dataIndex: "customer",
      key: "customer",
      width: 192,
      className: "font-medium text-stone-900",
    },
    {
      title: "邮件号",
      dataIndex: "mailNo",
      key: "mailNo",
      width: 200,
      render: (value: string, item) => (
        <Typography.Link
          onClick={() => {
            if (item.waybillId) onOpenDetail(item.waybillId);
          }}
          className="inline-flex items-center gap-1 font-mono"
        >
          {value}
          <ExternalLink className="h-3 w-3 text-stone-400" />
        </Typography.Link>
      ),
    },
    {
      title: "异常说明",
      dataIndex: "description",
      key: "description",
      className: "leading-relaxed text-stone-600",
    },
    {
      title: "当前节点",
      dataIndex: "currentNode",
      key: "node",
      width: 144,
      className: "text-stone-500",
    },
    {
      title: "发生时间",
      dataIndex: "occurTime",
      key: "occurTime",
      width: 168,
      align: "right",
      className: "whitespace-nowrap font-mono text-stone-400",
      render: (value: string) => (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3 text-stone-400" />
          <span>{value}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-stone-900">今日异常预警</h3>
          <p className="mt-0.5 text-xs text-stone-400">仅展示今日检出的最新异常</p>
        </div>
        <Button size="small" onClick={onToggleShowAll}>
          {showAll ? "收起列表" : "查看全部"}
        </Button>
      </div>

      <Table rowKey="id" columns={columns} data={items} empty="暂无异常预警" />
    </div>
  );
}
