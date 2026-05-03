"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { decryptSecret } from "@/lib/crypto/encryption";
import {
  createIntegration as createIntegrationDb,
  deleteIntegration as deleteIntegrationDb,
  getIntegrationByIdForProject,
  getIntegrationByService,
  getIntegrations as getIntegrationsDb,
  updateIntegrationCredentials as updateIntegrationCredentialsDb,
} from "@/lib/db/integrations";
import { verifyUserCanEditIntegration } from "@/lib/db/metrics";
import { pollIntegration } from "@/lib/poll/poll-integration";
import { parseServiceCredentials } from "@/lib/services/credentials";
import { validateNeonConsoleCredentials } from "@/lib/services/neon-input";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { neonCredentialsSchema } from "@/lib/validations/integration";
import { neonUpdateSchema } from "@/lib/validations/neon-update";

export async function getIntegrationsAction(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };
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

  if (!user) return { data: null, error: "Not authenticated" };

  const existing = await getIntegrationByService(projectId, "neon");
  if (existing.error) {
    return { data: null, error: existing.error };
  }
  if (existing.data) {
    return {
      data: null,
      error: "Neon is already connected to this project.",
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

  const result = await createIntegrationDb(projectId, "neon", keyToEncrypt);
  if (!result.error) {
    revalidateTag("integrations", "max");
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/integrations`);
    revalidatePath(`/projects/${projectId}/integrations/neon`, "layout");
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

  if (!user) return { data: null, error: "Not authenticated" };

  const canEdit = await verifyUserCanEditIntegration(integrationId, user.id);
  if (!canEdit) return { data: null, error: "Forbidden" };

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
        error: "Stored credentials could not be read. Enter a new API key.",
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
    revalidateTag("integrations", "max");
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/integrations`);
    revalidatePath(
      `/projects/${projectId}/integrations/${integrationId}`,
      "page",
    );
    revalidatePath(`/projects/${projectId}/integrations/neon`, "layout");
  }

  return result;
}

export async function pollIntegrationAction(
  integrationId: string,
  projectId: string,
  mode: "soft" | "hard" = "hard",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, error: "Not authenticated" };

  const canEdit = await verifyUserCanEditIntegration(integrationId, user.id);
  if (!canEdit) return { ok: false as const, error: "Forbidden" };

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
  revalidatePath(`/projects/${projectId}`, "layout");
  revalidatePath(`/projects/${projectId}/integrations`, "layout");
  revalidatePath(
    `/projects/${projectId}/integrations/${integrationId}`,
    "page",
  );
  if (row.service === "neon") {
    revalidatePath(`/projects/${projectId}/integrations/neon`, "layout");
  }

  if (mode === "hard" && pollResult.metricsInsertFailed) {
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

  if (!user) return { data: null, error: "Not authenticated" };

  const result = await deleteIntegrationDb(id);
  if (!result.error) {
    revalidateTag("integrations", "max");
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/integrations`);
    revalidatePath(`/projects/${projectId}/integrations/neon`, "layout");
  }
  return result;
}
