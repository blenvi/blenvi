import { TIME_MS } from "@/constants";
import { createClient } from "@/lib/supabase/server";
import type { IntegrationCheck } from "@/types/database";

import type { Result } from "./types";

type LatestFields = Pick<
  IntegrationCheck,
  "status" | "checked_at" | "response_code" | "error_message"
>;

export type IntegrationPollStats = {
  integrationId: string;
  latest: LatestFields | null;
  checksLast24h: number;
  healthyLast24h: number;
  degradedLast24h: number;
  downLast24h: number;
  unknownLast24h: number;
};

function mapError(message: string) {
  return message || "Something went wrong";
}

function emptyStats(integrationId: string): IntegrationPollStats {
  return {
    integrationId,
    latest: null,
    checksLast24h: 0,
    healthyLast24h: 0,
    degradedLast24h: 0,
    downLast24h: 0,
    unknownLast24h: 0,
  };
}

/** Latest check + 24h status breakdown per integration for a project. */
export async function getIntegrationPollStatsForProject(
  integrationIds: string[],
): Promise<Result<Record<string, IntegrationPollStats>>> {
  if (integrationIds.length === 0) {
    return { data: {}, error: null };
  }

  const supabase = await createClient();
  const since = new Date(Date.now() - TIME_MS.day).toISOString();

  const { data: checks24h, error: err24h } = await supabase
    .from("integration_checks")
    .select("integration_id, status, checked_at, response_code, error_message")
    .in("integration_id", integrationIds)
    .gte("checked_at", since);

  if (err24h) {
    return { data: null, error: mapError("Failed to load integration stats") };
  }

  const { data: latestChecks, error: errLatest } = await supabase
    .from("integration_checks")
    .select("integration_id, status, checked_at, response_code, error_message")
    .in("integration_id", integrationIds)
    .order("checked_at", { ascending: false })
    .limit(Math.min(integrationIds.length * 50, 500));

  if (errLatest) {
    return { data: null, error: mapError("Failed to load latest checks") };
  }

  const latestById: Record<string, LatestFields> = {};

  for (const row of latestChecks ?? []) {
    const id = row.integration_id as string;
    if (latestById[id]) continue;
    latestById[id] = {
      status: row.status as LatestFields["status"],
      checked_at: row.checked_at as string,
      response_code: row.response_code as number | null,
      error_message: row.error_message as string | null,
    };
  }

  const out: Record<string, IntegrationPollStats> = {};
  for (const id of integrationIds) {
    out[id] = emptyStats(id);
    const latest = latestById[id];
    if (latest) out[id].latest = latest;
  }

  for (const row of checks24h ?? []) {
    const id = row.integration_id as string;
    if (!out[id]) out[id] = emptyStats(id);
    const entry = out[id];
    entry.checksLast24h += 1;
    switch (row.status) {
      case "healthy":
        entry.healthyLast24h += 1;
        break;
      case "degraded":
        entry.degradedLast24h += 1;
        break;
      case "down":
        entry.downLast24h += 1;
        break;
      default:
        entry.unknownLast24h += 1;
    }
  }

  return { data: out, error: null };
}
