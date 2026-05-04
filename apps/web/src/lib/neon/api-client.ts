import {
  EXTERNAL_API_BASE_URLS,
  NEON_API_ENDPOINTS,
  POLLING_LIMITS,
} from "@/constants";
import type { NeonCredentials } from "@/types/database";

import type {
  NeonApiBranch,
  NeonApiConsumption,
  NeonApiEndpoint,
  NeonApiOperation,
  NeonApiProject,
  NeonBranchesResponse,
  NeonConsumptionHistoryResponse,
  NeonEndpointsResponse,
  NeonOperationsResponse,
  NeonProjectResponse,
} from "./api-types";

export class NeonApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function fetchJson<T>(creds: NeonCredentials, path: string): Promise<T> {
  const res = await fetch(`${EXTERNAL_API_BASE_URLS.neonConsole}${path}`, {
    headers: {
      Authorization: `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let code = "unknown_error";
    let message = `Neon API request failed (${res.status})`;
    try {
      const body = (await res.json()) as {
        error?: { code?: string; message?: string };
        message?: string;
      };
      code = body.error?.code ?? code;
      message = body.error?.message ?? body.message ?? message;
    } catch {
      // Ignore JSON parse failures and keep generic message.
    }
    throw new NeonApiError(res.status, code, message);
  }

  return (await res.json()) as T;
}

function currentMonthRange() {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return {
    from: from.toISOString(),
    to: now.toISOString(),
  };
}

export async function getProject(
  creds: NeonCredentials,
): Promise<NeonApiProject> {
  const data = await fetchJson<NeonProjectResponse>(
    creds,
    NEON_API_ENDPOINTS.project(creds.projectId),
  );
  return data.project;
}

export async function getEndpoints(
  creds: NeonCredentials,
): Promise<NeonApiEndpoint[]> {
  const data = await fetchJson<NeonEndpointsResponse>(
    creds,
    NEON_API_ENDPOINTS.endpoints(creds.projectId),
  );
  return data.endpoints ?? [];
}

export async function getConsumption(
  creds: NeonCredentials,
): Promise<NeonApiConsumption | null> {
  const { from, to } = currentMonthRange();
  const params = new URLSearchParams({
    project_ids: creds.projectId,
    from,
    to,
  });
  const data = await fetchJson<NeonConsumptionHistoryResponse>(
    creds,
    NEON_API_ENDPOINTS.consumptionHistoryProjects(params.toString()),
  );
  return data.projects?.find((p) => p.project_id === creds.projectId) ?? null;
}

export async function getBranches(
  creds: NeonCredentials,
): Promise<NeonApiBranch[]> {
  const data = await fetchJson<NeonBranchesResponse>(
    creds,
    NEON_API_ENDPOINTS.branches(creds.projectId),
  );
  return data.branches ?? [];
}

export async function getOperations(
  creds: NeonCredentials,
): Promise<NeonApiOperation[]> {
  const data = await fetchJson<NeonOperationsResponse>(
    creds,
    NEON_API_ENDPOINTS.operations(
      creds.projectId,
      POLLING_LIMITS.operationsLimit,
    ),
  );
  return data.operations ?? [];
}
