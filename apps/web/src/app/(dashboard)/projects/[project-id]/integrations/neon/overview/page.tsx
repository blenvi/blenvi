import { unstable_noStore as noStore } from "next/cache";

import { NeonOverviewPanel } from "@/components/integrations/neon";
import { NeonPageShell } from "../_components/neon-page-shell";
import { getNeonRouteData } from "../_data/neon-route-data";

export const dynamic = "force-dynamic";

export default async function NeonOverviewPage({
  params,
}: Readonly<{
  params: Promise<{ "project-id": string }>;
}>) {
  noStore();
  const { "project-id": projectId } = await params;
  const data = await getNeonRouteData(projectId);

  return (
    <NeonPageShell
      projectId={projectId}
      projectName={data.project.name}
      integration={data.integration}
      activePage="overview"
    >
      <NeonOverviewPanel
        snapshot={data.snapshot}
        costForecast={data.costForecast}
      />
    </NeonPageShell>
  );
}
