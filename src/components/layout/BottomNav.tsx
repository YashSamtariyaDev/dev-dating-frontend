'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Flame, LayoutGrid, MessageCircle, User } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Home', Icon: Flame },
  { href: '/explore', label: 'Explore', Icon: LayoutGrid },
  { href: '/messages', label: 'Messages', Icon: MessageCircle },
  { href: '/profile', label: 'Profile', Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto w-full max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="rounded-3xl bg-card/85 backdrop-blur-xl shadow-[0_20px_60px_rgba(1,48,63,0.18)] ring-1 ring-foreground/10">
          <div className="grid grid-cols-4 px-3 py-2">
            {items.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-2xl transition-all',
                      active
                        ? 'bg-[linear-gradient(90deg,var(--cta-gradient-from),var(--cta-gradient-to))] text-white shadow-[0_10px_25px_var(--cta-glow)]'
                        : 'bg-transparent'
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="leading-none">{label}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
