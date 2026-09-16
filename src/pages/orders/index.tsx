/** @route
meta:
  layout: default
  title: 订单管理
*/

import { WaybillDetailModal } from "@/src/components/Waybill/DetailModal";
import { OrdersSearch } from "./components/orders-search";
import { OrdersTable } from "./components/orders-table";
import { useOrders } from "./hooks/use-orders";

export default function OrdersPage() {
  const orders = useOrders();

  return (
    <div className="space-y-4">
      <OrdersSearch
        waybillNo={orders.waybillNo}
        status={orders.status}
        severity={orders.severity}
        onWaybillNoChange={(value) => {
          orders.setWaybillNo(value);
          orders.setPage(1);
        }}
        onStatusChange={(value) => {
          orders.setStatus(value);
          orders.setPage(1);
        }}
        onSeverityChange={(value) => {
          orders.setSeverity(value);
          orders.setPage(1);
        }}
        onReset={orders.resetFilters}
      />
      <OrdersTable
        items={orders.items}
        total={orders.total}
        page={orders.page}
        size={orders.size}
        loading={orders.loading}
        error={orders.error}
        onReload={orders.reload}
        onPageChange={orders.setPage}
        onSizeChange={(size) => {
          orders.setSize(size);
          orders.setPage(1);
        }}
        onOpenDetail={orders.setDetailId}
      />
      <WaybillDetailModal
        id={orders.detailId}
        open={orders.detailId !== null}
        onClose={() => orders.setDetailId(null)}
      />
    </div>
  );
}
