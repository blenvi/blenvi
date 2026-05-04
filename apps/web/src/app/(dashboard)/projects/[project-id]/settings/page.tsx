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
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { deleteProjectAction, updateProjectAction } from "@/actions/projects";
import PageContainer from "@/components/layouts/page-container";
import {
  type UpdateProjectInput,
  updateProjectSchema,
} from "@/lib/validators/project";

export default function ProjectSettingsPage() {
  const router = useRouter();
  const params = useParams<{ "project-id": string }>();
  const projectId = params["project-id"];
  const [error, setError] = useState<string | null>(null);
  const form = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: { name: "", description: "" },
  });

  return (
    <PageContainer
      pageTitle="Project settings"
      pageDescription="Rename this project or remove it from the workspace."
    >
      <div className="max-w-xl space-y-4 rounded-xl border-[0.5px] border-border bg-background p-5">
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              const result = await updateProjectAction(projectId, values);
              setError(result.error);
            })}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Project name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save changes</Button>
          </form>
        </Form>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete project</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={async () => {
                  const result = await deleteProjectAction(projectId);
                  if (!result.error) router.push("/projects");
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
