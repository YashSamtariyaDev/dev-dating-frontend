'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success message from URL params
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    console.log('🔐 Login form submitted:', data);
    
    try {
      console.log('📤 Calling NextAuth signIn with:', {
        email: data.email,
        redirect: false
      });
      
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      console.log('📥 NextAuth result:', result);

      if (result?.error) {
        console.error('❌ NextAuth error:', result.error);
        setError('Invalid email or password');
        return;
      }

      console.log('✅ Login successful, redirecting to dashboard...');
      router.replace('/dashboard');
    } catch (error) {
      console.error('💥 Login form error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              ✅ {successMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="brand"
            size="lg"
            className="w-full h-11 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" text="Signing in..." />
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => router.push('/auth/register')}
              disabled={isSubmitting}
            >
              Register
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
