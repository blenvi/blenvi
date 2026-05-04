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
import { Textarea } from "@blenvi/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { createProjectAction } from "@/actions/projects";
import PageContainer from "@/components/layouts/page-container";
import { ROUTE_PATHS } from "@/constants";
import {
  type CreateProjectInput,
  createProjectSchema,
} from "@/lib/validators/project";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

export default function NewProjectPage() {
  const router = useRouter();
  const { activeWorkspace, setActiveProject } = useWorkspaceStore();
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "" },
  });

  return (
    <PageContainer
      pageTitle="New project"
      pageDescription="Create a project to group integrations and health checks."
    >
      <Form {...form}>
        <form
          className="max-w-xl space-y-4 rounded-xl border-[0.5px] border-border bg-background p-5"
          onSubmit={form.handleSubmit(async (values) => {
            if (!activeWorkspace) return;
            const result = await createProjectAction(
              activeWorkspace.id,
              values,
            );
            if (result.data) {
              setActiveProject(result.data);
              router.push(ROUTE_PATHS.project(result.data.id));
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
                  <Input {...field} placeholder="Project name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Optional description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create project</Button>
        </form>
      </Form>
    </PageContainer>
  );
}
