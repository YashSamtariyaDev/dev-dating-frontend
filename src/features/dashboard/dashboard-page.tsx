'use client';

import { useSession } from 'next-auth/react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedDiv } from '@/components/ui/motion-wrapper';
import { Users, MessageCircle, Heart, TrendingUp } from 'lucide-react';
import { useMatches, useChats } from '@/hooks/use-api';
import { Match } from '@/types';

export function DashboardPage() {
  const { data: session } = useSession();
  const { user } = useAppSelector((state) => state.auth);
  const { data: matches, isLoading: matchesLoading } = useMatches();
  const { data: chats, isLoading: chatsLoading } = useChats();

  const stats = [
    {
      title: 'Total Matches',
      value: matches?.length || 0,
      icon: Heart,
      description: 'People you\'ve connected with',
      color: 'text-red-600',
    },
    {
      title: 'Active Chats',
      value: chats?.length || 0,
      icon: MessageCircle,
      description: 'Ongoing conversations',
      color: 'text-blue-600',
    },
    {
      title: 'Profile Views',
      value: '42',
      icon: Users,
      description: 'People viewed your profile',
      color: 'text-green-600',
    },
    {
      title: 'Compatibility Score',
      value: '89%',
      icon: TrendingUp,
      description: 'Average match compatibility',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <AnimatedDiv
              key={stat.title}
              variant="slideUp"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </AnimatedDiv>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Recent Matches */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>
                Your latest developer connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matchesLoading ? (
                <div className="text-center py-8">Loading matches...</div>
              ) : matches && matches.length > 0 ? (
                <div className="space-y-4">
                  {matches?.slice(0, 3)?.map((match: Match, index: number) => (
                    <div
                      key={match.id || index}
                      className="flex items-center justify-between rounded-2xl border bg-card/50 p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div>
                          <p className="font-medium">Developer {match?.id?.slice(-4)}</p>
                          <p className="text-sm text-muted-foreground">
                            {match.compatibilityScore}% compatible
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No matches yet. Start exploring to find your perfect developer match!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {/* <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with these common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full h-11 text-base" variant="brand" size="lg">
                Find New Matches
              </Button>
              <Button className="w-full" variant="outline">
                Update Profile
              </Button>
              <Button className="w-full" variant="outline">
                Browse Developers
              </Button>
              <Button className="w-full" variant="outline">
                View Messages
              </Button>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}
