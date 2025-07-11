import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { ForgotPasswordFormSkeleton } from '@/components/auth/forgot-password-form-skeleton';
import { LoginForm } from '@/components/auth/login-form';
import { LoginFormSkeleton } from '@/components/auth/login-form-skeleton';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { SignUpFormSkeleton } from '@/components/auth/sign-up-form-skeleton';
import { UpdatePasswordForm } from '@/components/auth/update-password-form';
import { UpdatePasswordFormSkeleton } from '@/components/auth/update-password-form-skeleton';
import { createClient } from '@/lib/supabase/server';

export default async function AuthPage({
  params,
}: Readonly<{
  params: Promise<{ slug?: string }>;
}>) {
  const slug = (await params).slug;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return notFound(); // User is already authenticated, redirect to not found
  } else {
    switch (slug) {
      case undefined:
      case 'login':
        return (
          <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
              <Suspense fallback={<LoginFormSkeleton />}>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        );
      case 'sign-up':
        return (
          <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
              <Suspense fallback={<SignUpFormSkeleton />}>
                <SignUpForm />
              </Suspense>
            </div>
          </div>
        );
      case 'forgot-password':
        return (
          <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
              <Suspense fallback={<ForgotPasswordFormSkeleton />}>
                <ForgotPasswordForm />
              </Suspense>
            </div>
          </div>
        );
      case 'update-password':
        return (
          <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
              <Suspense fallback={<UpdatePasswordFormSkeleton />}>
                <UpdatePasswordForm />
              </Suspense>
            </div>
          </div>
        );
      default:
        return notFound();
    }
  }
}
