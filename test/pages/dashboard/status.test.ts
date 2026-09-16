import { describe, expect, test } from "bun:test";
import { dashboardStatusCoverage, rankedDashboardStatuses } from "@/src/pages/dashboard/model/status";

describe("rankedDashboardStatuses", () => {
  test("collapses legacy statuses into five coarse buckets", () => {
    const rows = rankedDashboardStatuses([
      { current_status: "cancelled", total: 19 },
      { current_status: "in_transit", total: 6269 },
      { current_status: "arrived_destination", total: 2465 },
      { current_status: "returned", total: 3 },
      { current_status: "rejected", total: 4 },
    ]);
    expect(rows.map((row) => row.status)).toEqual(["in_transit", "returned", "cancelled"]);
    expect(rows.find((row) => row.status === "in_transit")?.total).toBe(8734);
    expect(rows.find((row) => row.status === "returned")?.total).toBe(7);
  });
});

describe("dashboardStatusCoverage", () => {
  test("matches total new orders", () => {
    const rows = rankedDashboardStatuses([
      { current_status: "in_transit", total: 6269 },
      { current_status: "arrived_destination", total: 2465 },
      { current_status: "delivered", total: 38 },
      { current_status: "picked_up", total: 28 },
      { current_status: "cancelled", total: 19 },
      { current_status: "rejected", total: 4 },
      { current_status: "returned", total: 3 },
      { current_status: "out_for_delivery", total: 1 },
    ]);
    expect(dashboardStatusCoverage(rows, 8827)).toEqual({ covered: 8827, rate: "100.0%" });
  });
});
