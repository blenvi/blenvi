"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  createWorkspace as createWorkspaceDb,
  deleteWorkspace as deleteWorkspaceDb,
  getWorkspaceById as getWorkspaceByIdDb,
  getWorkspaces as getWorkspacesDb,
  updateWorkspace as updateWorkspaceDb,
} from "@/lib/db/workspaces";
import { createClient } from "@/lib/supabase/server";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from "@/lib/validations/workspace";

export async function getWorkspacesAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };
  return getWorkspacesDb();
}

export async function getWorkspaceByIdAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };
  return getWorkspaceByIdDb(id);
}

export async function createWorkspaceAction(input: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = createWorkspaceSchema.safeParse(input);
  if (!parsed.success)
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };

  const result = await createWorkspaceDb(parsed.data);
  if (!result.error) {
    revalidateTag("workspaces", "max");
    revalidatePath("/overview");
  }
  return result;
}

export async function updateWorkspaceAction(id: string, input: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = updateWorkspaceSchema.safeParse(input);
  if (!parsed.success)
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };

  const result = await updateWorkspaceDb(id, parsed.data);
  if (!result.error) {
    revalidateTag("workspaces", "max");
    revalidatePath("/overview");
    revalidatePath("/settings/workspace");
  }
  return result;
}

export async function deleteWorkspaceAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const result = await deleteWorkspaceDb(id);
  if (!result.error) {
    revalidateTag("workspaces", "max");
    revalidatePath("/overview");
    revalidatePath("/projects");
    revalidatePath("/settings/workspace");
  }
  return result;
}
