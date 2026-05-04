"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { ROUTE_PATHS, UI_TEXT } from "@/constants";
import { createClient } from "@/lib/supabase/server";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from "@/lib/validators/workspace";
import {
  createWorkspace as createWorkspaceDb,
  deleteWorkspace as deleteWorkspaceDb,
  getWorkspaceById as getWorkspaceByIdDb,
  getWorkspaces as getWorkspacesDb,
  updateWorkspace as updateWorkspaceDb,
} from "@/services/db/workspaces";

export async function getWorkspacesAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: UI_TEXT.auth.notAuthenticated };
  return getWorkspacesDb();
}

export async function getWorkspaceByIdAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: UI_TEXT.auth.notAuthenticated };
  return getWorkspaceByIdDb(id);
}

export async function createWorkspaceAction(input: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: UI_TEXT.auth.notAuthenticated };

  const parsed = createWorkspaceSchema.safeParse(input);
  if (!parsed.success)
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };

  const result = await createWorkspaceDb(parsed.data);
  if (!result.error) {
    revalidateTag("workspaces", "max");
    revalidatePath(ROUTE_PATHS.overview);
  }
  return result;
}

export async function updateWorkspaceAction(id: string, input: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: UI_TEXT.auth.notAuthenticated };

  const parsed = updateWorkspaceSchema.safeParse(input);
  if (!parsed.success)
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };

  const result = await updateWorkspaceDb(id, parsed.data);
  if (!result.error) {
    revalidateTag("workspaces", "max");
    revalidatePath(ROUTE_PATHS.overview);
    revalidatePath("/settings/workspace");
  }
  return result;
}

export async function deleteWorkspaceAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: UI_TEXT.auth.notAuthenticated };

  const result = await deleteWorkspaceDb(id);
  if (!result.error) {
    revalidateTag("workspaces", "max");
    revalidatePath(ROUTE_PATHS.overview);
    revalidatePath(ROUTE_PATHS.projects);
    revalidatePath("/settings/workspace");
  }
  return result;
}
