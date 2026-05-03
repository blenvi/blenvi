"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@blenvi/ui/components/item";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { formatRelative } from "@/components/dashboard/metric-format";
import { statusBorderClass } from "@/lib/ui/status-styles";

export type IncidentRow = {
  id: string;
  title: string;
  severity: "info" | "warning" | "critical";
  opened_at: string;
  serviceLabel: string;
  projectId: string;
  integrationId: string;
};

type Props = {
  incidents: IncidentRow[];
};

export function RecentIncidents({ incidents }: Props) {
  return (
    <Card>
      <CardHeader className="border-b border-border [.border-b]:pb-4">
        <CardTitle>Recent incidents</CardTitle>
        <CardDescription>Open issues for this project</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {incidents.length === 0 ? (
          <p className="text-sm font-normal italic text-muted-foreground">
            No open incidents.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {incidents.map((inc) => {
              const major = inc.severity === "critical";
              const borderL = major
                ? statusBorderClass.down
                : statusBorderClass.degraded;
              return (
                <Item
                  key={inc.id}
                  variant="outline"
                  size="sm"
                  className={`border-l-2 py-2 pl-3 ${borderL}`}
                >
                  <ItemMedia variant="icon">
                    <span
                      className={`size-1.5 rounded-full ${
                        major ? "bg-status-down" : "bg-status-degraded"
                      }`}
                      aria-hidden
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="text-sm">{inc.title}</ItemTitle>
                    <ItemDescription>
                      {formatRelative(inc.opened_at)} ·{" "}
                      <Link
                        href={`/projects/${inc.projectId}/integrations/${inc.integrationId}`}
                        className="inline-flex items-center gap-0.5 font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {inc.serviceLabel}
                        <ArrowUpRight className="size-3" aria-hidden />
                      </Link>
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {inc.severity}
                    </span>
                  </ItemActions>
                </Item>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
