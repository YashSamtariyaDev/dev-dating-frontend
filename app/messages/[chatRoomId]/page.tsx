import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { MobileShell } from '@/components/layout/MobileShell';
import { authOptions } from '@/config/auth';
import { ChatRoomPage } from '@/features/chat/chat-room-page';

export default async function ChatRoom({
  params,
}: {
  params: Promise<{ chatRoomId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const { chatRoomId } = await params;

  return (
    <MobileShell title="Chat" subtitle={undefined}>
      <ChatRoomPage chatRoomId={chatRoomId} />
    </MobileShell>
  );
}
