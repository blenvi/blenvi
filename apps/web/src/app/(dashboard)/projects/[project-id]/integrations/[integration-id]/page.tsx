import { Button } from "@blenvi/ui/components/button";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SimulatedDataBanner } from "@/components/features/dashboard/simulated-data-banner";
import { MetricHistoryTable } from "@/components/features/integrations/metric-history-table";
import { IntegrationCredentialsForm } from "@/components/forms/integrations/integration-credentials-form";
import PageContainer from "@/components/layouts/page-container";
import { ROUTE_PATHS } from "@/constants";
import {
  getIntegrationByIdForProject,
  getIntegrationNeonProjectIdForEdit,
} from "@/services/db/integrations";
import { getMetricsHistory } from "@/services/db/metrics";
import { getProjectById } from "@/services/db/projects";
import { getMetricDefinitions } from "@/services/integrations/definitions";
import { isSimulatedMetricPayload } from "@/services/integrations/simulated";
/** Always read fresh metric rows after poll/revalidate (avoid stale RSC shell). */
export const dynamic = "force-dynamic";

export default async function IntegrationDetailPage({
  params,
}: Readonly<{
  params: Promise<{ "project-id": string; "integration-id": string }>;
}>) {
  const { "project-id": projectId, "integration-id": integrationId } =
    await params;

  noStore();

  const projectResult = await getProjectById(projectId);
  if (!projectResult.data) notFound();

  const integrationResult = await getIntegrationByIdForProject(
    integrationId,
    projectId,
  );
  if (!integrationResult.data) notFound();

  const editDefaults = await getIntegrationNeonProjectIdForEdit(
    integrationId,
    projectId,
  );
  const initialNeonProjectId = editDefaults.data?.neonProjectId ?? "";

  const historyResult = await getMetricsHistory(integrationId, 48);
  const rows = historyResult.data ?? [];
  const historyError = historyResult.error;
  const defs = getMetricDefinitions(integrationResult.data.service);
  const latestRowSimulated =
    rows.length > 0
      ? isSimulatedMetricPayload(rows[0].raw_payload ?? null)
      : false;

  return (
    <PageContainer
      pageTitle={integrationResult.data.service}
      pageDescription={`Connection and metric history for ${projectResult.data.name}.`}
      pageHeaderAction={
        <Button variant="outline" asChild>
          <Link href={ROUTE_PATHS.projectIntegrations(projectId)}>Back</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {latestRowSimulated ? <SimulatedDataBanner /> : null}

        <div className="rounded-lg border p-5">
          <h2 className="mb-1 text-lg font-medium">Connection</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Update the Neon project ID or rotate your Console API key.
          </p>
          <IntegrationCredentialsForm
            projectId={projectId}
            integrationId={integrationId}
            initialNeonProjectId={initialNeonProjectId}
          />
        </div>

        <div className="rounded-lg border">
          <MetricHistoryTable
            rows={rows}
            defs={defs}
            historyError={historyError}
          />
        </div>
      </div>
    </PageContainer>
  );
}
