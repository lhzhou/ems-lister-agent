import type { ReactNode } from "react";
import { Status, type AppStatusTone } from "./Status";

export type ViewField = {
  label: string;
  value?: ReactNode;
  extra?: ReactNode;
};

export function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    " ",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

export function formatRelativeTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return Math.floor(diff / 60_000) + "分钟前";
  if (diff < 86_400_000) return Math.floor(diff / 3_600_000) + "小时前";
  return formatDateTime(value);
}

export function statusDot(label: string, tone: AppStatusTone = "success") {
  return <Status tone={tone}>{label}</Status>;
}

export function ViewFields({ items, footer }: { items: ViewField[]; footer?: ReactNode }) {
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-outline bg-surface-container">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={
              "grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4 px-5 py-3.5" +
              (index === items.length - 1 ? "" : " border-b border-dashed border-outline")
            }
          >
            <div className="text-sm text-on-surface-disabled">{item.label}</div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-on-surface">
              <span className="min-w-0 break-all">{item.value ?? "—"}</span>
              {item.extra}
            </div>
          </div>
        ))}
      </div>
      {footer ? (
        <div className="mt-4 flex items-center justify-between text-xs text-on-surface-disabled">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
