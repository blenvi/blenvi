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
import {
  type NewPasswordInput,
  newPasswordSchema,
} from "@/lib/validators/auth";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold">Set new password</h1>
      <p className="text-sm text-muted-foreground">
        Choose a strong password you have not used elsewhere.
      </p>
      <Form {...form}>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            setServerError(null);
            const { error: updateError } = await supabase.auth.updateUser({
              password: values.password,
            });
            if (updateError) {
              setServerError(updateError.message);
              return;
            }
            router.push("/overview");
            router.refresh();
          })}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="New password"
                    minLength={8}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
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
            {form.formState.isSubmitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      </Form>
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
