const HOURS_PER_DAY = 24;
const DAYS_PER_YEAR = 365;

/** 时长显示样式：hours=始终 x小时，auto=按 24 小时 / 365 天进位 */
export type DurationStyle = "hours" | "auto";

function hoursLabel(total: number) {
  return `${total}小时`;
}

function joinParts(parts: string[]) {
  return parts.join("") || hoursLabel(0);
}

function autoLabel(total: number) {
  if (total < HOURS_PER_DAY) return hoursLabel(total);

  const days = Math.floor(total / HOURS_PER_DAY);
  const restHours = total % HOURS_PER_DAY;
  if (days < DAYS_PER_YEAR) {
    return joinParts([days > 0 ? `${days}天` : "", restHours > 0 ? `${restHours}小时` : ""]);
  }

  const years = Math.floor(days / DAYS_PER_YEAR);
  const restDays = days % DAYS_PER_YEAR;
  return joinParts([
    years > 0 ? `${years}年` : "",
    restDays > 0 ? `${restDays}天` : "",
    restHours > 0 ? `${restHours}小时` : "",
  ]);
}

/**
 * 把小时数格式化成中文时长。
 * @param hours 总小时数
 * @param style 显示样式
 * - `"hours"` → `52小时`
 * - `"auto"`（默认）
 *   - `< 24小时` → `5小时`
 *   - `≥ 24小时` → `2天4小时`
 *   - `≥ 365天` → `1年3天8小时`
 */
export function formatDuration(
  hours: number | null | undefined,
  style: DurationStyle = "auto",
): string {
  if (hours == null || !Number.isFinite(hours) || hours < 0) {
    return "-";
  }
  const total = Math.floor(hours);
  if (style === "hours") return hoursLabel(total);
  return autoLabel(total);
}
