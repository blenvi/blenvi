"use client";

import { Avatar, AvatarFallback } from "@blenvi/ui/components/avatar";
import { Button } from "@blenvi/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@blenvi/ui/components/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@blenvi/ui/components/item";
import { cn } from "@blenvi/ui/lib/utils";
import { Activity, ArrowUpRight, DatabaseZap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";

import { pollIntegrationAction } from "@/actions/integrations";
import { formatRelative } from "@/components/features/dashboard/metric-format";
import {
  POLL_MODES,
  POLLING_LIMITS,
  ROUTE_PATHS,
  SERVICE_INITIALS,
  UI_TEXT,
} from "@/constants";
import { severitySurfaceClass, statusDotClass } from "@/lib/ui/status-styles";
import { formatBytes, formatDuration } from "@/lib/utils/format-metric";
import { isSimulatedMetricPayload } from "@/services/integrations/simulated";
import type {
  Integration,
  IntegrationIncident,
  IntegrationMetric,
  NeonSnapshot,
  ServiceMetrics,
} from "@/types/database";

import { StatusBadge } from "./status-badge";

type PollMode = (typeof POLL_MODES)[keyof typeof POLL_MODES];

type MetricTileProps = Readonly<{
  label: string;
  value: ReactNode;
}>;

type Props = {
  projectId: string;
  integration: Integration;
  latestMetric: IntegrationMetric | null;
  neonSnapshot: NeonSnapshot | null;
  incidents: IntegrationIncident[];
};

function serviceSubtitle(metrics: ServiceMetrics | null): string | null {
  if (!metrics) return null;

  if (metrics.service !== "neon" || !("projectId" in metrics)) {
    return null;
  }

  const id = metrics.projectId;
  return id.length > 10 ? `${id.slice(0, 10)}...` : id;
}

function getComputeStateLabel(snapshot: NeonSnapshot | null): string {
  switch (snapshot?.endpoint_state) {
    case "active":
      return "Active";
    case "suspended":
      return "Suspended";
    case "provisioning":
      return "Provisioning";
    default:
      return "Unknown";
  }
}

function getComputeStatus(
  snapshot: NeonSnapshot | null,
): Integration["status"] {
  if (!snapshot) return "unknown";

  const provisioningTooLong =
    snapshot.endpoint_state === "provisioning" &&
    snapshot.polled_at != null &&
    Date.now() - new Date(snapshot.polled_at).getTime() >
      POLLING_LIMITS.provisioningStaleMs;
  const suspendedNeverActive =
    snapshot.endpoint_state === "suspended" && !snapshot.last_active_at;

  return provisioningTooLong || suspendedNeverActive ? "degraded" : "healthy";
}

function getFallbackMetricTiles(metrics: ServiceMetrics): MetricTileProps[] {
  return [
    {
      label: "Active branches",
      value: "activeBranches" in metrics ? metrics.activeBranches : "N/A",
    },
    {
      label: "Compute used",
      value:
        "computeUsedHours" in metrics ? `${metrics.computeUsedHours} h` : "N/A",
    },
    {
      label: "Storage",
      value:
        "storageBytes" in metrics ? formatBytes(metrics.storageBytes) : "N/A",
    },
    {
      label: "Backup",
      value:
        "lastBackupAt" in metrics && metrics.lastBackupAt
          ? formatRelative(metrics.lastBackupAt)
          : "N/A",
    },
  ];
}

function getNeonMetricTiles(snapshot: NeonSnapshot): MetricTileProps[] {
  return [
    {
      label: "Branches",
      value: snapshot.branch_count,
    },
    {
      label: "Compute time",
      value: `${formatDuration(snapshot.compute_time_seconds)} this period`,
    },
    {
      label: "Storage",
      value: formatBytes(
        Math.round(
          snapshot.data_storage_bytes_hour /
            POLLING_LIMITS.storageHoursPerMonth,
        ),
      ),
    },
  ];
}

function MetricTile({ label, value }: MetricTileProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function MetricGrid({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{children}</div>
  );
}

function MetricSummary({
  integration,
  neonSnapshot,
  metrics,
  computeStatus,
  computeStateLabel,
}: Readonly<{
  integration: Integration;
  neonSnapshot: NeonSnapshot | null;
  metrics: ServiceMetrics | null;
  computeStatus: Integration["status"];
  computeStateLabel: string;
}>) {
  if (integration.service === "neon" && neonSnapshot) {
    return (
      <MetricGrid>
        <div className="rounded-lg border border-border bg-muted/40 p-2.5">
          <p className="text-xs text-muted-foreground">Compute state</p>
          <div className="mt-1">
            <StatusBadge
              status={computeStatus}
              label={computeStateLabel}
              className="capitalize"
            />
          </div>
        </div>
        {getNeonMetricTiles(neonSnapshot).map((tile) => (
          <MetricTile key={tile.label} {...tile} />
        ))}
      </MetricGrid>
    );
  }

  if (metrics) {
    return (
      <MetricGrid>
        {getFallbackMetricTiles(metrics).map((tile) => (
          <MetricTile key={tile.label} {...tile} />
        ))}
      </MetricGrid>
    );
  }

  return (
    <p className="text-sm text-muted-foreground italic">
      No metrics sampled yet.
    </p>
  );
}

export function IntegrationHealthCard({
  projectId,
  integration,
  latestMetric,
  neonSnapshot,
  incidents,
}: Readonly<Props>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activePollMode, setActivePollMode] = useState<PollMode | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const metrics = latestMetric?.metrics ?? null;
  const isDemoSnapshot = isSimulatedMetricPayload(
    latestMetric?.raw_payload ?? null,
  );
  const subtitle = serviceSubtitle(metrics);
  const updatedSource =
    integration.last_checked ?? latestMetric?.polled_at ?? null;
  const computeStateLabel = getComputeStateLabel(neonSnapshot);
  const computeStatus = getComputeStatus(neonSnapshot);

  const onRefresh = (mode: PollMode) => {
    setActivePollMode(mode);
    startTransition(() => {
      void (async () => {
        setRefreshError(null);
        const res = await pollIntegrationAction(
          integration.id,
          projectId,
          mode,
        );
        if (!res.ok) {
          setRefreshError(res.error);
          setActivePollMode(null);
          return;
        }
        router.refresh();
        setActivePollMode(null);
      })();
    });
  };

  return (
    <Card>
      <CardHeader className="border-b border-border [.border-b]:pb-4">
        <Item variant="muted" size="sm" className="rounded-lg border-0 p-0">
          <ItemMedia variant="icon" className="size-9 [&]:rounded-full">
            <Avatar className="size-9 rounded-full bg-muted">
              <AvatarFallback className="text-xs font-medium">
                {SERVICE_INITIALS[integration.service]}
              </AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="capitalize">{integration.service}</ItemTitle>
            {subtitle ? <ItemDescription>{subtitle}</ItemDescription> : null}
            {isDemoSnapshot ? (
              <ItemDescription className="text-status-degraded-foreground">
                Resource metrics are demo placeholders (not live API data).
              </ItemDescription>
            ) : null}
          </ItemContent>
          <ItemActions className="flex-col items-end gap-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <StatusBadge status={integration.status} />
              <Button
                variant="link"
                size="sm"
                className="h-auto px-0 text-xs"
                asChild
              >
                <Link
                  href={ROUTE_PATHS.projectIntegration(
                    projectId,
                    integration.id,
                  )}
                >
                  Details
                </Link>
              </Button>
            </div>
            {refreshError ? (
              <p className="max-w-[min(100%,220px)] text-right text-xs text-destructive">
                {refreshError}
              </p>
            ) : null}
          </ItemActions>
        </Item>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <MetricSummary
          integration={integration}
          neonSnapshot={neonSnapshot}
          metrics={metrics}
          computeStatus={computeStatus}
          computeStateLabel={computeStateLabel}
        />

        {incidents.length > 0 ? (
          <div className="space-y-2">
            {incidents.map((incident) => {
              const major = incident.severity === "critical";
              const surfaceClass = major
                ? severitySurfaceClass.critical
                : severitySurfaceClass.warning;
              const dotClass = major
                ? statusDotClass.down
                : statusDotClass.degraded;

              return (
                <Item
                  key={incident.id}
                  variant="outline"
                  size="xs"
                  className={cn("border-0 py-2", surfaceClass)}
                >
                  <ItemMedia variant="icon">
                    <span
                      className={cn("size-1.5 rounded-full", dotClass)}
                      aria-hidden
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="text-xs">
                      {incident.title ?? "Incident"}
                    </ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <span className="rounded-full border-[0.5px] border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {incident.severity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      asChild
                    >
                      <Link
                        href={ROUTE_PATHS.projectIntegration(
                          projectId,
                          incident.integration_id,
                        )}
                        aria-label="Open integration"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </Button>
                  </ItemActions>
                </Item>
              );
            })}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Last checked:{" "}
          {updatedSource ? formatRelative(updatedSource) : "never"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={pending}
            onClick={() => onRefresh(POLL_MODES.soft)}
          >
            <Activity className="size-3.5" />
            {activePollMode === POLL_MODES.soft
              ? UI_TEXT.polling.softChecking
              : UI_TEXT.polling.softCheck}
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-xs"
            disabled={pending}
            onClick={() => onRefresh(POLL_MODES.hard)}
          >
            <DatabaseZap className="size-3.5" />
            {activePollMode === POLL_MODES.hard
              ? UI_TEXT.polling.hardRefreshing
              : UI_TEXT.polling.hardRefresh}
          </Button>
          <Button
            variant="link"
            size="sm"
            className="h-auto px-0 text-xs"
            asChild
          >
            <Link
              href={ROUTE_PATHS.projectIntegration(projectId, integration.id)}
            >
              Details -&gt;
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
