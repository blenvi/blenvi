"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  createProject as createProjectDb,
  deleteProject as deleteProjectDb,
  getProjectById as getProjectByIdDb,
  getProjects as getProjectsDb,
  updateProject as updateProjectDb,
} from "@/lib/db/projects";
import { createClient } from "@/lib/supabase/server";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/validations/project";

export async function getProjectsAction(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };
  return getProjectsDb(workspaceId);
}

export async function getProjectByIdAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };
  return getProjectByIdDb(id);
}

export async function createProjectAction(workspaceId: string, input: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success)
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };

  const result = await createProjectDb(workspaceId, parsed.data);
  if (!result.error) {
    revalidateTag("projects", "max");
    revalidatePath("/projects");
  }
  return result;
}

export async function updateProjectAction(id: string, input: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success)
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };

  const result = await updateProjectDb(id, parsed.data);
  if (!result.error) {
    revalidateTag("projects", "max");
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath(`/projects/${id}/settings`);
  }
  return result;
}

export async function deleteProjectAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const result = await deleteProjectDb(id);
  if (!result.error) {
    revalidateTag("projects", "max");
    revalidatePath("/projects");
  }
  return result;
}
