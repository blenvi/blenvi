import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { decryptSecret } from "@/lib/crypto/encryption";
import {
  type NeonPollMode,
  pollNeonHealthCheck,
  pollNeonIntegration,
} from "@/lib/neon/poll";
import { parseServiceCredentials } from "@/lib/services/credentials";
import { pollHealth as pollNeonHealth } from "@/lib/services/neon-service";
import type { Integration } from "@/types/database";

export type PollIntegrationResult = {
  status: Integration["status"];
  responseCode: number | null;
  errorMessage: string | null;
  healthCheckFailed: boolean;
  integrationUpdateFailed: boolean;
  checkInsertFailed: boolean;
  metricsInsertFailed: boolean;
};

/** Row shape needed to poll an integration from cron or manual refresh. */
export type IntegrationPollRow = Pick<
  Integration,
  "id" | "service" | "api_key_enc"
>;

export type LiveUsageResult = {
  integrationId: string;
  metrics: Awaited<ReturnType<typeof pollNeonHealth>>["metrics"] | null;
  status: Integration["status"];
  error: string | null;
  latencyMs: number;
  simulated: boolean;
};

export async function fetchLiveUsageForIntegration(
  integration: IntegrationPollRow,
): Promise<LiveUsageResult> {
  const startedAt = performance.now();
  try {
    if (integration.service !== "neon") {
      throw new Error(
        `Unsupported integration service: ${integration.service}`,
      );
    }
    const decrypted = decryptSecret(integration.api_key_enc);
    const credentials = parseServiceCredentials(decrypted);
    const result = await pollNeonHealth(credentials);
    const raw = result.raw_payload;
    const simulated =
      Boolean(raw) &&
      typeof raw === "object" &&
      (raw as { mock?: boolean }).mock === true;

    return {
      integrationId: integration.id,
      metrics: result.metrics,
      status: result.status,
      error: result.error_message ?? null,
      latencyMs: Math.round(performance.now() - startedAt),
      simulated,
    };
  } catch (error) {
    return {
      integrationId: integration.id,
      metrics: null,
      status: "down",
      error: error instanceof Error ? error.message : "Live usage fetch failed",
      latencyMs: Math.round(performance.now() - startedAt),
      simulated: false,
    };
  }
}

export async function fetchLiveUsageForIntegrations(
  integrations: IntegrationPollRow[],
): Promise<Map<string, LiveUsageResult>> {
  const results = await Promise.all(
    integrations.map((integration) =>
      fetchLiveUsageForIntegration(integration),
    ),
  );
  return new Map(results.map((result) => [result.integrationId, result]));
}

async function markDown(
  supabase: SupabaseClient,
  integrationId: string,
  nowIso: string,
  errorMessage: string,
): Promise<PollIntegrationResult> {
  const { error: updateError } = await supabase
    .from("integrations")
    .update({ status: "down", last_checked: nowIso })
    .eq("id", integrationId);

  const { error: checkError } = await supabase
    .from("integration_checks")
    .insert({
      integration_id: integrationId,
      status: "down",
      response_code: null,
      error_message: errorMessage,
      checked_at: nowIso,
    });

  return {
    status: "down",
    responseCode: null,
    errorMessage,
    healthCheckFailed: true,
    integrationUpdateFailed: Boolean(updateError),
    checkInsertFailed: Boolean(checkError),
    metricsInsertFailed: false,
  };
}

export async function pollIntegration(
  supabase: SupabaseClient,
  integration: IntegrationPollRow,
  nowIso: string,
  mode: NeonPollMode = "hard",
): Promise<PollIntegrationResult> {
  if (integration.service !== "neon") {
    return markDown(
      supabase,
      integration.id,
      nowIso,
      `Unsupported integration service: ${integration.service}`,
    );
  }

  let apiKey = "";
  let projectId = "";
  try {
    const decrypted = decryptSecret(integration.api_key_enc);
    const credentials = parseServiceCredentials(decrypted);
    apiKey = credentials.secret.trim();
    projectId = credentials.neonProjectId?.trim() ?? "";
  } catch {
    return markDown(
      supabase,
      integration.id,
      nowIso,
      "Failed to decrypt Neon credentials",
    );
  }

  if (!apiKey || !projectId) {
    return markDown(
      supabase,
      integration.id,
      nowIso,
      "Neon API key and project ID are required",
    );
  }

  if (mode === "soft") {
    const result = await pollNeonHealthCheck(
      supabase,
      integration.id,
      { apiKey, projectId },
      nowIso,
    );

    return {
      status: result.status,
      responseCode: result.responseCode,
      errorMessage: result.errorMessage,
      healthCheckFailed:
        result.status !== "healthy" || Boolean(result.errorMessage),
      integrationUpdateFailed: result.integrationUpdateFailed,
      checkInsertFailed: result.checkInsertFailed,
      metricsInsertFailed: false,
    };
  }

  const result = await pollNeonIntegration(integration.id, {
    apiKey,
    projectId,
  });

  return {
    status: result.status ?? "unknown",
    responseCode: result.success ? 200 : null,
    errorMessage: result.error ?? null,
    healthCheckFailed: !result.success || result.status !== "healthy",
    integrationUpdateFailed: result.integrationUpdateFailed ?? false,
    checkInsertFailed: result.checkInsertFailed ?? false,
    metricsInsertFailed: result.snapshotInsertFailed ?? false,
  };
}
