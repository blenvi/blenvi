import { createClient } from "@/lib/supabase/server";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/validators/project";
import type { Project } from "@/types/database";

import type { Result } from "./types";

function mapError(message: string) {
  return message || "Something went wrong";
}

export async function getProjects(
  workspaceId: string,
): Promise<Result<Project[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: mapError("Failed to fetch projects") };
  return { data: (data ?? []) as Project[], error: null };
}

export async function getProjectById(id: string): Promise<Result<Project>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { data: null, error: mapError("Project not found") };
  return { data: data as Project, error: null };
}

export async function createProject(
  workspaceId: string,
  input: CreateProjectInput,
): Promise<Result<Project>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      description: input.description ?? null,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: mapError("Failed to create project") };
  return { data: data as Project, error: null };
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Result<Project>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      ...input,
      description: input.description ?? null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return { data: null, error: mapError("Failed to update project") };
  return { data: data as Project, error: null };
}

export async function deleteProject(
  id: string,
): Promise<Result<{ id: string }>> {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) return { data: null, error: mapError("Failed to delete project") };
  return { data: { id }, error: null };
}
