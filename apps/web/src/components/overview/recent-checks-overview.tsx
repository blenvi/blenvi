import { Button } from "@blenvi/ui/components/button";
import Link from "next/link";

import { RecentChecksTable } from "@/components/checks/recent-checks-table";
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
          <Link href="/projects">All projects</Link>
        </Button>
      }
    />
  );
}
