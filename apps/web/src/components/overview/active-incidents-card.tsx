import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldTitle,
} from "@blenvi/ui/components/field";
import Link from "next/link";
import { formatRelative } from "@/components/dashboard/metric-format";
import { StatusBadge } from "@/components/integrations/status-badge";
import { statusBorderClass } from "@/lib/ui/status-styles";
import type { OverviewIncident } from "@/types/database";

export function ActiveIncidentsCard({
  incidents,
}: {
  incidents: OverviewIncident[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active incidents</CardTitle>
        <CardDescription>
          Open issues tracked for workspace integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <p className="text-sm font-normal italic text-muted-foreground">
            No open incidents.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {incidents.map((incident) => {
              const border =
                incident.severity === "critical" ||
                incident.severity === "major"
                  ? statusBorderClass.down
                  : statusBorderClass.degraded;
              const label =
                incident.severity === "critical"
                  ? "critical"
                  : incident.severity === "major"
                    ? "major"
                    : "minor";
              return (
                <Field
                  key={incident.id}
                  orientation="vertical"
                  className={`gap-1.5 rounded-lg border border-border border-l-2 bg-card/50 p-3 pl-3 sm:p-4 ${border}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <FieldTitle className="text-xs font-medium leading-snug">
                      {incident.title}
                    </FieldTitle>
                    <StatusBadge
                      status={
                        incident.severity === "minor" ? "degraded" : "down"
                      }
                      label={label}
                      className="shrink-0"
                    />
                  </div>
                  <FieldDescription>
                    {incident.projectName} · {incident.service} ·{" "}
                    {incident.status} · {formatRelative(incident.startedAt)}
                  </FieldDescription>
                  {incident.sourceUrl ? (
                    <Link
                      href={incident.sourceUrl}
                      className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      ↗ Details
                    </Link>
                  ) : null}
                </Field>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
