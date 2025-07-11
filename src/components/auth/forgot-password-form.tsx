'use client';

import { useState } from 'react';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { Icons } from '../ui/icons';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export function ForgotPasswordForm({ className }: Readonly<{ className?: string }>) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleForgotPassword = async (values: z.infer<typeof formSchema>) => {
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent!', {
        description:
          'If you registered using your email and password, you will receive a password reset email.',
      });
    } catch (error: unknown) {
      toast.error('Failed to send reset email', {
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while sending the reset email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleForgotPassword)}
        className={cn('space-y-6', className)}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md">
            <Icons.Blenvi className="size-10 invert-100 dark:invert-0" />
          </div>
          <span className="sr-only">Blenvi</span>
          <h1 className="text-xl font-bold">Reset Password</h1>
          <div className="text-center text-sm">
            Return back to{' '}
            <Link href="/auth/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com" type="email" {...field} />
                </FormControl>
                <FormDescription>
                  Enter your email address to receive a password reset link.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset email'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
