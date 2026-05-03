import { Button } from "@blenvi/ui/components/button";
import Link from "next/link";
import { notFound } from "next/navigation";

import PageContainer from "@/components/layout/page-container";
import { getRecentIncidentsForProject } from "@/lib/db/integration-checks";
import { getIntegrations } from "@/lib/db/integrations";
import { getActiveIncidentsForProject } from "@/lib/db/metrics";
import { getProjectById } from "@/lib/db/projects";
import { severitySurfaceClass, statusTextClass } from "@/lib/ui/status-styles";
import type { IntegrationIncident } from "@/types/database";

function severityStyle(sev: IntegrationIncident["severity"]) {
  if (sev === "critical") {
    return severitySurfaceClass.critical;
  }
  if (sev === "warning") {
    return severitySurfaceClass.warning;
  }
  return severitySurfaceClass.neutral;
}

export default async function ProjectAlertsPage({
  params,
}: Readonly<{
  params: Promise<{ "project-id": string }>;
}>) {
  const { "project-id": projectId } = await params;
  const projectResult = await getProjectById(projectId);
  if (!projectResult.data) notFound();

  const projectName = projectResult.data.name;
  const integrationsResult = await getIntegrations(projectId);
  const integrations = integrationsResult.data ?? [];
  const byId = new Map(integrations.map((i) => [i.id, i]));

  const [recordedIncidents, checkIncidents] = await Promise.all([
    getActiveIncidentsForProject(projectId, 100),
    getRecentIncidentsForProject(projectId, 50),
  ]);

  const openFromTable = recordedIncidents.data ?? [];
  const fromChecks = checkIncidents.data ?? [];

  return (
    <PageContainer
      pageTitle="Alerts"
      pageDescription={`Open incidents for ${projectName}, plus recent degraded or down health checks.`}
      pageHeaderAction={
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${projectId}`}>Dashboard</Link>
        </Button>
      }
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">
            Open incidents (recorded)
          </h2>
          {recordedIncidents.error ? (
            <p className="text-sm text-destructive">
              {recordedIncidents.error}
            </p>
          ) : openFromTable.length === 0 ? (
            <div className="rounded-xl border-[0.5px] border-border bg-background p-6 text-sm text-muted-foreground">
              No open incidents in the database for this project. When incident
              automation is enabled, degraded integrations will appear here.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {openFromTable.map((inc) => {
                const integration = byId.get(inc.integration_id);
                return (
                  <li
                    key={inc.id}
                    className={`rounded-xl p-4 ${severityStyle(inc.severity)}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {inc.title ?? "Untitled incident"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {integration ? (
                            <span className="capitalize">
                              {integration.service}
                            </span>
                          ) : (
                            "Integration"
                          )}
                          {" · "}
                          Opened {new Date(inc.opened_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border-[0.5px] border-border bg-background px-2 py-0.5 text-[11px] font-medium">
                          {inc.severity}
                        </span>
                        <Link
                          href={`/projects/${projectId}/integrations/${inc.integration_id}`}
                          className="text-xs text-primary underline-offset-4 hover:underline"
                        >
                          View integration
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">
            Recent probe alerts (checks)
          </h2>
          <p className="text-xs text-muted-foreground">
            Latest degraded or down rows from{" "}
            <span className="font-medium text-foreground">
              integration_checks
            </span>{" "}
            — useful even before the incidents table is populated.
          </p>
          {checkIncidents.error ? (
            <p className="text-sm text-destructive">{checkIncidents.error}</p>
          ) : fromChecks.length === 0 ? (
            <div className="rounded-xl border-[0.5px] border-border bg-background p-6 text-sm text-muted-foreground">
              No degraded or down checks recorded yet.
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-xl border-[0.5px] border-border bg-background">
              {fromChecks.map((row) => {
                const svc = row.integrations?.service ?? "—";
                return (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize text-foreground">
                        {svc}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(row.checked_at).toLocaleString()}
                        {row.response_code != null
                          ? ` · HTTP ${row.response_code}`
                          : ""}
                      </p>
                      {row.error_message ? (
                        <p className="mt-1 line-clamp-2 font-mono text-xs text-muted-foreground">
                          {row.error_message}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.status === "down"
                          ? `bg-status-down-muted ${statusTextClass.down}`
                          : `bg-status-degraded-muted ${statusTextClass.degraded}`
                      }`}
                    >
                      {row.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
