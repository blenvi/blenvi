import { notFound } from "next/navigation";

import { getProjectById } from "@/services/db/projects";
import { getWorkspaceById } from "@/services/db/workspaces";

import { ProjectContextSync } from "./project-context-sync";

export default async function ProjectRouteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ "project-id": string }>;
}>) {
  const { "project-id": projectId } = await params;
  const projectResult = await getProjectById(projectId);
  if (!projectResult.data) notFound();

  const workspaceResult = await getWorkspaceById(
    projectResult.data.workspace_id,
  );
  if (!workspaceResult.data) notFound();

  return (
    <>
      <ProjectContextSync
        project={projectResult.data}
        workspace={workspaceResult.data}
      />
      {children}
    </>
  );
}
