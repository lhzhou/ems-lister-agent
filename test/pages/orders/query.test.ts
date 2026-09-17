import { describe, expect, test } from "bun:test";
import {
  DEFAULT_ORDERS_QUERY,
  ordersHref,
  parseOrdersQuery,
  serializeOrdersQuery,
} from "@/src/pages/orders/model/query";

describe("orders query", () => {
  test("omits default page and size from the address", () => {
    expect(serializeOrdersQuery(DEFAULT_ORDERS_QUERY)).toBe("");
    expect(ordersHref(DEFAULT_ORDERS_QUERY)).toBe("/orders");
  });

  test("round-trips filters and pagination", () => {
    const query = {
      page: 3,
      size: 50,
      waybillNo: "9819327665042",
      status: "in_transit",
      severity: "P1",
    };
    expect(ordersHref(query)).toBe(
      "/orders?waybill_no=9819327665042&status=in_transit&severity=P1&page=3&size=50",
    );
    expect(
      parseOrdersQuery("?waybill_no=9819327665042&status=in_transit&severity=P1&page=3&size=50"),
    ).toEqual(query);
  });

  test("drops unknown status and invalid size", () => {
    expect(parseOrdersQuery("status=lost&size=15&page=0")).toEqual({
      ...DEFAULT_ORDERS_QUERY,
      page: 1,
    });
  });
});
