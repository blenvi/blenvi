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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createClient } from "@/lib/supabase/client";
import { type SignUpInput, signUpSchema } from "@/lib/validators/auth";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <Form {...form}>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            setServerError(null);
            setMessage(null);
            const { data, error: signupError } = await supabase.auth.signUp({
              email: values.email,
              password: values.password,
              options: {
                data: {
                  full_name: values.fullName,
                },
              },
            });
            if (signupError) {
              setServerError(signupError.message);
              return;
            }
            if (data.session) {
              router.push("/overview");
              router.refresh();
              return;
            }
            setMessage(
              "Account created. If email confirmation is enabled, check your inbox to verify.",
            );
          })}
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="name"
                    placeholder="Full name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Password"
                    minLength={8}
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
            {form.formState.isSubmitting ? "Creating…" : "Sign up"}
          </Button>
        </form>
      </Form>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline">
          Log in
        </Link>
      </p>
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {serverError ? (
        <p className="text-sm text-destructive">{serverError}</p>
      ) : null}
    </main>
  );
}
