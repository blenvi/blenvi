import { redirect } from "next/navigation";
import { INTEGRATION_SERVICES, POLLING_LIMITS, ROUTE_PATHS } from "@/constants";
import { getIntegrationByService } from "@/services/db/integrations";
import {
  getNeonBranches,
  getNeonCostForecast,
  getNeonLatestSnapshot,
  getNeonOperations,
  getNeonSnapshotHistory,
} from "@/services/db/neon";
import { getProjectById } from "@/services/db/projects";
import type {
  Integration,
  NeonBranch,
  NeonOperation,
  NeonSnapshot,
} from "@/types/database";

type NeonRouteData = {
  project: {
    id: string;
    name: string;
  };
  integration: Integration;
  snapshot: NeonSnapshot | null;
  branches: NeonBranch[];
  operations: NeonOperation[];
  history: NeonSnapshot[];
  costForecast: {
    estimatedMonthlyUsd: number;
    daysRemaining: number;
    dailyRateUsd: number;
    dataPoints?: number;
  };
};

export async function getNeonRouteData(
  projectId: string,
): Promise<NeonRouteData> {
  const projectResult = await getProjectById(projectId);
  if (!projectResult.data) {
    redirect(ROUTE_PATHS.projects);
  }

  const integrationResult = await getIntegrationByService(
    projectId,
    INTEGRATION_SERVICES.neon,
  );
  if (!integrationResult.data) {
    redirect(ROUTE_PATHS.projectIntegrations(projectId));
  }

  const integrationId = integrationResult.data.id;
  const [snapshot, branches, operations, history, costForecast] =
    await Promise.all([
      getNeonLatestSnapshot(integrationId),
      getNeonBranches(integrationId),
      getNeonOperations(integrationId, POLLING_LIMITS.operationsLimit),
      getNeonSnapshotHistory(integrationId, 48),
      getNeonCostForecast(integrationId),
    ]);

  return {
    project: {
      id: projectResult.data.id,
      name: projectResult.data.name,
    },
    integration: integrationResult.data,
    snapshot: snapshot.data,
    branches: branches.data ?? [],
    operations: operations.data ?? [],
    history: history.data ?? [],
    costForecast: costForecast.data ?? {
      estimatedMonthlyUsd: 0,
      daysRemaining: 0,
      dailyRateUsd: 0,
      dataPoints: 0,
    },
  };
}
