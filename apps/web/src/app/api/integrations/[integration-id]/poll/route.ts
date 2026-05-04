import { revalidatePath } from "next/cache";
import { POLL_MODES, POLLING_LIMITS, ROUTE_PATHS, UI_TEXT } from "@/constants";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { verifyUserCanEditIntegration } from "@/services/db/metrics";
import {
  type IntegrationPollRow,
  pollIntegration,
} from "@/services/poll/poll-integration";
import type { PollMode } from "@/types/api";
import type { Integration } from "@/types/database";

type IntegrationRouteRow = IntegrationPollRow &
  Pick<Integration, "status" | "last_checked" | "project_id">;

type ServiceRoleClient = ReturnType<typeof createServiceRoleClient>;

function jsonError(error: string, status: number) {
  return Response.json({ success: false, error }, { status });
}

function isPollMode(value: unknown): value is PollMode {
  return value === POLL_MODES.soft || value === POLL_MODES.hard;
}

async function readPollMode(request: Request): Promise<PollMode | null> {
  const body = (await request.json().catch(() => ({}))) as { mode?: unknown };
  return isPollMode(body.mode) ? body.mode : null;
}

function isWithinManualPollCooldown(polledAt: string | null | undefined) {
  if (!polledAt) return false;
  const elapsedMs = Date.now() - new Date(polledAt).getTime();
  return elapsedMs < POLLING_LIMITS.manualPollCooldownMs;
}

async function getIntegrationRow(
  admin: ServiceRoleClient,
  integrationId: string,
): Promise<IntegrationRouteRow | null> {
  const { data, error } = await admin
    .from("integrations")
    .select("id, api_key_enc, service, status, last_checked, project_id")
    .eq("id", integrationId)
    .maybeSingle();

  if (error || !data) return null;
  return data as IntegrationRouteRow;
}

async function getLatestHardPollAt(
  admin: ServiceRoleClient,
  integrationId: string,
): Promise<string | null> {
  const { data } = await admin
    .from("neon_snapshots")
    .select("polled_at")
    .eq("integration_id", integrationId)
    .order("polled_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return typeof data?.polled_at === "string" ? data.polled_at : null;
}

async function isRateLimited(
  admin: ServiceRoleClient,
  integration: IntegrationRouteRow,
  mode: PollMode,
): Promise<boolean> {
  if (mode === POLL_MODES.soft) {
    return isWithinManualPollCooldown(integration.last_checked);
  }

  const latestHardPollAt = await getLatestHardPollAt(admin, integration.id);
  return isWithinManualPollCooldown(latestHardPollAt);
}

function revalidatePollViews(projectId: string, integrationId: string) {
  revalidatePath(ROUTE_PATHS.projectIntegrations(projectId), "layout");
  revalidatePath(
    ROUTE_PATHS.projectIntegration(projectId, integrationId),
    "page",
  );
  revalidatePath(ROUTE_PATHS.neonIntegration(projectId), "layout");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ "integration-id": string }> },
) {
  const { "integration-id": integrationId } = await context.params;
  const mode = await readPollMode(request);

  if (!mode) {
    return jsonError(UI_TEXT.neon.invalidPollMode, 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError(UI_TEXT.auth.notAuthenticated, 401);
  }

  const canEdit = await verifyUserCanEditIntegration(integrationId, user.id);
  if (!canEdit) {
    return jsonError(UI_TEXT.auth.forbidden, 403);
  }

  const admin = createServiceRoleClient();
  const integration = await getIntegrationRow(admin, integrationId);

  if (!integration) {
    return jsonError("Integration not found", 404);
  }

  if (await isRateLimited(admin, integration, mode)) {
    return jsonError(UI_TEXT.polling.rateLimited, 429);
  }

  const result = await pollIntegration(
    admin,
    {
      id: integration.id,
      service: integration.service,
      api_key_enc: integration.api_key_enc,
    },
    new Date().toISOString(),
    mode,
  );
  const success =
    !result.integrationUpdateFailed &&
    !result.checkInsertFailed &&
    !result.metricsInsertFailed;

  revalidatePollViews(integration.project_id, integrationId);

  return Response.json(
    {
      success,
      error: result.errorMessage,
      latency_ms: null,
      mode,
      status: result.status ?? integration.status,
    },
    { status: success ? 200 : 500 },
  );
}
