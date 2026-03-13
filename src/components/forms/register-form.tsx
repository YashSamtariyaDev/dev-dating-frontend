'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { registerSchema, RegisterFormData } from '@/lib/validations/auth';
import { apiClient } from '@/config/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegisterFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Initiate registration and send OTP
      const response = await apiClient.post('/auth/initiate-registration', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        setRegistrationData(data);
        setShowOTP(true);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Registration initiation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show OTP verification form
  if (showOTP && registrationData) {
    return (
      <OtpVerificationForm
        email={registrationData.email}
        name={registrationData.name}
        password={registrationData.password}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Register to start matching with developers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

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
              placeholder="Create a password"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" variant="brand" size="lg" className="w-full h-11 text-base" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoadingSpinner size="sm" text="Sending OTP..." />
            ) : (
              '📧 Send OTP & Register'
            )}
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => router.push('/auth/login')}
              disabled={isSubmitting}
            >
              Sign in
            </button>
          </div>

          <div className="text-xs text-muted-foreground text-center border-t pt-3">
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-600">✅</span>
              Email verification required for security
            </p>
            <p className="mt-1">
              We'll send a 6-digit OTP to verify your email
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// OTP Verification Form Component
function OtpVerificationForm({ 
  email, 
  name, 
  password, 
  onBack 
}: { 
  email: string; 
  name: string; 
  password: string; 
  onBack: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        setError('Please enter all 6 digits');
        return;
      }

      const response = await apiClient.post('/auth/verify-email', {
        email,
        otp: otpCode,
        name,
        password,
      });

      if (response.data.message && response.data.userId) {
        setSuccess('Email verified successfully! Setting up your account...');
        
        // Instead of auto-login, redirect to login with success message
        setTimeout(() => {
          router.push('/auth/login?message=Account created successfully! Please login to continue.');
        }, 1500);
      } else {
        setError('OTP verification failed. Please try again.');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.post('/auth/resend-otp', { email });
      
      if (response.data.success) {
        setSuccess('New OTP sent to your email');
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>🔐 Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit OTP to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Enter OTP</Label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg font-bold"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}

          <Button type="submit" variant="brand" size="lg" className="w-full h-11 text-base" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoadingSpinner size="sm" text="Verifying..." />
            ) : (
              '✅ Verify Email'
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendOTP}
              disabled={isResending || isSubmitting}
            >
              {isResending ? (
                <LoadingSpinner size="sm" text="Resending..." />
              ) : (
                '📧 Resend OTP'
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            <p>⏰ OTP expires in 10 minutes</p>
            <p className="mt-2">
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={onBack}
                disabled={isSubmitting}
              >
                Go back
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
