'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

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
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import SIPasswordInput from '../custom/si-password-input';
import { Icons } from '../ui/icons';

const formSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function UpdatePasswordForm({ className }: Readonly<{ className?: string }>) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  const handleUpdatePassword = async (values: z.infer<typeof formSchema>) => {
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      if (error) throw error;
      toast.success('Password updated successfully!', {
        description: 'Your password has been changed.',
      });
      router.push('/');
    } catch (error: unknown) {
      toast.error('Failed to update password', {
        description:
          error instanceof Error ? error.message : 'An error occurred while updating your password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleUpdatePassword)}
        className={cn('space-y-6', className)}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md">
            <Icons.Blenvi className="size-10 invert-100 dark:invert-0" />
          </div>
          <span className="sr-only">Blenvi</span>
          <h1 className="text-xl font-bold">Reset Password</h1>
        </div>
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <SIPasswordInput {...field} />
                </FormControl>
                <FormDescription>
                  Enter a new password to reset your current password.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save new password'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
