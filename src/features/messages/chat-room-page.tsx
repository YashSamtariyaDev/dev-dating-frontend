'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChatMessages, useSendMessage } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

type ChatMessage = {
  id: number;
  senderId: number;
  content: string;
  createdAt: string;
  status?: string;
};

export function ChatRoomPage({ chatRoomId }: { chatRoomId: string }) {
  const { data, isLoading, isError } = useChatMessages(chatRoomId);
  const send = useSendMessage();

  const [text, setText] = useState('');

  const listRef = useRef<HTMLDivElement | null>(null);

  const messages = useMemo<ChatMessage[]>(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : [];
  }, [data]);

  useEffect(() => {
    // scroll to bottom when messages update
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, [messages.length]);

  const onSend = async () => {
    const content = text.trim();
    if (!content) return;

    setText('');
    try {
      await send.mutateAsync({ chatId: chatRoomId, content });
    } catch {
      // restore on failure
      setText(content);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl p-6 text-center">
        <div className="text-base font-medium">Loading chat…</div>
        <div className="mt-1 text-sm text-muted-foreground">Fetching messages.</div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl p-6 text-center">
        <div className="text-base font-medium">Couldn’t load chat</div>
        <div className="mt-1 text-sm text-muted-foreground">Try again in a moment.</div>
      </Card>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col">
      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-3xl bg-card/60 backdrop-blur-xl p-4 ring-1 ring-foreground/10 shadow-[0_12px_40px_rgba(1,48,63,0.10)]"
      >
        {messages
          .slice()
          .reverse()
          .map((m) => (
            <div key={m.id} className="flex">
              <div className="max-w-[82%] rounded-3xl border bg-card/85 px-4 py-2 text-sm shadow-sm">
                {m.content}
              </div>
            </div>
          ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="h-12"
        />
        <Button
          variant="brand"
          size="icon"
          className="size-12 rounded-full"
          onClick={onSend}
          disabled={send.isPending}
        >
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  );
}
