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
    <main className="flex-1 w-full px-3 py-4 space-y-4 sm:px-5 lg:px-6">
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h1 className="text-base font-bold text-stone-900">{title}</h1> : null}
            {description ? <p className="mt-0.5 text-xs text-stone-500">{description}</p> : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </main>
  );
}
