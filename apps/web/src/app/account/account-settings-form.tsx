"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@blenvi/ui/components/avatar";
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
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { updateProfileAction } from "@/actions/profile";
import { updateProfileSchema } from "@/lib/validators/profile";

type FormValues = {
  display_name: string;
  avatar_url: string;
};

export function AccountSettingsForm({
  email,
  initialDisplayName,
  initialAvatarUrl,
}: {
  email: string;
  initialDisplayName: string;
  initialAvatarUrl: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      display_name: initialDisplayName,
      avatar_url: initialAvatarUrl,
    },
  });

  const displayName = form.watch("display_name");
  const avatarUrl = form.watch("avatar_url");

  const initials = useMemo(() => {
    const fromName = displayName?.trim();
    if (fromName?.length) {
      const parts = fromName.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        const a = parts[0]?.[0] ?? "";
        const b = parts[1]?.[0] ?? "";
        return `${a}${b}`.toUpperCase();
      }
      return fromName.slice(0, 2).toUpperCase();
    }
    const prefix = email.split("@")[0] ?? "U";
    return prefix.slice(0, 2).toUpperCase();
  }, [displayName, email]);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">
          Your profile is stored in Blenvi and tied to your login.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="size-16 text-lg" size="lg">
          {avatarUrl.trim() ? (
            <AvatarImage src={avatarUrl.trim()} alt="" />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <p className="text-sm text-muted-foreground">
          Preview uses your display name for initials, or the image URL below.
        </p>
      </div>

      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            setError(null);
            setSaved(false);
            const result = await updateProfileAction(values);
            if (result.error) {
              setError(result.error);
              return;
            }
            setSaved(true);
            router.refresh();
          })}
        >
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input value={email} disabled readOnly autoComplete="email" />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Email comes from your auth provider and cannot be changed here.
            </p>
          </FormItem>

          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar image URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="url"
                    placeholder="https://…"
                    autoComplete="off"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Optional. Must be a valid https URL.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </Form>

      {saved ? (
        <p className="text-sm text-emerald-600">Profile saved.</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
