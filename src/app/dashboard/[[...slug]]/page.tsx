import ConfigurePage from "@/components/pages/configure-page";
import OverviewPage from "@/components/pages/overview-page";
import TeamPage from "@/components/pages/team-page";
import WorkflowPage from "@/components/pages/workflow-page";
import { notFound } from "next/navigation";

export default async function DashboardPage({
  params,
}: Readonly<{
  params: Promise<{ slug?: string[] }>;
}>) {
  const slug = (await params).slug || [];

  const teamId = slug[0];
  const projectId = slug[1];
  const route = slug[2];

  // Validate IDs
  if (!teamId || !projectId) {
    return notFound();
  }

  switch (route) {
    case undefined:
      return <OverviewPage />;
    case "team":
      return <TeamPage />;
    case "workflow":
      return <WorkflowPage teamId={teamId} projectId={projectId} />;
    case "configure":
      return <ConfigurePage teamId={teamId} projectId={projectId} />;
    default:
      return notFound();
  }
}
