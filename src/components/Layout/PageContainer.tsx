import type { ReactNode } from "react";

export function PageContainer({
  title,
  description,
  actions,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="w-full flex-1 space-y-4 px-4 py-6 sm:px-6">
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h1 className="text-lg font-semibold text-on-surface">{title}</h1> : null}
            {description ? (
              <p className="mt-0.5 text-xs text-on-surface-variant">{description}</p>
            ) : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </main>
  );
}
