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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { updateIntegrationCredentialsAction } from "@/actions/integrations";
import {
  type NeonUpdateInput,
  neonUpdateSchema,
} from "@/lib/validations/neon-update";

type Props = {
  projectId: string;
  integrationId: string;
  initialNeonProjectId: string;
};

export function IntegrationCredentialsForm({
  projectId,
  integrationId,
  initialNeonProjectId,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NeonUpdateInput>({
    resolver: zodResolver(neonUpdateSchema),
    defaultValues: {
      neonApiKey: "",
      neonProjectId: initialNeonProjectId,
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          setError(null);
          const result = await updateIntegrationCredentialsAction(
            integrationId,
            projectId,
            {
              neonApiKey: values.neonApiKey,
              neonProjectId: values.neonProjectId,
            },
          );
          if (result.error || !result.data) {
            setError(result.error ?? "Failed to update connection");
            return;
          }
          form.reset({
            neonApiKey: "",
            neonProjectId: values.neonProjectId.trim(),
          });
          router.refresh();
        })}
      >
        <FormField
          control={form.control}
          name="neonProjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Neon project ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="Project ID (Console URL / Settings)"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="neonApiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Console API key</FormLabel>
              <FormControl>
                <Input
                  placeholder="Leave blank to keep the current key"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Change the project ID or paste a new API key from Neon → Account
          settings → API keys. Leave the key field empty to keep your existing
          key.
        </p>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </form>
    </Form>
  );
}
