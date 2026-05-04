import { createClient } from "@/lib/supabase/server";
import type { NeonBranch, NeonOperation, NeonSnapshot } from "@/types/database";

import type { Result } from "./types";

function mapError(message: string) {
  return message || "Something went wrong";
}

function asSnapshot(row: Record<string, unknown>): NeonSnapshot {
  return row as unknown as NeonSnapshot;
}

function asBranch(row: Record<string, unknown>): NeonBranch {
  return row as unknown as NeonBranch;
}

function asOperation(row: Record<string, unknown>): NeonOperation {
  return row as unknown as NeonOperation;
}

export async function getNeonLatestSnapshot(
  integrationId: string,
): Promise<Result<NeonSnapshot | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neon_snapshots")
    .select("*")
    .eq("integration_id", integrationId)
    .order("polled_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return { data: null, error: mapError("Failed to load snapshot") };
  return {
    data: data ? asSnapshot(data as Record<string, unknown>) : null,
    error: null,
  };
}

export async function getNeonSnapshotHistory(
  integrationId: string,
  limit = 48,
): Promise<Result<NeonSnapshot[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neon_snapshots")
    .select("*")
    .eq("integration_id", integrationId)
    .order("polled_at", { ascending: false })
    .limit(limit);
  if (error) {
    return { data: null, error: mapError("Failed to load snapshot history") };
  }
  return {
    data: (data ?? []).map((row) => asSnapshot(row as Record<string, unknown>)),
    error: null,
  };
}

export async function getNeonBranches(
  integrationId: string,
): Promise<Result<NeonBranch[]>> {
  const supabase = await createClient();
  const latest = await getNeonLatestSnapshot(integrationId);
  if (!latest.data?.id) return { data: [], error: null };
  const { data, error } = await supabase
    .from("neon_branches")
    .select("*")
    .eq("integration_id", integrationId)
    .eq("snapshot_id", latest.data.id)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });
  if (error) return { data: null, error: mapError("Failed to load branches") };
  return {
    data: (data ?? []).map((row) => asBranch(row as Record<string, unknown>)),
    error: null,
  };
}

export async function getNeonOperations(
  integrationId: string,
  limit = 50,
): Promise<Result<NeonOperation[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neon_operations")
    .select("*")
    .eq("integration_id", integrationId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error)
    return { data: null, error: mapError("Failed to load operations") };
  return {
    data: (data ?? []).map((row) =>
      asOperation(row as Record<string, unknown>),
    ),
    error: null,
  };
}

export async function getNeonCostForecast(integrationId: string): Promise<
  Result<{
    estimatedMonthlyUsd: number;
    daysRemaining: number;
    dailyRateUsd: number;
    dataPoints: number;
  }>
> {
  const history = await getNeonSnapshotHistory(integrationId, 96);
  if (!history.data) return { data: null, error: history.error };
  const rows = [...history.data].sort(
    (a, b) => new Date(a.polled_at).getTime() - new Date(b.polled_at).getTime(),
  );
  if (rows.length < 2) {
    return {
      data: {
        estimatedMonthlyUsd: 0,
        daysRemaining: 0,
        dailyRateUsd: 0,
        dataPoints: rows.length,
      },
      error: null,
    };
  }

  const first = rows[0];
  const last = rows[rows.length - 1];
  const firstDate = new Date(first.polled_at);
  const lastDate = new Date(last.polled_at);
  const elapsedDays = Math.max(
    1 / 24,
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const deltaSeconds = Math.max(
    0,
    (last.compute_time_seconds ?? 0) - (first.compute_time_seconds ?? 0),
  );
  const dailySeconds = deltaSeconds / elapsedDays;
  const dailyHours = dailySeconds / 3600;
  const dailyRateUsd = dailyHours * 0.16;

  const endOfMonth = new Date(
    Date.UTC(
      lastDate.getUTCFullYear(),
      lastDate.getUTCMonth() + 1,
      0,
      23,
      59,
      59,
    ),
  );
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (endOfMonth.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  const currentCostUsd = ((last.compute_time_seconds ?? 0) / 3600) * 0.16;
  const estimatedMonthlyUsd = currentCostUsd + dailyRateUsd * daysRemaining;

  return {
    data: {
      estimatedMonthlyUsd: Number(estimatedMonthlyUsd.toFixed(2)),
      daysRemaining,
      dailyRateUsd: Number(dailyRateUsd.toFixed(4)),
      dataPoints: rows.length,
    },
    error: null,
  };
}
