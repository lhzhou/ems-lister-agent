import type { ReactNode } from "react";

export function DashboardShell({
  header,
  sidebar,
  tabs,
  children,
}: {
  header: ReactNode;
  sidebar: ReactNode;
  tabs: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-layout font-sans text-on-surface">
      {header}
      <div className="relative flex w-full flex-1">
        {sidebar}
        <div className="flex min-w-0 w-full flex-1 flex-col">
          {tabs}
          {children}
        </div>
      </div>
    </div>
  );
}
