import type { NeonServiceMetrics } from "@/types/database";
import type { ServiceCredentials } from "./credentials";
import type { MetricDefinition, PollResult } from "./types";

export const METRICS_DEFINITION: MetricDefinition[] = [
  {
    key: "activeBranches",
    label: "Active branches",
    unit: "count",
    higherIsBetter: false,
    thresholds: { warn: 8, critical: 12 },
  },
  {
    key: "storageBytes",
    label: "Storage",
    unit: "bytes",
    higherIsBetter: false,
  },
  {
    key: "lastBackupAt",
    label: "Last backup",
    unit: "iso8601",
    is_read_only: true,
  },
  {
    key: "computeUsedHours",
    label: "Compute hours (period)",
    unit: "count",
    higherIsBetter: false,
    thresholds: { warn: 200, critical: 400 },
  },
];

const NEON_API = "https://console.neon.tech/api/v2";

type NeonBranch = {
  id: string;
  current_state?: string;
  /** Bytes used by branch data (Neon API). */
  logical_size?: number;
  physical_size?: number;
  created_at?: string;
  updated_at?: string;
};

type ListBranchesJson = {
  branches?: NeonBranch[];
  pagination?: { cursor?: string; next?: string };
};

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function fetchBranchesPage(
  projectId: string,
  apiKey: string,
  cursor?: string,
): Promise<{ branches: NeonBranch[]; nextCursor?: string }> {
  const params = new URLSearchParams({ limit: "1000" });
  if (cursor) params.set("cursor", cursor);

  const url = `${NEON_API}/projects/${encodeURIComponent(projectId)}/branches?${params}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Neon branches ${res.status}: ${text.slice(0, 400) || res.statusText}`,
    );
  }
  const data = parseJson(text) as ListBranchesJson | null;
  const branches = data?.branches ?? [];
  const nextCursor = data?.pagination?.next ?? data?.pagination?.cursor;
  return { branches, nextCursor: nextCursor || undefined };
}

async function listAllBranches(
  projectId: string,
  apiKey: string,
): Promise<NeonBranch[]> {
  const all: NeonBranch[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 25; page++) {
    const { branches, nextCursor } = await fetchBranchesPage(
      projectId,
      apiKey,
      cursor,
    );
    all.push(...branches);
    if (branches.length < 1000) break;
    if (!nextCursor) break;
    cursor = nextCursor;
  }
  return all;
}

/** Sum branch sizes; Neon returns logical_size in bytes for API v2. */
function totalStorageBytes(branches: NeonBranch[]): number {
  let sum = 0;
  for (const b of branches) {
    const v = b.logical_size ?? b.physical_size ?? 0;
    sum += typeof v === "number" && Number.isFinite(v) ? v : 0;
  }
  return Math.round(sum);
}

function latestActivityIso(branches: NeonBranch[]): string {
  let best = 0;
  for (const b of branches) {
    const raw = b.updated_at ?? b.created_at;
    if (!raw) continue;
    const t = new Date(raw).getTime();
    if (!Number.isNaN(t) && t > best) best = t;
  }
  return best > 0 ? new Date(best).toISOString() : new Date().toISOString();
}

async function fetchOrganizationId(
  projectId: string,
  apiKey: string,
): Promise<string | null> {
  const url = `${NEON_API}/projects/${encodeURIComponent(projectId)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const text = await res.text();
  const raw = parseJson(text) as Record<string, unknown> | null;
  if (!raw) return null;
  const proj = raw.project as Record<string, unknown> | undefined;
  const orgObj = proj?.organization as Record<string, unknown> | undefined;
  const org =
    (typeof proj?.organization_id === "string" && proj.organization_id) ||
    (typeof proj?.org_id === "string" && proj.org_id) ||
    (typeof orgObj?.id === "string" && orgObj.id) ||
    (typeof raw.organization_id === "string" && raw.organization_id);
  return org || null;
}

/** Consumption API (usage-based plans). Returns compute-unit seconds or null if unavailable. */
async function fetchComputeUnitSeconds(
  projectId: string,
  orgId: string,
  apiKey: string,
): Promise<number | null> {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
    granularity: "daily",
    org_id: orgId,
    project_ids: projectId,
    metrics: "compute_unit_seconds",
  });

  const url = `${NEON_API}/consumption_history/v2/projects?${params}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const text = await res.text();
  const raw = parseJson(text);
  const seconds = sumConsumptionLeafMetric(raw, "compute_unit_seconds");
  return Number.isFinite(seconds) ? seconds : null;
}

