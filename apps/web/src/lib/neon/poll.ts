import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getBranches,
  getConsumption,
  getEndpoints,
  getOperations,
  getProject,
  NeonApiError,
} from "@/lib/neon/api-client";
import type {
  NeonApiBranch,
  NeonApiEndpoint,
  NeonApiOperation,
  NeonApiProject,
} from "@/lib/neon/api-types";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  Integration,
  NeonCredentials,
  NeonEndpointState,
} from "@/types/database";

type PollResult = {
  success: boolean;
  error?: string;
  status?: Integration["status"];
  latencyMs?: number;
  checkInsertFailed?: boolean;
  integrationUpdateFailed?: boolean;
  snapshotInsertFailed?: boolean;
};

export type NeonPollMode = "hard" | "soft";

type SoftPollResult = {
  status: Integration["status"];
  responseCode: number | null;
  errorMessage: string | null;
  latencyMs: number;
  integrationUpdateFailed: boolean;
  checkInsertFailed: boolean;
};

type Settled<T> = PromiseSettledResult<T>;

function mapEndpointState(endpoint: NeonApiEndpoint | null): NeonEndpointState {
  if (!endpoint) return "unknown";
  if (endpoint.current_state === "active") return "active";
  if (endpoint.current_state === "idle") return "suspended";
  if (endpoint.current_state === "stopped") return "provisioning";
  return "unknown";
}

function sumConsumption(
  periods: Array<{
    consumption: {
      compute_time_seconds: number;
      active_time_seconds: number;
      cpu_used_sec: number;
      data_storage_bytes_hour: number;
      data_transfer_bytes: number;
      written_data_bytes: number;
    };
  }>,
) {
  return periods.reduce(
    (acc, p) => {
      acc.compute_time_seconds += p.consumption.compute_time_seconds ?? 0;
      acc.active_time_seconds += p.consumption.active_time_seconds ?? 0;
      acc.cpu_used_sec += p.consumption.cpu_used_sec ?? 0;
      acc.data_storage_bytes_hour += p.consumption.data_storage_bytes_hour ?? 0;
      acc.data_transfer_bytes += p.consumption.data_transfer_bytes ?? 0;
      acc.written_data_bytes += p.consumption.written_data_bytes ?? 0;
      return acc;
    },
    {
      compute_time_seconds: 0,
      active_time_seconds: 0,
      cpu_used_sec: 0,
      data_storage_bytes_hour: 0,
      data_transfer_bytes: 0,
      written_data_bytes: 0,
    },
  );
}

function deriveStatus(
  results: {
    project: Settled<NeonApiProject>;
    endpoints: Settled<NeonApiEndpoint[]>;
    consumption: Settled<Awaited<ReturnType<typeof getConsumption>>>;
    branches: Settled<NeonApiBranch[]>;
    operations: Settled<NeonApiOperation[]>;
  },
  endpointState: NeonEndpointState,
): Integration["status"] {
  const entries = Object.values(results);
  const failedCount = entries.filter((r) => r.status === "rejected").length;
  const allFailed = failedCount === entries.length;
  if (allFailed) return "down";

  const projectErr =
    results.project.status === "rejected" ? results.project.reason : null;
  if (projectErr instanceof NeonApiError && projectErr.status === 404) {
    return "down";
  }

  if (failedCount > 0) return "degraded";
  if (endpointState === "provisioning") return "degraded";
  if (endpointState === "active" || endpointState === "suspended") {
    return "healthy";
  }
  return "unknown";
}

function errorStatus(reason: unknown): number | null {
  return reason instanceof NeonApiError ? reason.status : null;
}

function deriveSoftStatus(
  project: Settled<NeonApiProject>,
  endpoints: Settled<NeonApiEndpoint[]>,
  endpointState: NeonEndpointState,
): Integration["status"] {
  if (project.status === "rejected") {
    const status = errorStatus(project.reason);
    if (status === 401 || status === 403 || status === 404) return "down";
  }
  if (project.status === "rejected" && endpoints.status === "rejected") {
    return "down";
  }
  if (project.status === "rejected" || endpoints.status === "rejected") {
    return "degraded";
  }
  if (endpointState === "provisioning") return "degraded";
  if (endpointState === "active" || endpointState === "suspended") {
    return "healthy";
  }
  return "unknown";
}

