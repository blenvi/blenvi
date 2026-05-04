export const EXTERNAL_API_BASE_URLS = {
  neonConsole: "https://console.neon.tech/api/v2",
} as const;

export const NEON_API_ENDPOINTS = {
  projects: "/projects",
  project: (projectId: string) => `/projects/${encodeURIComponent(projectId)}`,
  endpoints: (projectId: string) =>
    `/projects/${encodeURIComponent(projectId)}/endpoints`,
  branches: (projectId: string) =>
    `/projects/${encodeURIComponent(projectId)}/branches`,
  operations: (projectId: string, limit: number) =>
    `/projects/${encodeURIComponent(projectId)}/operations?limit=${limit}`,
  consumptionHistoryProjects: (query: string) =>
    `/consumption_history/projects?${query}`,
  consumptionHistoryV2Projects: (query: string) =>
    `/consumption_history/v2/projects?${query}`,
} as const;

export const API_ENDPOINTS = {
  authCallback: "/api/auth/callback",
  integrationPoll: (integrationId: string) =>
    `/api/integrations/${integrationId}/poll`,
} as const;
