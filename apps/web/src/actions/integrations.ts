"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  INTEGRATION_SERVICES,
  POLL_MODES,
  ROUTE_PATHS,
  UI_TEXT,
} from "@/constants";
import { decryptSecret } from "@/lib/crypto/encryption";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { neonCredentialsSchema } from "@/lib/validators/integration";
import { neonUpdateSchema } from "@/lib/validators/neon-update";
import {
  createIntegration as createIntegrationDb,
  deleteIntegration as deleteIntegrationDb,
  getIntegrationByIdForProject,
  getIntegrationByService,
  getIntegrations as getIntegrationsDb,
  updateIntegrationCredentials as updateIntegrationCredentialsDb,
} from "@/services/db/integrations";
import { verifyUserCanEditIntegration } from "@/services/db/metrics";
import { parseServiceCredentials } from "@/services/integrations/credentials";
import { validateNeonConsoleCredentials } from "@/services/integrations/neon-input";
import { pollIntegration } from "@/services/poll/poll-integration";
import type { PollMode } from "@/types/api";

function revalidateProjectIntegrationViews(
  projectId: string,
  integrationId?: string,
) {
  revalidateTag("integrations", "max");
  revalidatePath(ROUTE_PATHS.project(projectId));
  revalidatePath(ROUTE_PATHS.projectIntegrations(projectId));
  revalidatePath(ROUTE_PATHS.neonIntegration(projectId), "layout");

  if (integrationId) {
    revalidatePath(
      ROUTE_PATHS.projectIntegration(projectId, integrationId),
      "page",
    );
  }
}

export async function getIntegrationsAction(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: UI_TEXT.auth.notAuthenticated };
  return getIntegrationsDb(projectId);
}

export type CreateNeonCredentials = {
  apiKey?: string;
  projectId?: string;
};

export async function createIntegrationAction(
  projectId: string,
  credentials: CreateNeonCredentials,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: UI_TEXT.auth.notAuthenticated };

  const existing = await getIntegrationByService(
    projectId,
    INTEGRATION_SERVICES.neon,
  );
  if (existing.error) {
    return { data: null, error: existing.error };
  }
  if (existing.data) {
    return {
      data: null,
      error: UI_TEXT.neon.alreadyConnected,
    };
  }

  const parsed = neonCredentialsSchema.safeParse({
    apiKey: credentials.apiKey ?? "",
    projectId: credentials.projectId ?? "",
  });
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const keyToEncrypt = JSON.stringify({
    apiKey: parsed.data.apiKey,
    projectId: parsed.data.projectId,
  });

  const result = await createIntegrationDb(
    projectId,
    INTEGRATION_SERVICES.neon,
    keyToEncrypt,
  );
  if (!result.error) {
    revalidateProjectIntegrationViews(projectId);
  }
  return result;
}

export type UpdateNeonCredentials = {
  neonApiKey?: string;
  neonProjectId?: string;
};

export async function updateIntegrationCredentialsAction(
  integrationId: string,
  projectId: string,
  credentials: UpdateNeonCredentials,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: UI_TEXT.auth.notAuthenticated };

  const canEdit = await verifyUserCanEditIntegration(integrationId, user.id);
  if (!canEdit) return { data: null, error: UI_TEXT.auth.forbidden };

  const parsed = neonUpdateSchema.safeParse(credentials);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { data: null, error: first?.message ?? "Invalid input" };
  }

  const { neonApiKey, neonProjectId } = parsed.data;
  const secretInput = neonApiKey.trim();
  const neonProjectIdTrim = neonProjectId.trim();

  const existing = await getIntegrationByIdForProject(integrationId, projectId);
  if (!existing.data) {
    return { data: null, error: "Integration not found" };
  }

  let secret = secretInput;
  if (!secret) {
    try {
      const decrypted = decryptSecret(existing.data.api_key_enc);
      const creds = parseServiceCredentials(decrypted);
      secret = creds.secret;
      if (!secret) {
        return {
          data: null,
          error: "Enter a Neon API key to finish connecting this integration.",
        };
      }
    } catch {
      return {
        data: null,
        error: UI_TEXT.neon.credentialsReadFailed,
      };
    }
  }

  const neonErr = validateNeonConsoleCredentials(secret, neonProjectIdTrim);
  if (neonErr) {
    return { data: null, error: neonErr };
  }

  const keyToEncrypt = JSON.stringify({
    v: 1 as const,
    secret,
    neonProjectId: neonProjectIdTrim,
  });

  const result = await updateIntegrationCredentialsDb(
    integrationId,
    projectId,
    keyToEncrypt,
  );

  if (!result.error) {
    revalidateProjectIntegrationViews(projectId, integrationId);
  }

  return result;
}

export async function pollIntegrationAction(
  integrationId: string,
  projectId: string,
  mode: PollMode = POLL_MODES.hard,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return { ok: false as const, error: UI_TEXT.auth.notAuthenticated };

  const canEdit = await verifyUserCanEditIntegration(integrationId, user.id);
  if (!canEdit) return { ok: false as const, error: UI_TEXT.auth.forbidden };

  const admin = createServiceRoleClient();
  const { data: row, error: rowError } = await admin
    .from("integrations")
    .select("id, service, api_key_enc")
    .eq("id", integrationId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (rowError || !row) {
    return { ok: false as const, error: "Integration not found" };
  }

  const nowIso = new Date().toISOString();
  const pollResult = await pollIntegration(admin, row, nowIso, mode);

  revalidateTag("integrations", "max");
  revalidatePath(ROUTE_PATHS.project(projectId), "layout");
  revalidatePath(ROUTE_PATHS.projectIntegrations(projectId), "layout");
  revalidatePath(
    ROUTE_PATHS.projectIntegration(projectId, integrationId),
    "page",
  );
  if (row.service === INTEGRATION_SERVICES.neon) {
    revalidatePath(ROUTE_PATHS.neonIntegration(projectId), "layout");
  }

  if (mode === POLL_MODES.hard && pollResult.metricsInsertFailed) {
    return {
      ok: false as const,
      error:
        pollResult.errorMessage ??
        "Could not save metrics to history. Check database permissions and Supabase logs.",
    };
  }

  return { ok: true as const };
}

export async function deleteIntegrationAction(id: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: UI_TEXT.auth.notAuthenticated };

  const result = await deleteIntegrationDb(id);
  if (!result.error) {
    revalidateProjectIntegrationViews(projectId);
  }
  return result;
}
