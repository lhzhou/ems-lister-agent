export type TrendPoint = {
  time: string;
  orderCount: number;
  exceptionCount: number;
  subscribeCount: number;
  stagnantCount: number;
};

export const TREND_DATA: TrendPoint[] = [
  { time: "00:00", orderCount: 20, exceptionCount: 1, subscribeCount: 95, stagnantCount: 12 },
  { time: "03:00", orderCount: 12, exceptionCount: 1, subscribeCount: 190, stagnantCount: 16 },
  { time: "06:00", orderCount: 45, exceptionCount: 1, subscribeCount: 90, stagnantCount: 24 },
  { time: "09:00", orderCount: 140, exceptionCount: 2, subscribeCount: 310, stagnantCount: 30 },
  { time: "12:00", orderCount: 60, exceptionCount: 1, subscribeCount: 810, stagnantCount: 32 },
  { time: "15:00", orderCount: 40, exceptionCount: 0, subscribeCount: 60, stagnantCount: 25 },
  { time: "18:00", orderCount: 35, exceptionCount: 0, subscribeCount: 45, stagnantCount: 22 },
  { time: "21:00", orderCount: 20, exceptionCount: 0, subscribeCount: 30, stagnantCount: 20 },
];

export const TREND_SERIES = [
  { key: "orderCount", name: "今日新增订单", color: "#00703C", dashed: false },
  { key: "exceptionCount", name: "今日活动异常", color: "#0284c7", dashed: false },
  { key: "subscribeCount", name: "今日订阅次数", color: "#d97706", dashed: true },
  { key: "stagnantCount", name: "当前滞留", color: "#dc2626", dashed: false },
] as const;

export type TrendSeriesRow = {
  time: Date;
  timeLabel: string;
  series: string;
  value: number;
  dashed: boolean;
};

function shanghaiDate(statDate?: string) {
  return (
    statDate?.slice(0, 10) || new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" })
  );
}

export function parseTrendTime(time: string, statDate?: string): Date {
  const day = shanghaiDate(statDate);
  const raw = time.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
    const date = new Date(normalized.includes("+") ? normalized : `${normalized}+08:00`);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const hhmm = raw === "24:00" ? "23:59" : raw.length === 5 ? raw : raw.slice(0, 5);
  return new Date(`${day}T${hhmm}:00+08:00`);
}

export function trendDayBounds(statDate?: string) {
  const day = shanghaiDate(statDate);
  return {
    start: new Date(`${day}T00:00:00+08:00`),
    end: new Date(`${day}T23:59:59+08:00`),
  };
}

export function shanghaiHour(value: Date | number | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return NaN;
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(date),
  );
}

export function formatTrendTick(value: Date | number | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export function formatHourTick(value: Date | number | string) {
  const hour = shanghaiHour(value);
  if (Number.isNaN(hour)) return String(value);
  return hour === 0 ? "00:00" : `${hour}:00`;
}

export function hourlyTicks(start: Date, count = 24) {
  return Array.from(
    { length: count },
    (_, hour) => new Date(start.getTime() + hour * 60 * 60 * 1000),
  );
}

export function toTrendSeriesRows(points: TrendPoint[], statDate?: string): TrendSeriesRow[] {
  return points.flatMap((point) => {
    const time = parseTrendTime(point.time, statDate);
    const timeLabel = formatTrendTick(time);
    return TREND_SERIES.map((series) => ({
      time,
      timeLabel,
      series: series.name,
      value: Number(point[series.key] ?? 0),
      dashed: series.dashed,
    }));
  });
}
