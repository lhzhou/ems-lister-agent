import { Empty, Table as AntTable, Typography } from "antd";
import type { TablePaginationConfig, TableProps } from "antd";
import { Button } from "./Button";
import { useRef, useState, type ReactNode } from "react";
import { Pagination } from "./Pagination";

export type { ColumnsType } from "antd/es/table";

export type AppTableProps<T extends object> = Omit<TableProps<T>, "locale" | "title"> & {
  data?: T[];
  error?: string;
  empty?: ReactNode;
  onRetry?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
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
  title,
  description,
  extra,
  loading = false,
  pagination = false,
  footer,
  size = "middle",
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
              <Button type="refresh" onClick={onRetry}>
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
  const total = typeof pagination === "object" ? pagination.total : undefined;
  const summary =
    description ?? (title != null && typeof total === "number" ? `共 ${total} 条` : undefined);
  const showHeader = title != null || extra != null || Boolean(onRetry);

  return (
    <section className="app-card">
      {showHeader ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {title != null || summary != null ? (
              <h3 className="flex min-w-0 items-baseline gap-2 text-base font-semibold text-on-surface">
                {title}
                {summary != null ? (
                  <span className="text-xs font-normal text-on-surface-disabled">{summary}</span>
                ) : null}
              </h3>
            ) : null}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {extra}
            {onRetry ? (
              <Button type="refresh" onClick={onRetry} disabled={busy}>
                刷新
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
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
    </section>
  );
}
