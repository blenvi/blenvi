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
import type { ProjectAnalytics } from "@/services/db/integration-analytics";

type Props = {
  analytics: ProjectAnalytics;
  coveragePct: number;
  expectedTotal7d: number;
};

export function ProjectStatsRow({
  analytics,
  coveragePct,
  expectedTotal7d,
}: Props) {
  const checks24h = analytics.totals24h.checks;
  const checks7d = analytics.totals7d.checks;
  const topCode = [...analytics.httpCodes7d].sort(
    (a, b) => b.count - a.count,
  )[0];

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Availability (24h)</CardDescription>
          <CardTitle>
            {checks24h > 0
              ? formatPercent(analytics.totals24h.availabilityPct)
              : "-"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-muted-foreground">
            {checks24h === 0
              ? "No checks in 24h"
              : `${formatCount(analytics.totals24h.healthy)} of ${formatCount(checks24h)} healthy checks`}
          </p>
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Availability (7d)</CardDescription>
          <CardTitle>
            {checks7d > 0
              ? formatPercent(analytics.totals7d.availabilityPct)
              : "-"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-muted-foreground">
            {formatCount(checks7d)} checks -{" "}
            {formatCount(analytics.totals7d.incidentCount)} incidents
          </p>
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Poll coverage (7d)</CardDescription>
          <CardTitle>{formatPercent(coveragePct)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-muted-foreground">
            {formatCount(checks7d)} actual vs ~{formatCount(expectedTotal7d)}{" "}
            expected
          </p>
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>HTTP outcomes (7d)</CardDescription>
          <CardTitle>{formatCount(analytics.httpCodes7d.length)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-muted-foreground">
            {topCode
              ? `Top: ${topCode.code} (${formatCount(topCode.count)})`
              : "No HTTP data"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
