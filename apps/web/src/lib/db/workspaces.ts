import { createClient } from "@/lib/supabase/server";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from "@/lib/validations/workspace";
import type { Workspace } from "@/types/database";

import type { Result } from "./types";

function mapError(message: string) {
  return message || "Something went wrong";
}

type WorkspaceMemberRow = {
  role: Workspace["my_role"];
  workspaces: EmbeddedWorkspace;
};

/** PostgREST may return a single row or a one-element array for FK embeds. */
type EmbeddedWorkspace =
  | Omit<Workspace, "my_role">
  | Omit<Workspace, "my_role">[]
  | null;

function unwrapWorkspace(
  embed: EmbeddedWorkspace,
): Omit<Workspace, "my_role"> | null {
  if (embed == null) return null;
  return Array.isArray(embed) ? (embed[0] ?? null) : embed;
}

export async function getWorkspaces(): Promise<Result<Workspace[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      `
      role,
      workspaces (
        id,
        name,
        poll_interval_minutes,
        last_health_poll_at,
        created_at,
        updated_at
      )
    `,
    )
    .eq("user_id", user.id);

  if (error)
    return { data: null, error: mapError("Failed to fetch workspaces") };

  const rows = (data ?? []) as WorkspaceMemberRow[];
  const workspaces: Workspace[] = rows
    .flatMap((row) => {
      const w = unwrapWorkspace(row.workspaces);
      if (!w || row.role == null) return [];
      const workspace: Workspace = { ...w, my_role: row.role };
      return [workspace];
    })
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  return { data: workspaces, error: null };
}

export async function getWorkspaceById(id: string): Promise<Result<Workspace>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      `
      role,
      workspaces (
        id,
        name,
        poll_interval_minutes,
        last_health_poll_at,
        created_at,
        updated_at
      )
    `,
    )
    .eq("workspace_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const row = data as WorkspaceMemberRow | null;
  const w = row ? unwrapWorkspace(row.workspaces) : null;

  if (error || !row || !w) {
    return { data: null, error: mapError("Workspace not found") };
  }

  return {
    data: {
      ...w,
      my_role: row.role as Workspace["my_role"],
    },
    error: null,
  };
}

export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<Result<Workspace>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase.rpc("create_workspace_with_owner", {
    p_name: input.name,
  });

  if (error)
    return { data: null, error: mapError("Failed to create workspace") };
  const ws = data as Omit<Workspace, "my_role">;
  return {
    data: { ...ws, my_role: "owner" },
    error: null,
  };
}

export async function updateWorkspace(
  id: string,
  input: UpdateWorkspaceInput,
): Promise<Result<Workspace>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update(input)
    .eq("id", id);

  if (error)
    return { data: null, error: mapError("Failed to update workspace") };
  return getWorkspaceById(id);
}

export async function deleteWorkspace(
  id: string,
): Promise<Result<{ id: string }>> {
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").delete().eq("id", id);

  if (error)
    return { data: null, error: mapError("Failed to delete workspace") };
  return { data: { id }, error: null };
}
