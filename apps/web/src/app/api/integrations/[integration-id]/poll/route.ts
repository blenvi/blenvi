import { revalidatePath } from "next/cache";

import { verifyUserCanEditIntegration } from "@/lib/db/metrics";
import { pollIntegration } from "@/lib/poll/poll-integration";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(
  request: Request,
  context: { params: Promise<{ "integration-id": string }> },
) {
  const { "integration-id": integrationId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { mode?: unknown };
  const mode = body.mode === "soft" || body.mode === "hard" ? body.mode : null;

  if (!mode) {
    return Response.json(
      { success: false, error: "Poll mode must be soft or hard." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { success: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const canEdit = await verifyUserCanEditIntegration(integrationId, user.id);
  if (!canEdit) {
    return Response.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  const admin = createServiceRoleClient();
  const { data: integration, error: integrationError } = await admin
    .from("integrations")
    .select("id, api_key_enc, service, status, last_checked, project_id")
    .eq("id", integrationId)
    .maybeSingle();

  if (integrationError || !integration) {
    return Response.json(
      { success: false, error: "Integration not found" },
      { status: 404 },
    );
  }

  if (mode === "soft" && integration.last_checked) {
    const elapsedMs = Date.now() - new Date(integration.last_checked).getTime();
    if (elapsedMs < 60_000) {
      return Response.json(
        { success: false, error: "Rate limited. Retry after 60 seconds." },
        { status: 429 },
      );
    }
  }

  if (mode === "hard") {
    const { data: latestSnapshot } = await admin
      .from("neon_snapshots")
      .select("polled_at")
      .eq("integration_id", integrationId)
      .order("polled_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const latestHardPoll = latestSnapshot?.polled_at as string | undefined;
    if (latestHardPoll) {
      const elapsedMs = Date.now() - new Date(latestHardPoll).getTime();
      if (elapsedMs < 60_000) {
        return Response.json(
          { success: false, error: "Rate limited. Retry after 60 seconds." },
          { status: 429 },
        );
      }
    }
  }

  const result = await pollIntegration(
    admin,
    {
      id: integration.id as string,
      service: integration.service as "neon",
      api_key_enc: integration.api_key_enc as string,
    },
    new Date().toISOString(),
    mode,
  );
  const success =
    !result.integrationUpdateFailed &&
    !result.checkInsertFailed &&
    !result.metricsInsertFailed;

  const projectId = integration.project_id as string;
  revalidatePath(`/projects/${projectId}/integrations`, "layout");
  revalidatePath(
    `/projects/${projectId}/integrations/${integrationId}`,
    "page",
  );
  if (integration.service === "neon") {
    revalidatePath(`/projects/${projectId}/integrations/neon`, "layout");
  }

  const statusCode = success ? 200 : 500;
  return Response.json(
    {
      success,
      error: result.errorMessage,
      latency_ms: null,
      mode,
      status: result.status ?? integration.status,
    },
    { status: statusCode },
  );
}
