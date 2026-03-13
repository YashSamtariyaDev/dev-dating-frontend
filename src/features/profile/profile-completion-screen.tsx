'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, User, MapPin, Briefcase, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CompletionStatus {
  isComplete: boolean;
  missing: string[];
  completionPercentage: number;
}

export function ProfileCompletionScreen() {
  const [status, setStatus] = useState<CompletionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/proxy/profile/completion-status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="text-lg font-medium">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="text-lg font-medium">Error loading profile</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status.isComplete) {
    router.push('/explore');
    return null;
  }

  const fieldInfo = {
    bio: { icon: FileText, label: 'Bio', description: 'Tell us about yourself' },
    techStack: { icon: Briefcase, label: 'Tech Stack', description: 'Your technical skills' },
    experienceLevel: { icon: Briefcase, label: 'Experience', description: 'Your experience level' },
    location: { icon: MapPin, label: 'Location', description: 'Where are you based?' },
    gender: { icon: User, label: 'Gender', description: 'What is your gender?' },
    photoUrl: { icon: User, label: 'Profile Photo', description: 'Add a photo to get matches' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Complete Your Profile
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Finish setting up your profile to start connecting with other developers
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress Section */}
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {status.completionPercentage}%
              </div>
              <Progress 
                value={status.completionPercentage} 
                className="h-2 mb-2"
              />
              <p className="text-sm text-slate-600">
                Profile completion
              </p>
            </div>

            {/* Missing Fields */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-700">What's missing:</h3>
              {status.missing.map((field) => {
                const info = fieldInfo[field as keyof typeof fieldInfo];
                if (!info) return null;
                
                return (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
                  >
                    <Circle className="w-5 h-5 text-amber-600" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{info.label}</div>
                      <div className="text-sm text-slate-600">{info.description}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Completed Fields */}
            <div className="space-y-2">
              <h3 className="font-medium text-slate-700">Completed:</h3>
              {Object.keys(fieldInfo)
                .filter(field => !status.missing.includes(field))
                .map((field) => {
                  const info = fieldInfo[field as keyof typeof fieldInfo];
                  if (!info) return null;
                  
                  return (
                    <div key={field} className="flex items-center space-x-3 p-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-slate-700">{info.label}</span>
                    </div>
                  );
                })}
            </div>

            {/* Action Button */}
            <Button 
              className="w-full h-11 text-base"
              onClick={() => router.push('/profile')}
            >
              Complete Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
