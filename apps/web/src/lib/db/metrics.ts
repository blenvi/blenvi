import { createClient } from "@/lib/supabase/server";
import type {
  IntegrationIncident,
  IntegrationMetric,
  ServiceMetrics,
} from "@/types/database";

import type { Result } from "./types";

function mapError(message: string) {
  return message || "Something went wrong";
}

function asMetrics(json: unknown): ServiceMetrics {
  if (
    json &&
    typeof json === "object" &&
    "service" in json &&
    (json as { service: unknown }).service === "neon"
  ) {
    return json as ServiceMetrics;
  }
  return {
    service: "neon",
    projectId: "",
    activeBranches: 0,
    computeUsedHours: 0,
    storageBytes: 0,
    lastBackupAt: new Date().toISOString(),
  };
}

export async function getLatestMetricsForIntegrations(
  integrationIds: string[],
): Promise<Result<Map<string, IntegrationMetric>>> {
  if (integrationIds.length === 0) {
    return { data: new Map(), error: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_metrics")
    .select("*")
    .in("integration_id", integrationIds)
    .order("polled_at", { ascending: false });

  if (error) {
    return {
      data: null,
      error: mapError("Failed to load integration metrics"),
    };
  }

  const map = new Map<string, IntegrationMetric>();
  for (const row of data ?? []) {
    const id = row.integration_id as string;
    if (!map.has(id)) {
      map.set(id, {
        id: row.id as string,
        integration_id: id,
        polled_at: row.polled_at as string,
        latency_ms: row.latency_ms as number | null,
        metrics: asMetrics(row.metrics),
        raw_payload: (row.raw_payload ?? null) as Record<
          string,
          unknown
        > | null,
      });
    }
  }

  return { data: map, error: null };
}

export async function getMetricsHistory(
  integrationId: string,
  limit = 48,
): Promise<Result<IntegrationMetric[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_metrics")
    .select("*")
    .eq("integration_id", integrationId)
    .order("polled_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: mapError("Failed to load metric history") };
  }

  const rows = (data ?? []).map((row) => ({
    id: row.id as string,
    integration_id: row.integration_id as string,
    polled_at: row.polled_at as string,
    latency_ms: row.latency_ms as number | null,
    metrics: asMetrics(row.metrics),
    raw_payload: (row.raw_payload ?? null) as Record<string, unknown> | null,
  }));

  return { data: rows, error: null };
}

export async function getActiveIncidentsForProject(
  projectId: string,
  limit = 50,
): Promise<Result<IntegrationIncident[]>> {
  const supabase = await createClient();
  const { data: integrations, error: intError } = await supabase
    .from("integrations")
    .select("id")
    .eq("project_id", projectId);

  if (intError) {
    return { data: null, error: mapError("Failed to load incidents") };
  }

  const ids = (integrations ?? []).map((r) => r.id as string);
  if (ids.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("integration_incidents")
    .select("*")
    .in("integration_id", ids)
    .is("resolved_at", null)
    .order("opened_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: mapError("Failed to load incidents") };
  }

  return { data: (data ?? []) as IntegrationIncident[], error: null };
}

export async function getActiveIncidentsForIntegration(
  integrationId: string,
): Promise<Result<IntegrationIncident[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_incidents")
    .select("*")
    .eq("integration_id", integrationId)
    .is("resolved_at", null)
    .order("opened_at", { ascending: false });

  if (error) {
    return { data: null, error: mapError("Failed to load incidents") };
  }

  return { data: (data ?? []) as IntegrationIncident[], error: null };
}

/** True if the user is an owner or editor of the integration's workspace (not viewer). */
export async function verifyUserCanEditIntegration(
  integrationId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data: integration, error: iErr } = await supabase
    .from("integrations")
    .select("project_id")
    .eq("id", integrationId)
    .maybeSingle();

  if (iErr || !integration?.project_id) return false;

  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("workspace_id")
    .eq("id", integration.project_id)
    .maybeSingle();

  if (pErr || !project?.workspace_id) return false;

  const { data: membership, error: mErr } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (mErr || !membership) return false;
  return membership.role === "owner" || membership.role === "editor";
}
