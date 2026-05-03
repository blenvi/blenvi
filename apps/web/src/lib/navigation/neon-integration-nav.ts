/** Neon integration sub-routes under `/projects/:id/integrations/neon`. */
export type NeonIntegrationSection =
  | "overview"
  | "branches"
  | "consumption"
  | "operations";

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
  return `/projects/${projectId}/integrations/neon`;
}

export function neonIntegrationSectionPath(
  projectId: string,
  section: NeonIntegrationSection,
): string {
  return `${neonIntegrationBasePath(projectId)}/${section}`;
}
