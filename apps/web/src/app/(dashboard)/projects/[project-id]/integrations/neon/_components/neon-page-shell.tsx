import { Badge } from "@blenvi/ui/components/badge";
import { Button } from "@blenvi/ui/components/button";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatRelative } from "@/components/dashboard/metric-format";
import PageContainer from "@/components/layout/page-container";
import {
  NEON_INTEGRATION_SECTIONS,
  type NeonIntegrationSection,
  neonIntegrationSectionPath,
} from "@/lib/navigation/neon-integration-nav";
import type { Integration } from "@/types/database";

import { NeonPollActions } from "./neon-poll-actions";

type Props = {
  projectId: string;
  projectName: string;
  integration: Integration;
  activePage: NeonIntegrationSection;
  children: ReactNode;
};

export function NeonPageShell({
  projectId,
  projectName,
  integration,
  activePage,
  children,
}: Props) {
  return (
    <PageContainer
      pageTitle="Neon Postgres"
      pageDescription={`${projectName} integration health and usage`}
      pageHeaderAction={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="secondary">{integration.status}</Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}/integrations`}>
              Integrations
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/projects/${projectId}/integrations/${integration.id}`}
            >
              Credentials
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Neon is connected
            </p>
            <p className="text-xs text-muted-foreground">
              Last checked:{" "}
              {integration.last_checked
                ? formatRelative(integration.last_checked)
                : "never"}
            </p>
          </div>
          <NeonPollActions integrationId={integration.id} />
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Neon sections">
          {NEON_INTEGRATION_SECTIONS.map((page) => (
            <Button
              key={page.value}
              variant={activePage === page.value ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={neonIntegrationSectionPath(projectId, page.value)}>
                {page.label}
              </Link>
            </Button>
          ))}
        </nav>

        {children}
      </div>
    </PageContainer>
  );
}
