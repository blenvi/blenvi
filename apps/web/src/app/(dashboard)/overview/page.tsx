import { ActiveIncidentsCard } from "@/components/features/overview/active-incidents-card";
import { OverviewActivityChart } from "@/components/features/overview/overview-activity-chart";
import { OverviewStatsRow } from "@/components/features/overview/overview-stats-row";
import { ProjectsListCard } from "@/components/features/overview/projects-list-card";
import { RecentChecksOverview } from "@/components/features/overview/recent-checks-overview";
import { WorkspaceAlertBar } from "@/components/features/overview/workspace-alert-bar";
import PageContainer from "@/components/layouts/page-container";
import { getWorstStatus } from "@/lib/utils/status";
import { resolveActiveWorkspace } from "@/lib/workspace-context";
import { getWorkspaceOverview } from "@/services/db/overview";
import { getWorkspaces } from "@/services/db/workspaces";
import type { Integration } from "@/types/database";

function workspaceOverallStatus(
  integrations: Array<Integration & { projectName: string }>,
): Integration["status"] {
  const statuses = integrations.map((i) => i.status);
  if (statuses.length === 0) return "unknown";
  if (statuses.includes("down")) return "down";
  if (statuses.includes("degraded")) return "degraded";
  if (statuses.every((s) => s === "healthy")) return "healthy";
  return getWorstStatus(statuses);
}

export default async function OverviewPage() {
  const { data: workspaces } = await getWorkspaces();

  if (!workspaces || workspaces.length === 0) {
    return (
      <PageContainer>
        <div className="space-y-2">
          <h1 className="text-2xl font-medium">Overview</h1>
          <p className="text-sm font-normal text-muted-foreground">
            No workspaces found. Create one from the sidebar to begin.
          </p>
        </div>
      </PageContainer>
    );
  }

  const activeWorkspace = await resolveActiveWorkspace(workspaces);
  if (!activeWorkspace) {
    return null;
  }

  const overviewResult = await getWorkspaceOverview(activeWorkspace.id);
  if (overviewResult.error || !overviewResult.data) {
    return (
      <PageContainer>
        <p className="text-sm font-normal text-muted-foreground">
          {overviewResult.error ?? "Failed to load workspace overview."}
        </p>
      </PageContainer>
    );
  }

  const overview = overviewResult.data;
  const workspaceStatus = workspaceOverallStatus(overview.integrations);

  const downItems = overview.integrations
    .filter((i) => i.status === "down")
    .map((i) => ({
      projectId: i.project_id,
      projectName: i.projectName,
      service: i.service,
    }));

  const degradedItems = overview.integrations
    .filter((i) => i.status === "degraded")
    .map((i) => ({
      projectId: i.project_id,
      projectName: i.projectName,
      service: i.service,
    }));

  const affectedProjectsCount = new Set(
    overview.activeIncidents.map((i) => i.projectName),
  ).size;

  return (
    <PageContainer
      pageTitle="Overview"
      pageDescription={`${activeWorkspace.name} workspace health and activity`}
    >
      <div className="space-y-4">
        <WorkspaceAlertBar
          downItems={downItems}
          degradedItems={degradedItems}
        />
        <OverviewStatsRow
          stats={{
            ...overview.stats,
            affectedProjectsCount,
          }}
        />
        <OverviewActivityChart
          trend={overview.checksTrend7d}
          checks24h={overview.stats.checks24h}
          availability24h={overview.stats.availability24h}
        />
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
          <ProjectsListCard projects={overview.projects} />
          <RecentChecksOverview checks={overview.recentChecks} />
        </div>

        <ActiveIncidentsCard incidents={overview.activeIncidents} />

        <p className="sr-only">Workspace status: {workspaceStatus}</p>
      </div>
    </PageContainer>
  );
}
