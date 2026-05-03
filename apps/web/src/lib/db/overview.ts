import { getWorstStatus } from "@/lib/utils/status";
import type {
  Integration,
  IntegrationMetric,
  OverviewIncident,
  WorkspaceOverview,
} from "@/types/database";

import { createClient } from "../supabase/server";
import type { Result } from "./types";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

type IntegrationRow = Integration & {
  projects: { name: string } | { name: string }[] | null;
};

type IntegrationMetricRow = Pick<
  IntegrationMetric,
  "integration_id" | "polled_at" | "latency_ms" | "metrics"
>;

type IncidentRow = {
  id: string;
  integration_id: string;
  title: string | null;
  severity: "info" | "warning" | "critical";
  opened_at: string;
  details: Record<string, unknown> | null;
  integrations:
    | {
        service: Integration["service"];
        projects: { name: string } | { name: string }[] | null;
      }
    | {
        service: Integration["service"];
        projects: { name: string } | { name: string }[] | null;
      }[]
    | null;
};

function mapError(message: string) {
  return message || "Something went wrong";
}

function asObject<T>(value: T | T[] | null): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toPercent(healthy: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((healthy / total) * 1000) / 10;
}

function asSeverity(
  level: IncidentRow["severity"],
): OverviewIncident["severity"] {
  if (level === "critical") return "critical";
  if (level === "warning") return "major";
  return "minor";
}

function sourceUrl(details: Record<string, unknown> | null) {
  const candidate = details?.source_url;
  return typeof candidate === "string" ? candidate : null;
}

/** Last `days` UTC calendar dates ending on `end` (inclusive of end's UTC date). */
function buildUtcDayKeysInclusive(end: Date, days: number): string[] {
  const keys: string[] = [];
  const y = end.getUTCFullYear();
  const m = end.getUTCMonth();
  const d = end.getUTCDate();
  for (let i = days - 1; i >= 0; i -= 1) {
    const dt = new Date(Date.UTC(y, m, d - i));
    keys.push(dt.toISOString().slice(0, 10));
  }
  return keys;
}

/** Derive poll outcome from metrics.raw_payload (new rows include `status`). */
function statusFromMetricPayload(raw: unknown): Integration["status"] {
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const s = r.status;
    if (
      s === "healthy" ||
      s === "degraded" ||
      s === "down" ||
      s === "unknown"
    ) {
      return s;
    }
    if (r.error === true || typeof r.error === "string") {
      return "down";
    }
  }
  return "healthy";
}

/**
 * One row per poll (`integration_metrics`). Matches chart to actual poll cadence
 * and avoids PostgREST row caps on `integration_checks` for busy workspaces.
 */
function buildPollTrend7dFromMetrics(
  rows: Array<{ polled_at: string; raw_payload: unknown }>,
) {
  const dayKeys = buildUtcDayKeysInclusive(new Date(), 7);
  const totals = new Map(dayKeys.map((k) => [k, 0]));
  const healthyByDay = new Map(dayKeys.map((k) => [k, 0]));

  for (const row of rows) {
    const key = row.polled_at.slice(0, 10);
    if (!totals.has(key)) continue;
    totals.set(key, (totals.get(key) ?? 0) + 1);
    if (statusFromMetricPayload(row.raw_payload) === "healthy") {
      healthyByDay.set(key, (healthyByDay.get(key) ?? 0) + 1);
    }
  }

  return dayKeys.map((key) => ({
    dayKey: key,
    checks: totals.get(key) ?? 0,
    healthy: healthyByDay.get(key) ?? 0,
  }));
}

