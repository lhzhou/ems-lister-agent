import { Button, Empty, Table as AntTable, Typography } from "antd";
import type { TableProps } from "antd";
import type { ReactNode } from "react";

export type { ColumnsType } from "antd/es/table";

export type AppTableProps<T extends object> = Omit<TableProps<T>, "locale"> & {
  data?: T[];
  error?: string;
  empty?: ReactNode;
  onRetry?: () => void;
};

export function Table<T extends object>({
  data,
  dataSource,
  error = "",
  empty = "暂无数据",
  onRetry,
  loading = false,
  pagination = false,
  size = "small",
  ...rest
}: AppTableProps<T>) {
  const emptyText = error ? (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div className="space-y-3">
          <Typography.Text type="danger">{error}</Typography.Text>
          {onRetry ? (
            <div>
              <Button size="small" onClick={onRetry}>
                重试
              </Button>
            </div>
          ) : null}
        </div>
      }
    />
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={empty} />
  );

  return (
    <AntTable<T>
      {...rest}
      dataSource={data ?? dataSource}
      loading={loading}
      pagination={pagination}
      size={size}
      locale={{ emptyText }}
    />
  );
}
