export type NeonIntegrationSection =
  | "overview"
  | "branches"
  | "consumption"
  | "operations";

export const ROUTE_PATHS = {
  home: "/",
  login: "/login",
  overview: "/overview",
  projects: "/projects",
  newProject: "/projects/new",
  updatePassword: "/update-password",
  project: (projectId: string) => `/projects/${projectId}`,
  projectAlerts: (projectId: string) => `/projects/${projectId}/alerts`,
  projectLogs: (projectId: string) => `/projects/${projectId}/logs`,
  projectSettings: (projectId: string) => `/projects/${projectId}/settings`,
  projectIntegrations: (projectId: string) =>
    `/projects/${projectId}/integrations`,
  projectIntegration: (projectId: string, integrationId: string) =>
    `/projects/${projectId}/integrations/${integrationId}`,
  neonIntegration: (projectId: string) =>
    `/projects/${projectId}/integrations/neon`,
  neonIntegrationSection: (
    projectId: string,
    section: NeonIntegrationSection,
  ) => `/projects/${projectId}/integrations/neon/${section}`,
} as const;

export const AUTH_ROUTE_PATHS = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/update-password",
] as const;

export const PROTECTED_ROUTE_PATTERNS = [
  "/overview",
  "/projects/:path*",
  "/settings/:path*",
  "/account/:path*",
] as const;

export const NEON_INTEGRATION_SECTIONS: ReadonlyArray<{
  value: NeonIntegrationSection;
  label: string;
}> = [
  { value: "overview", label: "Overview" },
  { value: "branches", label: "Branches" },
  { value: "consumption", label: "Consumption" },
  { value: "operations", label: "Operations" },
];

export function neonIntegrationBasePath(projectId: string): string {
  return ROUTE_PATHS.neonIntegration(projectId);
}

export function neonIntegrationSectionPath(
  projectId: string,
  section: NeonIntegrationSection,
): string {
  return ROUTE_PATHS.neonIntegrationSection(projectId, section);
}
