import {
  EXTERNAL_API_BASE_URLS,
  NEON_API_ENDPOINTS,
  POLLING_LIMITS,
} from "@/constants";
import { decryptSecret } from "@/lib/crypto/encryption";
import { parseServiceCredentials } from "@/services/integrations/credentials";
import type { Integration } from "@/types/database";

export type HealthStatus = Integration["status"];

type ServiceCheck = {
  url: string;
  init?: RequestInit;
};

function mapStatus(code: number | null): HealthStatus {
  if (code === null) return "down";
  if (code >= 200 && code < 300) return "healthy";
  if (code === 401 || code === 403 || code === 429) return "degraded";
  return "down";
}

function getNeonControlPlaneCheck(decryptedBlob: string): ServiceCheck {
  const creds = parseServiceCredentials(decryptedBlob);
  return {
    url: `${EXTERNAL_API_BASE_URLS.neonConsole}${NEON_API_ENDPOINTS.projects}`,
    init: { headers: { Authorization: `Bearer ${creds.secret}` } },
  };
}

async function timedFetch(
  input: string,
  init?: RequestInit,
): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    POLLING_LIMITS.healthRequestTimeoutMs,
  );

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetry(check: ServiceCheck): Promise<Response | null> {
  for (
    let attempt = 0;
    attempt <= POLLING_LIMITS.healthMaxRetries;
    attempt += 1
  ) {
    const response = await timedFetch(check.url, check.init);
    if (response?.ok) return response;
    if (attempt === POLLING_LIMITS.healthMaxRetries) return response;
  }
  return null;
}

export async function evaluateIntegrationHealth(integration: {
  service: Integration["service"];
  api_key_enc: string;
}) {
  let status: HealthStatus = "unknown";
  let responseCode: number | null = null;
  let errorMessage: string | null = null;
  let healthCheckFailed = false;

  try {
    const decrypted = decryptSecret(integration.api_key_enc);
    const check = getNeonControlPlaneCheck(decrypted);
    const response = await fetchWithRetry(check);
    responseCode = response?.status ?? null;
    status = mapStatus(response?.status ?? null);
    if (!response) {
      errorMessage = "Network error or request timeout";
      healthCheckFailed = true;
    } else if (!response.ok) {
      errorMessage = `Health check returned HTTP ${response.status}`;
      healthCheckFailed = true;
    }
  } catch {
    status = "down";
    errorMessage = "Failed to decrypt secret or execute integration check";
    healthCheckFailed = true;
  }

  return { status, responseCode, errorMessage, healthCheckFailed };
}

export async function processInBatches<T>(
  items: T[],
  batchSize: number,
  handler: (item: T) => Promise<void>,
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(batch.map((item) => handler(item)));
  }
}
