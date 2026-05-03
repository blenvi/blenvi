"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@blenvi/ui/components/alert-dialog";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@blenvi/ui/components/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, DatabaseZap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  deleteWorkspaceAction,
  getWorkspacesAction,
  updateWorkspaceAction,
} from "@/actions/workspaces";
import PageContainer from "@/components/layout/page-container";
import {
  type UpdateWorkspaceInput,
  updateWorkspaceSchema,
} from "@/lib/validations/workspace";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    activeWorkspace,
    workspaces,
    reset,
    setWorkspaces,
    setActiveWorkspace,
  } = useWorkspaceStore();
  const isOwner = activeWorkspace?.my_role === "owner";
  const canEdit = useMemo(
    () =>
      activeWorkspace?.my_role === "owner" ||
      activeWorkspace?.my_role === "editor",
    [activeWorkspace?.my_role],
  );
  const canDelete = useMemo(
    () => isOwner && workspaces.length > 1,
    [isOwner, workspaces.length],
  );
  const form = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: activeWorkspace?.name ?? "",
      poll_interval_minutes: activeWorkspace?.poll_interval_minutes ?? 5,
    },
  });

  useEffect(() => {
    if (!activeWorkspace) return;
    form.reset({
      name: activeWorkspace.name,
      poll_interval_minutes: activeWorkspace.poll_interval_minutes ?? 5,
    });
  }, [activeWorkspace, form]);

  if (!activeWorkspace)
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">
          No active workspace selected.
        </p>
      </PageContainer>
    );

  return (
    <PageContainer
      pageTitle="Workspace settings"
      pageDescription="Manage workspace identity, polling cadence, and ownership actions."
    >
      <div className="max-w-xl space-y-6 rounded-xl border-[0.5px] border-border bg-background p-5">
        {!canEdit ? (
          <p className="text-sm text-muted-foreground">
            You have view-only access to this workspace. Ask an owner or editor
            to make changes.
          </p>
        ) : null}

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              const result = await updateWorkspaceAction(
                activeWorkspace.id,
                values,
              );
              if (result.error) {
                setError(result.error);
                return;
              }
              const refresh = await getWorkspacesAction();
              if (refresh.data) {
                setWorkspaces(refresh.data);
                const current = refresh.data.find(
                  (item) => item.id === activeWorkspace.id,
                );
                if (current) setActiveWorkspace(current);
              }
            })}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!canEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="poll_interval_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soft health poll interval (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={1440}
                      step={1}
                      disabled={!canEdit}
                      value={field.value ?? 5}
                      onChange={(e) =>
                        field.onChange(Number.parseInt(e.target.value, 10) || 5)
                      }
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Between 1 and 1440 (24 hours). The platform scheduler runs
                    every minute; this value controls lightweight health checks
                    only. Use Refresh data on a project integration to run a
                    full Neon data pull.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={!canEdit}>
              Save workspace
            </Button>
          </form>
        </Form>

        <div className="space-y-3 border-t border-border pt-5">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              Polling options
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Automatic polling uses the soft option. Hard refreshes stay manual
              to avoid unnecessary Neon API usage.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">
                  Soft health check
                </h3>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Checks service reachability and endpoint state, then writes a
                health log.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-center gap-2">
                <DatabaseZap className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">
                  Hard data refresh
                </h3>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Pulls branches, operations, consumption, and a Neon snapshot
                from the project integration page.
              </p>
            </div>
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <AlertDialogTrigger asChild disabled={!canDelete}>
                  <Button variant="destructive" disabled={!canDelete}>
                    Delete workspace
                  </Button>
                </AlertDialogTrigger>
              </span>
            </TooltipTrigger>
            {!canDelete ? (
              <TooltipContent>
                {isOwner
                  ? "You need at least one workspace."
                  : "Only workspace owners can delete a workspace."}
              </TooltipContent>
            ) : null}
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={async () => {
                  const result = await deleteWorkspaceAction(
                    activeWorkspace.id,
                  );
                  if (result.error) return;
                  reset();
                  router.push("/overview");
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
}
