import { Button } from "@blenvi/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecentChecksTable } from "@/components/checks/recent-checks-table";
import { formatRelative } from "@/components/dashboard/metric-format";
import { SimulatedDataBanner } from "@/components/dashboard/simulated-data-banner";
import { IntegrationHealthCard } from "@/components/integrations/integration-health-card";
import { StatusBadge } from "@/components/integrations/status-badge";
import PageContainer from "@/components/layout/page-container";
import { AvailabilityByIntegration } from "@/components/project-dashboard/availability-by-integration";
import { CheckVolumeChart } from "@/components/project-dashboard/check-volume-chart";
import { ErrorMessagesList } from "@/components/project-dashboard/error-messages-list";
import { ProjectDownAlert } from "@/components/project-dashboard/project-down-alert";
import { ProjectStatsRow } from "@/components/project-dashboard/project-stats-row";
import type { IncidentRow } from "@/components/project-dashboard/recent-incidents";
import { RecentIncidents } from "@/components/project-dashboard/recent-incidents";
import { StaleIntegrationAlert } from "@/components/project-dashboard/stale-integration-alert";
import { getProjectAnalytics } from "@/lib/db/integration-analytics";
import { getRecentChecksForProject } from "@/lib/db/integration-checks";
import { getIntegrations } from "@/lib/db/integrations";
import {
  getActiveIncidentsForProject,
  getLatestMetricsForIntegrations,
} from "@/lib/db/metrics";
import { getNeonLatestSnapshot } from "@/lib/db/neon";
import { getProjectById } from "@/lib/db/projects";
import { getWorkspaceById } from "@/lib/db/workspaces";
import { isSimulatedMetricPayload } from "@/lib/services/simulated";
import { getWorstStatus } from "@/lib/utils/status";
import type { NeonSnapshot } from "@/types/database";

const staleThresholdMinutes = 30;

