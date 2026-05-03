"use client";

import { Button } from "@blenvi/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@blenvi/ui/components/form";
import { Input } from "@blenvi/ui/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createClient } from "@/lib/supabase/client";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <p className="text-sm text-muted-foreground">
        We will email you a link to set a new password.
      </p>
      <Form {...form}>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            setServerError(null);
            setMessage(null);
            const origin = window.location.origin;
            const { error: resetError } =
              await supabase.auth.resetPasswordForEmail(values.email.trim(), {
                redirectTo: `${origin}/api/auth/callback?next=/update-password`,
              });
            if (resetError) {
              setServerError(resetError.message);
              return;
            }
            setMessage(
              "If an account exists for that email, a reset link is on the way.",
            );
          })}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </Form>
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {serverError ? (
        <p className="text-sm text-destructive">{serverError}</p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary underline">
          Back to log in
        </Link>
      </p>
    </main>
  );
}
