'use client';

import { useState } from 'react';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconBrandGithubFilled, IconBrandGoogleFilled } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import PasswordInput from '../custom/password-input';
import SIPasswordInput from '../custom/si-password-input';
import { Icons } from '../ui/icons';

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/\d/, 'Password must contain at least 1 number')
  .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    'Password must contain at least 1 special character'
  )
  .regex(/^(?!.*(.)\1{2,})/, 'Password cannot contain 3 or more consecutive identical characters')
  .regex(/^(?!.*\s)/, 'Password cannot contain spaces')
  .refine(password => {
    // Check for common weak patterns
    const weakPatterns = [
      /^123456/,
      /^password/i,
      /^qwerty/i,
      /^abc123/i,
      /^111111/,
      /^000000/,
      /^admin/i,
      /^welcome/i,
    ];
    return !weakPatterns.some(pattern => pattern.test(password));
  }, 'Password contains common weak patterns');

const formSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: passwordValidation,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    data => {
      // Check if password contains user's name or email
      const password = data.password.toLowerCase();
      const firstName = data.firstName.toLowerCase();
      const lastName = data.lastName.toLowerCase();
      const emailUser = data.email.split('@')[0].toLowerCase();

      return (
        !password.includes(firstName) &&
        !password.includes(lastName) &&
        !password.includes(emailUser)
      );
    },
    {
      message: 'Password cannot contain your name or email',
      path: ['password'],
    }
  );

export function SignUpForm({ className }: Readonly<{ className?: string }>) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignUp = async (values: z.infer<typeof formSchema>) => {
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            firstName: values.firstName,
            lastName: values.lastName,
          },
        },
      });
      if (error) {
        toast.error('Sign up failed', {
          description: error.message,
        });
        throw error;
      }
      toast.success('Account created successfully!', {
        description: 'Please check your email to confirm your account.',
      });
    } catch (error: unknown) {
      toast.error('Sign up failed', {
        description: error instanceof Error ? error.message : 'An error occurred during sign up',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignUp)} className={cn('space-y-6', className)}>
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md">
            <Icons.Blenvi className="size-10 invert-100 dark:invert-0" />
          </div>
          <span className="sr-only">Acme Inc.</span>
          <h1 className="text-xl font-bold">Welcome to Blenvi</h1>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="underline underline-offset-4">
              Log in
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <SIPasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating an account...' : 'Continue'}
          </Button>
        </div>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">Or</span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Button variant="outline" type="button" className="w-full">
            <IconBrandGithubFilled />
            Continue with GitHub
          </Button>
          <Button variant="outline" type="button" className="w-full">
            <IconBrandGoogleFilled />
            Continue with Google
          </Button>
        </div>
      </form>
    </Form>
  );
}
