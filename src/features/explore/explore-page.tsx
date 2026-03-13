'use client';

import { useMemo, useState } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useExploreFeed, useSwipe, FeedUser } from '@/hooks/use-api';
import { Bell, Settings, X, Heart, Star, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProfileCompletionScreen } from '../profile/profile-completion-screen';

export function ExplorePage() {
  const { data: feed, isLoading, isError, error, refetch: refetchFeed } = useExploreFeed();
  const swipe = useSwipe();
  const router = useRouter();

  // Check if profile is incomplete
  if (isError && error?.message?.includes('complete your profile')) {
    return <ProfileCompletionScreen />;
  }

  const cards = useMemo<FeedUser[]>(() => {
    if (!feed) return [];
    return Array.isArray(feed) ? feed : [];
  }, [feed]);

  const [index, setIndex] = useState(0);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedUser, setMatchedUser] = useState<FeedUser | null>(null);
  const current = cards[index];

  const totalDots = Math.min(cards.length || 0, 5);
  const activeDot = totalDots === 0 ? 0 : index % totalDots;

  const decide = async (dir: 'left' | 'right' | 'super') => {
    if (!current) return;

    const type = dir === 'right' ? 'LIKE' : dir === 'super' ? 'SUPER_LIKE' : 'PASS';

    try {
      const result = await swipe.mutateAsync({ targetId: current.id, type });
      
      // Handle match
      if (result?.match) {
        setMatchedUser(current);
        setShowMatchAnimation(true);
        
        // Auto-navigate to chat after animation
        setTimeout(() => {
          setShowMatchAnimation(false);
          router.push(`/messages`);
        }, 3000);
      }
    } catch {
      // ignore for now; UI should still proceed
    }

    // Move to next card
    setIndex((i) => Math.min(i + 1, cards.length));
    
    // Refresh feed to get fresh data and exclude swiped users
    setTimeout(() => {
      refetchFeed();
    }, 100);
  };

  const onDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 110) void decide('right');
    if (info.offset.x < -110) void decide('left');
  };

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl">
        <CardContent className="py-10 text-center">
          <div className="text-base font-medium">Loading feed…</div>
          <div className="mt-1 text-sm text-muted-foreground">Finding developers for you.</div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl">
        <CardContent className="py-10 text-center">
          <div className="text-base font-medium">Couldn’t load feed</div>
          <div className="mt-1 text-sm text-muted-foreground">Try again in a moment.</div>
          <div className="mt-6">
            <Button variant="outline" onClick={() => refetchFeed()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl">
        <CardContent className="py-10 text-center">
          <div className="text-base font-medium">You’re all caught up</div>
          <div className="mt-1 text-sm text-muted-foreground">Check back later for more developers.</div>
          <div className="mt-6">
            <Button variant="brand" size="lg" className="h-11 px-8" onClick={() => refetchFeed()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight text-foreground">DevDating</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="size-5" />
            </Button>
          </div>
        </div>

      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: Math.max(totalDots, 1) }).map((_, i) => (
          <div
            key={i}
            className={
              i === activeDot
                ? 'h-1.5 w-6 rounded-full bg-[linear-gradient(90deg,var(--cta-gradient-from),var(--cta-gradient-to))]'
                : 'h-1.5 w-3 rounded-full bg-border'
            }
          />
        ))}
      </div>

      <div className="relative h-[540px]">
        <motion.div
          key={String(current.id)}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={onDragEnd}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          className="absolute inset-0"
        >
          <div className="relative h-full overflow-hidden rounded-[28px] bg-card/70 backdrop-blur-xl ring-1 ring-foreground/10 shadow-[0_18px_70px_rgba(1,48,63,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_30%_10%,color-mix(in_srgb,var(--brand-200)_52%,transparent_48%)_0%,transparent_62%),radial-gradient(800px_circle_at_85%_0%,color-mix(in_srgb,var(--brand-500)_38%,transparent_62%)_0%,transparent_62%),linear-gradient(180deg,color-mix(in_srgb,var(--brand-50)_78%,#ffffff_22%)_0%,var(--background)_72%)]" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgba(1,48,63,0.35)] to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="rounded-3xl bg-card/85 backdrop-blur-xl ring-1 ring-foreground/10 shadow-[0_18px_60px_rgba(1,48,63,0.18)] p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xl font-semibold tracking-tight">
                      {current.name}
                      {current.age ? <span className="ml-2 font-medium text-foreground/80">{current.age}</span> : null}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {current.experienceLevel || 'Developer'}
                      {current.location ? <span className="mx-1">•</span> : null}
                      {current.location || ''}
                      {typeof current.distance === 'number' ? (
                        <>
                          <span className="mx-1">•</span>
                          {Math.round(current.distance)} km
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-full bg-card/70 px-3 py-1 text-xs text-muted-foreground ring-1 ring-foreground/10">
                    {Math.round(current.matchScore)}% match
                  </div>
                </div>

                {current.bio ? (
                  <div className="mt-3 text-sm text-foreground/90">{current.bio}</div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {(current.techStack || []).slice(0, 6).map((t) => (
                    <div key={t} className="rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-5 pt-1">
        <Button
          variant="outline"
          size="icon"
          className="size-14 rounded-full shadow-sm"
          onClick={() => void decide('left')}
        >
          <X className="size-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="size-14 rounded-full shadow-sm"
          onClick={() => void decide('super')}
        >
          <Star className="size-6" />
        </Button>

        <Button
          variant="brand"
          size="icon"
          className="size-16 rounded-full"
          onClick={() => void decide('right')}
          disabled={swipe.isPending}
        >
          <Heart className="size-6" />
        </Button>
      </div>
    </div>

    {/* Match Animation Overlay */}
    <AnimatePresence>
      {showMatchAnimation && matchedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-8 text-center text-white max-w-sm mx-4 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <Sparkles className="w-16 h-16 mx-auto" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">It's a Match!</h2>
            <p className="text-lg mb-4 opacity-90">You and {matchedUser.name} liked each other</p>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <Heart className="w-8 h-8 text-white animate-pulse" />
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
            </div>
            <p className="text-sm opacity-75">Starting chat...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
