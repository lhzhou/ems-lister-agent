import { Button, Empty, Table as AntTable, Typography } from "antd";
import type { TablePaginationConfig, TableProps } from "antd";
import { useRef, useState, type ReactNode } from "react";
import { Pagination } from "./Pagination";

export type { ColumnsType } from "antd/es/table";

export type AppTableProps<T extends object> = Omit<TableProps<T>, "locale"> & {
  data?: T[];
  error?: string;
  empty?: ReactNode;
  onRetry?: () => void;
};

function tablePagination(
  pagination: TableProps["pagination"],
  disabled: boolean,
  onLock: () => void,
) {
  if (!pagination) return null;
  const config = pagination;
  const handleChange: TablePaginationConfig["onChange"] = (page, pageSize) => {
    onLock();
    config.onChange?.(page, pageSize);
  };
  return (
    <div className="flex justify-end">
      <Pagination
        current={config.current}
        pageSize={config.pageSize}
        total={config.total}
        showSizeChanger={config.showSizeChanger}
        pageSizeOptions={config.pageSizeOptions}
        showTotal={config.showTotal}
        disabled={disabled || config.disabled}
        onChange={handleChange}
      />
    </div>
  );
}

export function Table<T extends object>({
  data,
  dataSource,
  error = "",
  empty = "暂无数据",
  onRetry,
  loading = false,
  pagination = false,
  footer,
  size = "small",
  ...rest
}: AppTableProps<T>) {
  const rows = data ?? dataSource;
  const lockRef = useRef(false);
  const rowsRef = useRef(rows);
  const [, bump] = useState(0);

  if (lockRef.current && rows !== rowsRef.current) {
    lockRef.current = false;
  }
  rowsRef.current = rows;

  const busy = Boolean(loading) || lockRef.current;
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

  const paginationNode = tablePagination(pagination, busy, () => {
    if (lockRef.current) return;
    lockRef.current = true;
    bump((value) => value + 1);
  });

  return (
    <AntTable<T>
      {...rest}
      dataSource={rows}
      loading={busy}
      pagination={false}
      size={size}
      locale={{ emptyText }}
      footer={
        paginationNode
          ? (currentPageData) => (
              <>
                {typeof footer === "function" ? footer(currentPageData) : footer}
                {paginationNode}
              </>
            )
          : footer
      }
    />
  );
}