function firstErrorMessage(...results: Settled<unknown>[]): string | null {
  const failed = results.find((result) => result.status === "rejected");
  if (!failed || failed.status !== "rejected") return null;
  const reason = failed.reason;
  if (reason instanceof Error) return reason.message;
  return "Neon health check failed";
}

function firstResponseCode(...results: Settled<unknown>[]): number | null {
  for (const result of results) {
    if (result.status === "rejected") {
      const status = errorStatus(result.reason);
      if (status !== null) return status;
    }
  }
  return results.some((result) => result.status === "fulfilled") ? 200 : null;
}

async function pruneSnapshots(admin: SupabaseClient, integrationId: string) {
  const { data: keep } = await admin
    .from("neon_snapshots")
    .select("id")
    .eq("integration_id", integrationId)
    .order("polled_at", { ascending: false })
    .limit(288);
  const keepIds = (keep ?? []).map((r) => r.id as string);
  if (keepIds.length === 0) return;
  await admin
    .from("neon_snapshots")
    .delete()
    .eq("integration_id", integrationId)
    .not("id", "in", `(${keepIds.map((id) => `"${id}"`).join(",")})`);
}

export async function pollNeonIntegration(
  integrationId: string,
  creds: NeonCredentials,
): Promise<PollResult> {
  const admin = createServiceRoleClient();
  const startedAt = Date.now();
  const polledAt = new Date().toISOString();

  const [project, endpoints, consumption, branches, operations] =
    await Promise.allSettled([
      getProject(creds),
      getEndpoints(creds),
      getConsumption(creds),
      getBranches(creds),
      getOperations(creds),
    ]);

  const firstEndpoint =
    endpoints.status === "fulfilled" ? (endpoints.value[0] ?? null) : null;
  const endpointState = mapEndpointState(firstEndpoint);
  const latencyMs = Date.now() - startedAt;

  const status = deriveStatus(
    { project, endpoints, consumption, branches, operations },
    endpointState,
  );

  const allFailed =
    project.status === "rejected" &&
    endpoints.status === "rejected" &&
    consumption.status === "rejected" &&
    branches.status === "rejected" &&
    operations.status === "rejected";

  const consumptionSums =
    consumption.status === "fulfilled" && consumption.value
      ? sumConsumption(consumption.value.periods ?? [])
      : {
          compute_time_seconds: 0,
          active_time_seconds: 0,
          cpu_used_sec: 0,
          data_storage_bytes_hour: 0,
          data_transfer_bytes: 0,
          written_data_bytes: 0,
        };

  const branchRows = branches.status === "fulfilled" ? branches.value : [];
  const operationRows =
    operations.status === "fulfilled" ? operations.value.slice(0, 50) : [];

  const rawPayload = {
    project:
      project.status === "fulfilled"
        ? project.value
        : { error: String(project.reason) },
    endpoints:
      endpoints.status === "fulfilled"
        ? endpoints.value
        : { error: String(endpoints.reason) },
    consumption:
      consumption.status === "fulfilled"
        ? consumption.value
        : { error: String(consumption.reason) },
    branches:
      branches.status === "fulfilled"
        ? branchRows
        : { error: String(branches.reason) },
    operations:
      operations.status === "fulfilled"
        ? operationRows
        : { error: String(operations.reason) },
  } satisfies Record<string, unknown>;

  const { data: snapshot, error: snapshotErr } = await admin
    .from("neon_snapshots")
    .insert({
      integration_id: integrationId,
      polled_at: polledAt,
      endpoint_state: endpointState,
      endpoint_count:
        endpoints.status === "fulfilled" ? endpoints.value.length : 0,
      autosuspend_delay_s:
        firstEndpoint?.settings?.autosuspend_duration_seconds ?? null,
      last_active_at: firstEndpoint?.last_active ?? null,
      compute_time_seconds: consumptionSums.compute_time_seconds,
      active_time_seconds: consumptionSums.active_time_seconds,
      cpu_used_sec: consumptionSums.cpu_used_sec,
      data_storage_bytes_hour: consumptionSums.data_storage_bytes_hour,
      data_transfer_bytes: consumptionSums.data_transfer_bytes,
      written_data_bytes: consumptionSums.written_data_bytes,
      branch_count: branchRows.length,
      main_branch_id: branchRows.find((b) => b.default)?.id ?? null,
      latency_ms: latencyMs,
      raw_payload: rawPayload,
    })
    .select("id")
    .single();

  const snapshotInsertFailed = Boolean(snapshotErr || !snapshot?.id);
  const snapshotId = snapshot?.id as string | undefined;

  // Keep a snapshot-scoped branch set by replacing rows for this integration.
  if (snapshotId && branchRows.length > 0) {
    await admin
      .from("neon_branches")
      .delete()
      .eq("integration_id", integrationId);
    await admin.from("neon_branches").insert(
      branchRows.map((b) => {
        const endpoint =
          firstEndpoint?.branch_id === b.id ? firstEndpoint : null;
        const computeState =
          endpoint?.current_state === "active"
            ? "active"
            : endpoint?.current_state === "idle"
              ? "suspended"
              : null;
        return {
          snapshot_id: snapshotId,
          integration_id: integrationId,
          neon_branch_id: b.id,
          name: b.name,
          parent_id: b.parent_id,
          is_default: b.default,
          state: b.current_state,
          compute_state: computeState,
          created_at_neon: b.created_at,
          last_reset_at: null,
          logical_size_bytes: b.logical_size,
        };
      }),
    );
  }

  if (operationRows.length > 0) {
    await admin.from("neon_operations").upsert(
      operationRows.map((op) => {
        const started = new Date(op.created_at).getTime();
        const finished = new Date(op.updated_at).getTime();
        const durationMs =
          Number.isFinite(started) && Number.isFinite(finished)
            ? Math.max(0, finished - started)
            : null;
        return {
          integration_id: integrationId,
          neon_operation_id: op.id,
          action: op.action,
          status: op.status,
          branch_id: op.branch_id,
          endpoint_id: op.endpoint_id,
          error: op.error ?? null,
          started_at: op.created_at,
          finished_at:
            op.status === "finished" || op.status === "failed"
              ? op.updated_at
              : null,
          duration_ms: durationMs,
        };
      }),
      { onConflict: "neon_operation_id" },
    );
  }

  if (snapshotId) {
    await pruneSnapshots(admin, integrationId);
  }

  const { error: updateError } = await admin
    .from("integrations")
    .update({ status, last_checked: polledAt })
    .eq("id", integrationId);

  const message =
    snapshotErr?.message ?? (allFailed ? "All Neon API calls failed" : null);
  const { error: checkError } = await admin.from("integration_checks").insert({
    integration_id: integrationId,
    status,
    response_code: allFailed ? null : 200,
    error_message: message,
    checked_at: polledAt,
  });

  const integrationUpdateFailed = Boolean(updateError);
  const checkInsertFailed = Boolean(checkError);

  if (allFailed || snapshotInsertFailed || integrationUpdateFailed) {
    return {
      success: false,
      error:
        message ??
        updateError?.message ??
        checkError?.message ??
        "Neon poll failed",
      status,
      latencyMs,
      checkInsertFailed,
      integrationUpdateFailed,
      snapshotInsertFailed,
    };
  }
  return {
    success: true,
    status,
    latencyMs,
    checkInsertFailed,
    integrationUpdateFailed,
    snapshotInsertFailed,
  };
}