export async function getWorkspaceOverview(
  workspaceId: string,
): Promise<Result<WorkspaceOverview>> {
  const supabase = await createClient();

  const { data: projectsData, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (projectError) {
    return { data: null, error: mapError("Failed to load projects") };
  }

  const projects = (projectsData ?? []) as ProjectRow[];
  const projectIds = projects.map((p) => p.id);

  if (projectIds.length === 0) {
    return {
      data: {
        projects: [],
        integrations: [],
        activeIncidents: [],
        recentChecks: [],
        checksTrend7d: [],
        serviceHealth: [],
        stats: {
          totalProjects: 0,
          totalIntegrations: 0,
          activeIncidentCount: 0,
          availability24h: 0,
          availability7d: 0,
          totalChecks7d: 0,
          checks24h: 0,
          checks24hHealthy: 0,
          checks7dHealthy: 0,
          lastPolledAt: null,
        },
      },
      error: null,
    };
  }

  const { data: integrationsData, error: integrationsError } = await supabase
    .from("integrations")
    .select(
      "id, project_id, service, status, last_checked, created_at, updated_at, api_key_enc, projects(name)",
    )
    .in("project_id", projectIds);

  if (integrationsError) {
    return { data: null, error: mapError("Failed to load integrations") };
  }

  const integrationRows = (integrationsData ?? []) as IntegrationRow[];
  const integrations = integrationRows.map((row) => {
    const project = asObject(row.projects);
    return {
      id: row.id,
      project_id: row.project_id,
      service: row.service,
      status: row.status,
      last_checked: row.last_checked,
      created_at: row.created_at,
      updated_at: row.updated_at,
      api_key_enc: row.api_key_enc,
      projectName: project?.name ?? "Project",
    };
  });

  const integrationIds = integrations.map((i) => i.id);
  if (integrationIds.length === 0) {
    return {
      data: {
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          integrationCount: 0,
          worstStatus: "unknown",
          lastChecked: null,
        })),
        integrations: [],
        activeIncidents: [],
        recentChecks: [],
        checksTrend7d: [],
        serviceHealth: [],
        stats: {
          totalProjects: projects.length,
          totalIntegrations: 0,
          activeIncidentCount: 0,
          availability24h: 0,
          availability7d: 0,
          totalChecks7d: 0,
          checks24h: 0,
          checks24hHealthy: 0,
          checks7dHealthy: 0,
          lastPolledAt: null,
        },
      },
      error: null,
    };
  }

  const now = Date.now();
  const dayAgoIso = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const weekAgoIso = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    latestMetricsData,
    incidentsData,
    recentMetricsData,
    checks24hData,
    checks7dData,
    metricsTrend7dData,
  ] = await Promise.all([
    supabase
      .from("integration_metrics")
      .select("integration_id, polled_at, latency_ms, metrics")
      .in("integration_id", integrationIds)
      .order("polled_at", { ascending: false }),
    supabase
      .from("integration_incidents")
      .select(
        "id, integration_id, title, severity, opened_at, details, integrations(service, projects(name))",
      )
      .in("integration_id", integrationIds)
      .is("resolved_at", null)
      .order("opened_at", { ascending: false }),
    supabase
      .from("integration_metrics")
      .select(
        "integration_id, polled_at, latency_ms, integrations(service, status, projects(id, name))",
      )
      .in("integration_id", integrationIds)
      .order("polled_at", { ascending: false })
      .limit(5),
    supabase
      .from("integration_checks")
      .select("status")
      .in("integration_id", integrationIds)
      .gte("checked_at", dayAgoIso)
      .limit(25_000),
    supabase
      .from("integration_checks")
      .select("status, checked_at")
      .in("integration_id", integrationIds)
      .gte("checked_at", weekAgoIso)
      .order("checked_at", { ascending: true })
      .limit(50_000),
    supabase
      .from("integration_metrics")
      .select("polled_at, raw_payload")
      .in("integration_id", integrationIds)
      .gte("polled_at", weekAgoIso)
      .order("polled_at", { ascending: true })
      .limit(50_000),
  ]);

  if (latestMetricsData.error) {
    return { data: null, error: mapError("Failed to load latest metrics") };
  }
  if (incidentsData.error) {
    return { data: null, error: mapError("Failed to load incidents") };
  }
  if (recentMetricsData.error) {
    return { data: null, error: mapError("Failed to load recent checks") };
  }
  if (checks24hData.error || checks7dData.error || metricsTrend7dData.error) {
    return { data: null, error: mapError("Failed to load availability stats") };
  }

  const latestMetricsRows = (latestMetricsData.data ??
    []) as IntegrationMetricRow[];
  const latestMetricByIntegration = new Map<string, IntegrationMetricRow>();
  for (const row of latestMetricsRows) {
    if (!latestMetricByIntegration.has(row.integration_id)) {
      latestMetricByIntegration.set(row.integration_id, row);
    }
  }

  const projectSummaries = projects.map((project) => {
    const projectIntegrations = integrations.filter(
      (i) => i.project_id === project.id,
    );
    const statuses = projectIntegrations.map((i) => i.status);
    const checkedAt = projectIntegrations
      .map((i) => i.last_checked)
      .filter((v): v is string => Boolean(v))
      .sort((a, b) => b.localeCompare(a));

    return {
      id: project.id,
      name: project.name,
      integrationCount: projectIntegrations.length,
      worstStatus: getWorstStatus(statuses),
      lastChecked: checkedAt[0] ?? null,
    };
  });

  const incidents = ((incidentsData.data ?? []) as IncidentRow[]).map((row) => {
    const i = asObject(row.integrations);
    const p = asObject(i?.projects ?? null);
    return {
      id: row.id,
      integrationId: row.integration_id,
      title: row.title ?? "Open incident",
      severity: asSeverity(row.severity),
      status: "open" as const,
      startedAt: row.opened_at,
      sourceUrl: sourceUrl(row.details),
      service: i?.service ?? "neon",
      projectName: p?.name ?? "Project",
    };
  });

  const recentChecks = (
    (recentMetricsData.data ?? []) as Array<{
      integration_id: string;
      polled_at: string;
      latency_ms: number | null;
      integrations:
        | {
            service: Integration["service"];
            status: Integration["status"];
            projects:
              | { id: string; name: string }
              | { id: string; name: string }[]
              | null;
          }
        | {
            service: Integration["service"];
            status: Integration["status"];
            projects:
              | { id: string; name: string }
              | { id: string; name: string }[]
              | null;
          }[]
        | null;
    }>
  ).map((row) => {
    const integration = asObject(row.integrations);
    const project = asObject(integration?.projects ?? null);
    return {
      integrationId: row.integration_id,
      projectId: project?.id ?? "",
      polledAt: row.polled_at,
      latencyMs: row.latency_ms,
      service: integration?.service ?? "neon",
      status: integration?.status ?? "unknown",
      projectName: project?.name ?? "Project",
    };
  });

  const serviceHealthMap = new Map<
    Integration["service"],
    { total: number; healthy: number }
  >();
  for (const integration of integrations) {
    const current = serviceHealthMap.get(integration.service) ?? {
      total: 0,
      healthy: 0,
    };
    current.total += 1;
    if (integration.status === "healthy") current.healthy += 1;
    serviceHealthMap.set(integration.service, current);
  }
  const serviceHealth = Array.from(serviceHealthMap.entries()).map(
    ([service, counts]) => ({
      service,
      total: counts.total,
      healthy: counts.healthy,
    }),
  );

  const checks24h = checks24hData.data ?? [];
  const checks7d = (checks7dData.data ?? []) as Array<{
    status: Integration["status"];
    checked_at: string;
  }>;
  const healthy24h = checks24h.filter((row) => row.status === "healthy").length;
  const healthy7d = checks7d.filter((row) => row.status === "healthy").length;
  const checksTrend7d = buildPollTrend7dFromMetrics(
    (metricsTrend7dData.data ?? []) as Array<{
      polled_at: string;
      raw_payload: unknown;
    }>,
  );

  const lastPolledAt = latestMetricsRows[0]?.polled_at ?? null;

  return {
    data: {
      projects: projectSummaries,
      integrations,
      activeIncidents: incidents,
      recentChecks,
      checksTrend7d,
      serviceHealth,
      stats: {
        totalProjects: projects.length,
        totalIntegrations: integrations.length,
        activeIncidentCount: incidents.length,
        availability24h: toPercent(healthy24h, checks24h.length),
        availability7d: toPercent(healthy7d, checks7d.length),
        totalChecks7d: checks7d.length,
        checks24h: checks24h.length,
        checks24hHealthy: healthy24h,
        checks7dHealthy: healthy7d,
        lastPolledAt,
      },
    },
    error: null,
  };
}
