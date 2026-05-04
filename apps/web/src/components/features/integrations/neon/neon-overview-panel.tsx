import { Badge } from "@blenvi/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";

import { formatRelative } from "@/components/features/dashboard/metric-format";
import { formatBytes, formatDuration } from "@/lib/utils/format-metric";
import type { NeonSnapshot } from "@/types/database";

function endpointLabel(state: NeonSnapshot["endpoint_state"]) {
  switch (state) {
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

function usd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

type Props = {
  snapshot: NeonSnapshot | null;
  costForecast: {
    estimatedMonthlyUsd: number;
    daysRemaining: number;
    dailyRateUsd: number;
    dataPoints?: number;
  };
};

export function NeonOverviewPanel({ snapshot, costForecast }: Props) {
  const autosuspendMin =
    snapshot?.autosuspend_delay_s != null
      ? Math.round(snapshot.autosuspend_delay_s / 60)
      : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b border-border [.border-b]:pb-4">
          <CardTitle>Compute status</CardTitle>
          <CardDescription>Endpoint runtime state and activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {endpointLabel(snapshot?.endpoint_state ?? "unknown")}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {snapshot?.endpoint_state === "suspended"
                ? "Suspended - next query will incur a cold start."
                : snapshot?.endpoint_state === "active"
                  ? "Compute is running."
                  : snapshot?.endpoint_state === "provisioning"
                    ? "Compute endpoint is provisioning."
                    : "No endpoint state reported yet."}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Auto-suspends after {autosuspendMin ?? "-"} minute
            {autosuspendMin === 1 ? "" : "s"} of inactivity.
          </p>
          <p className="text-sm text-muted-foreground">
            Last active:{" "}
            {snapshot?.last_active_at
              ? formatRelative(snapshot.last_active_at)
              : "Never recorded"}
          </p>
          <p className="text-sm text-muted-foreground">
            Endpoint count: {snapshot?.endpoint_count ?? 0}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Compute time</CardDescription>
            <CardTitle>
              {formatDuration(snapshot?.compute_time_seconds ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active time</CardDescription>
            <CardTitle>
              {formatDuration(snapshot?.active_time_seconds ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Written data</CardDescription>
            <CardTitle>
              {formatBytes(snapshot?.written_data_bytes ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Data transfer</CardDescription>
            <CardTitle>
              {formatBytes(snapshot?.data_transfer_bytes ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border [.border-b]:pb-4">
          <CardTitle>Cost forecast</CardTitle>
          <CardDescription>
            Estimated month-end spend from current trend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 pt-3">
          {costForecast.dataPoints != null && costForecast.dataPoints < 2 ? (
            <p className="text-sm text-muted-foreground">
              Not enough data yet - check back after the next poll.
            </p>
          ) : (
            <>
              <p className="text-2xl font-medium text-foreground">
                {usd(costForecast.estimatedMonthlyUsd)}
              </p>
              <p className="text-sm text-muted-foreground">
                At current rate: ${costForecast.dailyRateUsd.toFixed(4)}/day -{" "}
                {costForecast.daysRemaining} days remaining
              </p>
              <p className="text-xs text-muted-foreground">
                Based on {costForecast.dataPoints ?? 0} data points
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border [.border-b]:pb-4">
          <CardTitle>Storage</CardTitle>
          <CardDescription>
            Storage footprint and branch summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 pt-3">
          <p className="text-sm text-muted-foreground">
            Storage (GB-hours):{" "}
            {formatBytes(
              Math.round((snapshot?.data_storage_bytes_hour ?? 0) / 720),
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            Branch count: {snapshot?.branch_count ?? 0}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
