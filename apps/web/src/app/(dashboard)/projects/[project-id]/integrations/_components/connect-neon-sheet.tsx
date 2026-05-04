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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@blenvi/ui/components/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { createIntegrationAction } from "@/actions/integrations";
import type { NeonCredentialsInput } from "@/lib/validators/integration";
import { neonCredentialsSchema } from "@/lib/validators/integration";
import type { Integration } from "@/types/database";

type Props = {
  projectId: string;
  open: boolean;
  isConnecting: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectingChange: (connecting: boolean) => void;
  onError: (message: string | null) => void;
  onCreated: (integration: Integration) => Promise<void> | void;
};

export function ConnectNeonSheet({
  projectId,
  open,
  isConnecting,
  onOpenChange,
  onConnectingChange,
  onError,
  onCreated,
}: Props) {
  const form = useForm<NeonCredentialsInput>({
    resolver: zodResolver(neonCredentialsSchema),
    defaultValues: { apiKey: "", projectId: "" },
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset();
      }}
    >
      <SheetContent className="flex flex-col gap-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Neon</SheetTitle>
          <SheetDescription>
            Credentials are stored as an encrypted JSON blob. Uses Neon Console
            API keys, not your Postgres connection string.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            className="mt-2 flex flex-1 flex-col space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              onError(null);
              onConnectingChange(true);
              const result = await createIntegrationAction(projectId, values);
              if (result.error || !result.data) {
                onError(result.error ?? "Failed to add integration");
                onConnectingChange(false);
                return;
              }
              const created = result.data as Integration;
              await onCreated(created);
              onConnectingChange(false);
              form.reset();
              onOpenChange(false);
            })}
          >
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Console API key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="nkey_..."
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Generate at console.neon.tech → Account → API keys.
                    Read-only access is sufficient.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="shiny-forest-12345678"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Found in your Neon project URL or Settings → General.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isConnecting}
              className="mt-auto"
            >
              {form.formState.isSubmitting || isConnecting
                ? "Connecting and running first check..."
                : "Save connection"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
