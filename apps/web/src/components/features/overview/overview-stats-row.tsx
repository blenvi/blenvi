import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";

import {
  formatCount,
  formatPercent,
} from "@/components/features/dashboard/metric-format";

type Stats = {
  availability24h: number;
  availability7d: number;
  totalChecks7d: number;
  totalIntegrations: number;
  activeIncidentCount: number;
  affectedProjectsCount: number;
  checks24h: number;
  checks24hHealthy: number;
};

export function OverviewStatsRow({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Availability (24h)</CardDescription>
          <CardTitle>{formatPercent(stats.availability24h)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-muted-foreground">
            {stats.checks24h === 0
              ? "No checks in 24h"
              : `${formatCount(stats.checks24hHealthy)} of ${formatCount(stats.checks24h)} healthy checks`}
          </p>
        </CardContent>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Availability (7d)</CardDescription>
          <CardTitle>{formatPercent(stats.availability7d)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-muted-foreground">
            {formatCount(stats.totalChecks7d)} checks
          </p>
        </CardContent>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total checks (7d)</CardDescription>
          <CardTitle>{formatCount(stats.totalChecks7d)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-muted-foreground">
            across {formatCount(stats.totalIntegrations)} integrations
          </p>
        </CardContent>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active incidents</CardDescription>
          <CardTitle>{formatCount(stats.activeIncidentCount)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-muted-foreground">
            {formatCount(stats.affectedProjectsCount)} projects affected
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
