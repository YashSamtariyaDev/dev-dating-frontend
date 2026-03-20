'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useChatMessages, useSendMessage } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

type ChatMessage = {
  id: number;
  senderId: number;
  sender?: {
    id: number;
    name: string;
  };
  senderName?: string;
  content: string;
  createdAt: string;
  status?: string;
};

export function ChatRoomPage({ chatRoomId }: { chatRoomId: string }) {
  const { data, isLoading, isError, refetch } = useChatMessages(chatRoomId);
  const send = useSendMessage();
  const { data: session } = useSession();

  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const myUserIdRef = useRef<number | null>(null);

  const accessToken = useMemo(() => {
    // NextAuth stores backend token here (see src/config/auth.ts session callback)
    const fromSession = (session as any)?.accessToken as string | undefined;
    if (fromSession) return fromSession;

    // Fallback for any legacy flow that stores token in localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') ?? undefined;
    }

    return undefined;
  }, [session]);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = accessToken;
    if (!token || !chatRoomId) return;

    // Determine socket URL at RUNTIME (not build-time).
    // NEXT_PUBLIC_ variables are baked in at build time, which doesn't work
    // when Cloudflare Workers sets them as runtime secrets. So we use the 
    // window.location.hostname to detect production vs local.
    const getSocketUrl = () => {
      const hostname = window.location.hostname;
      // If running on Cloudflare Workers production domain, connect to Railway backend directly
      if (hostname.includes('workers.dev') || hostname.includes('cloudflare.dev')) {
        return 'https://dev-dating-backend-production-9a96.up.railway.app';
      }
      // Local / Docker / staging — connect to backend directly
      // Return the hardcoded AWS public IP instead of localhost/origin
      return 'https://devdating.bytelong.com/';
    };

    const socketUrl = getSocketUrl();
    console.log(`🔌 Connecting socket to: ${socketUrl}`);

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    let userIdFromToken: number | null = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userIdFromToken = Number(payload.sub);
      if (Number.isFinite(userIdFromToken)) {
        myUserIdRef.current = userIdFromToken;
        setCurrentUserId(userIdFromToken);
      }
    } catch (e) {
      console.error('Failed to parse token:', e);
    }

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);

      // Register user and join room
      if (userIdFromToken) {
        newSocket.emit('register', { userId: userIdFromToken });
      }
      newSocket.emit('joinRoom', { chatRoomId: Number(chatRoomId) });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    // Listen for new messages
    newSocket.on('newMessage', (data) => {
      console.log('New message received:', data);
      setMessages(prev => {
        // Avoid duplicate messages
        const exists = prev.some(m => m.id === data.id);
        if (exists) return prev;

        const newMsg: ChatMessage = {
          id: data.id,
          senderId: data.senderId,
          sender: data.senderId === myUserIdRef.current ? { id: data.senderId, name: 'You' } : { id: data.senderId, name: data.senderName || 'Unknown' },
          senderName: data.senderName,
          content: data.content,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        return [...prev, newMsg];
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      newSocket.close();
    };
  }, [accessToken, chatRoomId]);

  // Load initial messages
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setMessages(data.map((msg: any) => ({
        ...msg,
        sender: msg.sender || { id: msg.senderId, name: msg.senderName || 'Unknown' }
      })));
    }
  }, [data]);

  // Auto-scroll when messages update
  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth'
      });
    });
  }, [messages.length]);

  const onSend = useCallback(async () => {
    const content = text.trim();
    if (!content || !socket || !isConnected) return;

    setText('');

    // Send via WebSocket for real-time delivery
    socket.emit('sendMessage', {
      chatRoomId: Number(chatRoomId),
      content: content
    });

    // WebSocket handles the message saving, no need for HTTP backup
    // The message will be received back via the 'newMessage' event
  }, [text, socket, isConnected, chatRoomId]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="text-base font-medium">Couldn't load chat</div>
        <div className="mt-1 text-sm text-muted-foreground">Try again in a moment.</div>
        <Button onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col">
      {/* Connection status */}
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        <span>Room {chatRoomId}</span>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-3xl bg-card/60 backdrop-blur-xl p-4 ring-1 ring-foreground/10 shadow-[0_12px_40px_rgba(1,48,63,0.10)]"
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            const senderName = isOwn ? 'You' : (message.sender?.name || message.senderName || 'Unknown');
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[82%] rounded-3xl px-4 py-2 text-sm shadow-sm ${isOwn
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/85 border'
                  }`}>
                  {!isOwn && (
                    <div className="text-xs font-medium mb-1 opacity-70">
                      {senderName}
                    </div>
                  )}
                  <div>{message.content}</div>
                  <div className={`text-xs mt-1 opacity-70`}>
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="mt-3 flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="h-12"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={!isConnected}
        />
        <Button
          variant="brand"
          size="icon"
          className="size-12 rounded-full"
          onClick={onSend}
          disabled={send.isPending || !isConnected || !text.trim()}
        >
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  );
}
