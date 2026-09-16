import { describe, expect, test } from "bun:test";
import { assembleJpegPagesPdf } from "@/src/lib/waybill-timeline-pdf";
import {
  buildWaybillTimelineNodes,
  buildWaybillTimelineView,
  formatNodeDuration,
  waybillHeaderMeta,
  waybillStatusLabel,
  type WaybillTimelineSource,
} from "@/src/lib/waybill-timeline";

const sample: WaybillTimelineSource = {
  waybill: {
    waybill_no: "9823189069696",
    current_status: "in_transit",
    customer_name: "虞城电商",
    first_received_at: "2026-09-14T14:32:27+08:00",
  },
  events: [
    {
      id: 1,
      op_time: "2026-09-14T14:32:27+08:00",
      op_code: "203",
      op_name: "收寄计费信息",
      op_desc: "中国邮政已收取快件",
      op_org_name: "虞城县电商客户揽收部",
    },
  ],
};

describe("waybillStatusLabel", () => {
  test("maps in_transit to Chinese", () => {
    expect(waybillStatusLabel("in_transit")).toBe("运输中");
  });
});

describe("buildWaybillTimelineView", () => {
  test("includes customer and send date in header", () => {
    const view = buildWaybillTimelineView(sample);
    expect(view.customerName).toBe("虞城电商");
    expect(view.sentAt).toContain("2026");
    expect(view.statusLabel).toBe("收寄计费信息");
    expect(waybillHeaderMeta(view)).toContain("客户：虞城电商");
    expect(waybillHeaderMeta(view)).toContain("发件日期：");
    expect(waybillHeaderMeta(view)).toContain("当前状态：收寄计费信息");
  });

  test("uses latest event op_name instead of mapped current_status", () => {
    const view = buildWaybillTimelineView({
      waybill: { ...sample.waybill, current_status: "arrived_destination" },
      events: [
        sample.events[0],
        {
          id: 6,
          op_time: "2026-09-16T22:21:55+08:00",
          op_code: "954",
          op_name: "邮件到达处理中心",
          op_desc: "快件到达【郑州港区包件车间】",
          op_org_name: "郑州港区包件车间",
        },
      ],
    });
    expect(view.statusLabel).toBe("邮件到达处理中心");
  });
});

describe("formatNodeDuration", () => {
  test("matches mixed hour and chinese minute formats", () => {
    expect(formatNodeDuration(1_000)).toBe("1秒");
    expect(formatNodeDuration(36_000)).toBe("36秒");
    expect(formatNodeDuration(18 * 60_000 + 42_000)).toBe("18分42秒");
    expect(formatNodeDuration(3 * 3_600_000 + 17 * 60_000 + 55_000)).toBe("3h 17m 55s");
  });
});

describe("buildWaybillTimelineNodes", () => {
  test("orders newest first and marks origin and durations", () => {
    const nodes = buildWaybillTimelineNodes(
      {
        waybill: sample.waybill,
        events: [
          {
            id: 1,
            op_time: "2026-09-14T14:46:17+08:00",
            op_code: "203",
            op_name: "收寄计费信息",
            op_desc: "中国邮政已收取快件",
            op_org_name: "虞城县电商客户揽收部",
          },
          {
            id: 2,
            op_time: "2026-09-14T15:04:59+08:00",
            op_code: "205",
            op_name: "揽收扫描配发",
            op_desc: "完成分拣",
            op_org_name: "虞城县电商客户揽收部",
          },
          {
            id: 3,
            op_time: "2026-09-14T15:05:35+08:00",
            op_code: "211",
            op_name: "揽投发运/封车",
            op_desc: "正在发往下一站",
            op_org_name: "虞城县电商客户揽收部",
          },
        ],
      },
      new Date("2026-09-14T15:20:00+08:00").getTime(),
    );
    expect(nodes.map((node) => node.title)).toEqual([
      "揽投发运/封车",
      "揽收扫描配发",
      "收寄计费信息",
    ]);
    expect(nodes[0]?.isLatest).toBe(true);
    expect(nodes[2]?.isOrigin).toBe(true);
    expect(nodes[0]?.durationLabel).toBe("已经停留 0小时");
    expect(nodes[1]?.durationLabel).toBe("耗时 18分42秒");
    expect(nodes[2]?.durationLabel).toBeUndefined();
  });

  test("keeps hop duration on delivered latest node", () => {
    const nodes = buildWaybillTimelineNodes(
      {
        waybill: { ...sample.waybill, current_status: "delivered" },
        events: [
          {
            id: 1,
            op_time: "2026-09-14T14:46:17+08:00",
            op_code: "203",
            op_name: "收寄计费信息",
            op_desc: "中国邮政已收取快件",
            op_org_name: "虞城县电商客户揽收部",
          },
          {
            id: 2,
            op_time: "2026-09-14T15:05:35+08:00",
            op_code: "704",
            op_name: "已签收",
            op_desc: "妥投",
            op_org_name: "投递部",
          },
        ],
      },
      new Date("2026-09-16T18:00:00+08:00").getTime(),
    );
    expect(nodes[0]?.durationLabel).toBe("耗时 19分18秒");
  });

  test("shows stay duration for undelivered latest node", () => {
    const nodes = buildWaybillTimelineNodes(
      {
        waybill: sample.waybill,
        events: [
          {
            id: 1,
            op_time: "2026-09-14T14:46:17+08:00",
            op_code: "203",
            op_name: "收寄计费信息",
            op_desc: "中国邮政已收取快件",
            op_org_name: "虞城县电商客户揽收部",
          },
          {
            id: 2,
            op_time: "2026-09-15T18:59:42+08:00",
            op_code: "305",
            op_name: "途经城市",
            op_desc: "您的快件正途经【唐山市】",
            op_org_name: "",
          },
        ],
      },
      new Date("2026-09-16T06:59:42+08:00").getTime(),
    );
    expect(nodes[0]?.durationLabel).toBe("已经停留 12小时");
  });
});

describe("assembleJpegPagesPdf", () => {
  test("embeds jpeg pages", () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const pdf = assembleJpegPagesPdf([{ width: 595.28, height: 841.89, content: jpeg }]);
    const text = new TextDecoder().decode(pdf);
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("/Subtype /Image");
    expect(text).toContain("%%EOF");
  });
});
