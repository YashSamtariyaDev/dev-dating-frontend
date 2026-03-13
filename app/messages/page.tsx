import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { MobileShell } from '@/components/layout/MobileShell';
import { authOptions } from '@/config/auth';
import { MessagesListPage } from '@/features/messages/messages-list-page';

export default async function Messages() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MobileShell title="Messages" subtitle="Your conversations">
      <MessagesListPage />
    </MobileShell>
  );
}
