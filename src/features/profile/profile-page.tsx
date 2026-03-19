'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProfile, useCompletionStatus } from '@/hooks/use-api';
import { MobileShell } from '@/components/layout/MobileShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Pencil, LogOut, Shield, ChevronRight } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function ProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: status, isLoading: statusLoading } = useCompletionStatus();

  const completionPercent = status?.completionPercentage || 0;
  
  // Format photo URL
  const photoUrl = useMemo(() => {
    if (!profile?.photoUrl) return null;
    if (profile.photoUrl.startsWith('/uploads')) {
        const backendBase = process.env.NEXT_PUBLIC_API_URL || '';
        return `${backendBase}${profile.photoUrl}`;
    }
    return profile.photoUrl;
  }, [profile?.photoUrl]);

  if (profileLoading || statusLoading) {
    return (
      <MobileShell title="Profile">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell 
      title="" 
      rightSlot={
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-card shadow-sm border">
                <Shield className="size-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-card shadow-sm border">
                <Settings className="size-5 text-muted-foreground" />
            </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center pt-4">
        {/* Profile Avatar with Progress Ring (Tinder Style) */}
        <div className="relative group">
            <div className="relative h-40 w-40 rounded-full p-1">
                {/* Progress Ring Graphic */}
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r="76"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-muted-foreground/10"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r="76"
                        stroke="url(#cta-gradient)"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={477}
                        strokeDashoffset={477 - (477 * completionPercent) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="cta-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--cta-gradient-from)" />
                            <stop offset="100%" stopColor="var(--cta-gradient-to)" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-background bg-muted shadow-xl">
                    {photoUrl ? (
                        <Image 
                            src={photoUrl} 
                            alt={profile?.user?.name || 'Profile'} 
                            fill 
                            className="object-cover"
                            unoptimized // Since it's from local backend
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <span className="text-4xl">👤</span>
                        </div>
                    )}
                    
                    <button 
                        onClick={() => router.push('/profile/edit')}
                        className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-110 active:scale-95"
                    >
                        <Pencil className="size-5" />
                    </button>
                </div>
            </div>
            
            {/* Completion Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <div className="rounded-full bg-[linear-gradient(90deg,var(--cta-gradient-from),var(--cta-gradient-to))] px-4 py-1 text-[10px] font-bold tracking-wider text-white shadow-md">
                   {completionPercent === 100 ? '100% COMPLETE' : `${completionPercent}% COMPLETE`}
                </div>
            </div>
        </div>

        <div className="mt-10 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
                {profile?.user?.name || 'Developer'}
                {profile?.age ? <span className="ml-2 font-medium text-muted-foreground">{profile.age}</span> : null}
                <span className="ml-2 text-blue-500">✅</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
                {profile?.experienceLevel?.toUpperCase() || 'DEVELOPER'}
                {profile?.location ? ` • ${profile.location}` : ''}
            </p>
        </div>

        {/* Dashboard Items */}
        <div className="mt-8 grid w-full grid-cols-3 gap-4">
            <Card className="flex flex-col items-center justify-center border-none bg-card/50 py-4 shadow-sm hover:bg-card transition-colors cursor-pointer">
                <div className="mb-1 text-yellow-500 text-lg">⭐</div>
                <div className="text-[10px] font-semibold text-center leading-tight">0 Super Likes</div>
                <div className="text-[10px] text-blue-500 font-bold uppercase mt-1">Get More</div>
            </Card>
            <Card className="flex flex-col items-center justify-center border-none bg-card/50 py-4 shadow-sm hover:bg-card transition-colors cursor-pointer">
                <div className="mb-1 text-purple-500 text-lg">⚡</div>
                <div className="text-[10px] font-semibold text-center leading-tight">My Boosts</div>
                <div className="text-[10px] text-blue-500 font-bold uppercase mt-1">Get More</div>
            </Card>
            <Card className="flex flex-col items-center justify-center border-none bg-card/50 py-4 shadow-sm hover:bg-card transition-colors cursor-pointer">
                <div className="mb-1 text-rose-500 text-lg">🔥</div>
                <div className="text-[10px] font-semibold text-center leading-tight">Subscriptions</div>
            </Card>
        </div>

        {/* Promo Banner */}
        <Card className="mt-6 w-full overflow-hidden border-none bg-brand-50/50 dark:bg-brand-900/10">
            <CardContent className="p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(90deg,var(--cta-gradient-from),var(--cta-gradient-to))] shadow-sm">
                        <span className="text-xl">🔥</span>
                    </div>
                    <div>
                        <div className="text-sm font-bold">50% OFF FIRST 1 MONTH!</div>
                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Offer ends in 00:28:23</div>
                    </div>
                </div>
                <div className="mt-4 flex gap-3">
                    <Button variant="brand" className="h-9 flex-1 rounded-xl text-xs font-bold shadow-md">
                        Upgrade
                    </Button>
                    <Button variant="outline" className="h-9 flex-1 rounded-xl text-xs font-bold border-none shadow-sm bg-background">
                        See All Features
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* Settings List */}
        <div className="mt-6 w-full space-y-2 pb-10">
            <div 
                className="flex items-center justify-between rounded-2xl bg-card/50 p-4 shadow-sm hover:bg-card transition-colors cursor-pointer group"
                onClick={() => router.push('/profile/edit')}
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                        <Pencil className="size-5" />
                    </div>
                    <span className="font-semibold text-sm">Edit Profile</span>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>

            <div 
                className="flex items-center justify-between rounded-2xl bg-card/50 p-4 shadow-sm hover:bg-card transition-colors cursor-pointer group text-rose-500"
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                        <LogOut className="size-5" />
                    </div>
                    <span className="font-semibold text-sm">Logout</span>
                </div>
            </div>
        </div>
      </div>
    </MobileShell>
  );
}
