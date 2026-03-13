'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useChats } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

type ChatRoom = {
  id: number;
  createdAt: string;
};

export function MessagesListPage() {
  const { data, isLoading, isError } = useChats();

  const chats = useMemo<ChatRoom[]>(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : [];
  }, [data]);

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl">
        <CardContent className="py-10 text-center">
          <div className="text-base font-medium">Loading messages…</div>
          <div className="mt-1 text-sm text-muted-foreground">Fetching your chats.</div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl">
        <CardContent className="py-10 text-center">
          <div className="text-base font-medium">Couldn’t load messages</div>
          <div className="mt-1 text-sm text-muted-foreground">Try again in a moment.</div>
        </CardContent>
      </Card>
    );
  }

  if (!chats.length) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl">
        <CardContent className="py-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <MessageCircle className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-4 text-base font-medium">No messages yet</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Start swiping to get matches and chat.
          </div>
          <div className="mt-6">
            <Button asChild variant="brand" size="lg" className="h-11 px-8">
              <Link href="/explore">Go to Explore</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          href={`/messages/${chat.id}`}
          className="block rounded-3xl bg-card/80 backdrop-blur-xl ring-1 ring-foreground/10 shadow-[0_12px_40px_rgba(1,48,63,0.12)]"
        >
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="size-12 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--brand-200)_0%,var(--brand-500)_55%,var(--brand-800)_100%)]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="truncate text-sm font-medium">Chat #{chat.id}</div>
                <div className="text-xs text-muted-foreground">{new Date(chat.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mt-1 truncate text-sm text-muted-foreground">Tap to open conversation</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
