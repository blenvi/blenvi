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
import { Activity, ArrowUpRight, DatabaseZap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { pollIntegrationAction } from "@/actions/integrations";
import { formatRelative } from "@/components/dashboard/metric-format";
import { isSimulatedMetricPayload } from "@/lib/services/simulated";
import { severitySurfaceClass, statusDotClass } from "@/lib/ui/status-styles";
import { formatBytes, formatDuration } from "@/lib/utils/format-metric";
import type {
  Integration,
  IntegrationIncident,
  IntegrationMetric,
  NeonSnapshot,
  ServiceMetrics,
} from "@/types/database";

import { StatusBadge } from "./status-badge";

const INITIALS: Record<Integration["service"], string> = {
  neon: "NE",
};

type PollMode = "soft" | "hard";

function serviceSubtitle(metrics: ServiceMetrics | null): string | null {
  if (!metrics) return null;
  if (metrics.service === "neon" && "projectId" in metrics) {
    const id = metrics.projectId;
    return id.length > 10 ? `${id.slice(0, 10)}…` : id;
  }
  return null;
}

type Props = {
  projectId: string;
  integration: Integration;
  latestMetric: IntegrationMetric | null;
  neonSnapshot: NeonSnapshot | null;
  incidents: IntegrationIncident[];
};

export function IntegrationHealthCard({
  projectId,
  integration,
  latestMetric,
  neonSnapshot,
  incidents,
}: Props) {
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

  const computeStateLabel =
    neonSnapshot?.endpoint_state === "active"
      ? "Active"
      : neonSnapshot?.endpoint_state === "suspended"
        ? "Suspended"
        : neonSnapshot?.endpoint_state === "provisioning"
          ? "Provisioning"
          : "Unknown";
  const provisioningTooLong =
    neonSnapshot?.endpoint_state === "provisioning" &&
    neonSnapshot.polled_at != null &&
    Date.now() - new Date(neonSnapshot.polled_at).getTime() > 5 * 60 * 1000;
  const suspendedNeverActive =
    neonSnapshot?.endpoint_state === "suspended" &&
    !neonSnapshot.last_active_at;
  const computeStatus =
    provisioningTooLong || suspendedNeverActive ? "degraded" : "healthy";

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
                {INITIALS[integration.service]}
              </AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="capitalize">{integration.service}</ItemTitle>
            {subtitle ? <ItemDescription>{subtitle}</ItemDescription> : null}
            {isDemoSnapshot ? (
              <ItemDescription className="text-amber-800 dark:text-amber-200">
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
                  href={`/projects/${projectId}/integrations/${integration.id}`}
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
        {integration.service === "neon" && neonSnapshot ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
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
            <div className="rounded-lg border border-border bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground">Branches</p>
              <p className="text-sm font-medium text-foreground">
                {neonSnapshot.branch_count}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground">Compute time</p>
              <p className="text-sm font-medium text-foreground">
                {formatDuration(neonSnapshot.compute_time_seconds)} this period
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground">Storage</p>
              <p className="text-sm font-medium text-foreground">
                {formatBytes(
                  Math.round(neonSnapshot.data_storage_bytes_hour / 720),
                )}
              </p>
            </div>
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground">Active branches</p>
              <p className="text-sm font-medium text-foreground">
                {"activeBranches" in metrics ? metrics.activeBranches : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground">Compute used</p>
              <p className="text-sm font-medium text-foreground">
                {"computeUsedHours" in metrics
                  ? `${metrics.computeUsedHours} h`
                  : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground">Storage</p>
              <p className="text-sm font-medium text-foreground">
                {"storageBytes" in metrics
                  ? formatBytes(metrics.storageBytes)
                  : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground">Backup</p>
              <p className="text-sm font-medium text-foreground">
                {"lastBackupAt" in metrics && metrics.lastBackupAt
                  ? formatRelative(metrics.lastBackupAt)
                  : "—"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No metrics sampled yet.
          </p>
        )}

        {incidents.length > 0 ? (
          <div className="space-y-2">
            {incidents.map((inc) => {
              const major = inc.severity === "critical";
              const wrap = major
                ? severitySurfaceClass.critical
                : severitySurfaceClass.warning;
              return (
                <Item
                  key={inc.id}
                  variant="outline"
                  size="xs"
                  className={`border-0 py-2 ${wrap}`}
                >
                  <ItemMedia variant="icon">
                    <span
                      className={`size-1.5 rounded-full ${
                        major ? statusDotClass.down : statusDotClass.degraded
                      }`}
                      aria-hidden
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="text-xs">
                      {inc.title ?? "Incident"}
                    </ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <span className="rounded-full border-[0.5px] border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {inc.severity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      asChild
                    >
                      <Link
                        href={`/projects/${projectId}/integrations/${inc.integration_id}`}
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
            onClick={() => onRefresh("soft")}
          >
            <Activity className="size-3.5" />
            {activePollMode === "soft" ? "Checking..." : "Soft check"}
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-xs"
            disabled={pending}
            onClick={() => onRefresh("hard")}
          >
            <DatabaseZap className="size-3.5" />
            {activePollMode === "hard" ? "Refreshing..." : "Hard refresh"}
          </Button>
          <Button
            variant="link"
            size="sm"
            className="h-auto px-0 text-xs"
            asChild
          >
            <Link
              href={`/projects/${projectId}/integrations/${integration.id}`}
            >
              Details →
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
