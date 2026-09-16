import { PAGE_SIZES, SEVERITY_OPTIONS, STATUS_OPTIONS } from "./types";

export type OrdersQuery = {
  page: number;
  size: number;
  waybillNo: string;
  status: string;
  severity: string;
};

export const DEFAULT_ORDERS_QUERY: OrdersQuery = {
  page: 1,
  size: 20,
  waybillNo: "",
  status: "",
  severity: "",
};

function allowed(options: { value: string }[], value: string | null) {
  if (!value) return "";
  return options.some((option) => option.value === value) ? value : "";
}

export function parseOrdersQuery(search: string): OrdersQuery {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
  const rawSize = Number.parseInt(params.get("size") || String(DEFAULT_ORDERS_QUERY.size), 10);
  return {
    page,
    size: PAGE_SIZES.includes(rawSize) ? rawSize : DEFAULT_ORDERS_QUERY.size,
    waybillNo: params.get("waybill_no")?.trim() ?? "",
    status: allowed(STATUS_OPTIONS, params.get("status")),
    severity: allowed(SEVERITY_OPTIONS, params.get("severity")),
  };
}

export function serializeOrdersQuery(query: OrdersQuery): string {
  const params = new URLSearchParams();
  if (query.waybillNo.trim()) params.set("waybill_no", query.waybillNo.trim());
  if (query.status) params.set("status", query.status);
  if (query.severity) params.set("severity", query.severity);
  if (query.page > 1) params.set("page", String(query.page));
  if (query.size !== DEFAULT_ORDERS_QUERY.size) params.set("size", String(query.size));
  return params.toString();
}

export function ordersHref(query: OrdersQuery): string {
  const search = serializeOrdersQuery(query);
  return search ? `/orders?${search}` : "/orders";
}
