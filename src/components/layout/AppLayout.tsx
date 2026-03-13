'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { store } from '@/store';
import { queryClient } from '@/config/query-client';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ApiClientProvider } from '@/lib/api-client';

interface AppLayoutProps {
  children: ReactNode;
  session?: any;
}

export function AppLayout({ children, session }: AppLayoutProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <ApiClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </ApiClientProvider>
        </SessionProvider>
      </QueryClientProvider>
    </Provider>
  );
}
