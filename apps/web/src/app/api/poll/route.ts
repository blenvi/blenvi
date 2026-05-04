import "server-only";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

import { processInBatches } from "@/services/poll/health";
import { pollIntegration } from "@/services/poll/poll-integration";

const POLL_LOCK_KEY = 962341;
const POLL_BATCH_SIZE = 5;

function getCronToken(headerStore: Headers) {
  const authHeader = headerStore.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return headerStore.get("x-cron-secret");
}

function pollIntervalMs(minutes: number | null | undefined) {
  const m = minutes ?? 5;
  return Math.max(1, m) * 60 * 1000;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { ok: false, error: "Missing Supabase service role configuration" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const headerStore = await headers();
    const incomingToken = getCronToken(headerStore);
    if (!incomingToken || incomingToken !== cronSecret) {
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  const { data: lockData, error: lockError } = await supabase.rpc(
    "acquire_poll_lock",
    { lock_key: POLL_LOCK_KEY },
  );
  const hasLock = lockData === true;

  if (lockError || !hasLock) {
    return Response.json({
      ok: true,
      skipped: true,
      reason: "poll_already_running",
    });
  }

  try {
    // Use * so this works before the poll-interval migration is applied
    // (selecting missing columns makes PostgREST return 400 + PGRST errors).
    const { data: workspaceRows, error: wsError } = await supabase
      .from("workspaces")
      .select("*");

    if (wsError) {
      return Response.json(
        {
          ok: false,
          error: "Failed to load workspaces",
          detail: wsError.message,
          hint: "If detail mentions a missing column, run apps/web/supabase/migrations SQL on your database.",
        },
        { status: 500 },
      );
    }

    const nowMs = Date.now();
    const workspaces = workspaceRows ?? [];
    const dueWorkspaces = workspaces.filter((w) => {
      const row = w as {
        last_health_poll_at: string | null;
        poll_interval_minutes?: number | null;
      };
      if (!row.last_health_poll_at) return true;
      const elapsed = nowMs - new Date(row.last_health_poll_at).getTime();
      return elapsed >= pollIntervalMs(row.poll_interval_minutes ?? undefined);
    });

    let totalIntegrations = 0;
    let updated = 0;
    let logged = 0;
    let updateFailures = 0;
    let logFailures = 0;
    let healthFailures = 0;
    let processingFailures = 0;
    const nowIso = new Date().toISOString();

    for (const workspace of dueWorkspaces) {
      const ws = workspace as { id: string };
      const { data: projects, error: projError } = await supabase
        .from("projects")
        .select("id")
        .eq("workspace_id", ws.id);

      if (projError) {
        processingFailures += 1;
        continue;
      }

      const projectIds = (projects ?? []).map((p) => p.id);
      if (projectIds.length === 0) {
        await supabase
          .from("workspaces")
          .update({ last_health_poll_at: nowIso })
          .eq("id", ws.id);
        continue;
      }

      const { data: integrations, error: intError } = await supabase
        .from("integrations")
        .select("id, service, api_key_enc")
        .in("project_id", projectIds);

      if (intError) {
        processingFailures += 1;
        continue;
      }

      const list = integrations ?? [];
      if (list.length === 0) {
        await supabase
          .from("workspaces")
          .update({ last_health_poll_at: nowIso })
          .eq("id", ws.id);
        continue;
      }

      totalIntegrations += list.length;

      await processInBatches(list, POLL_BATCH_SIZE, async (integration) => {
        try {
          const {
            healthCheckFailed,
            integrationUpdateFailed,
            checkInsertFailed,
            metricsInsertFailed,
          } = await pollIntegration(supabase, integration, nowIso, "soft");
          if (healthCheckFailed) healthFailures += 1;
          if (integrationUpdateFailed || metricsInsertFailed) {
            updateFailures += 1;
          } else {
            updated += 1;
          }
          if (checkInsertFailed) {
            logFailures += 1;
          } else {
            logged += 1;
          }
        } catch {
          processingFailures += 1;
        }
      });

      await supabase
        .from("workspaces")
        .update({ last_health_poll_at: nowIso })
        .eq("id", ws.id);
    }

    return Response.json({
      ok: true,
      workspacesDue: dueWorkspaces.length,
      checked: totalIntegrations,
      updated,
      logged,
      updateFailures,
      logFailures,
      healthFailures,
      processingFailures,
    });
  } finally {
    await supabase.rpc("release_poll_lock", { lock_key: POLL_LOCK_KEY });
  }
}
