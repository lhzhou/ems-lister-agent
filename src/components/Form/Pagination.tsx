import { Pagination as AntPagination } from "antd";
import type { PaginationProps } from "antd";

export type AppPaginationProps = PaginationProps;

const DEFAULT_PAGE_SIZE = 20;

function defaultShowTotal(total: number) {
  return (
    <>
      共 <b>{total}</b> 条
    </>
  );
}

export function Pagination({
  total = 0,
  current = 1,
  defaultCurrent = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  showSizeChanger = false,
  showTotal = defaultShowTotal,
  disabled = false,
  ...rest
}: AppPaginationProps) {
  return (
    <AntPagination
      {...rest}
      align="end"
      total={total}
      current={current}
      defaultCurrent={defaultCurrent}
      pageSize={pageSize}
      defaultPageSize={defaultPageSize}
      showSizeChanger={showSizeChanger}
      showTotal={showTotal}
      disabled={disabled}
    />
  );
}
