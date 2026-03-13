import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { MobileShell } from '@/components/layout/MobileShell';
import { ExplorePage } from '@/features/explore/explore-page';
import { authOptions } from '@/config/auth';

export default async function Explore() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MobileShell title="" subtitle={undefined}>
      <ExplorePage />
    </MobileShell>
  );
}
