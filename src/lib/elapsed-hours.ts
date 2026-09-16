const HOURS_PER_DAY = 24;
const HOURS_PER_MONTH = 24 * 30;

export function formatElapsedHours(hours: number | null | undefined): string {
  if (hours == null || !Number.isFinite(hours) || hours < 0) {
    return "-";
  }
  const total = Math.floor(hours);
  const raw = `${total}小时`;
  if (total < HOURS_PER_DAY) {
    return raw;
  }
  if (total < HOURS_PER_MONTH) {
    const days = Math.floor(total / HOURS_PER_DAY);
    const rest = total % HOURS_PER_DAY;
    return rest === 0 ? `${raw} / ${days}天` : `${raw} / ${days}天${rest}小时`;
  }
  const months = Math.floor(total / HOURS_PER_MONTH);
  const afterMonths = total % HOURS_PER_MONTH;
  const days = Math.floor(afterMonths / HOURS_PER_DAY);
  const rest = afterMonths % HOURS_PER_DAY;
  let converted = `${months}月`;
  if (days > 0) converted += `${days}天`;
  if (rest > 0) converted += `${rest}小时`;
  return `${raw} / ${converted}`;
}
