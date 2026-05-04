import { decryptSecret, encryptSecret } from "@/lib/crypto/encryption";
import { createClient } from "@/lib/supabase/server";
import { parseServiceCredentials } from "@/services/integrations/credentials";
import type { Integration } from "@/types/database";

import type { Result } from "./types";

function mapError(message: string) {
  return message || "Something went wrong";
}

export async function getIntegrationByIdForProject(
  integrationId: string,
  projectId: string,
): Promise<Result<Integration | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("id", integrationId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error)
    return { data: null, error: mapError("Failed to load integration") };
  return { data: (data as Integration | null) ?? null, error: null };
}

export async function getIntegrations(
  projectId: string,
): Promise<Result<Integration[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error)
    return { data: null, error: mapError("Failed to fetch integrations") };
  return { data: (data ?? []) as Integration[], error: null };
}

export async function getIntegrationByService(
  projectId: string,
  service: Integration["service"],
): Promise<Result<Integration | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("project_id", projectId)
    .eq("service", service)
    .maybeSingle();

  if (error) {
    return { data: null, error: mapError("Failed to load integration") };
  }

  return { data: (data as Integration | null) ?? null, error: null };
}

export async function createIntegration(
  projectId: string,
  service: Integration["service"],
  apiKey: string,
): Promise<Result<Integration>> {
  const supabase = await createClient();
  let encryptedApiKey: string;
  try {
    encryptedApiKey = encryptSecret(apiKey);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to encrypt API key";
    return { data: null, error: message };
  }

  const { data, error } = await supabase
    .from("integrations")
    .insert({
      project_id: projectId,
      service,
      api_key_enc: encryptedApiKey,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        data: null,
        error: "Neon is already connected to this project.",
      };
    }
    return { data: null, error: mapError("Failed to create integration") };
  }
  return { data: data as Integration, error: null };
}

/** Decrypts stored credentials and returns Neon project ID for the edit form (server-only). */
export async function getIntegrationNeonProjectIdForEdit(
  integrationId: string,
  projectId: string,
): Promise<Result<{ neonProjectId: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integrations")
    .select("api_key_enc")
    .eq("id", integrationId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error || !data?.api_key_enc) {
    return {
      data: null,
      error: mapError("Failed to load integration"),
    };
  }

  try {
    const decrypted = decryptSecret(data.api_key_enc as string);
    const creds = parseServiceCredentials(decrypted);
    return {
      data: { neonProjectId: creds.neonProjectId?.trim() ?? "" },
      error: null,
    };
  } catch {
    return { data: { neonProjectId: "" }, error: null };
  }
}

export async function updateIntegrationCredentials(
  integrationId: string,
  projectId: string,
  credentialJsonToEncrypt: string,
): Promise<Result<Integration>> {
  const supabase = await createClient();
  let encryptedApiKey: string;
  try {
    encryptedApiKey = encryptSecret(credentialJsonToEncrypt);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to encrypt API key";
    return { data: null, error: message };
  }

  const { data, error } = await supabase
    .from("integrations")
    .update({
      api_key_enc: encryptedApiKey,
    })
    .eq("id", integrationId)
    .eq("project_id", projectId)
    .select("*")
    .single();

  if (error)
    return { data: null, error: mapError("Failed to update integration") };
  return { data: data as Integration, error: null };
}

export async function deleteIntegration(
  id: string,
): Promise<Result<{ id: string }>> {
  const supabase = await createClient();
  const { error } = await supabase.from("integrations").delete().eq("id", id);

  if (error)
    return { data: null, error: mapError("Failed to delete integration") };
  return { data: { id }, error: null };
}
