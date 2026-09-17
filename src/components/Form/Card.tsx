import type { ReactNode } from "react";

export function Card({
  children,
  className,
  padding = "lg",
}: {
  children: ReactNode;
  className?: string;
  padding?: "md" | "lg";
}) {
  return (
    <section
      className={["app-card", padding === "md" ? "app-card--kpi" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
