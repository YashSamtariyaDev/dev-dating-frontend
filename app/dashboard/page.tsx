import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { MobileShell } from '@/components/layout/MobileShell';

import { authOptions } from '@/config/auth';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MobileShell
      title={`Welcome back, ${session.user?.name || 'Developer'}!`}
      subtitle="Here’s what’s happening with your developer connections today."
    >
      <DashboardPage />
    </MobileShell>
  );
}
