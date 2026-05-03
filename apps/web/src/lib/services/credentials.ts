import type { IntegrationCredentialV1 } from "@/types/database";

export type ServiceCredentials = {
  secret: string;
  neonProjectId?: string;
};

export function parseServiceCredentials(decrypted: string): ServiceCredentials {
  const trimmed = decrypted.trim();
  if (trimmed.startsWith("{")) {
    try {
      const raw = JSON.parse(trimmed) as unknown;
      if (
        raw &&
        typeof raw === "object" &&
        (("secret" in raw &&
          typeof (raw as { secret: unknown }).secret === "string") ||
          ("apiKey" in raw &&
            typeof (raw as { apiKey: unknown }).apiKey === "string"))
      ) {
        const o = raw as IntegrationCredentialV1 & {
          apiKey?: string;
          projectId?: string;
        };
        return {
          secret: o.secret ?? o.apiKey ?? "",
          neonProjectId: o.neonProjectId ?? o.projectId,
        };
      }
    } catch {
      // legacy plain secret
    }
  }
  return { secret: decrypted };
}
