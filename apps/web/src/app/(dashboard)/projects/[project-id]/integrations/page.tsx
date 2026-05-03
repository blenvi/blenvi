import { notFound } from "next/navigation";
import { getIntegrations } from "@/lib/db/integrations";
import { getProjectById } from "@/lib/db/projects";
import { ProjectIntegrationsClient } from "./project-integrations-client";

export default async function ProjectIntegrationsPage({
  params,
}: Readonly<{
  params: Promise<{ "project-id": string }>;
}>) {
  const { "project-id": projectId } = await params;
  const [projectResult, integrationsResult] = await Promise.all([
    getProjectById(projectId),
    getIntegrations(projectId),
  ]);

  if (!projectResult.data) {
    notFound();
  }

  return (
    <ProjectIntegrationsClient
      projectId={projectId}
      projectName={projectResult.data.name}
      initialIntegrations={integrationsResult.data ?? []}
    />
  );
}