/**
 * Sum `compute_unit_seconds` only on leaf period rows (objects with a time field).
 * Avoids double-counting totals nested inside parent objects.
 */
function sumConsumptionLeafMetric(data: unknown, metric: string): number {
  let total = 0;
  const walk = (node: unknown): void => {
    if (node === null || node === undefined) return;
    if (Array.isArray(node)) {
      for (const x of node) walk(x);
      return;
    }
    if (typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    const hasPeriod =
      typeof o.time === "string" ||
      typeof o.period_start === "string" ||
      typeof o.interval_start === "string" ||
      typeof o.start_time === "string";
    if (
      hasPeriod &&
      typeof o[metric] === "number" &&
      Number.isFinite(o[metric])
    ) {
      total += o[metric] as number;
      return;
    }
    for (const x of Object.values(o)) walk(x);
  };
  walk(data);
  return total;
}

function deriveStatus(
  metrics: NeonServiceMetrics,
): PollResult<NeonServiceMetrics>["status"] {
  const computeHours =
    metrics.computeUsedHours > 10_000 ? 0 : metrics.computeUsedHours;
  if (metrics.activeBranches >= 12 || computeHours >= 400) {
    return "down";
  }
  if (metrics.activeBranches >= 8 || computeHours >= 200) {
    return "degraded";
  }
  return "healthy";
}

export async function pollHealth(
  credentials: ServiceCredentials,
): Promise<PollResult<NeonServiceMetrics>> {
  const projectId = credentials.neonProjectId?.trim();
  const apiKey = credentials.secret?.trim();

  if (!projectId || !apiKey) {
    return {
      status: "down",
      metrics: {
        service: "neon",
        projectId: projectId ?? "",
        activeBranches: 0,
        computeUsedHours: 0,
        storageBytes: 0,
        lastBackupAt: new Date().toISOString(),
      },
      raw_payload: {
        mock: false,
        error: "missing_credentials",
        detail: "Neon API key and project ID are required",
      },
      response_code: null,
      error_message: "Neon API key and project ID are required",
    };
  }

  try {
    const [branches, orgId] = await Promise.all([
      listAllBranches(projectId, apiKey),
      fetchOrganizationId(projectId, apiKey),
    ]);
    const activeBranches = branches.length;

    const storageBytes = totalStorageBytes(branches);
    const lastBackupAt = latestActivityIso(branches);

    let computeUsedHours = 0;
    let consumptionNote: string | undefined;
    if (orgId) {
      const seconds = await fetchComputeUnitSeconds(projectId, orgId, apiKey);
      if (seconds !== null) {
        computeUsedHours = Math.round((seconds / 3600) * 100) / 100;
      } else {
        consumptionNote =
          "Consumption API returned no data or is unavailable on this plan.";
      }
    } else {
      consumptionNote =
        "Could not resolve organization id; compute hours set to 0.";
    }

    const metrics: NeonServiceMetrics = {
      service: "neon",
      projectId,
      activeBranches,
      computeUsedHours,
      storageBytes,
      lastBackupAt,
    };

    return {
      status: deriveStatus(metrics),
      metrics,
      raw_payload: {
        mock: false,
        source: "neon_console_api",
        branch_count: branches.length,
        ...(consumptionNote ? { consumption_note: consumptionNote } : {}),
      },
      response_code: 200,
      error_message: null,
    };
  } catch (e) {
    let msg = e instanceof Error ? e.message : "Neon API request failed";
    if (/401|unauthorized/i.test(msg)) {
      msg =
        "Neon rejected the API key (401). Create an API key under Neon Console → Account → API keys. Do not use your Postgres connection string or database password.";
    } else if (/404|not\s*found/i.test(msg)) {
      msg =
        "Neon returned 404 for this project ID. Copy the project ID from the Neon Console URL or project settings (e.g. winter-field-12345678).";
    }
    return {
      status: "down",
      metrics: {
        service: "neon",
        projectId,
        activeBranches: 0,
        computeUsedHours: 0,
        storageBytes: 0,
        lastBackupAt: new Date().toISOString(),
      },
      raw_payload: { mock: false, error: true, detail: msg },
      response_code: null,
      error_message: msg,
    };
  }
}
