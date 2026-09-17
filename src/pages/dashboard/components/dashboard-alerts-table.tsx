import { Clock, ExternalLink } from "lucide-react";
import { Button, riskStatusTone, Status, Table, type ColumnsType } from "@/src/components/Form";

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
        <Status tone={riskStatusTone(value)}>{value}</Status>
      ),
    },
    {
      title: "重点客户",
      dataIndex: "customer",
      key: "customer",
      width: 192,
      className: "font-medium text-on-surface",
    },
    {
      title: "邮件号",
      dataIndex: "mailNo",
      key: "mailNo",
      width: 200,
      render: (value: string, item) => (
        <Button
          type="link"
          className="app-action-view inline-flex items-center gap-1 px-0 font-mono"
          onClick={() => {
            if (item.waybillId) onOpenDetail(item.waybillId);
          }}
        >
          {value}
          <ExternalLink className="h-3 w-3 text-on-surface-disabled" />
        </Button>
      ),
    },
    {
      title: "异常说明",
      dataIndex: "description",
      key: "description",
      className: "leading-relaxed text-on-surface-variant",
    },
    {
      title: "当前节点",
      dataIndex: "currentNode",
      key: "node",
      width: 144,
      className: "text-on-surface-variant",
    },
    {
      title: "发生时间",
      dataIndex: "occurTime",
      key: "occurTime",
      width: 168,
      align: "right",
      className: "whitespace-nowrap font-mono text-on-surface-disabled",
      render: (value: string) => (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3 text-on-surface-disabled" />
          <span>{value}</span>
        </span>
      ),
    },
  ];

  return (
    <Table
      title="今日异常预警"
      description="仅展示今日检出的最新异常"
      extra={
        <Button type="view" onClick={onToggleShowAll}>
          {showAll ? "收起列表" : "查看全部"}
        </Button>
      }
      rowKey="id"
      columns={columns}
      data={items}
      empty="暂无异常预警"
    />
  );
}
