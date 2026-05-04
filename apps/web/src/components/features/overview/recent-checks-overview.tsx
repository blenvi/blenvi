import { Button } from "@blenvi/ui/components/button";
import Link from "next/link";

import { RecentChecksTable } from "@/components/features/checks/recent-checks-table";
import { ROUTE_PATHS } from "@/constants";
import type { OverviewRecentCheck } from "@/types/database";

export function RecentChecksOverview({
  checks,
}: {
  checks: OverviewRecentCheck[];
}) {
  return (
    <RecentChecksTable
      checks={checks.map((check) => ({
        id: `${check.integrationId}-${check.polledAt}`,
        integrationId: check.integrationId,
        projectId: check.projectId,
        projectName: check.projectName,
        service: check.service,
        status: check.status,
        polledAt: check.polledAt,
        latencyMs: check.latencyMs,
      }))}
      description="Last five polls across workspace integrations"
      showProjectColumn
      action={
        <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
          <Link href={ROUTE_PATHS.projects}>All projects</Link>
        </Button>
      }
    />
  );
}
