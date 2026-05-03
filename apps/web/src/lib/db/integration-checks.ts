import { createClient } from "@/lib/supabase/server";
import type { IntegrationCheck } from "@/types/database";

import type { Result } from "./types";

export type ProjectCheck = IntegrationCheck & {
  integrations: {
    id: string;
    service: "neon";
    project_id: string;
  } | null;
};

type CheckFilters = {
  service?: "neon" | "all";
  status?: "healthy" | "degraded" | "down" | "unknown" | "all";
  offset?: number;
};

function mapError(message: string) {
  return message || "Something went wrong";
}

export async function getRecentChecksForProject(
  projectId: string,
  limit = 20,
  filters: CheckFilters = {},
): Promise<Result<ProjectCheck[]>> {
  const supabase = await createClient();
  const offset = Math.max(filters.offset ?? 0, 0);
  let query = supabase
    .from("integration_checks")
    .select("*, integrations(id, service, project_id)")
    .eq("integrations.project_id", projectId)
    .order("checked_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.service && filters.service !== "all") {
    query = query.eq("integrations.service", filters.service);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: mapError("Failed to load integration checks") };
  }

  return { data: (data ?? []) as ProjectCheck[], error: null };
}

export async function getRecentIncidentsForProject(
  projectId: string,
  limit = 10,
): Promise<Result<ProjectCheck[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_checks")
    .select("*, integrations(id, service, project_id)")
    .eq("integrations.project_id", projectId)
    .in("status", ["degraded", "down"])
    .order("checked_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: mapError("Failed to load incident checks") };
  }

  return { data: (data ?? []) as ProjectCheck[], error: null };
}