export async function pollNeonHealthCheck(
  supabase: SupabaseClient,
  integrationId: string,
  creds: NeonCredentials,
  nowIso: string,
): Promise<SoftPollResult> {
  const startedAt = Date.now();
  const [project, endpoints] = await Promise.allSettled([
    getProject(creds),
    getEndpoints(creds),
  ]);
  const firstEndpoint =
    endpoints.status === "fulfilled" ? (endpoints.value[0] ?? null) : null;
  const endpointState = mapEndpointState(firstEndpoint);
  const latencyMs = Date.now() - startedAt;
  const status = deriveSoftStatus(project, endpoints, endpointState);
  const responseCode = firstResponseCode(project, endpoints);
  const errorMessage = firstErrorMessage(project, endpoints);

  const { error: updateError } = await supabase
    .from("integrations")
    .update({ status, last_checked: nowIso })
    .eq("id", integrationId);

  const { error: checkError } = await supabase
    .from("integration_checks")
    .insert({
      integration_id: integrationId,
      status,
      response_code: responseCode,
      error_message: errorMessage,
      checked_at: nowIso,
    });

  return {
    status,
    responseCode,
    errorMessage,
    latencyMs,
    integrationUpdateFailed: Boolean(updateError),
    checkInsertFailed: Boolean(checkError),
  };
}