export default async function ProjectPage({
  params,
}: Readonly<{
  params: Promise<{ "project-id": string }>;
}>) {
  const { "project-id": projectId } = await params;
  const projectResult = await getProjectById(projectId);

  if (!projectResult.data) notFound();

  const [integrationsResult, workspaceResult] = await Promise.all([
    getIntegrations(projectId),
    getWorkspaceById(projectResult.data.workspace_id),
  ]);
  const integrations = integrationsResult.data ?? [];
  const pollIntervalMinutes = workspaceResult.data?.poll_interval_minutes ?? 5;
  const integrationIds = integrations.map((i) => i.id);

  const [
    analyticsResult,
    checksResult,
    metricsMapResult,
    openIncidentsResult,
    snapshotResults,
  ] = await Promise.all([
    integrations.length > 0 ? getProjectAnalytics(integrations) : null,
    integrations.length > 0
      ? getRecentChecksForProject(projectId, 100)
      : { data: [], error: null },
    integrationIds.length > 0
      ? getLatestMetricsForIntegrations(integrationIds)
      : { data: new Map(), error: null },
    integrations.length > 0
      ? getActiveIncidentsForProject(projectId, 200)
      : { data: [], error: null },
    integrationIds.length > 0
      ? Promise.all(
          integrationIds.map(
            async (id) => [id, await getNeonLatestSnapshot(id)] as const,
          ),
        )
      : Promise.resolve([]),
  ]);

  const analytics = analyticsResult?.data ?? null;
  const checks = checksResult.data ?? [];
  const metricsById = metricsMapResult.data ?? new Map();
  const neonSnapshots = new Map<string, NeonSnapshot | null>();
  for (const [id, res] of snapshotResults) {
    neonSnapshots.set(id, res.data);
  }

  const openIncidents = openIncidentsResult.data ?? [];
  const incidentsByIntegration = new Map<string, typeof openIncidents>();
  for (const inc of openIncidents) {
    const list = incidentsByIntegration.get(inc.integration_id) ?? [];
    list.push(inc);
    incidentsByIntegration.set(inc.integration_id, list);
  }

  const overallHealth = getWorstStatus(integrations.map((i) => i.status));

  const hasSimulatedProviderMetrics = integrations.some((i) => {
    const m = metricsById.get(i.id);
    return isSimulatedMetricPayload(m?.raw_payload ?? null);
  });

  const staleIntegrations = integrations.filter((integration) => {
    if (!integration.last_checked) return true;
    const diffMs = Date.now() - new Date(integration.last_checked).getTime();
    return diffMs > staleThresholdMinutes * 60 * 1000;
  });

  const downIntegrations = integrations.filter((i) => i.status === "down");

  const lastPollWorkspace = workspaceResult.data?.last_health_poll_at ?? null;
  const lastPollIntegration = integrations.reduce<string | null>((best, i) => {
    if (!i.last_checked) return best;
    if (!best || new Date(i.last_checked) > new Date(best)) {
      return i.last_checked;
    }
    return best;
  }, null);
  const lastPolledIso = lastPollWorkspace ?? lastPollIntegration;

  const incidentFeed: IncidentRow[] = openIncidents.slice(0, 5).map((inc) => ({
    id: inc.id,
    title: inc.title ?? "Untitled incident",
    severity: inc.severity,
    opened_at: inc.opened_at,
    serviceLabel:
      integrations.find((i) => i.id === inc.integration_id)?.service ??
      "integration",
    projectId,
    integrationId: inc.integration_id,
  }));

  const checkRows = checks.map((c) => ({
    id: c.id,
    integrationId: c.integrations?.id ?? "",
    projectId,
    projectName: projectResult.data.name,
    service: c.integrations?.service ?? "neon",
    status: c.status,
    polledAt: c.checked_at,
    responseCode: c.response_code,
  }));

  let availChartRows: { name: string; percent: number }[] = [];
  let expectedTotal7d = 0;
  let coveragePct = 0;

  if (analytics) {
    const serviceCounts = new Map<string, number>();
    for (const row of analytics.perIntegration) {
      serviceCounts.set(row.service, (serviceCounts.get(row.service) ?? 0) + 1);
    }
    const seenService = new Map<string, number>();
    availChartRows = analytics.perIntegration.map((row) => {
      const dup = (serviceCounts.get(row.service) ?? 0) > 1;
      const n = (seenService.get(row.service) ?? 0) + 1;
      seenService.set(row.service, n);
      const name = dup
        ? `${row.service} · ${row.integrationId.slice(0, 8)}`
        : row.service;
      return { name, percent: row.availabilityPct };
    });

    const expectedPerIntegration = Math.max(
      1,
      Math.floor((7 * 24 * 60) / Math.max(1, pollIntervalMinutes)),
    );
    expectedTotal7d =
      integrations.length > 0
        ? expectedPerIntegration * integrations.length
        : expectedPerIntegration;
    coveragePct =
      expectedTotal7d > 0
        ? Math.min(
            100,
            Math.round((analytics.totals7d.checks / expectedTotal7d) * 1000) /
              10,
          )
        : 0;
  }

  return (
    <PageContainer
      pageTitle={projectResult.data.name}
      pageDescription={`${integrations.length} integration${
        integrations.length === 1 ? "" : "s"
      }${
        lastPolledIso
          ? ` · last polled ${formatRelative(lastPolledIso)}`
          : " · never polled"
      }`}
      pageHeaderAction={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {integrations.length > 0 ? (
            <StatusBadge status={overallHealth} />
          ) : null}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}/integrations`}>
              Add integration
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <ProjectDownAlert services={downIntegrations.map((i) => i.service)} />

        {hasSimulatedProviderMetrics ? <SimulatedDataBanner /> : null}

        {integrations.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Get started</CardTitle>
              <CardDescription>
                Connect an integration to start health monitoring for this
                project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/projects/${projectId}/integrations`}>
                  Add integration
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {integrations.length > 0 && analytics ? (
          <ProjectStatsRow
            analytics={analytics}
            coveragePct={coveragePct}
            expectedTotal7d={expectedTotal7d}
          />
        ) : null}

        {integrations.length > 0 ? (
          <div className="flex flex-col gap-4">
            {integrations.map((integration) => (
              <IntegrationHealthCard
                key={integration.id}
                projectId={projectId}
                integration={integration}
                latestMetric={metricsById.get(integration.id) ?? null}
                neonSnapshot={neonSnapshots.get(integration.id) ?? null}
                incidents={incidentsByIntegration.get(integration.id) ?? []}
              />
            ))}
          </div>
        ) : null}

        {integrations.length > 0 && analytics ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CheckVolumeChart buckets={analytics.checksHourly24h} />
            <AvailabilityByIntegration rows={availChartRows} />
          </div>
        ) : integrations.length > 0 && analyticsResult?.error ? (
          <p className="text-sm text-muted-foreground">
            Could not load analytics: {analyticsResult.error}
          </p>
        ) : null}

        {integrations.length > 0 && analytics ? (
          <ErrorMessagesList errors={analytics.topErrors7d} />
        ) : null}

        {integrations.length > 0 ? (
          <StaleIntegrationAlert
            stale={staleIntegrations}
            thresholdMinutes={staleThresholdMinutes}
          />
        ) : null}

        {integrations.length > 0 ? (
          <RecentIncidents incidents={incidentFeed} />
        ) : null}

        {integrations.length > 0 ? (
          <RecentChecksTable
            checks={checkRows}
            description="Latest health checks for this project"
            pageSize={10}
            action={
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                asChild
              >
                <Link href={`/projects/${projectId}/logs`}>All logs</Link>
              </Button>
            }
          />
        ) : null}
      </div>
    </PageContainer>
  );
}
