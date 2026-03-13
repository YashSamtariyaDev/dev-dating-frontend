'use client';

import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

type MobileShellProps = {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
};

export function MobileShell({ title, subtitle, rightSlot, children }: MobileShellProps) {
  const showHeader = Boolean(title || subtitle || rightSlot);

  return (
    <div className="dd-app-surface min-h-screen">
      <div className="mx-auto w-full max-w-md px-4 pb-24 pt-6">
        {showHeader ? (
          <div className="mb-6 flex items-start justify-between">
            <div>
              {title ? (
                <div className="text-xl font-semibold tracking-tight text-foreground">{title}</div>
              ) : null}
              {subtitle ? (
                <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
              ) : null}
            </div>
            {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
