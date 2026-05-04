"use client";

import { Button } from "@blenvi/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@blenvi/ui/components/dialog";
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
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  createWorkspaceAction,
  getWorkspacesAction,
} from "@/actions/workspaces";
import {
  type CreateWorkspaceInput,
  createWorkspaceSchema,
} from "@/lib/validators/workspace";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

type CreateWorkspaceDialogProps = {
  triggerLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
};

export function CreateWorkspaceDialog({
  triggerLabel = "New workspace",
  open: openProp,
  onOpenChange,
  withTrigger = true,
}: CreateWorkspaceDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [error, setError] = useState<string | null>(null);
  const { setWorkspaces, setActiveWorkspace, setActiveProject } =
    useWorkspaceStore();

  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const created = await createWorkspaceAction(values);

    if (created.error || !created.data) {
      setError(created.error ?? "Failed to create workspace");
      return;
    }

    const refreshed = await getWorkspacesAction();
    if (refreshed.data) setWorkspaces(refreshed.data);

    setActiveWorkspace(created.data);
    setActiveProject(null);
    setOpen(false);
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {withTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {triggerLabel}
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Set up a new workspace for your projects.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Workspace name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Creating..."
                  : "Create workspace"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
