import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { decryptSecret } from "@/lib/crypto/encryption";
import {
  type NeonPollMode,
  pollNeonHealthCheck,
  pollNeonIntegration,
} from "@/lib/neon/poll";
import { parseServiceCredentials } from "@/services/integrations/credentials";
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
