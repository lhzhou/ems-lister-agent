import React, { useEffect, useRef } from "react";
import { Chart } from "@antv/g2";
import {
  formatHourTick,
  formatTrendTick,
  hourlyTicks,
  toTrendSeriesRows,
  trendDayBounds,
  TREND_SERIES,
  type TrendPoint,
} from "../model/trend";

export function DashboardTrendChart({
  points,
  statDate,
}: {
  points: TrendPoint[];
  statDate?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rows = toTrendSeriesRows(points, statDate);
    const bounds = trendDayBounds(statDate);
    const ticks = hourlyTicks(bounds.start);
    const chart = new Chart({
      container,
      autoFit: true,
      height: 248,
      paddingLeft: 48,
      paddingRight: 8,
      paddingBottom: 36,
      paddingTop: 12,
    });

    chart
      .line()
      .data(rows)
      .encode("x", "time")
      .encode("y", "value")
      .encode("color", "series")
      .encode("series", "series")
      .scale("x", {
        type: "time",
        domainMin: bounds.start.getTime(),
        domainMax: bounds.end.getTime(),
        utc: false,
        tickCount: 24,
        tickMethod: () => ticks,
      })
      .scale("y", { nice: true, zero: true })
      .scale("color", {
        domain: TREND_SERIES.map((item) => item.name),
        range: TREND_SERIES.map((item) => item.color),
      })
      .axis("x", {
        title: false,
        labelAutoRotate: false,
        labelAutoHide: false,
        labelAutoEllipsis: false,
        labelAutoWrap: false,
        labelFontSize: 10,
        labelFormatter: (value: Date | number | string) => formatHourTick(value),
        transform: [],
      })
      .axis("y", {
        title: false,
        grid: true,
        gridStroke: "#F0F2F5",
        gridLineWidth: 1,
      })
      .legend(false)
      .tooltip({
        title: (datum: { time?: Date; timeLabel?: string }) =>
          datum.timeLabel || formatTrendTick(datum.time ?? ""),
      })
      .style("lineWidth", (datum: { series?: string }) =>
        datum.series === "今日新增订单" ? 2.4 : 1.8,
      )
      .style("lineDash", (datum: { series?: string }) =>
        datum.series === "今日订阅次数" ? [4, 3] : [],
      );

    void chart.render();
    return () => {
      chart.destroy();
    };
  }, [points, statDate]);

  return <div ref={containerRef} className="w-full h-[248px]" />;
}
